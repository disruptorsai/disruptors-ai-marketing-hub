# Authentication System Documentation

## Overview

The Disruptors AI Marketing Hub implements a complete authentication system with:
- **Glassmorphism login modal** with modern UI design
- **Dual auth methods**: Google OAuth and email/password
- **Protected routes** for `/app/*` paths
- **Session persistence** with localStorage
- **6-step onboarding flow** for new users
- **Business Brain auto-creation** on signup

---

## Architecture

### Components

**1. LoginModal** (`src/components/auth/LoginModal.jsx`)
- Premium glassmorphism design with animated gradient background
- Toggle between login and signup modes
- Google OAuth integration via Supabase
- Email/password authentication
- Form validation and error handling
- Responsive design for all screen sizes

**2. OnboardingFlow** (`src/components/auth/OnboardingFlow.jsx`)
- 6-step wizard for new user setup
- Business Brain concept explanation
- Business information collection
- Optional Brand DNA configuration
- Website scraping integration
- Auto-creates Business Brain on completion

**3. ProtectedRoute** (`src/components/auth/ProtectedRoute.jsx`)
- Authentication guard wrapper
- Shows LoginModal if not authenticated
- Triggers OnboardingFlow for new users
- Manages session state
- Handles OAuth callbacks

**4. AuthCallback** (`src/pages/auth-callback.jsx`)
- OAuth redirect handler
- Exchanges auth code for session
- Sets session cookie
- Redirects to home with success message

### Data Flow

```
User clicks "AI Content Writer"
    ↓
ProtectedRoute checks auth
    ↓
Not logged in → Show LoginModal
    ↓
User chooses auth method
    ↓
├─ Google OAuth → Redirect to Google → Callback → Session created
└─ Email/Password → Direct signup → Session created
    ↓
Is new user? → Yes → Show OnboardingFlow
    ↓
User completes onboarding (6 steps)
    ↓
Business Brain created in database
    ↓
Optional: Website scraping triggered
    ↓
Redirect to requested app
```

---

## Authentication Methods

### Google OAuth

**Setup Requirements:**
1. Enable Google provider in Supabase Dashboard
2. Configure OAuth redirect URLs
3. Set up Google Cloud Console credentials

**Flow:**
```javascript
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};
```

**Redirect URLs to configure:**
- Development: `http://localhost:5174/auth/callback`
- Production: `https://dm4.wjwelsh.com/auth/callback`

### Email/Password

**Signup Flow:**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePass123!',
});
```

**Login Flow:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePass123!',
});
```

**Password Requirements:**
- Minimum 6 characters (Supabase default)
- Can be configured in Supabase Dashboard
- Recommended: 8+ characters with mix of types

---

## Onboarding Flow

### Step 1: Welcome
- Welcomes user to Disruptors
- Explains what makes the platform unique
- Sets expectations for onboarding process

### Step 2: Business Brain Introduction
- Explains the Business Brain concept
- Shows how AI personalizes to their business
- Highlights the competitive advantage

### Step 3: Unique Value Proposition
- Emphasizes "game-changing concept"
- Explains how no one else does this
- Builds excitement for the platform

### Step 4: Business Information (Form)
```javascript
{
  businessName: string (required),
  website: string (required),
  industry: string (required),
  description: string (optional)
}
```

**Collected Data:**
- Business name
- Website URL (for scraping)
- Industry selection
- Business description

### Step 5: Brand DNA Configuration (Optional)
```javascript
{
  primaryColor: hex color,
  secondaryColor: hex color,
  brandTone: 'professional' | 'casual' | 'friendly' | 'authoritative',
  fontPreference: 'modern' | 'classic' | 'bold'
}
```

**Can be skipped** - configured later in Business Brain Manager

### Step 6: Setup Complete
- Shows loading animation during brain creation
- Displays success message
- Triggers website scraping (if URL provided)
- Redirects to requested app

---

## Business Brain Creation

### Auto-Creation on Signup

When a user completes onboarding, a Business Brain is automatically created:

```javascript
const brainData = {
  user_id: user.id,
  business_name: businessInfo.businessName,
  primary_website: businessInfo.website,
  industry: businessInfo.industry,
  business_description: businessInfo.description,
  slug: businessInfo.businessName.toLowerCase().replace(/\s+/g, '-'),
  onboarding_completed: true,
  brain_level: 'starter',
  confidence_score: 0.3,
  brand_colors: {
    primary: brandDNA.primaryColor,
    secondary: brandDNA.secondaryColor
  }
};

const brain = await BrainAPI.createBrain(brainData);
```

