/**
 * Marketing Images Batch Generator
 * Generates all required marketing images using AI orchestrator
 * Uploads to Cloudinary and organizes by category
 */

import { aiOrchestrator } from '../lib/ai-orchestrator.js';

class MarketingImageGenerator {
  constructor() {
    this.brandStyle = `Professional corporate design, modern technology aesthetic, clean minimal design, sophisticated blue and purple gradients, business-appropriate, high-quality commercial photography style, high resolution, sharp details, optimal lighting, perfect composition`;

    this.negativePrompts = `low quality, blurry, unprofessional, childish, cartoon, amateur, cluttered, messy`;

    this.imageSpecs = {
      serviceCards: {
        dimensions: { width: 1920, height: 1080 }, // 16:9 ratio
        quality: 'premium'
      },
      blogPosts: {
        dimensions: { width: 1200, height: 800 }, // 3:2 ratio
        quality: 'standard'
      },
      aiEmployees: {
        dimensions: { width: 1024, height: 1024 }, // Square
        quality: 'premium'
      }
    };

    this.results = {
      serviceCards: [],
      blogPosts: [],
      aiEmployees: []
    };
  }

  /**
   * Service Card Image Definitions
   */
  getServiceCardPrompts() {
    return [
      {
        id: 'ai_automation',
        title: 'AI Automation',
        description: 'Automate repetitive tasks and workflows',
        prompt: `Abstract digital automation concept with interconnected robotic elements, flowing data streams, automated workflow visualization, AI-powered processes, modern tech interface elements, gears and circuits merging with digital displays, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'social_media_marketing',
        title: 'Social Media Marketing',
        description: 'Build and engage your community',
        prompt: `Social media engagement visualization with floating social icons, community connection networks, content creation elements, engagement metrics, likes and shares flowing, modern social platform interfaces, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'seo_geo',
        title: 'SEO & GEO',
        description: 'Get found by your ideal customers',
        prompt: `Search optimization concept with magnifying glass, search results interface, location pins floating over digital map, ranking charts going upward, SEO analytics dashboard, local search elements, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'lead_generation',
        title: 'Lead Generation',
        description: 'Fill your pipeline with qualified prospects',
        prompt: `Sales funnel visualization with prospect flow, lead magnets represented as attractive elements, pipeline filled with qualified leads, conversion metrics, targeting crosshairs, prospecting tools, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'paid_advertising',
        title: 'Paid Advertising',
        description: 'Maximize ROI across all channels',
        prompt: `Multi-channel advertising dashboard with ROI charts trending upward, ad performance metrics, targeting options, budget allocation visualization, campaign optimization elements, advertising platforms, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'podcasting',
        title: 'Podcasting',
        description: 'Build authority through audio content',
        prompt: `Professional podcast studio setup with modern microphone, audio waveforms, broadcasting elements, sound waves radiating, podcast platform interfaces, authority-building symbols, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'custom_apps',
        title: 'Custom Apps',
        description: 'Tailored solutions for your needs',
        prompt: `Custom software development concept with mobile app interfaces, code elements, app wireframes, development tools, customization options, tailored solution symbols, modern UI elements, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'crm_management',
        title: 'CRM Management',
        description: 'Organize and nurture your relationships',
        prompt: `Customer relationship management dashboard with contact organization, relationship networks, nurturing workflows, customer journey visualization, CRM interface elements, data organization, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'fractional_cmo',
        title: 'Fractional CMO',
        description: 'Strategic marketing leadership',
        prompt: `Strategic marketing leadership concept with business growth charts, marketing strategy elements, leadership symbols, growth metrics, strategic planning tools, executive dashboard, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      }
    ];
  }

  /**
   * Blog Post Image Definitions
   */
  getBlogPostPrompts() {
    return [
      {
        id: 'ai_seo_guide',
        title: 'The Ultimate Guide to AI-Powered SEO in 2025',
        category: 'SEO & GEO',
        prompt: `Futuristic SEO concept with AI brain analyzing search results, modern search optimization tools, 2025 technology elements, AI-powered SEO dashboard, futuristic search interface, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'cold_email_templates',
        title: '5 Cold Email Templates That Actually Get Replies',
        category: 'Lead Generation',
        prompt: `Professional email marketing concept with inbox interface, email templates, reply notifications, engagement metrics, communication success symbols, email effectiveness visualization, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'custom_ai_app',
        title: 'How We Built a Custom AI App in 48 Hours',
        category: 'Custom Apps',
        prompt: `Rapid AI app development concept with coding interface, 48-hour timeline, AI app creation process, development speed visualization, rapid prototyping elements, coding productivity, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      }
    ];
  }

