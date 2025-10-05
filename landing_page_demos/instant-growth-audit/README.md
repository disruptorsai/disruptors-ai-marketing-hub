# 🚀 Instant Growth Audit

An AI-powered business intelligence demo that transforms any website URL into a branded growth report with actionable opportunities and a 30/60/90 day execution plan.

## ✨ Features

### 🎨 **Live Brand Detection**
- Auto-extracts logo, colors, and brand identity using Brandfetch API
- Fallback color extraction from images using node-vibrant
- Dynamic UI re-skinning with detected brand colors

### 🤖 **AI-Powered Analysis**
- **Business Profile Analyzer** - Extracts company info, offerings, ICP from website
- **Opportunity Detector** - Identifies 8-15 growth gaps across SEO, Content, Performance, CRO, Local, Social, Paid, Email/CRM, Data, AI
- **Service Mapper** - Maps opportunities to service packages (Starter/Core/Scale)
- **Copy Stylist** - Generates sales-ready email copy and proposals

## 🚀 Quick Start

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and add API keys
3. Run: `npm run dev`
4. Open http://localhost:3000

## 🔑 Required API Keys

- **ANTHROPIC_API_KEY** - Claude Sonnet 4 for AI analysis
- **FIRECRAWL_API_KEY** - Website scraping
- **BRANDFETCH_API_KEY** - Brand detection (optional)
- **PAGESPEED_API_KEY** - Performance audits (optional)

See README for full documentation.