### Database Schema

The `business_brains` table includes 51 columns:

**Core Fields:**
- `id` (UUID) - Primary key
- `name` - Business name
- `business_name` - Business name (duplicate for compatibility)
- `slug` - URL-friendly identifier
- `created_by` (UUID) - References auth.users(id)

**Contact & Location:**
- `primary_website` - Website URL
- `primary_email` - Contact email
- `primary_phone` - Phone number
- `headquarters_city`, `headquarters_state`, `headquarters_country`
- `service_areas` (array) - Geographic coverage

**Business Intelligence:**
- `industry` - Industry category
- `ideal_customer_profile` (JSONB) - ICP data
- `core_offerings` (JSONB) - Products/services
- `unique_value_propositions` (array)
- `key_differentiators` (array)
- `pain_points_solved` (array)
- `target_keywords` (array)
- `competitor_urls` (array)

**Brand Identity:**
- `brand_colors` (JSONB) - Color palette
- `typography` (JSONB) - Font specifications
- `logo_urls` (JSONB) - Logo assets
- `design_style` - Visual style descriptor
- `brand_voice` (array) - Voice attributes
- `tone_attributes` (array) - Tone descriptors
- `writing_style` - Content style
- `vocabulary_level` - Reading level

**Brain Metrics:**
- `brain_level` - 'starter' | 'enhanced' | 'expert'
- `confidence_score` (decimal) - 0.0 to 1.0
- `total_facts` (integer) - Number of facts learned
- `last_trained_at` (timestamp)
- `last_enhanced_at` (timestamp)

**Status Flags:**
- `onboarding_completed` (boolean)
- `auto_initialized` (boolean)
- `web_scrape_completed` (boolean)
- `brand_colors_extracted` (boolean)

### Website Scraping Integration

If a website URL is provided during onboarding, auto-initialization is triggered:

```javascript
if (businessInfo.website) {
  await BrainAPI.autoInitializeBrain(brain.id, {
    website_url: businessInfo.website
  });
}
```

This calls the `brain-auto-initialize` Netlify function which:
1. Scrapes the website using Firecrawl
2. Extracts 20-50 business facts
3. Populates the Business Brain
4. Increases confidence score to 0.5-0.7
5. May upgrade brain_level to 'enhanced'

---

## Protected Routes

### Implementation

All `/app/*` routes are protected:

```javascript
// In src/pages/index.jsx
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
```

### ProtectedRoute Component

```javascript
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        checkOnboardingStatus(session.user);
      } else {
        setShowLogin(true);
      }
    });
  }, []);

  return (
    <>
      {user && !showOnboarding ? children : null}
      <LoginModal isOpen={showLogin && !user} onAuthSuccess={handleAuthSuccess} />
      <OnboardingFlow isOpen={showOnboarding} onClose={handleOnboardingClose} user={user} />
    </>
  );
};
```

---

## Session Management

### Session Creation

**On successful authentication:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Session is automatically stored in localStorage
// Access token stored in: supabase.auth.token
```

### Session Persistence

**Automatic persistence:**
- Supabase stores session in localStorage
- Session persists across page refreshes
- Auto-refresh when token expires
- 7-day default expiration

**Custom session check:**
```javascript
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  // User is authenticated
  const user = session.user;
}
```

### Session Cleanup

**On logout:**
```javascript
await supabase.auth.signOut();
// Clears localStorage
// Invalidates session token
// Redirects to home
```

---

## Security Considerations

### Password Security
- Passwords hashed with bcrypt by Supabase
- Never stored in plain text
- Minimum 6 characters enforced
- Can configure complexity requirements in Supabase

### OAuth Security
- State parameter prevents CSRF
- PKCE flow for added security
- Tokens stored securely in localStorage
- Automatic token refresh

### Row Level Security (RLS)
```sql
-- Users can only access their own Business Brains
CREATE POLICY "Users can view own brains"
  ON business_brains
  FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can update own brains"
  ON business_brains
  FOR UPDATE
  USING (created_by = auth.uid());
