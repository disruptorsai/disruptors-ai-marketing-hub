import Vibrant from 'node-vibrant';
import { formatHex, wcagContrast, formatCss } from 'culori';

export interface BrandData {
  logo?: string;
  palette: {
    primary: string;
    secondary?: string;
    neutrals: string[];
  };
  name?: string;
}

export class BrandDetector {
  private brandfetchKey?: string;

  constructor(apiKey?: string) {
    this.brandfetchKey = apiKey || process.env.BRANDFETCH_API_KEY;
  }

  async detectFromDomain(domain: string): Promise<BrandData | null> {
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

  private async fetchFromBrandfetch(domain: string): Promise<BrandData | null> {
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
      const neutrals = colors.slice(2, 5).map((c: any) => c.hex);

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

  async extractColorsFromImage(imageUrl: string): Promise<string[]> {
    try {
      const palette = await Vibrant.from(imageUrl).getPalette();

      const colors: string[] = [];

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

  validateContrast(foreground: string, background: string): boolean {
    try {
      const contrast = wcagContrast(foreground, background);
      return contrast >= 4.5; // WCAG AA standard
    } catch {
      return false;
    }
  }

  generatePalette(primaryColor: string): BrandData['palette'] {
    // Generate complementary colors based on primary
    const colors = this.extractColorsFromImage(primaryColor);

    return {
      primary: primaryColor,
      secondary: colors[1] || this.adjustBrightness(primaryColor, 0.3),
      neutrals: [
        this.adjustBrightness(primaryColor, -0.6),
        this.adjustBrightness(primaryColor, -0.3),
        this.adjustBrightness(primaryColor, 0.6),
      ],
    };
  }

  private adjustBrightness(hex: string, amount: number): string {
    // Simple brightness adjustment
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount * 255));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount * 255));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount * 255));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  async extractFromImages(imageUrls: string[]): Promise<BrandData> {
    const allColors: string[] = [];

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
