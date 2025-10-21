-- Instagram Carousel Generator Infrastructure Migration
-- Created: 2025-10-21
-- Purpose: Database tables and storage for intelligent carousel generation

-- ============================================================================
-- CAROUSEL GENERATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS carousel_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brain_id UUID REFERENCES business_brains(id) ON DELETE SET NULL,

  -- User inputs
  topic TEXT NOT NULL,
  slide_count INTEGER NOT NULL DEFAULT 5 CHECK (slide_count >= 3 AND slide_count <= 10),
  style_template TEXT NOT NULL DEFAULT 'educational', -- 'educational', 'promotional', 'storytelling', 'statistical'
  advanced_mode BOOLEAN DEFAULT FALSE,

  -- AI Strategy decisions
  strategy_json JSONB, -- Full strategy with reasoning for each slide
  /* Example structure:
  {
    "slides": [
      {
        "slide": 1,
        "text": "Hook headline",
        "image_description": "Description",
        "image_strategy": {
          "method": "download_modify", // generate | download | download_modify | download_combine
          "reasoning": "Explanation of why this strategy",
          "sources": ["google_image_search:query", "brand_assets:logo"],
          "modifications": "Instructions for Nano Banana",
          "estimated_cost": 0.039
        }
      }
    ],
    "total_estimated_cost": 0.195,
    "instagram_research_data": {
      "analyzed_carousels": 10,
      "top_performing_pattern": "real_faces_in_slide_1"
    }
  }
  */

  -- Research data
  research_examples JSONB, -- Scraped Instagram examples that informed strategy
  /* Example structure:
  {
    "industry_tag": "real_estate",
    "carousels_analyzed": [
      {
        "url": "instagram.com/p/xyz",
        "engagement_rate": 0.08,
        "likes": 1200,
        "slides": 5,
        "slide_1_type": "real_face",
        "slide_patterns": ["text_overlay", "ui_screenshot", "infographic"]
      }
    ],
    "key_insights": "Slide 1 with real faces performs 40% better"
  }
  */

  -- Final results
  slides_json JSONB, -- Generated slides with image URLs
  /* Example structure:
  {
    "slides": [
      {
        "slide": 1,
        "text": "Hook headline with text",
        "image_description": "Description used",
        "image_url": "https://supabase.storage/.../slide_1.png",
        "image_strategy_used": "download_modify",
        "generation_time_ms": 4500,
        "actual_cost": 0.039
      }
    ]
  }
  */

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'researching' | 'strategy_ready' | 'generating' | 'complete' | 'failed'

  error_message TEXT,

  -- Analytics
  total_cost NUMERIC(10, 4) DEFAULT 0,
  generation_duration_ms INTEGER,
  user_approved_strategy BOOLEAN, -- Did user approve or modify the AI strategy?
  regeneration_count INTEGER DEFAULT 0, -- How many slides were regenerated

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Indexes for performance
  CONSTRAINT valid_status CHECK (status IN ('pending', 'researching', 'strategy_ready', 'generating', 'complete', 'failed'))
);

-- Indexes for carousel_generations
CREATE INDEX idx_carousel_generations_user_id ON carousel_generations(user_id);
CREATE INDEX idx_carousel_generations_brain_id ON carousel_generations(brain_id);
CREATE INDEX idx_carousel_generations_status ON carousel_generations(status);
CREATE INDEX idx_carousel_generations_created_at ON carousel_generations(created_at DESC);
CREATE INDEX idx_carousel_generations_style_template ON carousel_generations(style_template);

