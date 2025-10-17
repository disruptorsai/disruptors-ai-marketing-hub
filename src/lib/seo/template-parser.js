/**
 * Landing Page Template Parser
 * Handles variable substitution and template processing
 *
 * Variable Syntax: {{variable_name}}
 * Conditional Syntax: {{#if variable}}content{{/if}}
 * Loop Syntax: {{#each items}}{{item}}{{/each}}
 *
 * Supported Variables:
 * - {{keyword}} - Target keyword
 * - {{location}} - Location/city name
 * - {{service}} - Service name
 * - {{industry}} - Industry name
 * - {{business_name}} - Business name from Brain
 * - {{year}} - Current year
 * - {{month}} - Current month name
 * - {{custom_*}} - Any custom variable
 */

/**
 * Parse template with variables
 *
 * @param {string} template - Template string with {{variables}}
 * @param {Object} variables - Key-value pairs for substitution
 * @param {Object} options - Parser options
 * @returns {string} Parsed template
 */
export function parseTemplate(template, variables = {}, options = {}) {
  if (!template) return ''

  const {
    strict = false, // Throw error on missing variables
    preserveUnused = false, // Keep {{var}} for unused variables
    defaultValue = '' // Default value for missing variables
  } = options

  let parsed = template

  // Add automatic variables
  const autoVars = {
    year: new Date().getFullYear(),
    month: new Date().toLocaleString('en-US', { month: 'long' }),
    date: new Date().toLocaleDateString('en-US'),
    ...variables
  }

  // Replace simple variables {{variable}}
  const variableRegex = /\{\{([^}#/]+)\}\}/g
  parsed = parsed.replace(variableRegex, (match, varName) => {
    const cleanVarName = varName.trim()

    if (cleanVarName in autoVars) {
      const value = autoVars[cleanVarName]
      return value !== null && value !== undefined ? String(value) : defaultValue
    }

    if (strict) {
      throw new Error(`Missing template variable: ${cleanVarName}`)
    }

    return preserveUnused ? match : defaultValue
  })

  // Handle conditionals {{#if variable}}content{{/if}}
  const conditionalRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g
  parsed = parsed.replace(conditionalRegex, (match, condition, content) => {
    const cleanCondition = condition.trim()
    const value = autoVars[cleanCondition]

    // Check if condition is truthy
    if (value && value !== 'false' && value !== '0' && value !== '') {
      return content
    }

    return ''
  })

  // Handle inverse conditionals {{#unless variable}}content{{/unless}}
  const unlessRegex = /\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g
  parsed = parsed.replace(unlessRegex, (match, condition, content) => {
    const cleanCondition = condition.trim()
    const value = autoVars[cleanCondition]

    // Check if condition is falsy
    if (!value || value === 'false' || value === '0' || value === '') {
      return content
    }

    return ''
  })

  return parsed
}

/**
 * Extract variables from template
 *
 * @param {string} template - Template string
 * @returns {Array<string>} List of variable names
 */
export function extractVariables(template) {
  if (!template) return []

  const variables = new Set()
  const variableRegex = /\{\{([^}#/]+)\}\}/g

  let match
  while ((match = variableRegex.exec(template)) !== null) {
    const varName = match[1].trim()
    // Exclude auto-generated variables
    if (!['year', 'month', 'date'].includes(varName)) {
      variables.add(varName)
    }
  }

  return Array.from(variables).sort()
}

/**
 * Validate template variables
 *
 * @param {string} template - Template string
 * @param {Object} variables - Variables to validate against
 * @returns {Object} Validation result
 */
export function validateTemplate(template, variables = {}) {
  const required = extractVariables(template)
  const provided = Object.keys(variables)
  const missing = required.filter(v => !(v in variables))
  const unused = provided.filter(v => !required.includes(v))

  return {
    valid: missing.length === 0,
    required,
    provided,
    missing,
    unused
  }
}

/**
 * Generate variable suggestions based on template type
 *
 * @param {string} templateType - Template type/category
 * @returns {Object} Suggested variables with descriptions
 */
export function getTemplateSuggestions(templateType) {
  const common = {
    keyword: 'Target SEO keyword',
    business_name: 'Your business name',
    year: 'Current year (auto)',
    month: 'Current month (auto)'
  }

  const suggestions = {
    'service-location': {
      ...common,
      service: 'Service name (e.g., "SEO Services")',
      location: 'City or region (e.g., "Los Angeles")',
      state: 'State name (e.g., "California")',
      zip_code: 'ZIP code (optional)'
    },
    'how-to-guide': {
      ...common,
      topic: 'Main topic or question',
      difficulty_level: 'Beginner, Intermediate, Advanced',
      time_required: 'Estimated time (e.g., "30 minutes")'
    },
    'comparison': {
      ...common,
      product_a: 'First product/service name',
      product_b: 'Second product/service name',
      winner: 'Which is better (optional)'
    },
    'category': {
      ...common,
      category: 'Category name',
      subcategory: 'Subcategory (optional)',
      item_count: 'Number of items in category'
    }
  }

  return suggestions[templateType] || common
}

/**
 * Create title from keyword and template
 *
 * @param {string} keyword - Target keyword
 * @param {Object} variables - Template variables
 * @param {string} templateType - Template type
 * @returns {string} Generated title
 */
export function generateTitle(keyword, variables = {}, templateType = null) {
  const { location, service, year } = variables

  // Template-specific title patterns
  if (templateType === 'service-location' && location) {
    return `${keyword} in ${location} | ${service || 'Professional Services'}`
  }

  if (templateType === 'how-to-guide') {
    if (keyword.toLowerCase().startsWith('how to')) {
      return `${keyword} | Complete Guide ${year}`
    }
    return `How to ${keyword} | Step-by-Step Guide`
  }

  if (templateType === 'comparison' && variables.product_a && variables.product_b) {
    return `${variables.product_a} vs ${variables.product_b}: ${keyword} Comparison`
  }

  // Default: Capitalize keyword with current year
  const capitalized = keyword
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return `${capitalized} | Expert Guide ${year}`
}

/**
 * Create slug from keyword
 *
 * @param {string} keyword - Target keyword
 * @param {Object} variables - Template variables
 * @returns {string} URL-safe slug
 */
export function generateSlug(keyword, variables = {}) {
  const { location } = variables

  let slug = keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim()

  // Add location suffix if present
  if (location) {
    const locationSlug = location
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    slug = `${slug}-${locationSlug}`
  }

  return slug
}

/**
 * Generate meta description from keyword and variables
 *
 * @param {string} keyword - Target keyword
 * @param {Object} variables - Template variables
 * @param {string} templateType - Template type
 * @returns {string} Meta description (150-160 chars)
 */
export function generateMetaDescription(keyword, variables = {}, templateType = null) {
  const { location, service, business_name, year } = variables
  const bizName = business_name || 'our team'

  let description = ''

  if (templateType === 'service-location' && location) {
    description = `Looking for ${keyword} in ${location}? ${bizName} provides expert ${service || 'services'}. Get a free consultation today!`
  } else if (templateType === 'how-to-guide') {
    description = `Learn ${keyword} with our comprehensive step-by-step guide. Expert tips, best practices, and proven strategies for ${year}.`
  } else if (templateType === 'comparison') {
    description = `${keyword} comparison guide. See the differences, pros, cons, and which option is best for your needs in ${year}.`
  } else {
    description = `Complete guide to ${keyword}. Expert insights, tips, and best practices from ${bizName}. Updated for ${year}.`
  }

  // Ensure length is within SEO best practices (150-160 chars)
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }

  return description
}

/**
 * Calculate keyword density in content
 *
 * @param {string} content - Content text
 * @param {string} keyword - Target keyword
 * @returns {Object} Density analysis
 */
export function calculateKeywordDensity(content, keyword) {
  if (!content || !keyword) {
    return { density: 0, count: 0, wordCount: 0, optimal: false }
  }

  const normalizedContent = content.toLowerCase()
  const normalizedKeyword = keyword.toLowerCase()

  // Count keyword occurrences (exact phrase)
  const keywordRegex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
  const matches = content.match(keywordRegex) || []
  const count = matches.length

  // Count total words
  const words = content.match(/\b\w+\b/g) || []
  const wordCount = words.length

  // Calculate density percentage
  const density = wordCount > 0 ? (count / wordCount) * 100 : 0

  // Optimal density is 1-3% for SEO
  const optimal = density >= 1 && density <= 3

  return {
    density: Math.round(density * 100) / 100,
    count,
    wordCount,
    optimal,
    warning: density > 3 ? 'Keyword density too high (over-optimization risk)' : null
  }
}

/**
 * Suggest keyword variations for natural language
 *
 * @param {string} keyword - Base keyword
 * @returns {Array<string>} Keyword variations
 */
export function generateKeywordVariations(keyword) {
  const variations = []

  // Add exact keyword
  variations.push(keyword)

  // Add plural/singular variations
  if (keyword.endsWith('s')) {
    variations.push(keyword.slice(0, -1)) // Remove 's'
  } else {
    variations.push(keyword + 's') // Add 's'
  }

  // Add "best" prefix
  if (!keyword.toLowerCase().includes('best')) {
    variations.push(`best ${keyword}`)
  }

  // Add "top" prefix
  if (!keyword.toLowerCase().includes('top')) {
    variations.push(`top ${keyword}`)
  }

  // Add year suffix
  const year = new Date().getFullYear()
  variations.push(`${keyword} ${year}`)

  return [...new Set(variations)] // Remove duplicates
}

export default {
  parseTemplate,
  extractVariables,
  validateTemplate,
  getTemplateSuggestions,
  generateTitle,
  generateSlug,
  generateMetaDescription,
  calculateKeywordDensity,
  generateKeywordVariations
}
