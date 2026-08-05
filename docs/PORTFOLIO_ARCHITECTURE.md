# Portfolio Architecture Documentation

## Overview

The SkillVerse Portfolio system is a comprehensive public-facing Career Identity Platform that enables users to publish professional profiles, generate portfolio websites, share their career identity with recruiters, and track profile engagement.

## Architecture

### Core Services

#### 1. Username Service (`username-service.ts`)
- **Purpose**: Manages unique usernames for public profiles
- **Key Features**:
  - Username validation (format, length, reserved names)
  - Availability checking
  - Username claiming and updating
  - Username suggestions
- **Database**: `usernames` collection in Firestore
- **Reserved Names**: admin, api, auth, blog, etc. (60+ reserved names)

#### 2. Portfolio Generator Service (`portfolio-generator.ts`)
- **Purpose**: Generates portfolio websites from Identity Hub data
- **Key Features**:
  - Dynamic portfolio generation
  - 7 portfolio themes (Modern, Minimal, Glass, Developer, Corporate, Dark, Creative)
  - Section visibility control
  - Section reordering
  - HTML export
  - AI-powered content enhancement
- **Themes**: Each theme includes colors, typography, and layout specifications
- **Sections**: Hero, About, Skills, Experience, Projects, Education, Achievements, Certifications, Coding Stats, Contact

#### 3. Profile Completion Service (`profile-completion.ts`)
- **Purpose**: Calculates profile completion percentage and provides suggestions
- **Key Features**:
  - Completion calculation (12 sections with weighted importance)
  - Priority suggestions
  - Public view readiness check
  - Recruiter readiness check
- **Completion Levels**: Excellent (90%+), Very Good (75%+), Good (50%+), Basic (25%+), Incomplete

#### 4. Profile Analytics Service (`profile-analytics.ts`)
- **Purpose**: Tracks profile views, engagement, and provides analytics
- **Key Features**:
  - Profile view tracking
  - Resume download tracking
  - QR code scan tracking
  - Link share tracking
  - Views over time (for charts)
  - Traffic source analysis
  - Unique visitor tracking
- **Database Collections**: `profile_views`, `resume_downloads`, `qr_scans`, `link_shares`, `profile_analytics`

#### 5. Resume Publishing Service (`resume-publishing.ts`)
- **Purpose**: Handles resume publishing and visibility management
- **Key Features**:
  - Resume publishing/unpublishing
  - Version management (ATS, Modern, Minimal)
  - Download permission control
  - Contact permission control
  - QR code generation
- **Database**: `resume_publish` collection

#### 6. Privacy Controls Service (`privacy-controls.ts`)
- **Purpose**: Manages public profile privacy settings
- **Key Features**:
  - Profile visibility (public, private, connections_only)
  - Section-level visibility control
  - Recruiter visibility toggle
  - Contact request permissions
  - Resume download permissions
  - Hidden sections management
  - Profile data filtering
- **Database**: `privacy_settings` collection

#### 7. SEO Optimizer Service (`seo-optimizer.ts`)
- **Purpose**: Generates SEO metadata and structured data
- **Key Features**:
  - Meta tag generation
  - Open Graph tags
  - Twitter Cards
  - JSON-LD structured data
  - Sitemap generation
  - Social preview URLs
  - Social share text generation

#### 8. Social Sharing Service (`social-sharing.ts`)
- **Purpose**: Handles social media sharing functionality
- **Key Features**:
  - Multi-platform sharing (LinkedIn, Twitter, Facebook, WhatsApp, Telegram, Email)
  - Link copying
  - Share tracking
  - QR code generation
  - Embed code generation
  - Share preview generation
- **Platforms**: 6 supported platforms

#### 9. Branding Service (`branding-service.ts`)
- **Purpose**: Handles user customization of portfolio appearance
- **Key Features**:
  - Color customization (accent, background, text)
  - Font family selection (7 fonts)
  - Layout selection (7 layouts)
  - Banner/profile image management
  - Section order customization
  - Custom CSS support
  - Color palette suggestions
- **Database**: `branding` collection

#### 10. Contact System Service (`contact-system.ts`)
- **Purpose**: Handles recruiter contact requests and messaging
- **Key Features**:
  - Contact request submission
  - Request status management (pending, accepted, declined, archived)
  - Contact statistics
  - Request validation
  - Contact form HTML generation
  - Export functionality