```

### Input Validation
- Email validation on client and server
- URL validation for website field
- XSS protection via React
- SQL injection prevented by Supabase client

---

## Error Handling

### Authentication Errors

**Email already exists:**
```javascript
if (error.message.includes('already registered')) {
  toast.error('Email already registered', {
    description: 'Please login instead or use a different email'
  });
}
```

**Invalid credentials:**
```javascript
if (error.message.includes('Invalid login credentials')) {
  toast.error('Invalid credentials', {
    description: 'Please check your email and password'
  });
}
```

**Network errors:**
```javascript
if (!navigator.onLine) {
  toast.error('No internet connection', {
    description: 'Please check your network and try again'
  });
}
```

### Onboarding Errors

**Brain creation failure:**
```javascript
try {
  const brain = await BrainAPI.createBrain(brainData);
} catch (error) {
  console.error('Brain creation failed:', error);
  toast.error('Failed to create Business Brain', {
    description: 'Please try again or contact support'
  });
  // Cleanup: delete auth user if brain creation fails
  await supabase.auth.admin.deleteUser(user.id);
}
```

---

## Testing

### Manual Testing

**Test User Credentials:**
- Email: `testuser1@example.com`
- Password: `TestPass123!`
- Brain ID: `f9d55fc1-76ec-49d6-a19c-18ed1da7a80d`

**Test Steps:**
1. Visit http://localhost:5174/resources
2. Click "AI Content Writer" (green LIVE badge)
3. Login modal appears
4. Enter credentials
5. Should bypass onboarding (already completed)
6. Redirects to AI Content Writer app
7. Business Brain loaded automatically

### Create New Test User

```bash
node scripts/create-test-user.js \\
  "email@example.com" \\
  "password123" \\
  "Business Name" \\
  "https://example.com" \\
  "Industry"
```

### Automated Testing

Currently no automated tests. Recommended:
- Playwright for E2E testing
- React Testing Library for component tests
- Jest for unit tests

---

## Deployment

### Environment Variables

Required in `.env`:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Netlify Configuration

Add environment variables in Netlify Dashboard:
1. Go to Site Settings → Environment Variables
2. Add all VITE_* variables
3. Redeploy site after adding

### OAuth Redirect URLs

Configure in Supabase Dashboard:
1. Authentication → URL Configuration
2. Add Site URL: `https://dm4.wjwelsh.com`
3. Add Redirect URLs:
   - `https://dm4.wjwelsh.com/auth/callback`
   - `http://localhost:5174/auth/callback` (development)

---

## Troubleshooting

### "Email not confirmed" error
- Check Supabase → Auth → Email Templates
- Ensure email confirmation is disabled for development
- Or check spam folder for confirmation email

### OAuth redirect loop
- Verify redirect URLs in Supabase match exactly
- Check Site URL is configured correctly
- Clear localStorage and try again

### Session not persisting
- Check localStorage is not disabled
- Verify cookies are not blocked
- Check browser console for errors

### Business Brain not created
- Check browser console for errors
- Verify database migration completed
- Check Supabase logs for errors
- Ensure service role key is set

---

## Future Enhancements

### Planned Features
- [ ] Multi-factor authentication (MFA)
- [ ] Social login (LinkedIn, Twitter)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Account settings page
- [ ] Profile management
- [ ] Team invitations
- [ ] Role-based access control (RBAC)

### Potential Improvements
- Add loading states for better UX
- Implement rate limiting
- Add CAPTCHA for signup
- Enhanced error messages
- Onboarding progress saving
- Skip onboarding option

---

## API Reference

### BrainAPI.createBrain()

```typescript
static async createBrain(brainData: {
  business_name: string;
  website_url?: string;
  industry: string;
  business_description?: string;
  slug: string;
  user_id: string;
  onboarding_completed?: boolean;
  brain_level?: 'starter' | 'enhanced' | 'expert';
  confidence_score?: number;
  brand_colors?: object;
}): Promise<BusinessBrain>
```

### BrainAPI.autoInitializeBrain()

```typescript
static async autoInitializeBrain(
  brainId: string,
  options?: {
    website_url?: string;
  }
): Promise<InitializationResult>
```

### BrainAPI.getBrainByUser()

```typescript
static async getBrainByUser(userId: string): Promise<BusinessBrain>
```

---

## Related Documentation

- [Business Brain Integration Guide](./BUSINESS_BRAIN_INTEGRATION_GUIDE.md)
- [App Integration Guide](./APP_INTEGRATION_GUIDE.md)
- [Business Brain User Guide](./BUSINESS_BRAIN_USER_GUIDE.md)
- [Developer Guide](./DEVELOPER_GUIDE_AUTHENTICATION.md)

---

**Last Updated**: 2025-10-08
**Version**: 1.0.0
**Status**: Production Ready ✅
