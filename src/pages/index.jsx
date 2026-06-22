import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Layout from "./Layout.jsx";
import { lazyWithRetry } from '@/utils/lazyWithRetry';

// Lazy load all pages for optimal performance with automatic retry on chunk load failure
// Home page now lazy-loaded to reduce initial bundle size and improve LCP
const Home = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading Home.jsx...');
    return import('./Home.jsx');
});

// Core pages - lazy loaded with retry logic to handle deployments
const Assessment = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading assessment.jsx...');
    return import('./assessment.jsx');
});
const Calculator = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading calculator.jsx...');
    return import('./calculator.jsx');
});
const MarketingAudit = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading marketing-audit.jsx...');
    return import('./marketing-audit.jsx');
});
const NotFound = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading 404.jsx...');
    return import('./404.jsx');
});
const Solutions = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading solutions.jsx...');
    return import('./solutions.jsx');
});
const Work = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading work.jsx...');
    return import('./work.jsx');
});
const About = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading about.jsx...');
    return import('./about.jsx');
});
const AITools = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading ai-tools.jsx...');
    return import('./ai-tools.jsx');
});
// ARCHIVED: contact.jsx moved to src/pages/archived/ (2026-03-02)
// const Contact = lazyWithRetry(() => {
//     console.log('🔄 [LAZY LOAD] Loading contact.jsx...');
//     return import('./contact.jsx');
// });
const Privacy = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading privacy.jsx...');
    return import('./privacy.jsx');
});
const Terms = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading terms.jsx...');
    return import('./terms.jsx');
});
const Pricing = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading Pricing.jsx...');
    return import('./Pricing.jsx');
});

// Dev pages for comparison - lazy loaded with retry
const HomeDev = lazyWithRetry(() => import('./Home-dev.jsx'));
const AboutDev = lazyWithRetry(() => import('./about-dev.jsx'));
const SolutionsDev = lazyWithRetry(() => import('./solutions-dev.jsx'));
const WorkDev = lazyWithRetry(() => import('./work-dev.jsx'));
const ResourcesDev = lazyWithRetry(() => import('./resources-dev.jsx'));
const ContactDev = lazyWithRetry(() => import('./contact-dev.jsx'));

// Blog system - lazy loaded with retry
const Blog = lazyWithRetry(() => import('./blog.jsx'));
const BlogDetail = lazyWithRetry(() => import('./blog-detail.jsx'));
const BlogDetailNew = lazyWithRetry(() => import('./blog-detail-new.jsx'));
// BlogManagement moved to Admin Nexus for security - was publicly accessible without auth
// const BlogManagement = lazyWithRetry(() => import('./blog-management.jsx'));

// Business Brain system - lazy loaded with retry
const BusinessBrainManager = lazyWithRetry(() => import('./business-brain-manager.jsx'));
const AIContentWriter = lazyWithRetry(() => import('./ai-content-writer.jsx'));
const KeywordResearch = lazyWithRetry(() => import('./keyword-research.jsx'));
const CarouselGenerator = lazyWithRetry(() => import('../modules/carousel-generator/CarouselGeneratorUI.jsx'));
const Tools = lazyWithRetry(() => import('./tools.jsx'));

// Event check-in page - lazy loaded with retry
const EventCheckin = lazyWithRetry(() => import('./event-checkin.jsx'));

// SEO Audit Tool - lazy loaded with retry
const ToolsSEOAudit = lazyWithRetry(() => {
    console.log('🔄 [LAZY LOAD] Loading tools-seo-audit.jsx...');
    return import('./tools-seo-audit.jsx');
});

// Auth system
const AuthCallback = lazyWithRetry(() => import('./auth-callback.jsx'));
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Disruptors Connect (Kiosk check-in system) - lazy loaded with retry
const ConnectWelcome = lazyWithRetry(() => import('./connect/Welcome.jsx'));
const ConnectIntake = lazyWithRetry(() => import('./connect/Intake.jsx'));
const ConnectPoll = lazyWithRetry(() => import('./connect/Poll.jsx'));
const ConnectSuccess = lazyWithRetry(() => import('./connect/Success.jsx'));
const ConnectScanner = lazyWithRetry(() => import('./connect/Scanner.jsx'));
const ConnectItinerary = lazyWithRetry(() => import('./connect/Itinerary.jsx'));
const ConnectResults = lazyWithRetry(() => import('./connect/Results.jsx'));

