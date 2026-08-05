# Identity Hub Architecture Documentation

## Overview

The Identity Hub is a modular platform integration system that aggregates user data from multiple professional and coding platforms into a unified career profile.

## Architecture

### Core Components

#### 1. Type System (`src/types/identity-hub.ts`)

Defines all data structures for the Identity Hub:

- **Platform**: Supported platform types (github, linkedin, leetcode, etc.)
- **PlatformConnection**: Connection status and metadata for each platform
- **Skill**: Normalized skill data with categories and proficiency
- **Project**: Aggregated project information
- **Achievement**: Badges, certifications, and milestones
- **CodingStats**: Platform-specific coding statistics
- **Contribution**: Activity/contribution data
- **UnifiedProfile**: Complete aggregated user profile
- **PrivacySettings**: User privacy controls

#### 2. Connector Architecture (`src/lib/connectors/`)

##### Base Connector (`base-connector.ts`)

Abstract base class that all platform connectors must implement:

```typescript
interface PlatformConnector {
  readonly config: ConnectorConfig;
  authenticate(credentials: any): Promise<ConnectorResult<{ token: string }>>;
  fetchProfile(username: string): Promise<ConnectorResult<any>>;
  normalizeData(rawData: any): Partial<UnifiedProfile>;
  fetchCodingStats(username: string): Promise<ConnectorResult<CodingStats>>;
  fetchProjects(username: string): Promise<ConnectorResult<Project[]>>;
  fetchAchievements(username: string): Promise<ConnectorResult<Achievement[]>>;
  fetchContributions(
    username: string,
  ): Promise<ConnectorResult<Contribution[]>>;
  extractSkills(rawData: any): Skill[];
  validateConnection(username: string): Promise<ConnectorResult<boolean>>;
  disconnect(): Promise<ConnectorResult<void>>;
}
```

##### Platform Configuration (`platform-config.ts`)

Centralized configuration for all platforms including:

- Platform metadata (name, icon, color)
- Authentication requirements
- Required API scopes

##### Implemented Connectors

- **GitHub** (`github/github-connector.ts`): Fetches repos, languages, contributions
- **LeetCode** (`leetcode/leetcode-connector.ts`): Fetches problems, badges, stats

#### 3. Services

##### Skills Aggregator (`src/lib/services/skills-aggregator.ts`)

- Normalizes skill names across platforms
- Aggregates skills from multiple sources
- Calculates proficiency based on platform data
- Groups skills by category
- Supports manual skill addition/removal

##### Sync Engine (`src/lib/services/sync-engine.ts`)

- Manages synchronization across platforms
- Supports incremental and full sync
- Tracks sync history
- Detects and resolves conflicts
- Removes duplicate data

##### Privacy Manager (`src/lib/services/privacy-manager.ts`)

- Applies privacy settings to profile data
- Controls section visibility
- Manages recruiter visibility
- Validates privacy settings
- Provides platform-specific recommendations

#### 4. UI Components

##### Identity Hub Page (`src/routes/identity-hub.tsx`)

Main interface for:

- Viewing connected platforms
- Connecting/disconnecting accounts
- Syncing data
- Monitoring sync status
- Viewing profile completion percentage

## Data Flow

### 1. Connection Flow

```
User enters credentials → Connector.authenticate() → Validate token → Store connection
```

### 2. Sync Flow

```
Sync Engine → Connector.fetchProfile() → Connector.normalizeData() → Skills Aggregator → Unified Profile
```

### 3. Privacy Flow

```
Privacy Settings → Privacy Manager.applyPrivacySettings() → Filtered Profile → Display
```

## Adding a New Platform

### Step 1: Add Platform Configuration

Update `src/lib/connectors/platform-config.ts`:

```typescript
export const PLATFORM_CONFIGS: Record<Platform, ConnectorConfig> = {
  // ... existing platforms
  yourplatform: {
    platform: "yourplatform",
    name: "Your Platform",
    icon: "icon-name",
    color: "#hexcolor",
    requiresAuth: true / false,
    authType: "oauth" | "token" | "username" | "api_key",
    scopes: ["required", "scopes"],
  },
};
```

### Step 2: Create Connector

Create `src/lib/connectors/yourplatform/yourplatform-connector.ts`:

```typescript
import { BaseConnector } from "../base-connector";
import { PLATFORM_CONFIGS } from "../platform-config";

export class YourPlatformConnector extends BaseConnector {
  readonly config = PLATFORM_CONFIGS.yourplatform;

  async authenticate(credentials: any) {
    // Implement authentication
  }

  async fetchProfile(username: string) {
    // Fetch user profile from API
  }

  normalizeData(rawData: any) {
    // Transform to UnifiedProfile format
  }

  // Implement other required methods
}
```

### Step 3: Export Connector

Create `src/lib/connectors/yourplatform/index.ts`:

```typescript
export { YourPlatformConnector } from "./yourplatform-connector";
```

### Step 4: Update Type Definitions

Add platform to `Platform` type in `src/types/identity-hub.ts`:

```typescript
export type Platform =
  | "github"
  | "linkedin"
  | "leetcode"
  // ... existing platforms
  | "yourplatform";
```

## Data Normalization

### Skill Categories

- `programming_language`: JavaScript, Python, Java, etc.
- `framework`: React, Django, Spring Boot, etc.
- `database`: PostgreSQL, MongoDB, Redis, etc.
- `cloud`: AWS, Azure, Google Cloud
- `ai_ml`: TensorFlow, PyTorch, scikit-learn
- `tools`: Docker, Git, Kubernetes
- `soft_skills`: Communication, Leadership

### Skill Proficiency Calculation

Proficiency is calculated based on:

- GitHub: Language frequency in repositories
- LeetCode: Problem count in language
- Manual: User-specified proficiency

## Error Handling

The base connector provides standardized error handling:

- `401`: Authentication expired
- `404`: Profile not found
- `429`: Rate limit exceeded
- Other: Generic error message

## Future AI Compatibility

All data structures are designed to be AI-ready:

- **Skills**: Structured for skill gap analysis
- **Projects**: Ready for ATS analysis
- **Achievements**: Timeline for career recommendations
- **Coding Stats**: For company matching algorithms
- **Experience**: For resume generation

## Performance Considerations

- **Caching**: Sync engine maintains sync history
- **Incremental Updates**: Only sync changed data
- **Lazy Loading**: Load data on demand
- **Duplicate Prevention**: Automatic deduplication

## Security

- **No Credential Storage**: Tokens are stored securely by platform
- **Privacy First**: All data respects user privacy settings
- **Optional Connections**: Users can disconnect at any time
- **Read-Only**: Only public data is fetched where possible
