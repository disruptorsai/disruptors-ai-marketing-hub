/**
 * TableSchemaManager
 * Defines column configurations for all Supabase tables
 * Maps field types, display names, and editor types
 */

export const TABLE_SCHEMAS = {
  posts: {
    tableName: 'posts',
    displayName: 'Blog Posts',
    icon: 'FileText',
    description: 'Manage blog content, resources, guides, and case studies',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'title', label: 'Title', type: 'text', width: 250, minWidth: 150, required: true },
      { key: 'slug', label: 'Slug', type: 'text', width: 200, minWidth: 150, required: true },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'content', label: 'Content', type: 'textarea', width: 400, minWidth: 250 },
      {
        key: 'content_type',
        label: 'Content Type',
        type: 'select',
        options: ['blog', 'resource', 'guide', 'case_study'],
        width: 130,
        minWidth: 120
      },
      { key: 'featured_image', label: 'Featured Image', type: 'image', width: 250, minWidth: 200 },
      { key: 'gallery_images', label: 'Gallery Images', type: 'array', width: 200, minWidth: 150 },
      { key: 'author_id', label: 'Author ID', type: 'text', width: 280, minWidth: 200 },
      { key: 'category', label: 'Category', type: 'text', width: 150, minWidth: 100 },
      { key: 'tags', label: 'Tags', type: 'array', width: 200, minWidth: 150 },
      { key: 'read_time_minutes', label: 'Read Time (min)', type: 'number', width: 130, minWidth: 100 },
      { key: 'is_featured', label: 'Featured', type: 'boolean', width: 100, minWidth: 80 },
      { key: 'is_published', label: 'Published', type: 'boolean', width: 100, minWidth: 80 },
      { key: 'published_at', label: 'Published At', type: 'date', width: 150, minWidth: 120 },
      { key: 'seo_title', label: 'SEO Title', type: 'text', width: 250, minWidth: 150 },
      { key: 'seo_description', label: 'SEO Description', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'seo_keywords', label: 'SEO Keywords', type: 'array', width: 200, minWidth: 150 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  },

  team_members: {
    tableName: 'team_members',
    displayName: 'Team Members',
    icon: 'Users',
    description: 'Manage team member profiles and information',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'name', label: 'Name', type: 'text', width: 180, minWidth: 120, required: true },
      { key: 'title', label: 'Title', type: 'text', width: 200, minWidth: 150 },
      { key: 'bio', label: 'Bio', type: 'textarea', width: 350, minWidth: 200 },
      { key: 'headshot', label: 'Headshot URL', type: 'image', width: 250, minWidth: 200 },
      { key: 'email', label: 'Email', type: 'text', width: 200, minWidth: 150 },
      { key: 'social_links', label: 'Social Links (JSON)', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'skills', label: 'Skills', type: 'array', width: 200, minWidth: 150 },
      { key: 'years_experience', label: 'Years Exp', type: 'number', width: 100, minWidth: 80 },
      { key: 'is_active', label: 'Active', type: 'boolean', width: 80, minWidth: 70 },
      { key: 'display_order', label: 'Display Order', type: 'number', width: 120, minWidth: 100 },
      { key: 'user_id', label: 'User ID', type: 'text', width: 280, minWidth: 200 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  },

  services: {
    tableName: 'services',
    displayName: 'Services',
    icon: 'Briefcase',
    description: 'Manage service offerings and pricing',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'title', label: 'Title', type: 'text', width: 200, minWidth: 150, required: true },
      { key: 'slug', label: 'Slug', type: 'text', width: 200, minWidth: 150, required: true },
      { key: 'hook', label: 'Hook', type: 'text', width: 300, minWidth: 200 },
      { key: 'description', label: 'Description', type: 'textarea', width: 350, minWidth: 200 },
      { key: 'image', label: 'Image URL', type: 'image', width: 250, minWidth: 200 },
      { key: 'icon', label: 'Icon', type: 'text', width: 150, minWidth: 100 },
      { key: 'category', label: 'Category', type: 'text', width: 150, minWidth: 100 },
      { key: 'benefits', label: 'Benefits', type: 'array', width: 250, minWidth: 200 },
      { key: 'pricing_model', label: 'Pricing Model', type: 'text', width: 150, minWidth: 120 },
      { key: 'base_price', label: 'Base Price', type: 'number', width: 120, minWidth: 100 },
      { key: 'currency', label: 'Currency', type: 'text', width: 80, minWidth: 70 },
      { key: 'tags', label: 'Tags', type: 'array', width: 200, minWidth: 150 },
      { key: 'display_order', label: 'Display Order', type: 'number', width: 120, minWidth: 100 },
      { key: 'is_active', label: 'Active', type: 'boolean', width: 80, minWidth: 70 },
      { key: 'seo_title', label: 'SEO Title', type: 'text', width: 250, minWidth: 150 },
      { key: 'seo_description', label: 'SEO Description', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'seo_keywords', label: 'SEO Keywords', type: 'array', width: 200, minWidth: 150 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  },

  case_studies: {
    tableName: 'case_studies',
    displayName: 'Case Studies',
    icon: 'BookOpen',
    description: 'Manage client case studies and success stories',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'title', label: 'Title', type: 'text', width: 250, minWidth: 150, required: true },
      { key: 'slug', label: 'Slug', type: 'text', width: 200, minWidth: 150, required: true },
      { key: 'client_name', label: 'Client Name', type: 'text', width: 180, minWidth: 120 },
      { key: 'industry', label: 'Industry', type: 'text', width: 150, minWidth: 100 },
      { key: 'description', label: 'Description', type: 'textarea', width: 350, minWidth: 200 },
      { key: 'challenge', label: 'Challenge', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'solution', label: 'Solution', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'results', label: 'Results', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'featured_image', label: 'Featured Image', type: 'image', width: 250, minWidth: 200 },
      { key: 'metrics', label: 'Metrics (JSON)', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'services_provided', label: 'Services', type: 'array', width: 200, minWidth: 150 },
      { key: 'technologies_used', label: 'Technologies', type: 'array', width: 200, minWidth: 150 },
      { key: 'timeline_months', label: 'Timeline (mo)', type: 'number', width: 120, minWidth: 100 },
      { key: 'testimonial_quote', label: 'Testimonial', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'testimonial_position', label: 'Position', type: 'text', width: 150, minWidth: 120 },
      { key: 'is_published', label: 'Published', type: 'boolean', width: 100, minWidth: 80 },
      { key: 'is_featured', label: 'Featured', type: 'boolean', width: 100, minWidth: 80 },
      { key: 'display_order', label: 'Display Order', type: 'number', width: 120, minWidth: 100 },
      { key: 'seo_title', label: 'SEO Title', type: 'text', width: 250, minWidth: 150 },
      { key: 'seo_description', label: 'SEO Description', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'seo_keywords', label: 'SEO Keywords', type: 'array', width: 200, minWidth: 150 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  },

  testimonials: {
    tableName: 'testimonials',
    displayName: 'Testimonials',
    icon: 'MessageSquare',
    description: 'Manage client testimonials and reviews',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'client_name', label: 'Client Name', type: 'text', width: 180, minWidth: 120, required: true },
      { key: 'client_position', label: 'Position', type: 'text', width: 200, minWidth: 150 },
      { key: 'client_company', label: 'Company', type: 'text', width: 180, minWidth: 120 },
      { key: 'content', label: 'Content', type: 'textarea', width: 400, minWidth: 250 },
      { key: 'rating', label: 'Rating', type: 'number', width: 100, minWidth: 80 },
      { key: 'avatar', label: 'Avatar URL', type: 'image', width: 250, minWidth: 200 },
      { key: 'is_published', label: 'Published', type: 'boolean', width: 100, minWidth: 80 },
      { key: 'is_featured', label: 'Featured', type: 'boolean', width: 100, minWidth: 80 },
      { key: 'display_order', label: 'Display Order', type: 'number', width: 120, minWidth: 100 },
      { key: 'source', label: 'Source', type: 'text', width: 150, minWidth: 100 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  },

  contact_submissions: {
    tableName: 'contact_submissions',
    displayName: 'Contact Form Submissions',
    icon: 'Mail',
    description: 'View and manage contact form submissions',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'name', label: 'Name', type: 'text', width: 180, minWidth: 120 },
      { key: 'email', label: 'Email', type: 'text', width: 200, minWidth: 150 },
      { key: 'phone', label: 'Phone', type: 'text', width: 150, minWidth: 120 },
      { key: 'company', label: 'Company', type: 'text', width: 180, minWidth: 120 },
      { key: 'message', label: 'Message', type: 'textarea', width: 400, minWidth: 250 },
      { key: 'services_interested', label: 'Services', type: 'array', width: 200, minWidth: 150 },
      { key: 'budget_range', label: 'Budget Range', type: 'text', width: 150, minWidth: 120 },
      { key: 'timeline', label: 'Timeline', type: 'text', width: 150, minWidth: 120 },
      { key: 'utm_data', label: 'UTM Data (JSON)', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'is_processed', label: 'Processed', type: 'boolean', width: 100, minWidth: 80 },
      { key: 'processed_by', label: 'Processed By', type: 'text', width: 280, minWidth: 200 },
      { key: 'processed_at', label: 'Processed At', type: 'date', width: 150, minWidth: 120 },
      { key: 'lead_id', label: 'Lead ID', type: 'text', width: 280, minWidth: 200 },
      { key: 'metadata', label: 'Metadata (JSON)', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  },

  leads: {
    tableName: 'leads',
    displayName: 'Leads',
    icon: 'Target',
    description: 'Manage sales leads and prospects',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'email', label: 'Email', type: 'text', width: 200, minWidth: 150, required: true },
      { key: 'first_name', label: 'First Name', type: 'text', width: 150, minWidth: 100 },
      { key: 'last_name', label: 'Last Name', type: 'text', width: 150, minWidth: 100 },
      { key: 'company', label: 'Company', type: 'text', width: 180, minWidth: 120 },
      { key: 'phone', label: 'Phone', type: 'text', width: 150, minWidth: 120 },
      { key: 'website', label: 'Website', type: 'text', width: 200, minWidth: 150 },
      { key: 'source', label: 'Source', type: 'text', width: 150, minWidth: 100 },
      { key: 'utm_source', label: 'UTM Source', type: 'text', width: 150, minWidth: 120 },
      { key: 'utm_medium', label: 'UTM Medium', type: 'text', width: 150, minWidth: 120 },
      { key: 'utm_campaign', label: 'UTM Campaign', type: 'text', width: 150, minWidth: 120 },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'],
        width: 130,
        minWidth: 120
      },
      { key: 'score', label: 'Score', type: 'number', width: 100, minWidth: 80 },
      { key: 'notes', label: 'Notes', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'interested_services', label: 'Services', type: 'array', width: 200, minWidth: 150 },
      { key: 'budget_range', label: 'Budget Range', type: 'text', width: 150, minWidth: 120 },
      { key: 'timeline', label: 'Timeline', type: 'text', width: 150, minWidth: 120 },
      { key: 'assigned_to', label: 'Assigned To', type: 'text', width: 280, minWidth: 200 },
      { key: 'converted_at', label: 'Converted At', type: 'date', width: 150, minWidth: 120 },
      { key: 'metadata', label: 'Metadata (JSON)', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  },

  settings: {
    tableName: 'settings',
    displayName: 'Site Settings',
    icon: 'Settings',
    description: 'Manage site-wide configuration and settings',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'key', label: 'Key', type: 'text', width: 200, minWidth: 150, required: true },
      { key: 'value', label: 'Value (JSON)', type: 'textarea', width: 350, minWidth: 250 },
      { key: 'category', label: 'Category', type: 'text', width: 150, minWidth: 100 },
      { key: 'description', label: 'Description', type: 'textarea', width: 300, minWidth: 200 },
      { key: 'is_public', label: 'Public', type: 'boolean', width: 80, minWidth: 70 },
      { key: 'updated_by', label: 'Updated By', type: 'text', width: 280, minWidth: 200 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  },

  media: {
    tableName: 'media',
    displayName: 'Media Assets',
    icon: 'Image',
    description: 'Manage uploaded media files and assets',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'filename', label: 'Filename', type: 'text', width: 200, minWidth: 150, required: true },
      { key: 'original_filename', label: 'Original Name', type: 'text', width: 200, minWidth: 150 },
      { key: 'file_path', label: 'File Path', type: 'text', width: 250, minWidth: 200 },
      { key: 'file_url', label: 'File URL', type: 'image', width: 250, minWidth: 200 },
      { key: 'file_type', label: 'File Type', type: 'text', width: 120, minWidth: 100 },
      { key: 'file_size', label: 'Size (bytes)', type: 'number', width: 120, minWidth: 100 },
      { key: 'mime_type', label: 'MIME Type', type: 'text', width: 150, minWidth: 120 },
      { key: 'width', label: 'Width', type: 'number', width: 100, minWidth: 80 },
      { key: 'height', label: 'Height', type: 'number', width: 100, minWidth: 80 },
      { key: 'alt_text', label: 'Alt Text', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'caption', label: 'Caption', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'metadata', label: 'Metadata (JSON)', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'uploaded_by', label: 'Uploaded By', type: 'text', width: 280, minWidth: 200 },
      { key: 'folder', label: 'Folder', type: 'text', width: 150, minWidth: 120 },
      { key: 'is_public', label: 'Public', type: 'boolean', width: 80, minWidth: 70 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  },

  site_media: {
    tableName: 'site_media',
    displayName: 'Site Media',
    icon: 'Image',
    description: 'Manage all site images and videos with context',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'ID', type: 'text', width: 280, minWidth: 200, readOnly: true },
      { key: 'media_key', label: 'Media Key', type: 'text', width: 250, minWidth: 150, required: true },
      { key: 'media_type', label: 'Type', type: 'select', options: ['image', 'video'], width: 120, minWidth: 100, required: true },
      { key: 'media_url', label: 'URL', type: 'image', width: 300, minWidth: 200, required: true },
      { key: 'page_slug', label: 'Page', type: 'text', width: 180, minWidth: 120 },
      { key: 'section_name', label: 'Section', type: 'text', width: 150, minWidth: 100 },
      { key: 'purpose', label: 'Purpose', type: 'text', width: 200, minWidth: 150 },
      { key: 'alt_text', label: 'Alt Text', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'caption', label: 'Caption', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'title', label: 'Title', type: 'text', width: 200, minWidth: 150 },
      { key: 'width', label: 'Width', type: 'number', width: 100, minWidth: 80 },
      { key: 'height', label: 'Height', type: 'number', width: 100, minWidth: 80 },
      { key: 'file_size', label: 'Size (bytes)', type: 'number', width: 120, minWidth: 100 },
      { key: 'mime_type', label: 'MIME Type', type: 'text', width: 150, minWidth: 120 },
      { key: 'cloudinary_public_id', label: 'Cloudinary ID', type: 'text', width: 200, minWidth: 150 },
      { key: 'cloudinary_folder', label: 'Cloudinary Folder', type: 'text', width: 180, minWidth: 120 },
      { key: 'cloudinary_version', label: 'Version', type: 'text', width: 120, minWidth: 100 },
      { key: 'cloudinary_format', label: 'Format', type: 'text', width: 100, minWidth: 80 },
      { key: 'display_order', label: 'Order', type: 'number', width: 100, minWidth: 80 },
      { key: 'is_active', label: 'Active', type: 'boolean', width: 80, minWidth: 70 },
      { key: 'is_featured', label: 'Featured', type: 'boolean', width: 90, minWidth: 80 },
      { key: 'lazy_load', label: 'Lazy Load', type: 'boolean', width: 100, minWidth: 80 },
      { key: 'seo_optimized', label: 'SEO OK', type: 'boolean', width: 90, minWidth: 80 },
      { key: 'accessibility_checked', label: 'A11y OK', type: 'boolean', width: 90, minWidth: 80 },
      { key: 'tags', label: 'Tags', type: 'array', width: 200, minWidth: 150 },
      { key: 'metadata', label: 'Metadata (JSON)', type: 'textarea', width: 250, minWidth: 200 },
      { key: 'created_at', label: 'Created', type: 'date', width: 150, minWidth: 120, readOnly: true },
      { key: 'updated_at', label: 'Updated', type: 'date', width: 150, minWidth: 120, readOnly: true }
    ]
  }
};

