/**
 * Browser-compatible Cloudinary client
 * Handles client-side transformations and URL generation
 */

class CloudinaryClient {
  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    this.baseUrl = `https://res.cloudinary.com/${this.cloudName}`;
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;
  }

  /**
   * Generate optimized image URL with transformations
   */
  generateImageUrl(publicId, transformations = {}) {
    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto:good',
      format = 'auto',
      gravity = 'center'
    } = transformations;

    let transformString = [];

    if (width) transformString.push(`w_${width}`);
    if (height) transformString.push(`h_${height}`);
    if (crop) transformString.push(`c_${crop}`);
    if (gravity) transformString.push(`g_${gravity}`);
    if (quality) transformString.push(`q_${quality}`);
    if (format) transformString.push(`f_${format}`);

    const transforms = transformString.length > 0 ? `/${transformString.join(',')}` : '';

    return `${this.baseUrl}/image/upload${transforms}/${publicId}`;
  }

  /**
   * Generate video URL with transformations
   */
  generateVideoUrl(publicId, transformations = {}) {
    const {
      width,
      height,
      quality = 'auto:good',
      format = 'auto'
    } = transformations;

    let transformString = [];

    if (width) transformString.push(`w_${width}`);
    if (height) transformString.push(`h_${height}`);
    if (quality) transformString.push(`q_${quality}`);
    if (format) transformString.push(`f_${format}`);

    const transforms = transformString.length > 0 ? `/${transformString.join(',')}` : '';

    return `${this.baseUrl}/video/upload${transforms}/${publicId}`;
  }

  /**
   * Browser-based file upload using fetch
   */
  async uploadFile(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', options.uploadPreset || 'ml_default');

      if (options.folder) {
        formData.append('folder', options.folder);
      }

      if (options.publicId) {
        formData.append('public_id', options.publicId);
      }

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload from URL (requires backend proxy)
   */
  async uploadFromUrl(sourceUrl, options = {}) {
    try {
      // This would typically go through your backend API
      const response = await fetch('/api/cloudinary/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: sourceUrl,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`Upload from URL failed: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Upload from URL failed:', error);
      throw error;
    }
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  generateResponsiveImages(publicId, sizes = []) {
    const defaultSizes = [
      { width: 320, suffix: 'mobile' },
      { width: 768, suffix: 'tablet' },
      { width: 1024, suffix: 'desktop' },
      { width: 1920, suffix: 'large' }
    ];

    const imageSizes = sizes.length > 0 ? sizes : defaultSizes;

    return imageSizes.map(size => ({
      url: this.generateImageUrl(publicId, {
        width: size.width,
        quality: 'auto:good',
        format: 'auto'
      }),
      width: size.width,
      suffix: size.suffix
    }));
  }

  /**
   * Generate srcset string for responsive images
   */
  generateSrcSet(publicId, widths = [320, 768, 1024, 1920]) {
    return widths
      .map(width => {
        const url = this.generateImageUrl(publicId, {
          width,
          quality: 'auto:good',
          format: 'auto'
        });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Get image info (requires API call)
   */
  async getImageInfo(publicId) {
    try {
      // This would typically go through your backend API
      const response = await fetch(`/api/cloudinary/info/${encodeURIComponent(publicId)}`);

      if (!response.ok) {
        throw new Error(`Failed to get image info: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Failed to get image info:', error);
      throw error;
    }
  }

  /**
   * Generate placeholder image URL
   */
  generatePlaceholder(width = 400, height = 300, text = 'Loading...') {
    return `https://via.placeholder.com/${width}x${height}/f0f0f0/999999?text=${encodeURIComponent(text)}`;
  }

  /**
   * Generate blur placeholder from existing image
   */
  generateBlurPlaceholder(publicId, quality = 1) {
    return this.generateImageUrl(publicId, {
      width: 40,
      height: 40,
      quality: quality,
      effect: 'blur:1000'
    });
  }
}

// Export singleton instance
export const cloudinaryClient = new CloudinaryClient();
export default CloudinaryClient;