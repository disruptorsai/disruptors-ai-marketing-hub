import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Layout from "./Layout.jsx";

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Lazy load all pages for optimal performance
// Home page loaded immediately for faster initial render
import Home from "./Home.jsx";

// Core pages - lazy loaded
const Assessment = lazy(() => import('./assessment.jsx'));
const Calculator = lazy(() => import('./calculator.jsx'));
const NotFound = lazy(() => import('./404.jsx'));
const Solutions = lazy(() => import('./solutions.jsx'));
const Work = lazy(() => import('./work.jsx'));
const About = lazy(() => import('./about.jsx'));
const Resources = lazy(() => import('./resources.jsx'));
const Contact = lazy(() => import('./contact.jsx'));
const Privacy = lazy(() => import('./privacy.jsx'));
const Terms = lazy(() => import('./terms.jsx'));

// Dev pages for comparison - lazy loaded
import HomeDev from "./Home-dev.jsx";
const AboutDev = lazy(() => import('./about-dev.jsx'));
const SolutionsDev = lazy(() => import('./solutions-dev.jsx'));
const WorkDev = lazy(() => import('./work-dev.jsx'));
const ResourcesDev = lazy(() => import('./resources-dev.jsx'));
const ContactDev = lazy(() => import('./contact-dev.jsx'));

// Blog system - lazy loaded
const Blog = lazy(() => import('./blog.jsx'));
const BlogDetail = lazy(() => import('./blog-detail.jsx'));
const BlogManagement = lazy(() => import('./blog-management.jsx'));

// Business Brain system - lazy loaded
const BusinessBrainManager = lazy(() => import('./business-brain-manager.jsx'));
const AIContentWriter = lazy(() => import('./ai-content-writer.jsx'));
const Tools = lazy(() => import('./tools.jsx'));

// Auth system
const AuthCallback = lazy(() => import('./auth-callback.jsx'));
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Work case studies - lazy loaded
const WorkSaasContentEngine = lazy(() => import('./work-saas-content-engine.jsx'));
const WorkTradeworxUsa = lazy(() => import('./work-tradeworx-usa.jsx'));
const WorkTimberViewFinancial = lazy(() => import('./work-timber-view-financial.jsx'));
const WorkTheWellnessWay = lazy(() => import('./work-the-wellness-way.jsx'));
const WorkSoundCorrections = lazy(() => import('./work-sound-corrections.jsx'));
const WorkSegpro = lazy(() => import('./work-segpro.jsx'));
const WorkNeuroMastery = lazy(() => import('./work-neuro-mastery.jsx'));
const WorkMuscleWorks = lazy(() => import('./work-muscle-works.jsx'));
const WorkGranitePaving = lazy(() => import('./work-granite-paving.jsx'));
const WorkAutoTrimUtah = lazy(() => import('./work-auto-trim-utah.jsx'));

// Solutions pages - lazy loaded
const SolutionsAiAutomation = lazy(() => import('./solutions-ai-automation.jsx'));
const SolutionsSocialMedia = lazy(() => import('./solutions-social-media.jsx'));
const SolutionsSeoGeo = lazy(() => import('./solutions-seo-geo.jsx'));
const SolutionsLeadGeneration = lazy(() => import('./solutions-lead-generation.jsx'));
const SolutionsPaidAdvertising = lazy(() => import('./solutions-paid-advertising.jsx'));
const SolutionsPodcasting = lazy(() => import('./solutions-podcasting.jsx'));
const SolutionsCustomApps = lazy(() => import('./solutions-custom-apps.jsx'));
const SolutionsCrmManagement = lazy(() => import('./solutions-crm-management.jsx'));
const SolutionsFractionalCmo = lazy(() => import('./solutions-fractional-cmo.jsx'));

// Additional pages - lazy loaded
const BookStrategySession = lazy(() => import('./book-strategy-session.jsx'));
const Podcast = lazy(() => import('./podcast.jsx'));
const Gallery = lazy(() => import('./gallery.jsx'));
const Faq = lazy(() => import('./faq.jsx'));
const ResourcesAiSuitcaseTermsDecoded = lazy(() => import('./resources-ai-suitcase-terms-decoded.jsx'));

// Demo pages with 3D/animations - lazy loaded (saves 1.98 MB physics bundle)
const ScrollAnimationDemo = lazy(() => import('../components/examples/ScrollAnimationExamples.jsx'));
const FullAnimationDemo = lazy(() => import('./full-animation-demo.jsx'));
const SplineDemo = lazy(() => import('./spline-demo.jsx'));
const SplineHandPreview = lazy(() => import('./spline-hand-preview.jsx'));
const VideoScrubDemo = lazy(() => import('./video-scrub-demo.jsx'));
const TextGlitchDemo = lazy(() => import('./TextGlitchDemo.jsx'));

