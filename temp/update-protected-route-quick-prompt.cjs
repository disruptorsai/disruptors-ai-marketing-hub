/**
 * Update ProtectedRoute to show Quick Brain Prompt for One Tap users
 */

const fs = require('fs');
const path = require('path');

const PROTECTED_ROUTE_PATH = path.join(__dirname, '..', 'src/components/auth/ProtectedRoute.jsx');

console.log('🚀 Updating ProtectedRoute to show Quick Brain Prompt...\n');

try {
  let content = fs.readFileSync(PROTECTED_ROUTE_PATH, 'utf8');

  // Step 1: Add import for QuickBrainPrompt
  if (!content.includes('QuickBrainPrompt')) {
    content = content.replace(
      `import LoginModal from './LoginModal';
import OnboardingFlow from './OnboardingFlow';`,
      `import LoginModal from './LoginModal';
import OnboardingFlow from './OnboardingFlow';
import QuickBrainPrompt from './QuickBrainPrompt';`
    );
    console.log('✅ Added QuickBrainPrompt import');
  } else {
    console.log('⏭️  QuickBrainPrompt import already exists');
  }

  // Step 2: Add showQuickPrompt state
  if (!content.includes('showQuickPrompt')) {
    content = content.replace(
      `const [showLogin, setShowLogin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);`,
      `const [showLogin, setShowLogin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showQuickPrompt, setShowQuickPrompt] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);`
    );
    console.log('✅ Added showQuickPrompt state');
  } else {
    console.log('⏭️  showQuickPrompt state already exists');
  }

  // Step 3: Replace checkIfNewUser function to show quick prompt for one-tap users
  const oldCheckIfNewUser = `  const checkIfNewUser = async (userId) => {
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

  const newCheckIfNewUser = `  const checkIfNewUser = async (userId) => {
    try {
      console.log('🔒 [PROTECTED_ROUTE] Checking if user has brain for userId:', userId);

      // Check if user signed up via One Tap (lead magnet flow)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const signupSource = currentUser?.user_metadata?.signup_source;
      const onboardingCompleted = currentUser?.user_metadata?.onboarding_completed;
      const brainPromptShown = currentUser?.user_metadata?.brain_prompt_shown;

      console.log('🔒 [PROTECTED_ROUTE] User metadata:', {
        signupSource,
        onboardingCompleted,
        brainPromptShown
      });

      // Try to get user's business brain
      const brain = await BrainAPI.getBrainByUser(userId);
      console.log('🔒 [PROTECTED_ROUTE] Brain API response:', {
        hasBrain: !!brain,
        brainId: brain?.id,
        businessName: brain?.business_name
      });

      // If user has a brain, no onboarding needed
      if (brain) {
        return false;
      }

      // User has no brain - check if they're a one-tap user
      if (signupSource === 'one_tap' && onboardingCompleted === false) {
        // One-tap user without brain
        // Check if we've shown them the quick prompt this session
        const promptSeenThisSession = sessionStorage.getItem('brain_prompt_seen');

        if (!brainPromptShown && !promptSeenThisSession) {
          // First time seeing AI tool - show quick brain explainer
          console.log('🔒 [PROTECTED_ROUTE] One Tap user - showing Quick Brain Prompt');
          setShowQuickPrompt(true);
          return false; // Don't force full onboarding yet
        } else {
          // They've seen the prompt before and skipped - let them use tool without brain
          console.log('🔒 [PROTECTED_ROUTE] One Tap user already saw prompt - allowing access');
          return false;
        }
      }

      // Regular signup (not one-tap) without brain - show full onboarding
      return true;
    } catch (error) {
      // Error fetching brain - assume new user needs onboarding
      console.error('🔒 [PROTECTED_ROUTE] Error checking user brain:', error);
      return true;
    }
  };`;

  content = content.replace(oldCheckIfNewUser, newCheckIfNewUser);
  console.log('✅ Updated checkIfNewUser function');

  // Step 4: Add handlers for Quick Prompt
  if (!content.includes('handleQuickPromptSetup')) {
    const handlersToAdd = `
  const handleQuickPromptSetup = () => {
    // User chose to set up their Brain now
    console.log('🔒 [PROTECTED_ROUTE] User chose to set up Brain from quick prompt');
    setShowQuickPrompt(false);
    setShowOnboarding(true);
    setIsNewUser(true);
  };

  const handleQuickPromptSkip = () => {
    // User chose to skip Brain setup for now
    console.log('🔒 [PROTECTED_ROUTE] User skipped Brain setup');
    setShowQuickPrompt(false);
    // Let them use the tool without a brain (generic AI)
    toast.info('You can set up your Business Brain anytime from your dashboard');
  };

  const handleQuickPromptClose = () => {
    // User closed the prompt (same as skip)
    handleQuickPromptSkip();
  };
`;

    content = content.replace(
      `  const handleOnboardingClose = () => {`,
      handlersToAdd + `  const handleOnboardingClose = () => {`
    );
    console.log('✅ Added Quick Prompt handlers');
  } else {
    console.log('⏭️  Quick Prompt handlers already exist');
  }

  // Step 5: Add QuickBrainPrompt component to render
  if (!content.includes('<QuickBrainPrompt')) {
    content = content.replace(
      `      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        user={user}
      />
    </>
  );
}`,
      `      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        user={user}
      />

      <QuickBrainPrompt
        isOpen={showQuickPrompt}
        onSetupNow={handleQuickPromptSetup}
        onSkip={handleQuickPromptSkip}
        onClose={handleQuickPromptClose}
      />
    </>
  );
}`
    );
    console.log('✅ Added QuickBrainPrompt component to render');
  } else {
    console.log('⏭️  QuickBrainPrompt component already in render');
  }

  // Write the updated content
  fs.writeFileSync(PROTECTED_ROUTE_PATH, content, 'utf8');

  console.log('\n✅ ProtectedRoute updated successfully!');
  console.log('\nNext steps:');
  console.log('1. Restart your dev server: npm run dev:netlify');
  console.log('2. Test the flow:');
  console.log('   - Sign up via lead magnet (/l/ai-email-swipes)');
  console.log('   - Then click an AI tool from Resources page');
  console.log('   - You should see the beautiful Quick Brain Prompt!');

} catch (error) {
  console.error('❌ Error updating ProtectedRoute:', error.message);
  process.exit(1);
}
