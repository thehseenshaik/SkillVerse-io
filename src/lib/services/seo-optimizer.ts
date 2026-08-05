/**
 * SEO Optimization Service
 * Generates meta tags, Open Graph, Twitter Cards, and structured data
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  structuredData: any;
}

export class SEOOptimizerService {
  /**
   * Generate SEO metadata for profile
   */
  generateProfileMetadata(profile: any, username: string): SEOMetadata {
    const baseUrl = "https://skillverse.io";
    const profileUrl = `${baseUrl}/u/${username}`;
    const displayName = profile.displayName || username;
    const headline = profile.bio || profile.headline || "Professional";
    const location = profile.location || "";

    const title = `${displayName} - ${headline} | SkillVerse`;
    const description = `View ${displayName}'s professional profile on SkillVerse. ${headline}${location ? ` based in ${location}` : ""}. Skills, projects, experience, and more.`;
    
    const keywords = [
      displayName,
      headline,
      "portfolio",
      "profile",
      "developer",
      "engineer",
      "skills",
      "projects",
      "resume",
      ...((profile.skills || []).slice(0, 5).map((s: any) => s.name || s)),
    ];

    const structuredData = this.generateStructuredData(profile, username, profileUrl);

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      ogImage: profile.avatar || `${baseUrl}/og-default.png`,
      ogType: "profile",
      twitterCard: "summary_large_image",
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: profile.avatar || `${baseUrl}/og-default.png`,
      canonicalUrl: profileUrl,
      structuredData,
    };
  }

  /**
   * Generate structured data (JSON-LD)
   */
  private generateStructuredData(profile: any, username: string, profileUrl: string): any {
    const displayName = profile.displayName || username;
    const headline = profile.bio || profile.headline || "Professional";

    const structuredData: any = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: displayName,
      url: profileUrl,
      description: headline,
    };

    if (profile.avatar) {
      structuredData.image = profile.avatar;
    }

    if (profile.location) {
      structuredData.address = {
        "@type": "PostalAddress",
        addressLocality: profile.location,
      };
    }

    if (profile.website) {
      structuredData.sameAs = [profile.website];
    }

    if (profile.github) {
      structuredData.sameAs = [...(structuredData.sameAs || []), profile.github];
    }

    if (profile.linkedin) {
      structuredData.sameAs = [...(structuredData.sameAs || []), profile.linkedin];
    }

    if (profile.twitter) {
      structuredData.sameAs = [...(structuredData.sameAs || []), profile.twitter];
    }

    if (profile.skills && profile.skills.length > 0) {
      structuredData.knowsAbout = profile.skills.slice(0, 10).map((s: any) => s.name || s);
    }

    if (profile.experience && profile.experience.length > 0) {
      structuredData.jobTitle = profile.experience[0].title || profile.experience[0].role;
    }

    return structuredData;
  }

  /**
   * Generate meta tags HTML
   */
  generateMetaTags(metadata: SEOMetadata): string {
    let tags = "";

    // Basic meta tags
    tags += `<title>${this.escapeHtml(metadata.title)}</title>\n`;
    tags += `<meta name="description" content="${this.escapeHtml(metadata.description)}">\n`;
    tags += `<meta name="keywords" content="${metadata.keywords.join(", ")}">\n`;

    // Open Graph tags
    tags += `<meta property="og:title" content="${this.escapeHtml(metadata.ogTitle)}">\n`;
    tags += `<meta property="og:description" content="${this.escapeHtml(metadata.ogDescription)}">\n`;
    tags += `<meta property="og:image" content="${this.escapeHtml(metadata.ogImage)}">\n`;
    tags += `<meta property="og:type" content="${metadata.ogType}">\n`;
    tags += `<meta property="og:url" content="${this.escapeHtml(metadata.canonicalUrl)}">\n`;

    // Twitter Card tags
    tags += `<meta name="twitter:card" content="${metadata.twitterCard}">\n`;
    tags += `<meta name="twitter:title" content="${this.escapeHtml(metadata.twitterTitle)}">\n`;
    tags += `<meta name="twitter:description" content="${this.escapeHtml(metadata.twitterDescription)}">\n`;
    tags += `<meta name="twitter:image" content="${this.escapeHtml(metadata.twitterImage)}">\n`;

    // Canonical URL
    tags += `<link rel="canonical" href="${this.escapeHtml(metadata.canonicalUrl)}">\n`;

    // Structured data
    tags += `<script type="application/ld+json">\n`;
    tags += JSON.stringify(metadata.structuredData, null, 2);
    tags += `\n</script>\n`;

    return tags;
  }

  /**
   * Generate sitemap entry
   */
  generateSitemapEntry(username: string, lastModified: Date = new Date()): string {
    const baseUrl = "https://skillverse.io";
    const profileUrl = `${baseUrl}/u/${username}`;
    const lastmod = lastModified.toISOString().split("T")[0];

    return `  <url>
    <loc>${profileUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  /**
   * Generate robots.txt entry
   */
  generateRobotsTxtEntry(username: string): string {
    return `Allow: /u/${username}`;
  }

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Generate social preview card URL
   */
  generateSocialPreviewUrl(username: string, platform: "linkedin" | "twitter" | "facebook"): string {
    const baseUrl = "https://skillverse.io";
    const profileUrl = `${baseUrl}/u/${username}`;

    switch (platform) {
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
      case "twitter":
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
      default:
        return profileUrl;
    }
  }

  /**
   * Generate social share text
   */
  generateSocialShareText(profile: any, username: string): string {
    const displayName = profile.displayName || username;
    const headline = profile.bio || profile.headline || "Professional";
    const profileUrl = `https://skillverse.io/u/${username}`;

    return `Check out ${displayName}'s professional profile on SkillVerse! ${headline} - ${profileUrl}`;
  }
}

export const seoOptimizerService = new SEOOptimizerService();
