import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Newspaper,
  Mail,
  Share2,
  Briefcase,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  Lock,
  TrendingUp,
  Users,
  Zap,
  BookOpen,
  Hash,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * AI Content Writer UI Component
 *
 * Three-Level Access:
 * - Internal: Unlimited generations, all content types, advanced options
 * - Client: Quota-limited, all content types, brain context visible
 * - Public: Limited to blog type, max 300 words, upgrade CTA
 *
 * @param {Object} brain - Business Brain context
 * @param {string} audience - Access level (internal/client/public)
 * @param {Object} config - User configuration
 * @param {Object} access - Quota information
 * @param {Function} onRun - Execute module function
 * @param {boolean} loading - Loading state
 * @param {Object} result - Execution result
 * @param {Error} error - Execution error
 */
const AIContentWriterUI = ({
  brain,
  audience = 'internal',
  config = {},
  access = {},
  onRun,
  loading = false,
  result = null,
  error = null
}) => {
  // Form state
  const [contentType, setContentType] = useState('blog');
  const [topic, setTopic] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [tone, setTone] = useState(config.default_tone || 'professional');
  const [length, setLength] = useState(config.default_length || 'medium');
  const [targetAudience, setTargetAudience] = useState('');
  const [copied, setCopied] = useState(false);

  // Access level checks
  const isInternal = audience === 'internal';
  const isClient = audience === 'client';
  const isPublic = audience === 'public';

  /**
   * Content type options
   */
  const contentTypes = [
    { value: 'blog', label: 'Blog Post', icon: FileText, description: 'SEO-optimized blog articles' },
    { value: 'social', label: 'Social Media', icon: Share2, description: 'Engaging social content' },
    { value: 'email', label: 'Email Copy', icon: Mail, description: 'Compelling email campaigns' },
    { value: 'landing', label: 'Landing Page', icon: Newspaper, description: 'High-converting pages' },
    { value: 'case-study', label: 'Case Study', icon: Briefcase, description: 'Client success stories' }
  ];

  /**
   * Tone options
   */
  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'bold', label: 'Bold & Contrarian' }
  ];

  /**
   * Length options
   */
  const lengthOptions = [
    { value: 'short', label: 'Short', words: '300-500 words' },
    { value: 'medium', label: 'Medium', words: '800-1,200 words' },
    { value: 'long', label: 'Long', words: '1,500-2,500 words' }
  ];

  /**
   * Handle secondary keyword addition
   */
  const addSecondaryKeyword = () => {
    if (keywordInput.trim() && !secondaryKeywords.includes(keywordInput.trim())) {
      setSecondaryKeywords([...secondaryKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  /**
   * Handle secondary keyword removal
   */
  const removeSecondaryKeyword = (keyword) => {
    setSecondaryKeywords(secondaryKeywords.filter(k => k !== keyword));
  };

  /**
   * Handle content generation
   */
  const handleGenerate = async () => {
    if (!topic.trim()) {
      return;
    }

    // Execute module
    await onRun({
      content_type: isPublic ? 'blog' : contentType,
      topic,
      primary_keyword: primaryKeyword || null,
      secondary_keywords: secondaryKeywords,
      tone,
      length,
      target_audience: targetAudience || null
    });
  };

  /**
   * Copy content to clipboard
   */
  const copyToClipboard = async () => {
    if (result?.content) {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Get length word count display
   */
  const getLengthWordCount = (lengthValue) => {
    const option = lengthOptions.find(opt => opt.value === lengthValue);
    return option ? option.words : '';
  };

  return (
    <div className="space-y-6">
      {/* Header with Quota Display */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-green-400 font-mono flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            AI Content Writer
          </h2>
          <p className="text-green-400/60 text-sm mt-1">
            {brain ? `${brain.business_name} - ${brain.industry}` : 'Generate brand-consistent, SEO-optimized content'}
          </p>
        </div>

        {/* Quota Display */}
        {!isInternal && access && (
          <div className="text-right">
            <div className="text-sm text-green-400/60">Generations Today</div>
            <div className="text-xl font-bold text-green-400 font-mono">
              {access.daily_used || 0}/{access.daily_limit || 20}
            </div>
            {access.daily_used >= access.daily_limit && (
              <Badge className="mt-2 bg-red-500/20 text-red-500 border-red-500">
                Daily Limit Reached
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content Type Selection - Hidden for Public */}
      {!isPublic && (
        <Card className="bg-black/50 border-green-400/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono text-lg">Content Type</CardTitle>
            <CardDescription className="text-green-400/60">
              Choose the type of content you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setContentType(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      contentType === type.value
                        ? 'border-green-400 bg-green-400/10'
                        : 'border-green-400/30 bg-black/50 hover:border-green-400/50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      contentType === type.value ? 'text-green-400' : 'text-green-400/60'
                    }`} />
                    <div className={`text-sm font-medium ${
                      contentType === type.value ? 'text-green-400' : 'text-green-400/80'
                    }`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-green-400/50 mt-1">
                      {type.description}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card className="bg-black/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="text-green-400 font-mono text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Content Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Topic */}
          <div>
            <label className="text-sm text-green-400 font-mono mb-2 block flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Topic *
            </label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How AI is transforming small business marketing"
              className="bg-black border-green-400/30 text-green-400 font-mono min-h-[100px]"
              disabled={loading}
            />
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Keyword */}
            <div>
              <label className="text-sm text-green-400 font-mono mb-2 block flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Primary Keyword (Optional)
              </label>
              <Input
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                placeholder="e.g., AI marketing automation"
                className="bg-black border-green-400/30 text-green-400 font-mono"
                disabled={loading}
              />
            </div>

            {/* Secondary Keywords */}
            <div>
              <label className="text-sm text-green-400 font-mono mb-2 block flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Secondary Keywords (Optional)
              </label>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaryKeyword())}
                  placeholder="Add keyword and press Enter"
                  className="bg-black border-green-400/30 text-green-400 font-mono"
                  disabled={loading}
                />
                <Button
                  onClick={addSecondaryKeyword}
                  variant="outline"
                  size="sm"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                  disabled={loading}
                >
                  Add
                </Button>
              </div>
              {secondaryKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {secondaryKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      className="bg-green-400/20 text-green-400 border-green-400/50 cursor-pointer hover:bg-red-500/20 hover:text-red-500 hover:border-red-500"
                      onClick={() => removeSecondaryKeyword(keyword)}
                    >
                      {keyword} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tone & Length */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tone */}
            <div>
              <label className="text-sm text-green-400 font-mono mb-2 block flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Tone
              </label>
              <Select value={tone} onValueChange={setTone} disabled={loading}>
                <SelectTrigger className="bg-black border-green-400/30 text-green-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-400/30">
                  {toneOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-green-400">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Length - Hidden for Public */}
            {!isPublic && (
              <div>
                <label className="text-sm text-green-400 font-mono mb-2 block flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Length
                </label>
                <RadioGroup value={length} onValueChange={setLength} disabled={loading}>
                  <div className="flex gap-4">
                    {lengthOptions.map(opt => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={opt.value}
                          id={`length-${opt.value}`}
                          className="border-green-400 text-green-400"
                        />
                        <label
                          htmlFor={`length-${opt.value}`}
                          className="text-sm text-green-400 cursor-pointer"
                        >
                          {opt.label}
                          <span className="text-green-400/50 text-xs ml-1">({opt.words})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          {/* Target Audience - Hidden for Public */}
          {!isPublic && (
            <div>
              <label className="text-sm text-green-400 font-mono mb-2 block flex items-center gap-2">
                <Users className="w-4 h-4" />
                Target Audience (Optional)
              </label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder={brain?.ideal_customer_profile || "e.g., Small business owners in construction"}
                className="bg-black border-green-400/30 text-green-400 font-mono"
                disabled={loading}
              />
              {brain?.ideal_customer_profile && (
                <p className="text-xs text-green-400/50 mt-1">
                  Default: {brain.ideal_customer_profile}
                </p>
              )}
            </div>
          )}

          {/* Public User Limitation Notice */}
          {isPublic && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span className="font-mono">
                  Public access limited to blog posts (max 300 words). Sign up for unlimited access.
                </span>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-green-400 hover:bg-green-500 text-black font-mono"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-mono">{error.message || 'An error occurred'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          {/* Title & Meta (if available) */}
          {result.title && (
            <Card className="bg-black/50 border-green-400/30">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-green-400/60 font-mono mb-1">Title</div>
                    <div className="text-lg font-bold text-green-400">{result.title}</div>
                  </div>
                  {result.meta_description && (
                    <div>
                      <div className="text-sm text-green-400/60 font-mono mb-1">Meta Description</div>
                      <div className="text-sm text-green-400/80">{result.meta_description}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Content */}
          <Card className="bg-black/50 border-green-400/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-400 font-mono text-lg">Generated Content</CardTitle>
                  <CardDescription className="text-green-400/60">
                    {result.word_count} words • {result.content_type}
                  </CardDescription>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="text-green-400/90 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {result.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Context Card (if brain available) */}
          {result.business_context && Object.keys(result.business_context).length > 0 && (
            <Card className="bg-gradient-to-r from-green-400/10 to-blue-400/10 border-green-400/50">
              <CardHeader>
                <CardTitle className="text-green-400 font-mono text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Business Context Applied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {result.business_context.business_name && (
                    <div>
                      <div className="text-green-400/60 font-mono mb-1">Business</div>
                      <div className="text-green-400 font-medium">{result.business_context.business_name}</div>
                    </div>
                  )}
                  {result.business_context.industry && (
                    <div>
                      <div className="text-green-400/60 font-mono mb-1">Industry</div>
                      <div className="text-green-400 font-medium">{result.business_context.industry}</div>
                    </div>
                  )}
                  {result.business_context.brand_voice && (
                    <div>
                      <div className="text-green-400/60 font-mono mb-1">Brand Voice</div>
                      <div className="text-green-400 font-medium">{result.business_context.brand_voice}</div>
                    </div>
                  )}
                  {result.business_context.target_audience && (
                    <div className="md:col-span-3">
                      <div className="text-green-400/60 font-mono mb-1">Target Audience</div>
                      <div className="text-green-400 font-medium">{result.business_context.target_audience}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Public Upgrade CTA */}
      {isPublic && result && (
        <Card className="bg-gradient-to-r from-green-400/10 to-blue-400/10 border-green-400/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Lock className="w-5 h-5" />
                <h3 className="text-xl font-bold font-mono">Unlock Full Content Generation</h3>
              </div>
              <p className="text-green-400/80">
                Public access is limited to 300-word blog posts. Sign up for free to unlock:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-green-400/80">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>All content types (blog, social, email, landing pages, case studies)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Up to 2,500 words per generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>20 generations per day (vs. 5)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Business Brain integration for brand-consistent content</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>SEO optimization with keywords and meta descriptions</span>
                </li>
              </ul>
              <Button className="bg-green-400 hover:bg-green-500 text-black font-mono">
                <Sparkles className="w-4 h-4 mr-2" />
                Sign Up for Free
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIContentWriterUI;
