import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'CRM Management',
  h2: 'Your CRM, Reimagined.',
  descriptivePhrase: 'Turn Your CRM into a Powerful Asset',
  overview: 'We are experts in CRM design and builds, creating systems that actually work the way you do. Our team can integrate your CRM with the software, tools, and AI systems you rely on, turning it into a seamless and effective part of your business. The result is a streamlined hub that keeps your data, workflows, and communication aligned-so your CRM becomes an asset, not a headache.',
  image: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/what-we-do-bx-3.png',
  heroImage: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/v1758737704/disruptors-ai/services/crm-management.png',
  outcomes: [
    {
      title: 'Unified Data',
      description: 'Consolidate customer information from all sources into one intelligent, accessible system.'
    },
    {
      title: 'Automated Workflows',
      description: 'Eliminate manual data entry and follow-ups with smart automation that works for your team.'
    },
    {
      title: 'Better Decisions',
      description: 'Access real-time insights and reporting that help you understand what is working and optimize your approach.'
    }
  ],
  process: [
    {
      title: 'Discovery & Audit',
      description: 'Analyze your current CRM setup, workflows, pain points, and integration needs to design the optimal solution.'
    },
    {
      title: 'Strategy & Architecture',
      description: 'Design custom fields, pipelines, automation workflows, and integrations tailored to your business processes.'
    },
    {
      title: 'Implementation & Migration',
      description: 'Build your CRM, migrate data from existing systems, and integrate with your essential tools and platforms.'
    },
    {
      title: 'Training & Optimization',
      description: 'Train your team, refine workflows based on real-world usage, and provide ongoing support and optimization.'
    }
  ],
  features: [
    {
      title: 'CRM Platform Selection & Setup',
      description: 'Choose and configure the right CRM for your business (HubSpot, Salesforce, Pipedrive, etc.)'
    },
    {
      title: 'Custom Pipeline Design',
      description: 'Sales pipelines mapped to your actual sales process and stages'
    },
    {
      title: 'Workflow Automation',
      description: 'Automated task assignment, follow-ups, and deal progression'
    },
    {
      title: 'Data Migration & Cleanup',
      description: 'Clean migration from spreadsheets or old systems with data validation'
    },
    {
      title: 'Integration with Business Tools',
      description: 'Connect email, calendar, marketing tools, accounting software, and more'
    },
    {
      title: 'Custom Reporting & Dashboards',
      description: 'Real-time visibility into pipeline, performance, and revenue metrics'
    },
    {
      title: 'Team Training & Documentation',
      description: 'Comprehensive training and process documentation for your team'
    },
    {
      title: 'Ongoing Management & Support',
      description: 'Continuous optimization, troubleshooting, and strategic guidance'
    }
  ],
  faqs: [
    {
      question: 'Which CRM platform do you recommend?',
      answer: 'It depends on your business size, complexity, and budget. HubSpot is excellent for marketing-focused companies. Salesforce for enterprise needs. Pipedrive for sales-driven teams. GoHighLevel for agencies. We assess your specific requirements and recommend the platform that fits best.'
    },
    {
      question: 'Can you migrate data from our current system?',
      answer: 'Yes. We handle migrations from spreadsheets, legacy CRMs, and even paper-based systems. Our process includes data cleanup, deduplication, validation, and mapping to your new CRM structure. We ensure zero data loss and minimal business disruption during the transition.'
    },
    {
      question: 'How long does CRM implementation take?',
      answer: 'Basic setup and migration takes 2-4 weeks. Complex implementations with extensive customization, integrations, and automation can take 6-12 weeks. Timeline depends on data volume, number of integrations, and customization requirements. We provide detailed project plans during discovery.'
    },
    {
      question: 'Do you provide training for our team?',
      answer: 'Yes. Training is essential for CRM success. We provide hands-on training sessions, video tutorials, written documentation, and ongoing support. We tailor training to different roles (sales, marketing, management) and ensure everyone understands how to use the system effectively.'
    },
    {
      question: 'What if we outgrow our CRM or need changes?',
      answer: 'CRMs should evolve with your business. We provide ongoing optimization and can add new features, pipelines, automations, or integrations as your needs change. If you outgrow your platform entirely, we handle migration to a more robust system with minimal disruption.'
    }
  ],
  testimonials: [
    {
      name: 'Thomas Anderson',
      company: 'Construction Company Owner',
      quote: 'We were drowning in spreadsheets and missed follow-ups. The team implemented HubSpot and automated our entire sales process. Our close rate improved 40% and we have not missed a follow-up since implementation.'
    },
    {
      name: 'Rachel Green',
      company: 'Professional Services Firm',
      quote: 'They migrated years of client data, connected all our tools, and trained our team perfectly. Our CRM finally works the way we work. The time savings alone paid for the project in 3 months.'
    }
  ],
  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session'
};

export default function CrmManagement() {
  return <SolutionPageLayout service={service} />;
}
