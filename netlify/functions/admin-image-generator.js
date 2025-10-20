/**
 * Admin Image Generator
 * Generates 3 AI images per blog using OpenAI gpt-image-1
 * Uploads to Cloudinary for storage
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import fetch from 'node-fetch'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
})

/**
 * Generate image prompt from blog data
 */
function generateImagePrompt(title, excerpt, index) {
  const styles = [
    'modern minimalist digital illustration',
    'professional business photography',
    'vibrant abstract geometric design',
    'clean corporate infographic style',
    'cinematic editorial photography'
  ]

  const style = styles[index % styles.length]

  // Create prompt from title and excerpt
  const concept = excerpt ?
    excerpt.substring(0, 200).replace(/<[^>]*>/g, '') :
    title

  return `Create a ${style} image representing: ${concept}.
High quality, professional, suitable for business blog header.
No text or words in the image.
Clean, modern aesthetic aligned with AI/marketing/tech industry.`
}

/**
 * Upload image to Cloudinary
 */
async function uploadToCloudinary(imageUrl, blogSlug, index) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials not configured')
  }

  // Fetch image from OpenAI
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.buffer()
  const base64Image = imageBuffer.toString('base64')
  const dataUri = `data:image/png;base64,${base64Image}`

  // Upload to Cloudinary
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  const formData = new URLSearchParams()
  formData.append('file', dataUri)
  formData.append('upload_preset', 'ml_default') // or your preset
  formData.append('folder', `blogs/${blogSlug}`)
  formData.append('public_id', `featured-${index}`)
  formData.append('api_key', apiKey)

  // Generate signature
  const timestamp = Math.floor(Date.now() / 1000)
  const crypto = await import('crypto')
  const stringToSign = `folder=blogs/${blogSlug}&public_id=featured-${index}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex')

  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`)
  }

  const result = await response.json()
  return result.secure_url
}

/**
 * Main handler
 */
export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { blogId, title, excerpt, count = 3 } = JSON.parse(event.body)

    if (!blogId || !title) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'blogId and title are required' })
      }
    }

    // Get blog details
    const { data: blog, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('slug')
      .eq('id', blogId)
      .single()

    if (fetchError || !blog) {
      throw new Error('Blog not found')
    }

    const images = []

    // Generate multiple images
    for (let i = 0; i < count; i++) {
      try {
        console.log(`Generating image ${i + 1}/${count} for blog: ${title}`)

        // Generate image with OpenAI
        const prompt = generateImagePrompt(title, excerpt, i)

        const response = await openai.images.generate({
          model: 'gpt-image-1',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        })

        const openaiImageUrl = response.data[0].url

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(
          openaiImageUrl,
          blog.slug,
          i + 1
        )

        images.push({
          url: cloudinaryUrl,
          prompt,
          index: i + 1,
          generated_at: new Date().toISOString()
        })

        console.log(`Image ${i + 1} generated and uploaded successfully`)

        // Rate limiting: 1 second between generations
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

      } catch (error) {
        console.error(`Failed to generate image ${i + 1}:`, error)
        // Continue with other images even if one fails
      }
    }

    if (images.length === 0) {
      throw new Error('No images were generated successfully')
    }

    // Update blog with image options
    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update({
        image_options: images,
        updated_at: new Date().toISOString()
      })
      .eq('id', blogId)

    if (updateError) throw updateError

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        blogId,
        images,
        count: images.length
      })
    }

  } catch (error) {
    console.error('Image generation error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}
