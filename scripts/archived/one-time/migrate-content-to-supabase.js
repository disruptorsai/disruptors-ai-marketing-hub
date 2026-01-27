/**
 * Content Migration Script for Disruptors AI Marketing Hub
 * Migrates extracted content to Supabase database using the custom SDK
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Starting content migration to Supabase...')
console.log('URL:', supabaseUrl)
console.log('Service key available:', !!supabaseServiceKey)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function loadExtractedContent() {
    try {
        const fileContent = await fs.readFile('extracted-content.json', 'utf8')
        return JSON.parse(fileContent)
    } catch (error) {
        console.error('❌ Error loading extracted content:', error)
        throw error
    }
}

async function migrateTeamMembers(teamMembers) {
    console.log('\n📋 Migrating team members...')
    let successCount = 0
    let errorCount = 0

    for (const member of teamMembers) {
        try {
            const { data, error } = await supabase
                .from('team_members')
                .upsert({
                    name: member.name,
                    title: member.title,
                    bio: member.bio,
                    headshot: member.headshot,
                    social_links: member.social_links,
                    is_active: member.is_active,
                    display_order: member.display_order
                }, {
                    onConflict: 'name'
                })

            if (error) {
                console.error(`❌ Error inserting ${member.name}:`, error)
                errorCount++
            } else {
                console.log(`✅ Inserted team member: ${member.name}`)
                successCount++
            }
        } catch (error) {
            console.error(`❌ Exception inserting ${member.name}:`, error)
            errorCount++
        }
    }

    console.log(`📊 Team Members: ${successCount} success, ${errorCount} errors`)
    return { successCount, errorCount }
}

async function migrateServices(services) {
    console.log('\n🛠️ Migrating services...')
    let successCount = 0
    let errorCount = 0

    for (const service of services) {
        try {
            const { data, error } = await supabase
                .from('services')
                .upsert({
                    name: service.name,
                    slug: service.slug,
                    description: service.description,
                    short_description: service.short_description,
                    category: service.category,
                    featured_image: service.featured_image,
                    is_active: service.is_active,
                    features: service.features,
                    benefits: service.benefits,
                    seo_title: service.seo_title,
                    seo_description: service.seo_description,
                    seo_keywords: service.seo_keywords
                }, {
                    onConflict: 'slug'
                })

            if (error) {
                console.error(`❌ Error inserting ${service.name}:`, error)
                errorCount++
            } else {
                console.log(`✅ Inserted service: ${service.name}`)
                successCount++
            }
        } catch (error) {
            console.error(`❌ Exception inserting ${service.name}:`, error)
            errorCount++
        }
    }

    console.log(`📊 Services: ${successCount} success, ${errorCount} errors`)
    return { successCount, errorCount }
}

async function migrateCaseStudies(caseStudies) {
    console.log('\n💼 Migrating case studies...')
    let successCount = 0
    let errorCount = 0

    for (const study of caseStudies) {
        try {
            const { data, error } = await supabase
                .from('case_studies')
                .upsert({
                    title: study.title,
                    slug: study.slug,
                    client_name: study.client_name,
                    industry: study.industry,
                    project_type: study.project_type,
                    summary: study.summary,
                    challenge: study.challenge,
                    solution: study.solution,
                    results: study.results,
                    metrics: study.metrics,
                    services_provided: study.services_provided,
                    technologies_used: study.technologies_used,
                    timeline_months: study.timeline_months,
                    featured_image: study.featured_image,
                    testimonial_quote: study.testimonial_quote,
                    testimonial_author: study.testimonial_author,
                    is_featured: study.is_featured,
                    is_published: study.is_published,
                    display_order: study.display_order,
                    seo_title: study.seo_title,
                    seo_description: study.seo_description,
                    seo_keywords: study.seo_keywords
                }, {
                    onConflict: 'slug'
                })

            if (error) {
                console.error(`❌ Error inserting ${study.title}:`, error)
                errorCount++
            } else {
                console.log(`✅ Inserted case study: ${study.title}`)
                successCount++
            }
        } catch (error) {
            console.error(`❌ Exception inserting ${study.title}:`, error)
            errorCount++
        }
    }

    console.log(`📊 Case Studies: ${successCount} success, ${errorCount} errors`)
    return { successCount, errorCount }
}

async function migrateSettings(settings) {
    console.log('\n⚙️ Migrating settings...')
    let successCount = 0
    let errorCount = 0

    for (const setting of settings) {
        try {
            const { data, error } = await supabase
                .from('settings')
                .upsert({
                    key: setting.key,
                    value: setting.value,
                    category: setting.category,
                    description: setting.description,
                    is_public: setting.is_public
                }, {
                    onConflict: 'key'
                })

            if (error) {
                console.error(`❌ Error inserting setting ${setting.key}:`, error)
                errorCount++
            } else {
                console.log(`✅ Inserted setting: ${setting.key}`)
                successCount++
            }
        } catch (error) {
            console.error(`❌ Exception inserting setting ${setting.key}:`, error)
            errorCount++
        }
    }

    console.log(`📊 Settings: ${successCount} success, ${errorCount} errors`)
    return { successCount, errorCount }
}

async function migrateTestimonials(testimonials) {
    console.log('\n💬 Migrating testimonials...')
    let successCount = 0
    let errorCount = 0

    for (const testimonial of testimonials) {
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .insert({
                    quote: testimonial.quote,
                    author_name: testimonial.author_name,
                    author_position: testimonial.author_position,
                    author_company: testimonial.author_company,
                    rating: testimonial.rating,
                    is_featured: testimonial.is_featured,
                    is_published: testimonial.is_published,
                    display_order: testimonial.display_order,
                    source: testimonial.source
                })

            if (error) {
                console.error(`❌ Error inserting testimonial from ${testimonial.author_name}:`, error)
                errorCount++
            } else {
                console.log(`✅ Inserted testimonial: ${testimonial.author_name}`)
                successCount++
            }
        } catch (error) {
            console.error(`❌ Exception inserting testimonial from ${testimonial.author_name}:`, error)
            errorCount++
        }
    }

    console.log(`📊 Testimonials: ${successCount} success, ${errorCount} errors`)
    return { successCount, errorCount }
}

async function migratePosts(posts) {
    console.log('\n📝 Migrating posts...')
    let successCount = 0
    let errorCount = 0

    for (const post of posts) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .upsert({
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    content: post.content,
                    content_type: post.content_type,
                    category: post.category,
                    tags: post.tags,
                    read_time_minutes: post.read_time_minutes,
                    is_featured: post.is_featured,
                    is_published: post.is_published,
                    published_at: post.published_at,
                    seo_title: post.seo_title,
                    seo_description: post.seo_description,
                    seo_keywords: post.seo_keywords
                }, {
                    onConflict: 'slug'
                })

            if (error) {
                console.error(`❌ Error inserting post ${post.title}:`, error)
                errorCount++
            } else {
                console.log(`✅ Inserted post: ${post.title}`)
                successCount++
            }
        } catch (error) {
            console.error(`❌ Exception inserting post ${post.title}:`, error)
            errorCount++
        }
    }

    console.log(`📊 Posts: ${successCount} success, ${errorCount} errors`)
    return { successCount, errorCount }
}

async function verifyMigration() {
    console.log('\n🔍 Verifying migration...')

    try {
        // Check team members
        const { data: teamData, error: teamError } = await supabase
            .from('team_members')
            .select('count')

        if (teamError) {
            console.log('Team members table verification failed:', teamError)
        } else {
            console.log(`✅ Team members in database: ${teamData.length || 'unknown'}`)
        }

        // Check services
        const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('count')

        if (servicesError) {
            console.log('Services table verification failed:', servicesError)
        } else {
            console.log(`✅ Services in database: ${servicesData.length || 'unknown'}`)
        }

        // Check settings
        const { data: settingsData, error: settingsError } = await supabase
            .from('settings')
            .select('key')

        if (settingsError) {
            console.log('Settings table verification failed:', settingsError)
        } else {
            console.log(`✅ Settings in database: ${settingsData.length || 'unknown'}`)
        }

    } catch (error) {
        console.error('❌ Verification failed:', error)
    }
}

async function runMigration() {
    try {
        const content = await loadExtractedContent()
        console.log(`📦 Loaded content with ${content.total_records} total records`)

        const results = {
            team_members: await migrateTeamMembers(content.team_members),
            services: await migrateServices(content.services),
            case_studies: await migrateCaseStudies(content.case_studies),
            settings: await migrateSettings(content.settings),
            testimonials: await migrateTestimonials(content.testimonials),
            posts: await migratePosts(content.posts)
        }

        // Calculate totals
        const totalSuccess = Object.values(results).reduce((sum, result) => sum + result.successCount, 0)
        const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errorCount, 0)

        console.log('\n🎉 Migration completed!')
        console.log(`📊 Total Success: ${totalSuccess}`)
        console.log(`❌ Total Errors: ${totalErrors}`)
        console.log(`📈 Success Rate: ${((totalSuccess / (totalSuccess + totalErrors)) * 100).toFixed(1)}%`)

        // Verify migration
        await verifyMigration()

        // Save migration report
        const report = {
            migration_date: new Date().toISOString(),
            total_records_processed: totalSuccess + totalErrors,
            successful_migrations: totalSuccess,
            failed_migrations: totalErrors,
            success_rate: `${((totalSuccess / (totalSuccess + totalErrors)) * 100).toFixed(1)}%`,
            results: results
        }

        await fs.writeFile('migration-report.json', JSON.stringify(report, null, 2))
        console.log('📄 Migration report saved to migration-report.json')

    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

// Run the migration
runMigration()