- **Database**: `contact_requests` collection

#### 11. AI Portfolio Enhancement Service (`ai-portfolio-enhancement.ts`)
- **Purpose**: Uses Gemini AI to improve portfolio content
- **Key Features**:
  - About section enhancement
  - Project description enhancement
  - Skills summary enhancement
  - Professional headline generation
  - Experience description enhancement
  - Achievement wording enhancement
  - Multiple version generation
  - Portfolio improvement suggestions
  - Full portfolio enhancement

#### 12. Recruiter Downloads Service (`recruiter-downloads.ts`)
- **Purpose**: Handles resume, portfolio, and document downloads for recruiters
- **Key Features**:
  - Download permission checking
  - Download request tracking
  - Multiple download types (resume PDF/DOCX, portfolio PDF, project summary, AI career summary)
  - Download statistics
  - Request approval/blocking
  - Privacy-respecting downloads
- **Database**: `download_requests` collection

#### 13. Export Center Service (`export-center.ts`)
- **Purpose**: Handles exporting profile data in various formats
- **Key Features**:
  - Multiple export formats (JSON, HTML, PDF, DOCX, CSV, Markdown)
  - Private data filtering
  - Resume-specific export
  - Portfolio-specific export
  - Analytics export
  - File download utilities
- **Supported Formats**: 6 formats

#### 14. Performance Optimizer Service (`performance-optimizer.ts`)
- **Purpose**: Handles lazy loading, caching, and performance optimizations
- **Key Features**:
  - In-memory caching with TTL
  - Cache size management
  - Lazy loading utilities
  - Debounce/throttle functions
  - Performance measurement
  - Data prefetching
  - Image optimization
  - CSS/HTML minification
  - Service worker generation
  - Performance metrics

#### 15. Security Service (`security-service.ts`)
- **Purpose**: Handles security measures for public profiles
- **Key Features**:
  - Rate limiting (configurable)
  - CSRF protection
  - Input validation and sanitization
  - XSS protection
  - Email/URL/username validation
  - Profile access validation
  - Profile data sanitization
  - Suspicious activity detection
  - Security event logging
  - Hash generation and comparison

## Routes

### Public Profile Routes
- `/u/$username` - Public profile page
- `/u/$username/recruiter` - Recruiter-specific view

### Settings Routes
- `/username-settings` - Username claiming and management
- `/portfolio-editor` - Portfolio customization and preview

## Database Schema

### Collections

#### `usernames`
```typescript
{
  userId: string;
  username: string;
  createdAt: Date;
  releasedAt?: Date;
}
```

#### `profile_views`
```typescript
{
  userId: string;
  username: string;
  timestamp: Date;
  visitorId: string;
  referrer?: string;
  userAgent?: string;
  location?: string;
  duration?: number;
  isRecruiter?: boolean;
}
```

#### `resume_downloads`
```typescript
{
  userId: string;
  username: string;
  timestamp: Date;
  visitorId: string;
}
```

#### `qr_scans`
```typescript
{
  userId: string;
  username: string;
  timestamp: Date;
  visitorId: string;
  type: string;
}
```

#### `link_shares`
```typescript
{
  userId: string;
  username: string;
  timestamp: Date;
  platform: string;
}
```

#### `profile_analytics`
```typescript
{
  userId: string;
  username: string;
  totalViews: number;
  uniqueVisitors: number;
  recruiterViews: number;
  resumeDownloads: number;
  portfolioVisits: number;
  qrCodeScans: number;
  linkShares: number;
  averageDuration: number;
  trafficSources: Record<string, number>;
  returningVisitors: number;
  lastUpdated: Date;
}
```

#### `resume_publish`
```typescript
{
  userId: string;
  isPublic: boolean;
  publicUrl?: string;
  lastPublished?: Date;
  resumeVersion: "ats" | "modern" | "minimal";
  allowDownload: boolean;
  allowContact: boolean;
  qrCodeEnabled: boolean;
}
```

#### `privacy_settings`
```typescript
{
  userId: string;
  profileVisibility: "public" | "private" | "connections_only";
  showEmail: boolean;
  showLocation: boolean;
  showProjects: boolean;
  showAchievements: boolean;
  showCodingStats: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showCertifications: boolean;
  showSkills: boolean;
  recruiterVisibility: boolean;
  allowContactRequests: boolean;
  allowResumeDownload: boolean;
  hiddenSections: string[];
  lastUpdated: Date;
}
```

