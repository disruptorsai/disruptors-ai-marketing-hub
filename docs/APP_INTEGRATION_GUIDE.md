# App Integration Guide

## Overview

This guide explains how the AI Content Writer and Business Brain Manager apps are integrated into the Disruptors AI Marketing Hub, specifically how they connect to the Resources page and function as standalone applications with authentication.

---

## Architecture

### System Components

```
Resources Page (src/pages/resources.jsx)
    ↓
ResourceCard Components (src/components/shared/ResourceCard.jsx)
    ↓
User clicks tool with isLive: true
    ↓
Navigation to /app/* route
    ↓
ProtectedRoute wrapper (src/components/auth/ProtectedRoute.jsx)
    ↓
Authentication check
    ↓
├─ Authenticated → Load app with user's Business Brain
└─ Not authenticated → Show LoginModal → Onboarding → Then load app
```

---

## Resources Page Integration

### Tool Configuration

Tools are defined in `src/pages/resources.jsx` with route and live status:

```javascript
const MARKETING_TOOLS = [
  {
    title: 'AI Content Writer',
    description: 'Generate SEO-optimized blog posts and articles',
    icon: FileText,
    category: 'AI Tools',
    route: '/app/content-writer',    // App route
    isLive: true,                     // Shows green LIVE badge
    tier: 'all'
  },
  {
    title: 'Business Brain Manager',
    description: 'Manage your Business Brain knowledge base',
    icon: Brain,
    category: 'AI Tools',
    route: '/app/business-brain',     // App route
    isLive: true,                     // Shows green LIVE badge
    tier: 'all'
  },
  {
    title: 'AI Image Generator',
    description: 'Create stunning visuals with AI',
    icon: Image,
    category: 'AI Tools',
    comingSoon: true,                 // Coming Soon badge
    tier: 'core'
  }
];
```

### Navigation Logic

```javascript
const handleToolClick = (tool) => {
  if (tool.isLive && tool.route) {
    // Navigate to app route
    navigate(tool.route);
    return;
  }

  if (tool.comingSoon) {
    // Show "Coming Soon" message
    setSelectedTool(tool);
    setIsModalOpen(true);
    return;
  }

  // Other tools (demos, calculators, etc.)
  // Handle custom navigation logic
};
```

### ResourceCard Visual Indicators

**LIVE Badge** (`isLive: true`):
```jsx
{isLive && (
  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
    LIVE
  </div>
)}
```

**Coming Soon Badge** (`comingSoon: true`):
```jsx
{comingSoon && (
  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
    COMING SOON
  </div>
)}
```

---

## Route Configuration

### App Routes Definition

In `src/pages/index.jsx`:

```javascript
import { lazy } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Lazy load app pages
const BusinessBrainManager = lazy(() => import('./business-brain-manager.jsx'));
const AIContentWriter = lazy(() => import('./ai-content-writer.jsx'));
const AuthCallback = lazy(() => import('./auth-callback.jsx'));

// Route definitions
<Routes>
  {/* OAuth callback route */}
  <Route path="/auth/callback" element={<AuthCallback />} />

  {/* Protected app routes */}
  <Route path="/app/business-brain" element={
    <ProtectedRoute>
      <BusinessBrainManager />
    </ProtectedRoute>
  } />

  <Route path="/app/content-writer" element={
    <ProtectedRoute>
      <AIContentWriter />
    </ProtectedRoute>
  } />

  {/* Other routes... */}
</Routes>
```

### Lazy Loading Strategy

**Why lazy loading:**
- Reduces initial bundle size
- Faster page load times
- Code splitting for better performance
- Only loads app code when needed

**Implementation:**
```javascript
const BusinessBrainManager = lazy(() => import('./business-brain-manager.jsx'));

// Wrapped in Suspense (in Layout.jsx)
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    {/* routes */}
  </Routes>
</Suspense>
```

---

## Business Brain Manager App

### Overview
Full-featured Business Brain management interface with 11 modules for managing business knowledge, brand identity, and AI training data.

### Route
`/app/business-brain`

### Authentication
Required via ProtectedRoute wrapper

### Data Loading

**On mount, loads user's Business Brain:**
```javascript
useEffect(() => {
  loadBrain();
}, []);

const loadBrain = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Not authenticated');
      return;
    }

    const brainData = await BrainAPI.getBrainByUser(user.id);
    setBrain(brainData);
  } catch (err) {
    console.error('Failed to load brain:', err);
    setError(err.message);
  }
};
```

### Features

**Dashboard Tab:**
- Brain health overview
- Confidence score visualization
- Total facts count
- Last training date
- Quick actions