// Landing page demos - lazy loaded
const DemosIndex = lazy(() => import('./demos/index.jsx'));
const DemoHeroFocus = lazy(() => import('./demos/hero-focus.jsx'));
const DemoBenefitsDriven = lazy(() => import('./demos/benefits-driven.jsx'));
const DemoSocialProof = lazy(() => import('./demos/social-proof.jsx'));
const DemoInteractive = lazy(() => import('./demos/interactive.jsx'));
const DemoConversion = lazy(() => import('./demos/conversion.jsx'));
const DemoBestOfAll = lazy(() => import('./demos/best-of-all.jsx'));
const GrowthAuditDemo = lazy(() => import('./demos/growth-audit.jsx'));
const GrowthAuditResults = lazy(() => import('./demos/growth-audit-results.jsx'));

// Hidden utility pages - lazy loaded
const GraveyardArchive = lazy(() => import('./GraveyardArchive.jsx'));
const ScreenshotManager = lazy(() => import('./ScreenshotManager.jsx'));

const PAGES = {

    Home: Home,

    tools: Tools,

    assessment: Assessment,

    calculator: Calculator,

    "404": NotFound,

    "work-saas-content-engine": WorkSaasContentEngine,

    "resources-ai-suitcase-terms-decoded": ResourcesAiSuitcaseTermsDecoded,

    solutions: Solutions,

    work: Work,

    about: About,

    resources: Resources,

    contact: Contact,

    // Dev pages for comparison
    "Home-dev": HomeDev,
    "about-dev": AboutDev,
    "solutions-dev": SolutionsDev,
    "work-dev": WorkDev,
    "resources-dev": ResourcesDev,
    "contact-dev": ContactDev,
    
    privacy: Privacy,
    
    terms: Terms,
    
    blog: Blog,

    "blog-detail": BlogDetail,

    "blog-management": BlogManagement,

    "business-brain-manager": BusinessBrainManager,

    "ai-content-writer": AIContentWriter,

    "work-tradeworx-usa": WorkTradeworxUsa,
    
    "work-timber-view-financial": WorkTimberViewFinancial,
    
    "work-the-wellness-way": WorkTheWellnessWay,
    
    "work-sound-corrections": WorkSoundCorrections,
    
    "work-segpro": WorkSegpro,
    
    "work-neuro-mastery": WorkNeuroMastery,
    
    "work-muscle-works": WorkMuscleWorks,
    
    "work-granite-paving": WorkGranitePaving,
    
    "work-auto-trim-utah": WorkAutoTrimUtah,
    
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

    "full-animation": FullAnimationDemo,

    "spline-demo": SplineDemo,

    "spline-hand-preview": SplineHandPreview,

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

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<PageLoader />}>
                <Routes>

                        <Route path="/" element={<Home />} />


                    <Route path="/Home" element={<Home />} />

                <Route path="/tools" element={<Tools />} />

                <Route path="/assessment" element={<Assessment />} />
                
                <Route path="/calculator" element={<Calculator />} />
                
                <Route path="/404" element={<NotFound />} />
                
                <Route path="/work-saas-content-engine" element={<WorkSaasContentEngine />} />
                
                <Route path="/resources-ai-suitcase-terms-decoded" element={<ResourcesAiSuitcaseTermsDecoded />} />
                
                <Route path="/solutions" element={<Solutions />} />
                
                <Route path="/work" element={<Work />} />
                
                <Route path="/about" element={<About />} />
                
                <Route path="/resources" element={<Resources />} />
                
                <Route path="/contact" element={<Contact />} />

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

                <Route path="/blog-management" element={<BlogManagement />} />

                {/* Auth Callback */}
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Protected App Routes */}
                <Route path="/business-brain-manager" element={<ProtectedRoute><BusinessBrainManager /></ProtectedRoute>} />
                <Route path="/app/business-brain" element={<ProtectedRoute><BusinessBrainManager /></ProtectedRoute>} />

                <Route path="/ai-content-writer" element={<ProtectedRoute><AIContentWriter /></ProtectedRoute>} />
                <Route path="/app/content-writer" element={<ProtectedRoute><AIContentWriter /></ProtectedRoute>} />

                <Route path="/work-tradeworx-usa" element={<WorkTradeworxUsa />} />
                
                <Route path="/work-timber-view-financial" element={<WorkTimberViewFinancial />} />
                
                <Route path="/work-the-wellness-way" element={<WorkTheWellnessWay />} />
                
                <Route path="/work-sound-corrections" element={<WorkSoundCorrections />} />
                
                <Route path="/work-segpro" element={<WorkSegpro />} />
                
                <Route path="/work-neuro-mastery" element={<WorkNeuroMastery />} />
                
                <Route path="/work-muscle-works" element={<WorkMuscleWorks />} />
                
                <Route path="/work-granite-paving" element={<WorkGranitePaving />} />
                
                <Route path="/work-auto-trim-utah" element={<WorkAutoTrimUtah />} />
                
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

                <Route path="/full-animation" element={<FullAnimationDemo />} />

                <Route path="/spline-demo" element={<SplineDemo />} />

                <Route path="/spline-hand-preview" element={<SplineHandPreview />} />

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

                {/* Hidden utility pages */}
                <Route path="/graveyard-archive" element={<GraveyardArchive />} />
                <Route path="/screenshot-manager" element={<ScreenshotManager />} />

                {/* Catch-all route for 404 pages */}
                <Route path="*" element={<NotFound />} />

            </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}