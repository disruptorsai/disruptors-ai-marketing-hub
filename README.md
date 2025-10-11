# Disruptors AI Marketing Hub

A comprehensive AI-powered marketing platform built with React, Vite, and Supabase, featuring advanced GSAP animations, 3D Spline integrations, and cutting-edge AI automation tools.

## 🚀 Features

### Core Platform
- **Modern React Architecture**: Built with React 18, Vite, and TypeScript
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Comprehensive UI components with Radix UI primitives
- **State Management**: React hooks and context for efficient state management

### AI-Powered Capabilities
- **AI Image Generation**: Integration with OpenAI GPT-Image-1 and Google Gemini 2.5 Flash
- **Content Automation**: AI-driven content creation and optimization
- **Lead Generation**: Intelligent lead scoring and automated follow-ups
- **Analytics & Insights**: AI-powered data analysis and reporting

### Advanced Integrations
- **GSAP Animations**: Sophisticated scroll-triggered animations and timelines
- **3D Spline Models**: Interactive 3D elements and immersive experiences
- **Supabase Backend**: Real-time database, authentication, and storage
- **MCP Servers**: Model Context Protocol for AI orchestration

### Marketing Tools
- **Service Portfolio**: AI Automation, Social Media Marketing, SEO & GEO
- **Case Studies**: Detailed project showcases and success metrics
- **Team Profiles**: Dynamic team member presentations
- **Contact Management**: Advanced lead tracking and CRM integration

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **GSAP** - Professional-grade animations

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live data updates

### AI & Integrations
- **OpenAI API** - GPT models and image generation
- **Google Gemini** - Advanced AI capabilities
- **Replicate** - AI model hosting
- **Cloudinary** - Image optimization and CDN

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Concurrently** - Parallel script execution
- **Playwright** - End-to-end testing

## 📁 Project Structure

```
disruptors-ai-marketing-hub/
├── src/
│   ├── components/          # React components
│   │   ├── shared/         # Reusable components
│   │   ├── home/           # Homepage components
│   │   └── examples/       # Example implementations
│   ├── pages/              # Page components
│   ├── lib/                # Utility libraries
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Helper functions
├── public/                 # Static assets
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── scripts/               # Build and utility scripts
├── docs/                  # Documentation
├── supabase/              # Database migrations
└── schema.sql             # Authoritative database schema
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Google AI API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TechIntegrationLabs/disruptors-ai-marketing-hub.git
   cd disruptors-ai-marketing-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Database Setup**
   ```bash
   # Apply the database schema
   npx supabase db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### AI & Content
- `npm run generate:service-images` - Generate AI service images
- `npm run test:image-apis` - Test image generation APIs
- `npm run validate:image-apis` - Validate API configurations

### MCP Orchestration
- `npm run mcp:start` - Start MCP servers
- `npm run mcp:status` - Check MCP server status
- `npm run mcp:health` - Run health checks
- `npm run mcp:optimize` - Optimize MCP performance

### Database
- `npm run db:setup` - Initialize database
- `npm run migrate` - Run database migrations

## 🌟 Key Features

### AI-Powered Marketing
- **Intelligent Content Creation**: AI-generated marketing content and visuals
- **Automated Lead Scoring**: Smart lead qualification and routing
- **Performance Analytics**: AI-driven insights and recommendations
- **Personalization**: Dynamic content based on user behavior

### Advanced Animations
- **GSAP Timeline Management**: Sophisticated animation sequences
- **Scroll-Triggered Effects**: Engaging scroll-based interactions
- **3D Integration**: Immersive Spline model experiences
- **Performance Optimized**: Smooth 60fps animations

### Enterprise-Ready
- **Scalable Architecture**: Built for high-traffic scenarios
- **Security First**: Row-level security and data protection
- **Real-time Updates**: Live data synchronization
- **Comprehensive Testing**: Unit, integration, and E2E tests

## 📊 Database Schema

The project uses a comprehensive PostgreSQL schema with the following key tables:

- **Users & Profiles** - User management and preferences
- **Services** - Marketing service offerings
- **Case Studies** - Project showcases and metrics
- **Team Members** - Team profile management
- **Leads & Interactions** - CRM and lead tracking
- **Media & Posts** - Content and asset management
- **Analytics** - Page views and performance tracking

See `schema.sql` for the complete database structure.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: tyler@disruptorsmedia.com
- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/TechIntegrationLabs/disruptors-ai-marketing-hub/issues)

## 🙏 Acknowledgments

- **OpenAI** for GPT models and image generation
- **Google** for Gemini AI capabilities
- **Supabase** for backend infrastructure
- **GSAP** for animation tools
- **Spline** for 3D design platform
- **Radix UI** for accessible components

---

Built with ❤️ by the Disruptors AI team