# Module Template

This is a template for creating new modules in the Disruptors AI Marketing Hub.

## What is a Module?

A **module** is a self-contained, reusable micro-tool that:
- Performs a specific marketing task (SEO, content generation, analytics, etc.)
- Works across three levels: **internal** (admin), **client** (authenticated users), **public** (lead magnets)
- Uses **Business Brain** context for personalization
- Has clear input/output schemas and quotas
- Can be embedded in WordPress sites

## Module Structure

```
/src/modules/your-module-name/
  ├── manifest.json       # Module metadata and configuration
  ├── index.jsx           # Main orchestrator (entry point)
  ├── ModuleUI.jsx        # React UI component
  ├── schema.js           # Zod schemas for validation
  └── README.md           # Documentation
```

## Creating a New Module

### Step 1: Copy Template

```bash
cp -r src/modules/_template src/modules/your-module-name
```

### Step 2: Update manifest.json

```json
{
  "id": "your-module-slug",
  "slug": "your-module-slug",
  "name": "Your Module Name",
  "description": "What this module does",
  "category": "content|seo|automation|analytics|media|social",
  "status": "testing",
  "audience": ["internal"],
  "requires_brain": true,
  "default_daily_limit": 10,
  "default_monthly_limit": 100
}
```

### Step 3: Define Schemas (schema.js)

```javascript
import { z } from 'zod';

export const inputSchema = z.object({
  your_input_field: z.string().min(1).max(1000)
});

export const outputSchema = z.object({
  your_output_field: z.string()
});
```

### Step 4: Build UI Component (ModuleUI.jsx)

Your UI component receives:
- `brain` - Business Brain context
- `audience` - 'internal', 'client', or 'public'
- `config` - User configuration
- `access` - Quota/limit information
- `onRun` - Function to execute the module
- `loading` - Loading state
- `result` - Execution result
- `error` - Execution error

### Step 5: Implement Execution Logic (index.jsx)

```javascript
export const moduleConfig = {
  manifest,
  component: ModuleUI,

  async execute({ input, user, brain, audience, config }) {
    // Your module logic here
    // Call Netlify functions, APIs, etc.

    return {
      your_output_field: 'result'
    };
  }
};
```

### Step 6: Create Netlify Function (optional)

If your module needs serverless compute:

```javascript
// netlify/functions/module-your-module-name.js
export async function handler(event, context) {
  const { input, user_id, brain_id, audience } = JSON.parse(event.body);

  // Your business logic

  return {
    statusCode: 200,
    body: JSON.stringify({ result: 'output' })
  };
}
```

### Step 7: Register Module in Supabase

```sql
INSERT INTO modules (
  slug, name, description, category, status, audience,
  runtime_preference, entry_point, component_path,
  default_daily_limit, default_monthly_limit
) VALUES (
  'your-module-slug',
  'Your Module Name',
  'Description',
  'content',
  'testing',
  '["internal"]'::jsonb,
  'serverless',
  'src/modules/your-module-name/index.jsx',
  'src/modules/your-module-name/ModuleUI.jsx',
  10,
  100
);
```

## Module Lifecycle

1. **Testing** - Internal use only, experimental
2. **Review** - Pilot with select clients
3. **Approved** - Production-ready, can be public
4. **Deprecated** - Phased out

## Three-Level Access

### Level 1: Internal (Admin Nexus)
- `/admin/secret/module/your-module-slug`
- No quotas, full features, dev tools
- Sees all experimental modules

### Level 2: Client (User Apps)
- `/app/tool/your-module-slug`
- Quota-managed, brain-powered
- Only approved modules
- Clean UI, production-ready

### Level 3: Public (Tools Page)
- `/tools`
- Heavy rate limits, lead capture
- Demo-quality output
- Upgrade CTA

## Using Business Brain Context

Every module receives the user's Business Brain:

```javascript
async execute({ input, brain }) {
  const prompt = `
    Business: ${brain.business_name}
    Industry: ${brain.industry}
    Voice: ${brain.brand_voice}
    Target Audience: ${brain.ideal_customer_profile}

    Generate content for: ${input.topic}
  `;

  // Call AI with personalized context
}
```

## WordPress Integration

To make your module WordPress-compatible:

1. Update `manifest.json`:
```json
{
  "wordpress_compatible": true,
  "wordpress_shortcode": "[disruptors_your_module]",
  "wordpress_block": "disruptors/your-module"
}
```

2. Create WordPress plugin handler (future)
3. Ensure module works via API calls (no browser-only dependencies)

## Testing Checklist

- [ ] Module works in internal mode (unlimited)
- [ ] Module works in client mode (quota-enforced)
- [ ] Module works in public mode (rate-limited)
- [ ] Business Brain context is used correctly
- [ ] Input validation works (schema.js)
- [ ] Output validation works (schema.js)
- [ ] Quotas are enforced and tracked
- [ ] Error handling is robust
- [ ] Loading states are clear
- [ ] Module is documented

## Example Modules

See existing modules for reference:
- **Keyword Research** (`/src/modules/keyword-research`) - DataForSEO integration
- **AI Content Writer** (`/src/modules/ai-content-writer`) - Claude AI integration
- **Growth Audit** (`/src/modules/growth-audit`) - Job queue system

## Best Practices

1. **Keep it focused** - One module = one task
2. **Brain-first** - Always use Business Brain for personalization
3. **Validate strictly** - Use Zod schemas for type safety
4. **Handle errors gracefully** - User-friendly error messages
5. **Track telemetry** - Log runs to `module_runs` table
6. **Respect quotas** - Check `module_access` before execution
7. **Document thoroughly** - Clear README and inline comments
8. **Test all three levels** - Internal, client, public

## Support

Questions? Check the main docs:
- Architecture: `docs/MODULES_SYSTEM.md` (coming soon)
- Business Brain: `docs/BUSINESS_BRAIN_COMPLETE_SYSTEM.md`
- Integration: `docs/USER_ACCOUNT_ADMIN_INTEGRATION_PLAN.md`