// Work case studies - lazy loaded with retry
const WorkSaasContentEngine = lazyWithRetry(() => import('./work-saas-content-engine.jsx'));
const WorkTradeworxUsa = lazyWithRetry(() => import('./work-tradeworx-usa.jsx'));
const WorkTimberViewFinancial = lazyWithRetry(() => import('./work-timber-view-financial.jsx'));
const WorkTheWellnessWay = lazyWithRetry(() => import('./work-the-wellness-way.jsx'));
const WorkSoundCorrections = lazyWithRetry(() => import('./work-sound-corrections.jsx'));
const WorkSegpro = lazyWithRetry(() => import('./work-segpro.jsx'));
const WorkNeuroMastery = lazyWithRetry(() => import('./work-neuro-mastery.jsx'));
const WorkMuscleWorks = lazyWithRetry(() => import('./work-muscle-works.jsx'));
const WorkGranitePaving = lazyWithRetry(() => import('./work-granite-paving.jsx'));
const WorkAutoTrimUtah = lazyWithRetry(() => import('./work-auto-trim-utah.jsx'));

// Solutions pages - lazy loaded with retry
const SolutionsAiAutomation = lazyWithRetry(() => import('./solutions-ai-automation.jsx'));
const SolutionsSocialMedia = lazyWithRetry(() => import('./solutions-social-media.jsx'));
const SolutionsSeoGeo = lazyWithRetry(() => import('./solutions-seo-geo.jsx'));
const SolutionsLeadGeneration = lazyWithRetry(() => import('./solutions-lead-generation.jsx'));
const SolutionsPaidAdvertising = lazyWithRetry(() => import('./solutions-paid-advertising.jsx'));
const SolutionsPodcasting = lazyWithRetry(() => import('./solutions-podcasting.jsx'));
const SolutionsCustomApps = lazyWithRetry(() => import('./solutions-custom-apps.jsx'));
const SolutionsCrmManagement = lazyWithRetry(() => import('./solutions-crm-management.jsx'));
const SolutionsFractionalCmo = lazyWithRetry(() => import('./solutions-fractional-cmo.jsx'));

// Billboard funnel - lazy loaded with retry
const Billboard = lazyWithRetry(() => import('./billboard.jsx'));

// Additional pages - lazy loaded with retry
const BookStrategySession = lazyWithRetry(() => import('./book-strategy-session.jsx'));
const Podcast = lazyWithRetry(() => import('./podcast.jsx'));
const Gallery = lazyWithRetry(() => import('./gallery.jsx'));
const Faq = lazyWithRetry(() => import('./faq.jsx'));
const ResourcesAiSuitcaseTermsDecoded = lazyWithRetry(() => import('./resources-ai-suitcase-terms-decoded.jsx'));
const FreeResources = lazyWithRetry(() => import('./free-resources.jsx'));

// Demo pages - lazy loaded with retry
const ScrollAnimationDemo = lazyWithRetry(() => import('../components/examples/ScrollAnimationExamples.jsx'));
const VideoScrubDemo = lazyWithRetry(() => import('./video-scrub-demo.jsx'));
const TextGlitchDemo = lazyWithRetry(() => import('./TextGlitchDemo.jsx'));