**Facts Tab:**
- Search and filter brain facts
- Add new facts manually
- Edit existing facts
- Delete facts
- Categorize facts

**Training Tab:**
- Upload training documents
- Web scraping interface
- Manual data entry
- Import from integrations

**Settings Tab:**
- Business information
- Brand identity
- Voice and tone
- Publishing preferences

### UI Components

**Brain level indicator:**
```jsx
<Badge className={getBrainLevelColor(brain.brain_level)}>
  {brain.brain_level.toUpperCase()}
</Badge>
```

**Confidence score:**
```jsx
<Progress value={brain.confidence_score * 100} className="w-full" />
<span>{Math.round(brain.confidence_score * 100)}%</span>
```

---

## AI Content Writer App

### Overview
AI-powered content generation tool that creates blog posts, articles, and marketing copy personalized to the user's business using their Business Brain.

### Route
`/app/content-writer`

### Authentication
Required via ProtectedRoute wrapper

### Data Loading

**Loads user's Business Brain on mount:**
```javascript
useEffect(() => {
  loadUserBrain();
}, []);

const loadUserBrain = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Not authenticated');
      return;
    }

    const brain = await BrainAPI.getBrainByUser(user.id);
    setUserBrain(brain);

    toast.success('Brain loaded successfully!', {
      description: `Using brain: ${brain.business_name || 'Business Brain'}`
    });
  } catch (error) {
    console.error('Error loading brain:', error);
    toast.error('Failed to load Business Brain');
  }
};
```

### Features

**Content Generation:**
- Blog post creation
- Article writing
- Social media copy
- Email campaigns
- Product descriptions

**AI Personalization:**
- Uses Business Brain facts
- Applies brand voice
- Incorporates target keywords
- Maintains brand consistency

**Editor Features:**
- Rich text editor
- Real-time preview
- SEO optimization
- Keyword analysis
- Readability score

**Publishing:**
- Save as draft
- Publish to blog
- Schedule posts
- Export to various formats

### Business Brain Integration

**Content generation uses brain context:**
```javascript
const generateContent = async (prompt) => {
  const response = await fetch('/.netlify/functions/ai-content-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      brainId: userBrain.id,
      brainContext: {
        business_name: userBrain.business_name,
        industry: userBrain.industry,
        brand_voice: userBrain.brand_voice,
        tone_attributes: userBrain.tone_attributes,
        target_keywords: userBrain.target_keywords
      }
    })
  });

  return await response.json();
};
```

---

## Protected Route Behavior

### Authentication Flow

**1. User clicks LIVE tool on Resources page:**
```javascript
navigate('/app/content-writer');
```

**2. ProtectedRoute checks authentication:**
```javascript
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      setUser(session.user);
      await checkOnboardingStatus(session.user);
    } else {
      setShowLogin(true);
    }
  };

  checkAuth();
}, []);
```

**3. Authentication scenarios:**

**Already logged in:**
- User object exists
- Onboarding complete
- → Render app immediately

**Not logged in:**
- Show LoginModal
- User authenticates
- Check onboarding status
- → Show onboarding if needed
- → Then render app

**Logged in but onboarding incomplete:**
- Show OnboardingFlow
- User completes onboarding
- Business Brain created
- → Then render app

### Onboarding Status Check

```javascript
const checkOnboardingStatus = async (user) => {
  try {
    const brain = await BrainAPI.getBrainByUser(user.id);

    if (!brain || !brain.onboarding_completed) {
      setShowOnboarding(true);
    }
  } catch (error) {
    // No brain found - show onboarding
    setShowOnboarding(true);
  }
};
```

---

## Error Handling

### No Business Brain Found

**Scenario:** User authenticated but no Business Brain exists

**Handling:**
```javascript
if (!userBrain) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">No Business Brain Found</h2>
      <p className="text-gray-600 mb-4">
        Please complete onboarding to create your Business Brain
      </p>
      <Button onClick={() => navigate('/resources')}>
        Back to Resources
      </Button>
    </div>
  );
}
```

### Authentication Failure

**Scenario:** User session expired or invalid

**Handling:**
```javascript
const { data: { session }, error } = await supabase.auth.getSession();

if (error || !session) {
  toast.error('Session expired', {
    description: 'Please log in again'
  });
  setShowLogin(true);
  return;
}
```

### Brain Loading Error

**Scenario:** Database error or network issue