-- ============================================================================
-- CAROUSEL RESEARCH CACHE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS carousel_research_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Industry/topic clustering
  industry TEXT NOT NULL,
  topic_keywords TEXT[], -- Array of related keywords

  -- Scraped carousel data
  carousel_examples JSONB NOT NULL,
  /* Example structure:
  {
    "total_analyzed": 25,
    "carousels": [
      {
        "platform": "instagram",
        "account": "@realestate_ai_tips",
        "post_url": "instagram.com/p/abc123",
        "post_date": "2025-10-15",
        "engagement": {
          "likes": 1500,
          "comments": 45,
          "saves": 320,
          "engagement_rate": 0.089
        },
        "slide_count": 5,
        "slide_analysis": [
          {
            "slide": 1,
            "type": "real_face", // "illustration", "screenshot", "stock_photo", "text_only"
            "has_text_overlay": true,
            "color_scheme": "high_contrast",
            "composition": "centered_portrait"
          }
        ],
        "performance_tier": "top_10_percent" // "top_10_percent", "average", "below_average"
      }
    ],
    "pattern_insights": {
      "slide_1_best_practice": "real_face_with_emotion",
      "text_overlay_usage": 0.85,
      "average_slides": 5.2,
      "color_schemes": ["high_contrast", "brand_colors", "minimalist"]
    }
  }
  */

  -- Performance metrics
  average_engagement_rate NUMERIC(5, 4),
  top_performing_patterns TEXT[], -- ["real_face_slide_1", "ui_screenshot_slide_3"]

  -- Cache management
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  update_frequency_days INTEGER DEFAULT 7, -- How often to refresh this cache
  scrape_count INTEGER DEFAULT 0,

  -- Quality metrics
  data_quality_score NUMERIC(3, 2), -- 0.00 to 1.00 (based on sample size, recency)

  CONSTRAINT unique_industry_cache UNIQUE(industry)
);

-- Indexes for carousel_research_cache
CREATE INDEX idx_carousel_research_cache_industry ON carousel_research_cache(industry);
CREATE INDEX idx_carousel_research_cache_last_updated ON carousel_research_cache(last_updated DESC);
CREATE INDEX idx_carousel_research_cache_quality ON carousel_research_cache(data_quality_score DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on carousel_generations
ALTER TABLE carousel_generations ENABLE ROW LEVEL SECURITY;

-- Users can view their own carousels
CREATE POLICY "Users can view own carousels"
  ON carousel_generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own carousels
CREATE POLICY "Users can create carousels"
  ON carousel_generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own carousels
CREATE POLICY "Users can update own carousels"
  ON carousel_generations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own carousels
CREATE POLICY "Users can delete own carousels"
  ON carousel_generations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass (for backend functions)
CREATE POLICY "Service role has full access to carousels"
  ON carousel_generations
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Enable RLS on carousel_research_cache
ALTER TABLE carousel_research_cache ENABLE ROW LEVEL SECURITY;

-- Research cache is read-only for authenticated users
CREATE POLICY "Authenticated users can view research cache"
  ON carousel_research_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify research cache
CREATE POLICY "Service role can manage research cache"
  ON carousel_research_cache
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- STORAGE BUCKET: carousel-images
-- ============================================================================

-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for carousel-images bucket
CREATE POLICY "Users can upload carousel images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'carousel-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view carousel images"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'carousel-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own carousel images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'carousel-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own carousel images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'carousel-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Service role has full carousel-images access"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'carousel-images' AND
    auth.jwt()->>'role' = 'service_role'
  );

-- Public read access to carousel-images (for sharing)
CREATE POLICY "Public can view carousel images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'carousel-images');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_carousel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for carousel_generations
CREATE TRIGGER update_carousel_generations_updated_at
  BEFORE UPDATE ON carousel_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_carousel_updated_at();

-- Function to mark carousel as complete
CREATE OR REPLACE FUNCTION mark_carousel_complete(carousel_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE carousel_generations
  SET
    status = 'complete',
    completed_at = NOW()
  WHERE id = carousel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's carousel quota usage
CREATE OR REPLACE FUNCTION get_user_carousel_quota_usage(
  p_user_id UUID,
  p_period_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO usage_count
  FROM carousel_generations
  WHERE
    user_id = p_user_id AND
    created_at >= NOW() - (p_period_days || ' days')::INTERVAL AND
    status = 'complete';

  RETURN usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE carousel_generations IS 'Stores Instagram carousel generation requests, strategies, and results with intelligent image sourcing';
COMMENT ON TABLE carousel_research_cache IS 'Caches scraped Instagram carousel data for pattern analysis and strategy optimization';
COMMENT ON COLUMN carousel_generations.strategy_json IS 'AI-generated strategy including image sourcing decisions (generate, download, modify, combine)';
COMMENT ON COLUMN carousel_generations.research_examples IS 'Instagram carousels analyzed to inform this generation strategy';
COMMENT ON COLUMN carousel_generations.advanced_mode IS 'Whether user reviewed/modified AI strategy before generation';
COMMENT ON COLUMN carousel_research_cache.carousel_examples IS 'Scraped Instagram posts with engagement metrics and slide analysis';
COMMENT ON COLUMN carousel_research_cache.data_quality_score IS 'Quality score (0-1) based on sample size, recency, and engagement variance';