// Landing page demos - lazy loaded with retry
const DemosIndex = lazyWithRetry(() => import('./demos/index.jsx'));
const DemoHeroFocus = lazyWithRetry(() => import('./demos/hero-focus.jsx'));
const DemoBenefitsDriven = lazyWithRetry(() => import('./demos/benefits-driven.jsx'));
const DemoSocialProof = lazyWithRetry(() => import('./demos/social-proof.jsx'));
const DemoInteractive = lazyWithRetry(() => import('./demos/interactive.jsx'));
const DemoConversion = lazyWithRetry(() => import('./demos/conversion.jsx'));
const DemoBestOfAll = lazyWithRetry(() => import('./demos/best-of-all.jsx'));
const GrowthAuditDemo = lazyWithRetry(() => import('./demos/growth-audit.jsx'));
const GrowthAuditResults = lazyWithRetry(() => import('./demos/growth-audit-results.jsx'));
const KeywordResearchDemo = lazyWithRetry(() => import('./demos/keyword-research-demo.jsx'));
const AIContentWriterDemo = lazyWithRetry(() => import('./demos/ai-content-writer-demo.jsx'));

// Hidden utility pages - lazy loaded with retry
const GraveyardArchive = lazyWithRetry(() => import('./GraveyardArchive.jsx'));
const ScreenshotManager = lazyWithRetry(() => import('./ScreenshotManager.jsx'));

