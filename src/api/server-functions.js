/**
 * Server-side functions that should be moved to a backend API
 * These functions contain sensitive operations that shouldn't run in the browser
 */

// This file serves as a template for moving sensitive operations to a proper backend
// In production, these should be implemented as API endpoints (Express.js, Edge Functions, etc.)

/**
 * Example server-side email sending function
 * Move to: /api/send-email endpoint
 */
export async function sendEmailServer({
  to,
  subject,
  body,
  from_name = "Disruptors AI"
}) {
  // This should be implemented as a server-side API endpoint
  // Example implementation:
  
  /*
  // server/api/send-email.js (Express.js example)
  import { Resend } from 'resend';
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  export async function POST(req, res) {
    try {
      const { to, subject, body, from_name } = req.body;
      
      const result = await resend.emails.send({
        from: `${from_name} <noreply@disruptors.media>`,
        to: [to],
        subject: subject,
        html: body
      });
      
      res.json({ success: true, message_id: result.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  */

  console.warn("sendEmailServer should be implemented as a server-side API endpoint");
  
  return {
    status: "server_required",
    message: "This function should be moved to a server-side API endpoint",
    recommendation: "Create /api/send-email endpoint with Resend integration"
  };
}

/**
 * Example server-side LLM function
 * Move to: /api/invoke-llm endpoint
 */
export async function invokeLLMServer({
  prompt,
  model = "gpt-4o-mini",
  max_tokens = 1500
}) {
  console.warn("invokeLLMServer should be implemented as a server-side API endpoint");
  
  return {
    status: "server_required",
    message: "This function should be moved to a server-side API endpoint",
    recommendation: "Create /api/invoke-llm endpoint with OpenAI integration"
  };
}

/**
 * Example server-side image generation function
 * Move to: /api/generate-image endpoint
 */
export async function generateImageServer({ prompt, model = "dall-e-3" }) {
  console.warn("generateImageServer should be implemented as a server-side API endpoint");
  
  return {
    status: "server_required",
    message: "This function should be moved to a server-side API endpoint",
    recommendation: "Create /api/generate-image endpoint with OpenAI DALL-E integration"
  };
}

/**
 * Example implementation guide for moving to server-side
 */
export const SERVER_IMPLEMENTATION_GUIDE = {
  overview: "Move sensitive operations to server-side API endpoints",
  
  recommended_structure: {
    "api/send-email.js": "Email sending with Resend/SendGrid",
    "api/invoke-llm.js": "LLM integration with OpenAI/Anthropic",
    "api/generate-image.js": "Image generation with DALL-E",
    "api/process-file.js": "File processing and OCR",
    "api/analytics.js": "Analytics data processing"
  },
  
  security_benefits: [
    "API keys kept server-side only",
    "Request rate limiting",
    "Input validation and sanitization",
    "Authentication and authorization",
    "Audit logging"
  ],
  
  implementation_options: [
    "Express.js/Node.js API server",
    "Supabase Edge Functions",
    "Vercel API Routes",
    "Netlify Functions",
    "AWS Lambda functions"
  ],

  example_env_vars: {
    server_side: [
      "RESEND_API_KEY",
      "OPENAI_API_KEY", 
      "SUPABASE_SERVICE_ROLE_KEY"
    ],
    client_side: [
      "VITE_SUPABASE_URL",
      "VITE_SUPABASE_ANON_KEY"
    ]
  },

  migration_steps: [
    "1. Create server-side API endpoints",
    "2. Move sensitive environment variables to server",
    "3. Update client-side code to call API endpoints",
    "4. Remove sensitive keys from client environment",
    "5. Test all integrations",
    "6. Deploy server-side code"
  ]
};

/**
 * Example Edge Function for Supabase
 * Save as: supabase/functions/send-email/index.ts
 */
export const EDGE_FUNCTION_EXAMPLE = `
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, body, from_name } = await req.json()
    
    // Use Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${Deno.env.get('RESEND_API_KEY')}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: \`\${from_name} <noreply@disruptors.media>\`,
        to: [to],
        subject: subject,
        html: body,
      }),
    })

    const result = await resendResponse.json()
    
    return new Response(
      JSON.stringify({ success: true, message_id: result.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
`;

console.log("Server functions template loaded. See SERVER_IMPLEMENTATION_GUIDE for migration instructions.");