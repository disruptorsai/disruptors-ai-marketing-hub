import Vibrant from 'node-vibrant';
import { formatHex, wcagContrast } from 'culori';

/**
 * @typedef {Object} BrandData
 * @property {string} [logo] - Logo URL
 * @property {Object} palette - Color palette
 * @property {string} palette.primary - Primary brand color
 * @property {string} [palette.secondary] - Secondary brand color
 * @property {string[]} palette.neutrals - Neutral colors
 * @property {string} [name] - Brand name
 */

/**
 * Brand detector for extracting brand colors and identity
 */
export class BrandDetector {
  /**
   * @param {string} [apiKey] - Brandfetch API key (optional)
   */
  constructor(apiKey) {
    this.brandfetchKey = apiKey || import.meta.env.VITE_BRANDFETCH_API_KEY;
  }

  /**
   * Detect brand data from domain using Brandfetch API
   * @param {string} domain - Domain to detect brand for
   * @returns {Promise<BrandData | null>} Brand data or null if not found
   */
  async detectFromDomain(domain) {
    // Try Brandfetch API first
    if (this.brandfetchKey) {
      try {
        const brandfetchData = await this.fetchFromBrandfetch(domain);
        if (brandfetchData) return brandfetchData;
      } catch (error) {
        console.log('Brandfetch failed, falling back to color extraction');
      }
    }

    // Fallback: return null and let caller extract from images
    return null;
  }

  /**
   * Fetch brand data from Brandfetch API
   * @private
   * @param {string} domain - Domain to fetch
   * @returns {Promise<BrandData | null>} Brand data or null
   */
  async fetchFromBrandfetch(domain) {
    try {
      const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
        headers: {
          Authorization: `Bearer ${this.brandfetchKey}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();

      // Extract logo
      const logo = data.logos?.[0]?.formats?.[0]?.src || data.icon?.src;

      // Extract colors
      const colors = data.colors || [];
      const primary = colors[0]?.hex;
      const secondary = colors[1]?.hex;
      const neutrals = colors.slice(2, 5).map((c) => c.hex);

      return {
        logo,
        palette: {
          primary: primary || '#000000',
          secondary,
          neutrals: neutrals.length > 0 ? neutrals : ['#666666', '#999999', '#CCCCCC'],
        },
        name: data.name,
      };
    } catch (error) {
      console.error('Brandfetch error:', error);
      return null;
    }
  }

  /**
   * Extract colors from an image using Vibrant
   * @param {string} imageUrl - Image URL
   * @returns {Promise<string[]>} Array of hex color strings
   */
  async extractColorsFromImage(imageUrl) {
    try {
      const palette = await Vibrant.from(imageUrl).getPalette();

      const colors = [];

      // Extract vibrant colors
      if (palette.Vibrant) colors.push(formatHex(palette.Vibrant.rgb));
      if (palette.DarkVibrant) colors.push(formatHex(palette.DarkVibrant.rgb));
      if (palette.LightVibrant) colors.push(formatHex(palette.LightVibrant.rgb));
      if (palette.Muted) colors.push(formatHex(palette.Muted.rgb));
      if (palette.DarkMuted) colors.push(formatHex(palette.DarkMuted.rgb));
      if (palette.LightMuted) colors.push(formatHex(palette.LightMuted.rgb));

      return colors.filter((c) => c !== undefined);
    } catch (error) {
      console.error('Color extraction error:', error);
      return [];
    }
  }

  /**
   * Validate color contrast for accessibility (WCAG AA)
   * @param {string} foreground - Foreground color
   * @param {string} background - Background color
   * @returns {boolean} True if contrast meets WCAG AA standard (4.5:1)
   */
  validateContrast(foreground, background) {
    try {
      const contrast = wcagContrast(foreground, background);
      return contrast >= 4.5; // WCAG AA standard
    } catch {
      return false;
    }
  }

  /**
   * Generate complementary color palette from primary color
   * @param {string} primaryColor - Primary color (hex)
   * @returns {BrandData['palette']} Generated palette
   */
  generatePalette(primaryColor) {
    return {
      primary: primaryColor,
      secondary: this.adjustBrightness(primaryColor, 0.3),
      neutrals: [
        this.adjustBrightness(primaryColor, -0.6),
        this.adjustBrightness(primaryColor, -0.3),
        this.adjustBrightness(primaryColor, 0.6),
      ],
    };
  }

  /**
   * Adjust color brightness
   * @private
   * @param {string} hex - Hex color
   * @param {number} amount - Brightness adjustment (-1 to 1)
   * @returns {string} Adjusted hex color
   */
  adjustBrightness(hex, amount) {
    // Simple brightness adjustment
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount * 255));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount * 255));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount * 255));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Extract brand data from multiple images
   * @param {string[]} imageUrls - Array of image URLs
   * @returns {Promise<BrandData>} Extracted brand data
   */
  async extractFromImages(imageUrls) {
    const allColors = [];

    for (const url of imageUrls.slice(0, 3)) {
      // Only process first 3 images
      const colors = await this.extractColorsFromImage(url);
      allColors.push(...colors);
    }

    // Find most common/vibrant color as primary
    const primary = allColors[0] || '#2563eb'; // Fallback blue

    return {
      logo: imageUrls[0], // Use first image as logo candidate
      palette: this.generatePalette(primary),
    };
  }
}