const PAGES = {

    Home: Home,

    tools: Tools,

    assessment: Assessment,

    calculator: Calculator,

    "marketing-audit": MarketingAudit,

    "404": NotFound,

    "work-saas-content-engine": WorkSaasContentEngine,

    "resources-ai-suitcase-terms-decoded": ResourcesAiSuitcaseTermsDecoded,

    solutions: Solutions,

    work: Work,

    about: About,

    "ai-tools": AITools,

    // contact: Contact, // ARCHIVED

    // Dev pages for comparison
    "Home-dev": HomeDev,
    "about-dev": AboutDev,
    "solutions-dev": SolutionsDev,
    "work-dev": WorkDev,
    "resources-dev": ResourcesDev,
    "contact-dev": ContactDev,
    
    privacy: Privacy,

    terms: Terms,

    pricing: Pricing,

    blog: Blog,

    "blog-detail": BlogDetail,

    // "blog-management": BlogManagement, // Moved to Admin Nexus for security

    "business-brain-manager": BusinessBrainManager,

    "ai-content-writer": AIContentWriter,

    "keyword-research": KeywordResearch,

    "carousel-generator": CarouselGenerator,

    "tools-seo-audit": ToolsSEOAudit,

    "event-checkin": EventCheckin,

    "work-tradeworx-usa": WorkTradeworxUsa,
    
    "work-timber-view-financial": WorkTimberViewFinancial,
    
    "work-the-wellness-way": WorkTheWellnessWay,
    
    "work-sound-corrections": WorkSoundCorrections,
    
    "work-segpro": WorkSegpro,
    
    "work-neuro-mastery": WorkNeuroMastery,
    
    "work-muscle-works": WorkMuscleWorks,
    
    "work-granite-paving": WorkGranitePaving,
    
    "work-auto-trim-utah": WorkAutoTrimUtah,
    
    "billboard": Billboard,

    "book-strategy-session": BookStrategySession,
    
    "solutions-ai-automation": SolutionsAiAutomation,
    
    "solutions-social-media": SolutionsSocialMedia,
    
    "solutions-seo-geo": SolutionsSeoGeo,
    
    "solutions-lead-generation": SolutionsLeadGeneration,
    
    "solutions-paid-advertising": SolutionsPaidAdvertising,
    
    "solutions-podcasting": SolutionsPodcasting,
    
    "solutions-custom-apps": SolutionsCustomApps,
    
    "solutions-crm-management": SolutionsCrmManagement,
    
    "solutions-fractional-cmo": SolutionsFractionalCmo,
    
    podcast: Podcast,
    
    gallery: Gallery,
    
    faq: Faq,

    "animations-demo": ScrollAnimationDemo,
    "video-scrub-demo": VideoScrubDemo,
    "text-glitch-demo": TextGlitchDemo,

    // Landing page demos
    "demos": DemosIndex,
    "demos-hero-focus": DemoHeroFocus,
    "demos-benefits-driven": DemoBenefitsDriven,
    "demos-social-proof": DemoSocialProof,
    "demos-interactive": DemoInteractive,
    "demos-conversion": DemoConversion,
    "demos-best-of-all": DemoBestOfAll,
    "demos-growth-audit": GrowthAuditDemo,
    "demos-growth-audit-results": GrowthAuditResults,
    "demos-keyword-research": KeywordResearchDemo,
    "demos-ai-content-writer": AIContentWriterDemo,

    // Hidden utility pages
    "graveyard-archive": GraveyardArchive,
    "screenshot-manager": ScreenshotManager,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    // Handle root path explicitly
    if (urlLastPart === '' || url === '') {
        return 'Home';
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || '404';
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    // DEBUG: Log route changes
    console.log('🔍 [ROUTING] Current location:', location.pathname);
    console.log('🔍 [ROUTING] Matched page:', currentPage);
    console.log('🔍 [ROUTING] Available pages:', Object.keys(PAGES));

    return (
        <Suspense fallback={null}>
            <Routes>
                {/* Disruptors Connect (Kiosk check-in system) - Standalone pages without header/footer */}
                <Route path="/connectqr1" element={<ConnectWelcome />} />
                <Route path="/connectqr1/checkin" element={<ConnectIntake />} />
                <Route path="/connectqr1/poll" element={<ConnectPoll />} />
                <Route path="/connectqr1/success" element={<ConnectSuccess />} />
                <Route path="/connectqr1/scan" element={<ConnectScanner />} />
                <Route path="/connectqr1/itinerary" element={<ConnectItinerary />} />
                <Route path="/connectqr1/results" element={<ConnectResults />} />

                {/* All other routes wrapped in Layout with header/footer */}
                <Route path="*" element={
                    <Layout currentPageName={currentPage}>
                        <Routes>
                            <Route path="/" element={<Home />} />

                            <Route path="/Home" element={<Home />} />

                            <Route path="/tools" element={<Tools />} />

                            <Route path="/assessment" element={<Assessment />} />

                            <Route path="/calculator" element={<Calculator />} />

                            <Route path="/marketing-audit" element={<MarketingAudit />} />

                            <Route path="/404" element={<NotFound />} />

                            <Route path="/work-saas-content-engine" element={<WorkSaasContentEngine />} />

                            <Route path="/resources-ai-suitcase-terms-decoded" element={<ResourcesAiSuitcaseTermsDecoded />} />

                            <Route path="/solutions" element={<Solutions />} />

                            <Route path="/work" element={<Work />} />

                            <Route path="/about" element={<About />} />

                            <Route path="/pricing" element={<Pricing />} />

                            <Route path="/ai-tools" element={<AITools />} />

                            {/* Redirect old resources route to new ai-tools route */}
                            <Route path="/resources" element={<AITools />} />

                            {/* Free downloadable resources (lead magnets) */}
                            <Route path="/free-resources" element={<FreeResources />} />

                            {/* <Route path="/contact" element={<Contact />} /> ARCHIVED */}

                            {/* Dev pages for comparison */}
                            <Route path="/Home-dev" element={<HomeDev />} />
                            <Route path="/about-dev" element={<AboutDev />} />
                            <Route path="/solutions-dev" element={<SolutionsDev />} />
                            <Route path="/work-dev" element={<WorkDev />} />
                            <Route path="/resources-dev" element={<ResourcesDev />} />
                            <Route path="/contact-dev" element={<ContactDev />} />

                            <Route path="/privacy" element={<Privacy />} />

                            <Route path="/terms" element={<Terms />} />

                            <Route path="/blog" element={<Blog />} />

                            <Route path="/blog-detail" element={<BlogDetail />} />
                            <Route path="/blog-new" element={<BlogDetailNew />} />

                            {/* Blog Management moved to Admin Nexus for security */}
                            {/* <Route path="/blog-management" element={<BlogManagement />} /> */}

                            {/* Auth Callback */}
                            <Route path="/auth/callback" element={<AuthCallback />} />

                            {/* Protected App Routes */}
                            <Route path="/business-brain-manager" element={<ProtectedRoute><BusinessBrainManager /></ProtectedRoute>} />
                            <Route path="/app/business-brain" element={<ProtectedRoute><BusinessBrainManager /></ProtectedRoute>} />

                            <Route path="/ai-content-writer" element={<ProtectedRoute><AIContentWriter /></ProtectedRoute>} />
                            <Route path="/app/content-writer" element={<ProtectedRoute><AIContentWriter /></ProtectedRoute>} />

                            <Route path="/keyword-research" element={<ProtectedRoute><KeywordResearch /></ProtectedRoute>} />
                            <Route path="/app/keyword-research" element={<ProtectedRoute><KeywordResearch /></ProtectedRoute>} />

                            <Route path="/carousel-generator" element={<ProtectedRoute><CarouselGenerator /></ProtectedRoute>} />
                            <Route path="/app/carousel-generator" element={<ProtectedRoute><CarouselGenerator /></ProtectedRoute>} />

                            <Route path="/work-tradeworx-usa" element={<WorkTradeworxUsa />} />

                            <Route path="/work-timber-view-financial" element={<WorkTimberViewFinancial />} />

                            <Route path="/work-the-wellness-way" element={<WorkTheWellnessWay />} />

                            <Route path="/work-sound-corrections" element={<WorkSoundCorrections />} />

                            <Route path="/work-segpro" element={<WorkSegpro />} />

                            <Route path="/work-neuro-mastery" element={<WorkNeuroMastery />} />

                            <Route path="/work-muscle-works" element={<WorkMuscleWorks />} />

                            <Route path="/work-granite-paving" element={<WorkGranitePaving />} />

                            <Route path="/work-auto-trim-utah" element={<WorkAutoTrimUtah />} />

                            <Route path="/billboard" element={<Billboard />} />

                            <Route path="/book-strategy-session" element={<BookStrategySession />} />

                            <Route path="/solutions-ai-automation" element={<SolutionsAiAutomation />} />

                            <Route path="/solutions-social-media" element={<SolutionsSocialMedia />} />

                            <Route path="/solutions-seo-geo" element={<SolutionsSeoGeo />} />

                            <Route path="/solutions-lead-generation" element={<SolutionsLeadGeneration />} />

                            <Route path="/solutions-paid-advertising" element={<SolutionsPaidAdvertising />} />

                            <Route path="/solutions-podcasting" element={<SolutionsPodcasting />} />

                            <Route path="/solutions-custom-apps" element={<SolutionsCustomApps />} />

                            <Route path="/solutions-crm-management" element={<SolutionsCrmManagement />} />

                            <Route path="/solutions-fractional-cmo" element={<SolutionsFractionalCmo />} />

                            <Route path="/podcast" element={<Podcast />} />

                            <Route path="/gallery" element={<Gallery />} />

                            <Route path="/faq" element={<Faq />} />

                            <Route path="/animations-demo" element={<ScrollAnimationDemo />} />
                            <Route path="/video-scrub-demo" element={<VideoScrubDemo />} />
                            <Route path="/text-glitch-demo" element={<TextGlitchDemo />} />

                            {/* Landing page demos */}
                            <Route path="/demos" element={<DemosIndex />} />
                            <Route path="/demos/hero-focus" element={<DemoHeroFocus />} />
                            <Route path="/demos/benefits-driven" element={<DemoBenefitsDriven />} />
                            <Route path="/demos/social-proof" element={<DemoSocialProof />} />
                            <Route path="/demos/interactive" element={<DemoInteractive />} />
                            <Route path="/demos/conversion" element={<DemoConversion />} />
                            <Route path="/demos/best-of-all" element={<DemoBestOfAll />} />
                            <Route path="/demos/growth-audit" element={<GrowthAuditDemo />} />
                            <Route path="/demos/growth-audit/:jobId" element={<GrowthAuditResults />} />
                            <Route path="/demos/keyword-research" element={<KeywordResearchDemo />} />
                            <Route path="/demos/ai-content-writer" element={<AIContentWriterDemo />} />

                            {/* Hidden utility pages */}
                            <Route path="/graveyard-archive" element={<GraveyardArchive />} />
                            <Route path="/screenshot-manager" element={<ScreenshotManager />} />

                            {/* Catch-all route for 404 pages */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
        </Suspense>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}