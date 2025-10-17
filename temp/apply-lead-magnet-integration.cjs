/**
 * Integration Script for Lead Magnet System
 * Applies all necessary code changes to integrate the one-click signup system
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

// File paths
const INDEX_PATH = path.join(projectRoot, 'src/pages/index.jsx');
const PROTECTED_ROUTE_PATH = path.join(projectRoot, 'src/components/auth/ProtectedRoute.jsx');

console.log('🚀 Starting Lead Magnet System Integration...\n');

// ============================================================================
// STEP 1: Add imports to src/pages/index.jsx
// ============================================================================

console.log('Step 1: Adding imports to src/pages/index.jsx...');

try {
  let indexContent = fs.readFileSync(INDEX_PATH, 'utf8');

  // Check if imports already exist
  if (indexContent.includes('lead-magnet-landing.jsx')) {
    console.log('✅ Lead magnet imports already exist in index.jsx\n');
  } else {
    // Find the line with "// Auth system" and add imports before "// Work case studies"
    const importCode = `// Auth system
const AuthCallback = lazyWithRetry(() => import('./auth-callback.jsx'));
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Lead magnet system - lazy loaded with retry
const LeadMagnetLanding = lazyWithRetry(() => import('./lead-magnet-landing.jsx'));
const LeadMagnetGated = lazyWithRetry(() => import('./lead-magnet-gated.jsx'));
const BrainSetup = lazyWithRetry(() => import('./brain-setup.jsx'));

// Work case studies - lazy loaded with retry`;

    indexContent = indexContent.replace(
      /\/\/ Auth system\nconst AuthCallback = lazyWithRetry\(\(\) => import\('\.\/auth-callback\.jsx'\)\);\nimport ProtectedRoute from '@\/components\/auth\/ProtectedRoute';\n\n\/\/ Work case studies - lazy loaded with retry/,
      importCode
    );

    fs.writeFileSync(INDEX_PATH, indexContent, 'utf8');
    console.log('✅ Added lead magnet imports to index.jsx\n');
  }
} catch (error) {
  console.error('❌ Error adding imports:', error.message);
  process.exit(1);
}

// ============================================================================
// STEP 2: Add routes to src/pages/index.jsx
// ============================================================================

console.log('Step 2: Adding routes to src/pages/index.jsx...');

try {
  let indexContent = fs.readFileSync(INDEX_PATH, 'utf8');

  // Check if routes already exist
  if (indexContent.includes('<Route path="/l/:slug"')) {
    console.log('✅ Lead magnet routes already exist in index.jsx\n');
  } else {
    // Find the line with {/* Auth Callback */} and add routes after it
    const routeCode = `{/* Auth Callback */}
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Lead Magnet System */}
                <Route path="/l/:slug" element={<LeadMagnetLanding />} />
                <Route path="/g/:slug" element={<LeadMagnetGated />} />
                <Route path="/app/setup-brain" element={<BrainSetup />} />

                {/* Protected App Routes */}`;

    indexContent = indexContent.replace(
      /\{\/\* Auth Callback \*\/\}\n                <Route path="\/auth\/callback" element={<AuthCallback \/>} \/>\n\n                \{\/\* Protected App Routes \*\/\}/,
      routeCode
    );

    fs.writeFileSync(INDEX_PATH, indexContent, 'utf8');
    console.log('✅ Added lead magnet routes to index.jsx\n');
  }
} catch (error) {
  console.error('❌ Error adding routes:', error.message);
  process.exit(1);
}

// ============================================================================
// STEP 3: Update ProtectedRoute.jsx
// ============================================================================

console.log('Step 3: Updating ProtectedRoute.jsx...');

try {
  let protectedRouteContent = fs.readFileSync(PROTECTED_ROUTE_PATH, 'utf8');

  // Check if already updated
  if (protectedRouteContent.includes('signup_source')) {
    console.log('✅ ProtectedRoute.jsx already updated\n');
  } else {
    // Replace the checkIfNewUser function
    const oldFunction = `  const checkIfNewUser = async (userId) => {
    try {
      console.log('🔒 [PROTECTED_ROUTE] Checking if user has brain for userId:', userId);
      // Try to get user's business brain
      const brain = await BrainAPI.getBrainByUser(userId);
      console.log('🔒 [PROTECTED_ROUTE] Brain API response:', {
        hasBrain: !!brain,
        brainId: brain?.id,
        businessName: brain?.business_name
      });
      return brain === null; // null = new user needs onboarding
    } catch (error) {
      // Error fetching brain - assume new user needs onboarding
      console.error('🔒 [PROTECTED_ROUTE] Error checking user brain:', error);
      return true;
    }
  };`;

    const newFunction = `  const checkIfNewUser = async (userId) => {
    try {
      console.log('🔒 [PROTECTED_ROUTE] Checking if user has brain for userId:', userId);

      // Check if user signed up via One Tap (lead magnet flow)
      // These users skip onboarding until they use an actual AI tool
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const signupSource = currentUser?.user_metadata?.signup_source;
      const onboardingCompleted = currentUser?.user_metadata?.onboarding_completed;

      console.log('🔒 [PROTECTED_ROUTE] User metadata:', {
        signupSource,
        onboardingCompleted
      });

      // If user signed up via One Tap and hasn't explicitly completed onboarding,
      // skip onboarding for now (they came for a lead magnet, not the app)
      if (signupSource === 'one_tap' && onboardingCompleted === false) {
        console.log('🔒 [PROTECTED_ROUTE] One Tap user - skipping onboarding');
        return false;
      }

      // Try to get user's business brain
      const brain = await BrainAPI.getBrainByUser(userId);
      console.log('🔒 [PROTECTED_ROUTE] Brain API response:', {
        hasBrain: !!brain,
        brainId: brain?.id,
        businessName: brain?.business_name
      });
      return brain === null; // null = new user needs onboarding
    } catch (error) {
      // Error fetching brain - assume new user needs onboarding
      console.error('🔒 [PROTECTED_ROUTE] Error checking user brain:', error);
      return true;
    }
  };`;

    protectedRouteContent = protectedRouteContent.replace(oldFunction, newFunction);

    fs.writeFileSync(PROTECTED_ROUTE_PATH, protectedRouteContent, 'utf8');
    console.log('✅ Updated ProtectedRoute.jsx\n');
  }
} catch (error) {
  console.error('❌ Error updating ProtectedRoute:', error.message);
  process.exit(1);
}

// ============================================================================
// DONE!
// ============================================================================

console.log('✅ Integration complete!\n');
console.log('Next steps:');
console.log('1. Restart your dev server: npm run dev:netlify');
console.log('2. Test at: http://localhost:8888/l/ai-email-swipes?utm_source=test');
console.log('\nFull documentation: docs/ONE_CLICK_SIGNUP_SETUP.md\n');