  /**
   * AI Employee Image Definitions
   */
  getAIEmployeePrompts() {
    return [
      {
        id: 'content_curator',
        title: 'Content Curator AI Employee',
        prompt: `Futuristic AI assistant organizing content, holographic content curation interface, social media management, automated content systems, AI organizing digital content pieces, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'lead_nurturer',
        title: 'Lead Nurturer AI Employee',
        prompt: `AI assistant managing customer relationships, lead nurturing workflow visualization, customer journey automation, relationship management interface, AI handling prospect communication, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'customer_support',
        title: 'Customer Support AI Employee',
        prompt: `24/7 AI chatbot interface, customer service automation, support ticket management, AI assistant helping customers, round-the-clock support visualization, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'sales_qualifier',
        title: 'Sales Qualifier AI Employee',
        prompt: `AI sales assistant analyzing leads, lead qualification interface, sales process automation, prospect scoring system, AI evaluating sales opportunities, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'data_analyst',
        title: 'Data Analysis AI Employee',
        prompt: `AI analyzing business data, analytics dashboard with AI insights, data visualization, business intelligence interface, AI processing complex datasets, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      },
      {
        id: 'content_writer',
        title: 'Content Writer AI Employee',
        prompt: `AI writing content, automated copywriting interface, content creation visualization, AI generating marketing copy, writing assistance tools, ${this.brandStyle}. Avoid: ${this.negativePrompts}`
      }
    ];
  }

  /**
   * Generate all service card images
   */
  async generateServiceCards() {
    console.log('🎨 Generating service card images...');
    const prompts = this.getServiceCardPrompts();

    for (let i = 0; i < prompts.length; i++) {
      const serviceCard = prompts[i];
      console.log(`📸 Generating: ${serviceCard.title} (${i + 1}/${prompts.length})`);

      try {
        const result = await aiOrchestrator.generateImage(serviceCard.prompt, {
          ...this.imageSpecs.serviceCards,
          context: `service_card_${serviceCard.id}`,
          budget: 'medium', // Use Gemini instead of OpenAI
          specialization: 'professional_creative'
        });

        this.results.serviceCards.push({
          ...serviceCard,
          result,
          cloudinary_url: result.stored_url || result.url,
          cloudinary_public_id: result.cloudinary_public_id
        });

        console.log(`✅ Generated: ${serviceCard.title}`);

        // Add delay to avoid rate limiting
        if (i < prompts.length - 1) {
          await this.delay(2000);
        }

      } catch (error) {
        console.error(`❌ Failed to generate ${serviceCard.title}:`, error);
        this.results.serviceCards.push({
          ...serviceCard,
          error: error.message
        });
      }
    }
  }

  /**
   * Generate all blog post images
   */
  async generateBlogPosts() {
    console.log('📰 Generating blog post images...');
    const prompts = this.getBlogPostPrompts();

    for (let i = 0; i < prompts.length; i++) {
      const blogPost = prompts[i];
      console.log(`📸 Generating: ${blogPost.title} (${i + 1}/${prompts.length})`);

      try {
        const result = await aiOrchestrator.generateImage(blogPost.prompt, {
          ...this.imageSpecs.blogPosts,
          context: `blog_post_${blogPost.id}`,
          budget: 'medium', // Use Gemini
          specialization: 'professional_creative'
        });

        this.results.blogPosts.push({
          ...blogPost,
          result,
          cloudinary_url: result.stored_url || result.url,
          cloudinary_public_id: result.cloudinary_public_id
        });

        console.log(`✅ Generated: ${blogPost.title}`);

        // Add delay to avoid rate limiting
        if (i < prompts.length - 1) {
          await this.delay(2000);
        }

      } catch (error) {
        console.error(`❌ Failed to generate ${blogPost.title}:`, error);
        this.results.blogPosts.push({
          ...blogPost,
          error: error.message
        });
      }
    }
  }

  /**
   * Generate all AI employee images
   */
  async generateAIEmployees() {
    console.log('🤖 Generating AI employee images...');
    const prompts = this.getAIEmployeePrompts();

    for (let i = 0; i < prompts.length; i++) {
      const aiEmployee = prompts[i];
      console.log(`📸 Generating: ${aiEmployee.title} (${i + 1}/${prompts.length})`);

      try {
        const result = await aiOrchestrator.generateImage(aiEmployee.prompt, {
          ...this.imageSpecs.aiEmployees,
          context: `ai_employee_${aiEmployee.id}`,
          budget: 'medium', // Use Gemini
          specialization: 'professional_creative'
        });

        this.results.aiEmployees.push({
          ...aiEmployee,
          result,
          cloudinary_url: result.stored_url || result.url,
          cloudinary_public_id: result.cloudinary_public_id
        });

        console.log(`✅ Generated: ${aiEmployee.title}`);

        // Add delay to avoid rate limiting
        if (i < prompts.length - 1) {
          await this.delay(2000);
        }

      } catch (error) {
        console.error(`❌ Failed to generate ${aiEmployee.title}:`, error);
        this.results.aiEmployees.push({
          ...aiEmployee,
          error: error.message
        });
      }
    }
  }

  /**
   * Generate all images in sequence
   */
  async generateAllImages() {
    console.log('🚀 Starting marketing image generation...');
    const startTime = Date.now();

    try {
      // Generate service cards
      await this.generateServiceCards();

      // Generate blog posts
      await this.generateBlogPosts();

      // Generate AI employees
      await this.generateAIEmployees();

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log(`\n🎉 Generation complete! Total time: ${duration.toFixed(1)}s`);

      // Generate summary report
      this.generateReport();

      return this.results;

    } catch (error) {
      console.error('💥 Generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate summary report
   */
  generateReport() {
    console.log('\n📊 GENERATION SUMMARY REPORT');
    console.log('='.repeat(50));

    // Service Cards
    const serviceSuccess = this.results.serviceCards.filter(r => !r.error).length;
    const serviceTotal = this.results.serviceCards.length;
    console.log(`\n🎨 SERVICE CARDS: ${serviceSuccess}/${serviceTotal} successful`);

    this.results.serviceCards.forEach(card => {
      const status = card.error ? '❌' : '✅';
      console.log(`  ${status} ${card.title}`);
      if (card.cloudinary_url) {
        console.log(`    URL: ${card.cloudinary_url}`);
      }
    });

    // Blog Posts
    const blogSuccess = this.results.blogPosts.filter(r => !r.error).length;
    const blogTotal = this.results.blogPosts.length;
    console.log(`\n📰 BLOG POSTS: ${blogSuccess}/${blogTotal} successful`);

    this.results.blogPosts.forEach(post => {
      const status = post.error ? '❌' : '✅';
      console.log(`  ${status} ${post.title}`);
      if (post.cloudinary_url) {
        console.log(`    URL: ${post.cloudinary_url}`);
      }
    });

    // AI Employees
    const aiSuccess = this.results.aiEmployees.filter(r => !r.error).length;
    const aiTotal = this.results.aiEmployees.length;
    console.log(`\n🤖 AI EMPLOYEES: ${aiSuccess}/${aiTotal} successful`);

    this.results.aiEmployees.forEach(employee => {
      const status = employee.error ? '❌' : '✅';
      console.log(`  ${status} ${employee.title}`);
      if (employee.cloudinary_url) {
        console.log(`    URL: ${employee.cloudinary_url}`);
      }
    });

    // Overall stats
    const totalSuccess = serviceSuccess + blogSuccess + aiSuccess;
    const totalImages = serviceTotal + blogTotal + aiTotal;
    const successRate = ((totalSuccess / totalImages) * 100).toFixed(1);

    console.log(`\n🏆 OVERALL: ${totalSuccess}/${totalImages} images generated (${successRate}% success rate)`);
    console.log('='.repeat(50));
  }

  /**
   * Get organized results by category
   */
  getOrganizedResults() {
    return {
      service_cards: this.results.serviceCards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        cloudinary_url: card.cloudinary_url,
        cloudinary_public_id: card.cloudinary_public_id,
        error: card.error
      })),
      blog_posts: this.results.blogPosts.map(post => ({
        id: post.id,
        title: post.title,
        category: post.category,
        cloudinary_url: post.cloudinary_url,
        cloudinary_public_id: post.cloudinary_public_id,
        error: post.error
      })),
      ai_employees: this.results.aiEmployees.map(employee => ({
        id: employee.id,
        title: employee.title,
        cloudinary_url: employee.cloudinary_url,
        cloudinary_public_id: employee.cloudinary_public_id,
        error: employee.error
      }))
    };
  }

  /**
   * Utility delay function
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other modules
export default MarketingImageGenerator;

// If run directly, execute generation
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new MarketingImageGenerator();
  generator.generateAllImages()
    .then(results => {
      console.log('\n✨ All done! Results saved to Supabase and Cloudinary.');
      console.log('Organized results:', generator.getOrganizedResults());
    })
    .catch(error => {
      console.error('💥 Generation failed:', error);
      process.exit(1);
    });
}