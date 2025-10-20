#!/usr/bin/env node
/**
 * Blog Publishing Schedule Configuration
 * Sets up automated publishing schedule:
 * - Phase 1: 3x per week (Mon/Wed/Fri) for 90 days
 * - Phase 2: 2x per week (Tue/Thu) after 90 days
 *
 * Usage: node scripts/configure-blog-publishing-schedule.js
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Calculate publishing schedule for next 180 days
 */
function generatePublishingSchedule() {
  const schedule = []
  const startDate = new Date()
  startDate.setHours(9, 0, 0, 0) // 9 AM publishing time

  // Phase 1: 3x per week for 90 days (Mon/Wed/Fri)
  const phase1Days = [1, 3, 5] // Monday=1, Wednesday=3, Friday=5
  let currentDate = new Date(startDate)
  let phase1End = new Date(startDate)
  phase1End.setDate(phase1End.getDate() + 90)

  while (currentDate < phase1End) {
    const dayOfWeek = currentDate.getDay()

    if (phase1Days.includes(dayOfWeek)) {
      schedule.push({
        publish_date: new Date(currentDate),
        phase: 1,
        frequency: '3x_week',
        day_of_week: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Phase 2: 2x per week after 90 days (Tue/Thu)
  const phase2Days = [2, 4] // Tuesday=2, Thursday=4
  let phase2End = new Date(phase1End)
  phase2End.setDate(phase2End.getDate() + 90)

  currentDate = new Date(phase1End)

  while (currentDate < phase2End) {
    const dayOfWeek = currentDate.getDay()

    if (phase2Days.includes(dayOfWeek)) {
      schedule.push({
        publish_date: new Date(currentDate),
        phase: 2,
        frequency: '2x_week',
        day_of_week: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return schedule
}

/**
 * Configure system settings for auto-scheduling
 */
async function configureSystemSettings() {
  console.log('⚙️  Configuring publishing schedule settings...\n')

  try {
    // Phase 1 settings (Mon/Wed/Fri for 90 days)
    const { error: phase1Error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'blog_schedule_phase_1',
        setting_value: {
          days: ['monday', 'wednesday', 'friday'],
          duration_days: 90,
          start_date: new Date().toISOString(),
          publish_time: '09:00:00',
          timezone: 'America/Los_Angeles',
          active: true
        },
        description: 'Phase 1: 3x per week publishing schedule for first 90 days'
      }, {
        onConflict: 'setting_key'
      })

    if (phase1Error) throw phase1Error
    console.log('✅ Phase 1 configured (Mon/Wed/Fri for 90 days)')

    // Phase 2 settings (Tue/Thu after 90 days)
    const phase1EndDate = new Date()
    phase1EndDate.setDate(phase1EndDate.getDate() + 90)

    const { error: phase2Error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'blog_schedule_phase_2',
        setting_value: {
          days: ['tuesday', 'thursday'],
          start_date: phase1EndDate.toISOString(),
          publish_time: '09:00:00',
          timezone: 'America/Los_Angeles',
          active: true
        },
        description: 'Phase 2: 2x per week publishing schedule after 90 days'
      }, {
        onConflict: 'setting_key'
      })

    if (phase2Error) throw phase2Error
    console.log('✅ Phase 2 configured (Tue/Thu after 90 days)')

    // Buffer size settings
    const { error: bufferError } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: 'blog_buffer_size',
        setting_value: {
          minimum_approved: 5,
          target_buffer: 10,
          alert_threshold: 3
        },
        description: 'Minimum number of approved blogs to maintain in buffer'
      }, {
        onConflict: 'setting_key'
      })

    if (bufferError) throw bufferError
    console.log('✅ Buffer size configured (target: 10 blogs)')

    console.log('\n✨ All settings configured successfully!')
    return true

  } catch (error) {
    console.error('❌ Failed to configure settings:', error.message)
    return false
  }
}

/**
 * Auto-schedule approved blog posts
 */
async function autoScheduleApprovedPosts() {
  console.log('\n📅 Auto-scheduling approved blog posts...\n')

  try {
    // Get all approved but not scheduled posts
    const { data: approvedPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, slug, created_at')
      .eq('approval_status', 'approved')
      .is('scheduled_publish_date', null)
      .order('created_at', { ascending: true })

    if (fetchError) throw fetchError

    if (!approvedPosts || approvedPosts.length === 0) {
      console.log('ℹ️  No approved posts found to schedule')
      return
    }

    console.log(`Found ${approvedPosts.length} approved posts to schedule\n`)

    // Generate schedule
    const schedule = generatePublishingSchedule()

    // Assign posts to schedule slots
    const updates = []
    for (let i = 0; i < Math.min(approvedPosts.length, schedule.length); i++) {
      const post = approvedPosts[i]
      const slot = schedule[i]

      updates.push({
        id: post.id,
        scheduled_publish_date: slot.publish_date.toISOString(),
        approval_status: 'scheduled',
        phase: slot.phase,
        publish_day: slot.day_of_week
      })

      console.log(`📌 ${slot.publish_date.toLocaleDateString()} (${slot.day_of_week}): ${post.title}`)
    }

    // Batch update
    for (const update of updates) {
      const { error } = await supabase
        .from('posts')
        .update({
          scheduled_publish_date: update.scheduled_publish_date,
          approval_status: update.approval_status
        })
        .eq('id', update.id)

      if (error) {
        console.error(`❌ Failed to schedule ${update.id}:`, error.message)
      }
    }

    console.log(`\n✅ Scheduled ${updates.length} blog posts`)

    // Summary
    const phase1Count = updates.filter(u => u.phase === 1).length
    const phase2Count = updates.filter(u => u.phase === 2).length

    console.log(`\n📊 Schedule Summary:`)
    console.log(`   Phase 1 (Mon/Wed/Fri): ${phase1Count} posts`)
    console.log(`   Phase 2 (Tue/Thu): ${phase2Count} posts`)
    console.log(`   Total scheduled: ${updates.length} posts`)

    if (updates.length > 0) {
      console.log(`\n📅 Publishing Schedule:`)
      console.log(`   First post: ${new Date(updates[0].scheduled_publish_date).toLocaleDateString()}`)
      console.log(`   Last post: ${new Date(updates[updates.length - 1].scheduled_publish_date).toLocaleDateString()}`)
    }

    return true

  } catch (error) {
    console.error('❌ Failed to auto-schedule:', error.message)
    return false
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 BLOG PUBLISHING SCHEDULE CONFIGURATION')
  console.log('=' .repeat(70))
  console.log('📋 Schedule:')
  console.log('   Phase 1: 3x per week (Mon/Wed/Fri) for 90 days')
  console.log('   Phase 2: 2x per week (Tue/Thu) after 90 days')
  console.log('   Publish time: 9:00 AM Pacific')
  console.log('='.repeat(70))
  console.log('')

  // Configure settings
  const settingsOk = await configureSystemSettings()
  if (!settingsOk) {
    console.error('\n❌ Failed to configure settings')
    process.exit(1)
  }

  // Auto-schedule posts
  const scheduleOk = await autoScheduleApprovedPosts()
  if (!scheduleOk) {
    console.error('\n❌ Failed to auto-schedule posts')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(70))
  console.log('✨ CONFIGURATION COMPLETE')
  console.log('=' .repeat(70))
  console.log('\n🎯 Next Steps:')
  console.log('1. Review scheduled posts in Admin Nexus → Blog Management')
  console.log('2. First post will publish today (manually approved)')
  console.log('3. Subsequent posts will auto-publish on schedule')
  console.log('4. Monitor buffer size to maintain 10+ approved posts')
  console.log('')

  process.exit(0)
}

// Execute
main().catch(error => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