**Handling:**
```javascript
try {
  const brain = await BrainAPI.getBrainByUser(user.id);
  setBrain(brain);
} catch (error) {
  console.error('Brain load error:', error);

  toast.error('Failed to load Business Brain', {
    description: 'Please refresh the page or contact support'
  });

  setError(error.message);
}
```

---

## Adding New Apps

### Step 1: Create App Page

Create page file: `src/pages/your-app.jsx`

```javascript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { BrainAPI } from '@/lib/brain-api';

export default function YourApp() {
  const [userBrain, setUserBrain] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrain();
  }, []);

  const loadBrain = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const brain = await BrainAPI.getBrainByUser(user.id);
      setUserBrain(brain);
    } catch (error) {
      console.error('Error loading brain:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!userBrain) return <NoBrainMessage />;

  return (
    <div>
      {/* Your app UI */}
    </div>
  );
}
```

### Step 2: Add Route

In `src/pages/index.jsx`:

```javascript
const YourApp = lazy(() => import('./your-app.jsx'));

<Route path="/app/your-app" element={
  <ProtectedRoute>
    <YourApp />
  </ProtectedRoute>
} />
```

### Step 3: Add to Resources Page

In `src/pages/resources.jsx`:

```javascript
const MARKETING_TOOLS = [
  // ... existing tools
  {
    title: 'Your App Name',
    description: 'Your app description',
    icon: YourIcon,
    category: 'AI Tools',
    route: '/app/your-app',
    isLive: true,
    tier: 'all'
  }
];
```

### Step 4: Test Integration

1. Navigate to Resources page
2. Verify LIVE badge appears
3. Click tool card
4. Verify authentication flow
5. Confirm app loads with Business Brain

---

## Performance Considerations

### Lazy Loading

**Current setup:**
- Routes lazy loaded
- Components load on demand
- Reduces initial bundle by ~200KB

**Bundle sizes:**
- business-brain-manager: ~25KB
- ai-content-writer: ~247KB
- Total app code: ~272KB (lazy loaded)

### Business Brain Caching

**Consider implementing:**
```javascript
// Cache brain data to avoid repeated fetches
const BRAIN_CACHE_KEY = 'cached_brain_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const loadBrain = async () => {
  // Check cache first
  const cached = localStorage.getItem(BRAIN_CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      setBrain(data);
      return;
    }
  }

  // Fetch fresh data
  const brain = await BrainAPI.getBrainByUser(user.id);

  // Update cache
  localStorage.setItem(BRAIN_CACHE_KEY, JSON.stringify({
    data: brain,
    timestamp: Date.now()
  }));

  setBrain(brain);
};
```

---

## Testing

### Manual Testing Checklist

**Resources Page:**
- [ ] LIVE badges display correctly
- [ ] Tool cards are clickable
- [ ] Navigation works for live apps
- [ ] Coming Soon modal works for non-live apps

**Authentication Flow:**
- [ ] Clicking app triggers login if not authenticated
- [ ] Login modal displays correctly
- [ ] Both auth methods work (Google OAuth, email/password)
- [ ] Onboarding shows for new users
- [ ] Business Brain created successfully
- [ ] Redirects to app after completion

**App Loading:**
- [ ] Business Brain loads automatically
- [ ] User data displays correctly
- [ ] Error states handled gracefully
- [ ] Loading states show appropriately

**Cross-App Navigation:**
- [ ] Can navigate between apps
- [ ] Session persists across apps
- [ ] Brain data shared across apps
- [ ] Back button works correctly

---

## Troubleshooting

### "No Business Brain Found" after login

**Possible causes:**
1. Onboarding incomplete
2. Brain creation failed
3. Database migration incomplete

**Solutions:**
1. Complete onboarding flow
2. Check Supabase logs for errors
3. Verify `business_brains` table exists
4. Run database verification script

### App not loading after authentication

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Supabase logs for database errors
4. Business Brain exists in database

### Protected route redirect loop

**Causes:**
1. Invalid session
2. Onboarding status check failing
3. Missing OAuth callback handler

**Solutions:**
1. Clear localStorage
2. Re-login
3. Verify auth callback route exists
4. Check Supabase redirect URLs

---

## Related Documentation

- [Authentication System](./AUTHENTICATION_SYSTEM.md)
- [Business Brain Integration Guide](./BUSINESS_BRAIN_INTEGRATION_GUIDE.md)
- [Business Brain User Guide](./BUSINESS_BRAIN_USER_GUIDE.md)
- [Developer Guide](./DEVELOPER_GUIDE_AUTHENTICATION.md)

---

**Last Updated**: 2025-10-08
**Version**: 1.0.0
**Status**: Production Ready ✅
