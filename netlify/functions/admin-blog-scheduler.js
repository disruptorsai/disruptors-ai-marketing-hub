/**
 * Admin Blog Scheduler (Netlify Scheduled Function)
 * Cron job that:
 * 1. Publishes scheduled blogs at their scheduled time
 * 2. Checks buffer and generates new blogs if needed
 * 3. Auto-schedules approved blogs
 *
 * Schedule:
 * - Phase 1 (90 days): Mon/Wed/Fri 9AM EST
 * - Phase 2 (ongoing): Tue/Thu 9AM EST
 * - Daily midnight: Buffer check and generation
 */

import { createClient } from '@supabase/supabase-js'
import { schedule } from '@netlify/functions'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Publish blogs scheduled for now or earlier
 */
async function publishScheduledBlogs() {
  const now = new Date().toISOString()

  // Get blogs that should be published
  const { data: scheduledBlogs, error: fetchError } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('approval_status', 'scheduled')
    .lte('scheduled_for', now)
    .is('is_published', false)

  if (fetchError) {
    console.error('Error fetching scheduled blogs:', fetchError)
    return { published: 0, failed: 0 }
  }

  let published = 0
  let failed = 0

  for (const blog of scheduledBlogs || []) {
    try {
      // Update blog to published
      const { error: updateError } = await supabaseAdmin
        .from('posts')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          approval_status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', blog.id)

      if (updateError) throw updateError

      // Update schedule record
      await supabaseAdmin
        .from('blog_schedule')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('post_id', blog.id)
        .eq('status', 'pending')

      console.log(`✅ Published blog: ${blog.title}`)
      published++

    } catch (error) {
      console.error(`❌ Failed to publish blog: ${blog.title}`, error)

      // Log error in schedule
      await supabaseAdmin
        .from('blog_schedule')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('post_id', blog.id)
        .eq('status', 'pending')

      failed++
    }
  }

  return { published, failed }
}

/**
 * Auto-schedule approved blogs to next available slots
 */
async function autoScheduleApprovedBlogs() {
  try {
    // Get system settings
    const { data: settings } = await supabaseAdmin
      .from('system_settings')
      .select('setting_value')
      .in('setting_key', ['blog_schedule_phase_1', 'blog_schedule_phase_2'])

    if (!settings || settings.length < 2) {
      console.error('Schedule settings not found')
      return { scheduled: 0 }
    }

    const phase1Settings = settings.find(s => s.setting_key === 'blog_schedule_phase_1')?.setting_value
    const phase2Settings = settings.find(s => s.setting_key === 'blog_schedule_phase_2')?.setting_value

    // Determine current phase
    const { data: firstSchedule } = await supabaseAdmin
      .from('blog_schedule')
      .select('scheduled_date')
      .order('scheduled_date', { ascending: true })
      .limit(1)
      .single()

    const startDate = firstSchedule?.scheduled_date ? new Date(firstSchedule.scheduled_date) : new Date()
    const daysSinceStart = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24))
    const isPhase1 = daysSinceStart < (phase1Settings?.duration_days || 90)

    const scheduleDays = isPhase1 ? phase1Settings?.days : phase2Settings?.days
    const scheduleTime = isPhase1 ? phase1Settings?.time : phase2Settings?.time

    // Get approved blogs
    const { data: approvedBlogs, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('approval_status', 'approved')
      .is('scheduled_for', null)
      .order('approved_at', { ascending: true })

    if (fetchError || !approvedBlogs || approvedBlogs.length === 0) {
      return { scheduled: 0 }
    }

    // Get existing schedule to find next available slot
    const { data: existingSchedule } = await supabaseAdmin
      .from('blog_schedule')
      .select('scheduled_date')
      .eq('status', 'pending')
      .order('scheduled_date', { ascending: false })
      .limit(1)

    let nextSlot = existingSchedule?.length > 0
      ? new Date(existingSchedule[0].scheduled_date)
      : new Date()

    // Helper function to get next valid day
    const getNextScheduleDay = (currentDate) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      let testDate = new Date(currentDate)
      testDate.setDate(testDate.getDate() + 1) // Start from next day

      for (let i = 0; i < 7; i++) {
        const dayName = dayNames[testDate.getDay()]
        if (scheduleDays.includes(dayName)) {
          // Set the time
          const [hours, minutes] = scheduleTime.split(':')
          testDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          return testDate
        }
        testDate.setDate(testDate.getDate() + 1)
      }

      return null // Should never happen
    }

    let scheduled = 0

    for (const blog of approvedBlogs) {
      try {
        // Get next available schedule slot
        nextSlot = getNextScheduleDay(nextSlot)

        if (!nextSlot) {
          console.error('Could not determine next schedule slot')
          break
        }

        // Update blog
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            scheduled_for: nextSlot.toISOString(),
            approval_status: 'scheduled',
            updated_at: new Date().toISOString()
          })
          .eq('id', blog.id)

        if (updateError) throw updateError

        // Create schedule entry
        await supabaseAdmin
          .from('blog_schedule')
          .insert({
            post_id: blog.id,
            scheduled_date: nextSlot.toISOString(),
            schedule_type: 'auto',
            frequency_period: isPhase1 ? 'phase_1_90_days' : 'phase_2_ongoing',
            status: 'pending'
          })

        console.log(`📅 Scheduled blog "${blog.title}" for ${nextSlot.toISOString()}`)
        scheduled++

      } catch (error) {
        console.error(`Failed to schedule blog "${blog.title}":`, error)
      }
    }

    return { scheduled }

  } catch (error) {
    console.error('Auto-scheduling error:', error)
    return { scheduled: 0 }
  }
}

