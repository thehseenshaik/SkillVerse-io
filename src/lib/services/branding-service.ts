/**
 * Custom Branding Service
 * Handles user customization of portfolio appearance
 */

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { fbDb } from "@/lib/firebase";

const db = fbDb();

export interface BrandingConfig {
  userId: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  bannerImage?: string;
  profileImage?: string;
  layout: "modern" | "minimal" | "glass" | "developer" | "corporate" | "dark" | "creative";
  sectionOrder: string[];
  customCSS?: string;
  lastUpdated: Date;
}

export const DEFAULT_COLORS = {
  accent: "#3b82f6",
  background: "#ffffff",
  text: "#1f2937",
};

export const FONT_FAMILIES = [
  { id: "inter", name: "Inter", value: "Inter, sans-serif" },
  { id: "system", name: "System", value: "system-ui, sans-serif" },
  { id: "georgia", name: "Georgia", value: "Georgia, serif" },
  { id: "helvetica", name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { id: "jetbrains", name: "JetBrains Mono", value: "JetBrains Mono, monospace" },
  { id: "playfair", name: "Playfair Display", value: "Playfair Display, serif" },
  { id: "lato", name: "Lato", value: "Lato, sans-serif" },
];

export const LAYOUTS = [
  { id: "modern", name: "Modern", description: "Clean and contemporary" },
  { id: "minimal", name: "Minimal", description: "Simple and elegant" },
  { id: "glass", name: "Glass", description: "Glassmorphism effects" },
  { id: "developer", name: "Developer", description: "Code-focused design" },
  { id: "corporate", name: "Corporate", description: "Professional and formal" },
  { id: "dark", name: "Dark Professional", description: "Dark theme with professional look" },
  { id: "creative", name: "Creative", description: "Bold and artistic" },
];

export class BrandingService {
  /**
   * Get branding configuration
   */
  async getBrandingConfig(userId: string): Promise<BrandingConfig | null> {
    try {
      const brandingRef = doc(db, "branding", userId);
      const brandingDoc = await getDoc(brandingRef);

      if (!brandingDoc.exists()) {
        return this.getDefaultConfig(userId);
      }

      const data = brandingDoc.data();
      return {
        userId: data.userId,
        accentColor: data.accentColor || DEFAULT_COLORS.accent,
        backgroundColor: data.backgroundColor || DEFAULT_COLORS.background,
        textColor: data.textColor || DEFAULT_COLORS.text,
        fontFamily: data.fontFamily || "inter",
        bannerImage: data.bannerImage,
        profileImage: data.profileImage,
        layout: data.layout || "modern",
        sectionOrder: data.sectionOrder || [],
        customCSS: data.customCSS,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting branding config:", error);
      return null;
    }
  }

  /**
   * Get default branding configuration
   */
  getDefaultConfig(userId: string): BrandingConfig {
    return {
      userId,
      accentColor: DEFAULT_COLORS.accent,
      backgroundColor: DEFAULT_COLORS.background,
      textColor: DEFAULT_COLORS.text,
      fontFamily: "inter",
      layout: "modern",
      sectionOrder: [
        "hero",
        "about",
        "skills",
        "experience",
        "projects",
        "education",
        "achievements",
        "contact",
      ],
      lastUpdated: new Date(),
    };
  }

  /**
   * Update branding configuration
   */
  async updateBrandingConfig(userId: string, config: Partial<BrandingConfig>): Promise<void> {
    try {
      const brandingRef = doc(db, "branding", userId);
      const currentConfig = await this.getBrandingConfig(userId);
      
      const updatedConfig = {
        ...currentConfig,
        ...config,
        lastUpdated: new Date(),
      };

      await setDoc(brandingRef, updatedConfig);
    } catch (error) {
      console.error("Error updating branding config:", error);
      throw error;
    }
  }

  /**
   * Update accent color
   */
  async updateAccentColor(userId: string, color: string): Promise<void> {
    await this.updateBrandingConfig(userId, { accentColor: color });
  }

  /**
   * Update background color
   */
  async updateBackgroundColor(userId: string, color: string): Promise<void> {
    await this.updateBrandingConfig(userId, { backgroundColor: color });
  }

  /**
   * Update text color
   */
  async updateTextColor(userId: string, color: string): Promise<void> {
    await this.updateBrandingConfig(userId, { textColor: color });
  }

  /**
   * Update font family
   */
  async updateFontFamily(userId: string, fontFamily: string): Promise<void> {
    await this.updateBrandingConfig(userId, { fontFamily });
  }

  /**
   * Update layout
   */
  async updateLayout(userId: string, layout: BrandingConfig["layout"]): Promise<void> {
    await this.updateBrandingConfig(userId, { layout });
  }

  /**
   * Update banner image
   */
  async updateBannerImage(userId: string, imageUrl: string): Promise<void> {
    await this.updateBrandingConfig(userId, { bannerImage: imageUrl });
  }

  /**
   * Update profile image
   */
  async updateProfileImage(userId: string, imageUrl: string): Promise<void> {
    await this.updateBrandingConfig(userId, { profileImage: imageUrl });
  }

  /**
   * Update section order
   */
  async updateSectionOrder(userId: string, sectionOrder: string[]): Promise<void> {
    await this.updateBrandingConfig(userId, { sectionOrder });
  }

  /**
   * Update custom CSS
   */
  async updateCustomCSS(userId: string, customCSS: string): Promise<void> {
    await this.updateBrandingConfig(userId, { customCSS });
  }

  /**
   * Generate CSS variables from branding config
   */
  generateCSSVariables(config: BrandingConfig): string {
    const fontFamily = FONT_FAMILIES.find((f) => f.id === config.fontFamily)?.value || "Inter, sans-serif";
    
    return `
:root {
  --brand-accent: ${config.accentColor};
  --brand-background: ${config.backgroundColor};
  --brand-text: ${config.textColor};
  --brand-font: ${fontFamily};
}
    `.trim();
  }

  /**
   * Generate complete stylesheet
   */
  generateStylesheet(config: BrandingConfig): string {
    let css = this.generateCSSVariables(config);
    
    if (config.customCSS) {
      css += `\n\n${config.customCSS}`;
    }

    return css;
  }

  /**
   * Apply branding to element
   */
  applyBrandingToElement(element: HTMLElement, config: BrandingConfig): void {
    const cssVariables = this.generateCSSVariables(config);
    const styleElement = document.createElement("style");
    styleElement.textContent = cssVariables;
    element.appendChild(styleElement);
  }

  /**
   * Reset branding to default
   */
  async resetBranding(userId: string): Promise<void> {
    const defaultConfig = this.getDefaultConfig(userId);
    await this.updateBrandingConfig(userId, defaultConfig);
  }

  /**
   * Export branding configuration
   */
  exportBrandingConfig(userId: string): Promise<string> {
    return this.getBrandingConfig(userId).then((config) => {
      if (!config) {
        throw new Error("No branding configuration found");
      }
      return JSON.stringify(config, null, 2);
    });
  }

  /**
   * Import branding configuration
   */
  async importBrandingConfig(userId: string, configJson: string): Promise<void> {
    try {
      const config = JSON.parse(configJson);
      await this.updateBrandingConfig(userId, config);
    } catch (error) {
      console.error("Error importing branding config:", error);
      throw new Error("Invalid branding configuration format");
    }
  }

  /**
   * Get color palette suggestions
   */
  getColorPaletteSuggestions(): Array<{ name: string; colors: { accent: string; background: string; text: string } }> {
    return [
      {
        name: "Ocean Blue",
        colors: { accent: "#3b82f6", background: "#ffffff", text: "#1e293b" },
      },
      {
        name: "Forest Green",
        colors: { accent: "#10b981", background: "#ffffff", text: "#1e293b" },
      },
      {
        name: "Royal Purple",
        colors: { accent: "#8b5cf6", background: "#ffffff", text: "#1e293b" },
      },
      {
        name: "Sunset Orange",
        colors: { accent: "#f97316", background: "#ffffff", text: "#1e293b" },
      },
      {
        name: "Midnight Dark",
        colors: { accent: "#6366f1", background: "#0f172a", text: "#f8fafc" },
      },
      {
        name: "Rose Pink",
        colors: { accent: "#ec4899", background: "#ffffff", text: "#1e293b" },
      },
    ];
  }

  /**
   * Apply color palette
   */
  async applyColorPalette(userId: string, paletteName: string): Promise<void> {
    const palettes = this.getColorPaletteSuggestions();
    const palette = palettes.find((p) => p.name === paletteName);
    
    if (palette) {
      await this.updateBrandingConfig(userId, {
        accentColor: palette.colors.accent,
        backgroundColor: palette.colors.background,
        textColor: palette.colors.text,
      });
    }
  }
}

export const brandingService = new BrandingService();
