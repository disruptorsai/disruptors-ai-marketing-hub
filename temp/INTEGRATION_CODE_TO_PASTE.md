# Copy-Paste Integration Code

There seems to be a file watcher/linter interfering with edits. Here's the exact code to paste manually:

## 1. src/pages/index.jsx - Add Imports (after line 93)

Find this section (around line 91-95):
```javascript
// Auth system
const AuthCallback = lazyWithRetry(() => import('./auth-callback.jsx'));
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Work case studies - lazy loaded with retry
```

**Add these 3 lines between `ProtectedRoute` and `// Work case studies`:**

```javascript
// Lead magnet system - lazy loaded with retry
const LeadMagnetLanding = lazyWithRetry(() => import('./lead-magnet-landing.jsx'));
const LeadMagnetGated = lazyWithRetry(() => import('./lead-magnet-gated.jsx'));
const BrainSetup = lazyWithRetry(() => import('./brain-setup.jsx'));
```

Should look like:
```javascript
// Auth system
const AuthCallback = lazyWithRetry(() => import('./auth-callback.jsx'));
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Lead magnet system - lazy loaded with retry
const LeadMagnetLanding = lazyWithRetry(() => import('./lead-magnet-landing.jsx'));
const LeadMagnetGated = lazyWithRetry(() => import('./lead-magnet-gated.jsx'));
const BrainSetup = lazyWithRetry(() => import('./brain-setup.jsx'));

// Work case studies - lazy loaded with retry
```

---

## 2. src/pages/index.jsx - Add Routes (after line 358)

Find this section (around line 357-360):
```javascript
{/* Auth Callback */}
<Route path="/auth/callback" element={<AuthCallback />} />

{/* Protected App Routes */}
```

**Add these 3 routes after the Auth Callback route:**

```javascript
{/* Lead Magnet System */}
<Route path="/l/:slug" element={<LeadMagnetLanding />} />
<Route path="/g/:slug" element={<LeadMagnetGated />} />
<Route path="/app/setup-brain" element={<BrainSetup />} />
```

Should look like:
```javascript
{/* Auth Callback */}
<Route path="/auth/callback" element={<AuthCallback />} />

{/* Lead Magnet System */}
<Route path="/l/:slug" element={<LeadMagnetLanding />} />
<Route path="/g/:slug" element={<LeadMagnetGated />} />
<Route path="/app/setup-brain" element={<BrainSetup />} />

{/* Protected App Routes */}
```

---

## 3. src/components/auth/ProtectedRoute.jsx - Update checkIfNewUser Function

Find the `checkIfNewUser` function (around line 103-119):

```javascript
const checkIfNewUser = async (userId) => {
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
};
```

**Replace entire function with:**

```javascript
const checkIfNewUser = async (userId) => {
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
};
```

---

## Done!

After making these 3 edits:

1. Save all files
2. Restart your dev server: `npm run dev:netlify`
3. Test at: `http://localhost:8888/l/ai-email-swipes?utm_source=test`

Everything else is already built and ready!