#### `branding`
```typescript
{
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
```

#### `contact_requests`
```typescript
{
  userId: string;
  username: string;
  recruiterName: string;
  recruiterEmail: string;
  recruiterCompany?: string;
  message: string;
  type: "contact" | "resume_request" | "save_candidate";
  status: "pending" | "accepted" | "declined" | "archived";
  timestamp: Date;
  metadata?: {
    source?: string;
    referrer?: string;
  };
}
```

#### `download_requests`
```typescript
{
  userId: string;
  username: string;
  recruiterId?: string;
  recruiterEmail?: string;
  recruiterName?: string;
  recruiterCompany?: string;
  downloadType: "resume_pdf" | "resume_docx" | "portfolio_pdf" | "project_summary" | "ai_career_summary";
  status: "pending" | "completed" | "failed" | "blocked";
  timestamp: Date;
  metadata?: {
    version?: string;
    format?: string;
    fileSize?: number;
  };
}
```

## Integration Points

### Identity Hub Integration
- **Data Source**: `aiDataLayer.getUnifiedProfile()`
- **Used By**: Portfolio Generator, Profile Completion, Export Center
- **Data Types**: Skills, Projects, Experience, Education, Achievements, Certifications, Coding Stats

### AI Integration
- **Service**: `processAIRequest` from AI service
- **Used By**: AI Portfolio Enhancement
- **Feature Type**: `portfolio_enhancement`
- **Prompt Templates**: Custom prompts for each enhancement type

### Firebase Integration
- **Firestore**: All data persistence
- **Collections**: 10+ collections for various features
- **Authentication**: User authentication via Firebase Auth
- **Storage**: Image storage (future implementation)

## Security Considerations

### Privacy
- Section-level visibility controls
- Recruiter-specific visibility toggles
- Private data filtering for public views
- Contact request permissions
- Download permissions

### Rate Limiting
- Configurable rate limits per identifier
- Time-based windows
- Automatic cleanup of expired entries

### Input Validation
- Username validation
- Email validation
- URL validation
- Input sanitization
- XSS protection

### CSRF Protection
- Token generation
- Token validation
- Token expiration

## Performance Optimizations

### Caching
- In-memory caching with TTL
- Cache size management
- Automatic eviction of old entries

### Lazy Loading
- Component lazy loading utilities
- Data prefetching
- Image lazy loading

### Code Optimization
- CSS minification
- HTML minification
- Critical CSS generation
- Service worker for offline support

### Performance Monitoring
- Load time measurement
- Render time measurement
- Memory usage tracking
- Cache hit rate tracking

## SEO Optimization

### Meta Tags
- Title tags
- Description tags
- Keywords tags
- Canonical URLs

### Open Graph
- OG title
- OG description
- OG image
- OG type
- OG URL

### Twitter Cards
- Twitter card type
- Twitter title
- Twitter description
- Twitter image

### Structured Data
- JSON-LD format
- Person schema
- KnowsAbout
- JobTitle
- Address
- SameAs (social links)

## Future Enhancements

### Planned Features
- Image upload and storage
- Video portfolio support
- Multi-language support
- Advanced analytics dashboard
- A/B testing for profiles
- Custom domain support
- Webhook integrations
- API access for developers

### Scalability Considerations
- CDN for static assets
- Database indexing optimization
- Query optimization
- Caching layer (Redis)
- Load balancing
- Geographic distribution

## Testing Strategy

### Unit Tests
- Service method testing
- Validation logic testing
- Utility function testing

### Integration Tests
- Service integration testing
- Database operations testing
- API endpoint testing

### E2E Tests
- User flow testing
- Cross-browser testing
- Mobile responsiveness testing

### Performance Tests
- Load testing
- Stress testing
- Cache effectiveness testing

## Monitoring

### Metrics to Track
- Profile view count
- Download count
- Share count
- Contact request count
- Cache hit rate
- Error rate
- Response time

### Alerts
- High error rate
- Slow response times
- Security events
- Rate limit violations

## Documentation

### API Documentation
- Service method documentation
- Type definitions
- Usage examples

### User Documentation
- Getting started guide
- Feature guides
- Best practices
- FAQ

### Developer Documentation
- Architecture overview
- Database schema
- Integration guide
- Contribution guide
