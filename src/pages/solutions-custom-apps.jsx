import React from 'react';
import SolutionPageLayout from '../components/solutions/SolutionPageLayout';

const service = {
  title: 'Custom Apps',
  h2: 'Turn Your Ideas Into Tools.',
  descriptivePhrase: 'Create Custom Software & Applications',
  overview: 'With AI, turning ideas into tools has never been faster-we can take a concept, workflow, or software idea and bring it to life quickly and effectively. From custom calculators to AI-powered content machines, and even fully functional games, we have already built tools that solve real problems. Whatever your business needs, we can create a custom app or system that makes your work easier, smarter, and more scalable.',
  image: 'https://res.cloudinary.com/dvcvxhzmt/image/upload/f_auto,q_auto/disruptors-media/services/graphics/after-phone-sec.png',
  heroImage: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/so_0/q_auto:good/v1/dmsite/services/custom-apps.jpg',
  heroVideo: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/custom-apps.mp4',
  cardVideo: 'https://res.cloudinary.com/dvcvxhzmt/video/upload/v1/dmsite/services/custom-apps.mp4',
  outcomes: [
    {
      title: 'Faster Development',
      description: 'Build custom solutions in weeks instead of months using AI-accelerated development workflows.'
    },
    {
      title: 'Tailored Solutions',
      description: 'Get exactly what your business needs-no forcing your workflow into off-the-shelf software.'
    },
    {
      title: 'Competitive Advantage',
      description: 'Gain unique tools and systems that differentiate you from competitors stuck with generic solutions.'
    }
  ],
  process: [
    {
      title: 'Discovery & Requirements',
      description: 'Deep dive into your business process, pain points, and desired outcomes to define the perfect solution.'
    },
    {
      title: 'Design & Prototyping',
      description: 'Create wireframes, user flows, and interactive prototypes to validate the concept before full development.'
    },
    {
      title: 'Development & Testing',
      description: 'Build your custom application with modern tech stack, rigorous testing, and quality assurance.'
    },
    {
      title: 'Launch & Support',
      description: 'Deploy your application, train your team, and provide ongoing maintenance and feature enhancements.'
    }
  ],
  features: [
    {
      title: 'Web Application Development',
      description: 'Custom web apps built with React, Node.js, and modern frameworks'
    },
    {
      title: 'Mobile App Development',
      description: 'Native iOS and Android apps or cross-platform solutions'
    },
    {
      title: 'AI-Powered Tools',
      description: 'Integrate AI capabilities for automation, analysis, and intelligence'
    },
    {
      title: 'Custom Calculators & Tools',
      description: 'Lead generation tools and calculators tailored to your industry'
    },
    {
      title: 'API Development & Integration',
      description: 'Connect your app to external services and data sources'
    },
    {
      title: 'Database Design & Management',
      description: 'Scalable data architecture supporting your application'
    },
    {
      title: 'User Interface & Experience Design',
      description: 'Intuitive, beautiful interfaces that users love'
    },
    {
      title: 'Maintenance & Updates',
      description: 'Ongoing support, bug fixes, and feature enhancements'
    }
  ],
  faqs: [
    {
      question: 'How long does custom app development take?',
      answer: 'Simple applications take 4-8 weeks. More complex systems with integrations, AI features, and advanced functionality take 12-16 weeks. We provide detailed timelines during discovery and break projects into phases for faster time-to-value.'
    },
    {
      question: 'What technologies do you use?',
      answer: 'We build with modern, proven technology stacks including React, Node.js, Python, PostgreSQL, and cloud infrastructure like AWS or Google Cloud. Technology choices are driven by your specific needs, not our preferences. We recommend the best tools for your use case.'
    },
    {
      question: 'Can you integrate with our existing systems?',
      answer: 'Yes. We integrate with virtually any system via APIs, webhooks, or custom connectors. Common integrations include CRMs (HubSpot, Salesforce), payment processors (Stripe), email systems (SendGrid), and databases. We ensure seamless data flow between your new app and existing tools.'
    },
    {
      question: 'Do you provide hosting and maintenance?',
      answer: 'Yes. We offer managed hosting and ongoing maintenance packages that include server management, security updates, bug fixes, and feature enhancements. You own the code and can host anywhere, but many clients prefer our managed service for peace of mind.'
    },
    {
      question: 'What if my idea changes during development?',
      answer: 'We embrace iteration and flexibility. Projects are structured in phases with regular check-ins and demos. While major scope changes affect timeline and budget, minor adjustments and improvements are expected. We use agile methodology to adapt to evolving requirements.'
    }
  ],
  testimonials: [
    {
      name: 'Mitchell Halvorsen',
      company: 'Google Review',
      quote: 'I can\'t say enough good things about Disruptors Media. Their team is professional, creative, and truly understands how to capture attention in today\'s fast-paced digital world. They made the process smooth from start to finish.'
    },
    {
      name: 'Chris',
      company: 'Google Review',
      quote: 'Professional, well organized, and knowledgeable. If you\'re looking for a company that can drive revenue and expand your business success, this is the right place for you.'
    }
  ],
  cta_label: 'Book a Strategy Session',
  cta_link: 'book-strategy-session'
};

export default function CustomApps() {
  return <SolutionPageLayout service={service} />;
}