/**
 * Check buffer and generate new blogs if needed
 */
async function checkBufferAndGenerate() {
  try {
    // Get buffer settings
    const { data: settings } = await supabaseAdmin
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'blog_buffer_size')
      .single()

    const minBuffer = settings?.setting_value?.min || 3
    const targetBuffer = settings?.setting_value?.target || 5

    // Count current buffer (approved + scheduled blogs)
    const { data: bufferBlogs, error: countError } = await supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact' })
      .in('approval_status', ['approved', 'scheduled'])

    if (countError) throw countError

    const currentBuffer = bufferBlogs?.length || 0

    console.log(`📊 Current buffer: ${currentBuffer}/${minBuffer} (target: ${targetBuffer})`)

    if (currentBuffer < minBuffer) {
      const needed = targetBuffer - currentBuffer
      console.log(`🤖 Buffer low. Generating ${needed} new blogs...`)

      // Call generator function
      const response = await fetch(`${process.env.URL}/.netlify/functions/admin-blog-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_batch',
          count: needed
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Generated ${result.generated} blogs to replenish buffer`)
        return { generated: result.generated }
      } else {
        console.error('Failed to generate blogs:', await response.text())
        return { generated: 0 }
      }
    }

    return { generated: 0 }

  } catch (error) {
    console.error('Buffer check error:', error)
    return { generated: 0 }
  }
}

/**
 * Main cron handler
 */
const cronHandler = async () => {
  console.log(`🕐 Blog scheduler running at ${new Date().toISOString()}`)

  try {
    // 1. Publish scheduled blogs
    const publishResult = await publishScheduledBlogs()
    console.log(`📰 Published: ${publishResult.published}, Failed: ${publishResult.failed}`)

    // 2. Auto-schedule approved blogs
    const scheduleResult = await autoScheduleApprovedBlogs()
    console.log(`📅 Auto-scheduled: ${scheduleResult.scheduled} blogs`)

    // 3. Check buffer and generate if needed (only at midnight)
    const hour = new Date().getHours()
    if (hour === 0) { // Midnight check
      const bufferResult = await checkBufferAndGenerate()
      console.log(`🤖 Generated: ${bufferResult.generated} blogs`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        published: publishResult.published,
        scheduled: scheduleResult.scheduled,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Cron execution error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}

// Schedule for multiple times
// Mon/Wed/Fri at 9AM EST = 14:00 UTC (during winter) / 13:00 UTC (during summer)
// Tue/Thu at 9AM EST = 14:00 UTC
// Midnight EST = 05:00 UTC
export const handler = schedule('0 0,13,14 * * *', cronHandler)

// Also export a manual handler for testing
export const manualHandler = cronHandler