/**
 * Get schema for a specific table
 */
export const getTableSchema = (tableName) => {
  return TABLE_SCHEMAS[tableName] || null;
};

/**
 * Get list of all available tables
 */
export const getAvailableTables = () => {
  return Object.keys(TABLE_SCHEMAS);
};

/**
 * Get priority tables (most commonly used)
 */
export const getPriorityTables = () => {
  return ['posts', 'services', 'site_media', 'team_members', 'case_studies', 'testimonials', 'contact_submissions'];
};

/**
 * Get columns for a table, optionally filtered by visibility
 */
export const getTableColumns = (tableName, visibleOnly = false) => {
  const schema = getTableSchema(tableName);
  if (!schema) return [];

  if (visibleOnly) {
    return schema.columns.filter(col => !col.hidden);
  }

  return schema.columns;
};

/**
 * Get required columns for a table
 */
export const getRequiredColumns = (tableName) => {
  const schema = getTableSchema(tableName);
  if (!schema) return [];

  return schema.columns.filter(col => col.required).map(col => col.key);
};

/**
 * Validate row data against schema
 */
export const validateRowData = (tableName, data) => {
  const schema = getTableSchema(tableName);
  if (!schema) return { valid: false, errors: ['Unknown table'] };

  const errors = [];
  const requiredCols = getRequiredColumns(tableName);

  // Check required fields
  requiredCols.forEach(colKey => {
    if (!data[colKey] || (typeof data[colKey] === 'string' && data[colKey].trim() === '')) {
      const col = schema.columns.find(c => c.key === colKey);
      errors.push(`${col?.label || colKey} is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

export default TABLE_SCHEMAS;
