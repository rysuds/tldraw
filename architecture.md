# tldraw Architecture Overview

## Table of Contents
1. [Introduction](#introduction)
2. [High-Level Architecture](#high-level-architecture)
3. [Monorepo Structure](#monorepo-structure)
4. [Core Packages](#core-packages)
5. [Application Layer](#application-layer)
6. [State Management](#state-management)
7. [Data Flow](#data-flow)
8. [Multiplayer Sync Architecture](#multiplayer-sync-architecture)
9. [Build and Development](#build-and-development)

## Introduction

tldraw is an infinite canvas whiteboard SDK built with React and TypeScript. The project is organized as a monorepo using Yarn Berry workspaces, providing both a complete whiteboard application (tldraw.com) and a flexible SDK for building custom infinite canvas experiences.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Applications"
        DOTCOM[tldraw.com]
        DOCS[docs.tldraw.dev]
        EXAMPLES[Examples]
        VSCODE[VS Code Extension]
    end
    
    subgraph "SDK Packages"
        TLDRAW[tldraw<br/>Main SDK]
        EDITOR[editor<br/>Core Editor]
        AI[AI Module]
        SYNC[Sync<br/>Multiplayer]
    end
    
    subgraph "Core Infrastructure"
        STATE[state<br/>Signals Library]
        STORE[store<br/>Data Store]
        TLSCHEMA[tlschema<br/>Type Definitions]
        UTILS[utils<br/>Utilities]
        VALIDATE[validate<br/>Validation]
    end
    
    subgraph "Backend Services"
        SYNC_WORKER[Sync Worker]
        ASSET_WORKER[Asset Upload Worker]
        IMAGE_WORKER[Image Resize Worker]
        ANALYTICS[Analytics Service]
    end
    
    DOTCOM --> TLDRAW
    DOCS --> TLDRAW
    EXAMPLES --> TLDRAW
    VSCODE --> TLDRAW
    
    TLDRAW --> EDITOR
    TLDRAW --> AI
    TLDRAW --> SYNC
    
    EDITOR --> STATE
    EDITOR --> STORE
    EDITOR --> TLSCHEMA
    EDITOR --> UTILS
    EDITOR --> VALIDATE
    
    SYNC --> SYNC_WORKER
    DOTCOM --> ASSET_WORKER
    DOTCOM --> IMAGE_WORKER
    DOTCOM --> ANALYTICS
```

## Monorepo Structure

The tldraw monorepo is organized into several key directories:

```mermaid
graph LR
    ROOT[tldraw/]
    
    ROOT --> APPS[apps/]
    ROOT --> PACKAGES[packages/]
    ROOT --> TEMPLATES[templates/]
    ROOT --> INTERNAL[internal/]
    ROOT --> ASSETS[assets/]
    
    APPS --> DOTCOM_DIR[dotcom/]
    APPS --> DOCS_APP[docs/]
    APPS --> EXAMPLES_APP[examples/]
    APPS --> VSCODE_APP[vscode/]
    APPS --> ANALYTICS_APP[analytics/]
    APPS --> BEMO[bemo-worker/]
    
    DOTCOM_DIR --> CLIENT[client/]
    DOTCOM_DIR --> SYNC_W[sync-worker/]
    DOTCOM_DIR --> ASSET_W[asset-upload-worker/]
    DOTCOM_DIR --> IMAGE_W[image-resize-worker/]
    
    PACKAGES --> CORE_PKGS[Core Packages]
    PACKAGES --> SDK_PKGS[SDK Packages]
    
    TEMPLATES --> STARTER_TEMPLATES[Starter Templates]
```

### Workspace Organization

- **`apps/`**: Production applications and services
  - `dotcom/`: The tldraw.com application (client and workers)
  - `docs/`: Documentation site (tldraw.dev)
  - `examples/`: Example implementations
  - `vscode/`: VS Code extension
  - `analytics/`: Internal analytics service
  - `bemo-worker/`: Demo sync server

- **`packages/`**: Core SDK packages
  - `tldraw/`: Main SDK with shapes, tools, and UI
  - `editor/`: Core editor functionality
  - `state/`: Reactive signals library
  - `store/`: Client-side database
  - `sync/` & `sync-core/`: Multiplayer functionality
  - `ai/`: AI module for LLM integration
  - `tlschema/`: Type definitions and migrations
  - `utils/`: Shared utilities
  - `validate/`: Validation library

- **`templates/`**: Starter templates for different frameworks
- **`internal/`**: Build tools and scripts
- **`assets/`**: Fonts, icons, and translations

## Core Packages

### Package Dependency Graph

```mermaid
graph TD
    TLDRAW_PKG[tldraw<br/>v3.15.0]
    EDITOR_PKG[@tldraw/editor<br/>v3.15.0]
    STATE_PKG[@tldraw/state<br/>v3.15.0<br/>MIT License]
    STATE_REACT[@tldraw/state-react<br/>v3.15.0]
    STORE_PKG[@tldraw/store<br/>v3.15.0<br/>MIT License]
    TLSCHEMA[@tldraw/tlschema<br/>v3.15.0]
    UTILS[@tldraw/utils<br/>v3.15.0]
    VALIDATE[@tldraw/validate<br/>v3.15.0]
    AI_PKG[@tldraw/ai<br/>v3.15.0]
    SYNC_PKG[@tldraw/sync<br/>v3.15.0]
    SYNC_CORE[@tldraw/sync-core<br/>v3.15.0]
    ASSETS[@tldraw/assets<br/>v3.15.0]
    
    TLDRAW_PKG --> EDITOR_PKG
    TLDRAW_PKG --> STORE_PKG
    
    EDITOR_PKG --> STATE_PKG
    EDITOR_PKG --> STATE_REACT
    EDITOR_PKG --> STORE_PKG
    EDITOR_PKG --> TLSCHEMA
    EDITOR_PKG --> UTILS
    EDITOR_PKG --> VALIDATE
    
    STORE_PKG --> STATE_PKG
    STORE_PKG --> UTILS
    
    STATE_REACT --> STATE_PKG
    
    AI_PKG --> TLDRAW_PKG
    AI_PKG --> UTILS
    
    SYNC_PKG --> STATE_PKG
    SYNC_PKG --> STATE_REACT
    SYNC_PKG --> SYNC_CORE
    SYNC_PKG --> UTILS
    SYNC_PKG --> TLDRAW_PKG
    
    style TLDRAW_PKG fill:#f9f,stroke:#333,stroke-width:4px
    style STATE_PKG fill:#9f9,stroke:#333,stroke-width:2px
    style STORE_PKG fill:#9f9,stroke:#333,stroke-width:2px
```

### Key Package Responsibilities

1. **@tldraw/state**: Reactive signals library for state management
   - Provides `Atom`, `computed`, and reactive primitives
   - Foundation for all reactive state in tldraw

2. **@tldraw/store**: Client-side database for records
   - Record-based storage system
   - History management
   - Serialization/deserialization

3. **@tldraw/editor**: Core editor functionality
   - Canvas rendering
   - Shape management
   - Tool system
   - Event handling
   - Export capabilities

4. **tldraw**: Complete SDK with UI
   - Default shapes (arrows, boxes, etc.)
   - Default tools (select, draw, erase)
   - UI components and styling
   - Built on top of @tldraw/editor

5. **@tldraw/sync**: Multiplayer capabilities
   - Real-time collaboration
   - WebSocket-based sync
   - Conflict resolution

## Application Layer

### tldraw.com Architecture

```mermaid
graph TB
    subgraph "Frontend"
        CLIENT[React Client<br/>tldraw.com]
        CLERK[Clerk Auth]
        ZERO[Zero Cache]
        POSTHOG[PostHog Analytics]
    end
    
    subgraph "Cloudflare Workers"
        SYNC_WORKER[Sync Worker<br/>Multiplayer]
        ASSET_WORKER[Asset Upload<br/>Worker]
        IMAGE_WORKER[Image Resize<br/>Worker]
    end
    
    subgraph "Storage"
        R2[Cloudflare R2<br/>Asset Storage]
        KV[Cloudflare KV<br/>Metadata]
        DO[Durable Objects<br/>Room State]
    end
    
    CLIENT --> CLERK
    CLIENT --> ZERO
    CLIENT --> POSTHOG
    CLIENT --> SYNC_WORKER
    CLIENT --> ASSET_WORKER
    
    SYNC_WORKER --> DO
    SYNC_WORKER --> KV
    
    ASSET_WORKER --> R2
    ASSET_WORKER --> IMAGE_WORKER
    
    IMAGE_WORKER --> R2
```

### Documentation Site (tldraw.dev)

- Next.js application
- MDX-based content
- API reference generation
- Interactive examples

## State Management

### Reactive State Architecture

```mermaid
graph LR
    subgraph "State Layer"
        ATOMS[Atoms<br/>Base Values]
        COMPUTED[Computed<br/>Derived Values]
        REACTIONS[Reactions<br/>Side Effects]
    end
    
    subgraph "Store Layer"
        RECORDS[Records<br/>Domain Objects]
        HISTORY[History<br/>Undo/Redo]
        LISTENERS[Store Listeners]
    end
    
    subgraph "Editor Layer"
        EDITOR_STATE[Editor State]
        SHAPES[Shape Records]
        CAMERA[Camera State]
        UI_STATE[UI State]
    end
    
    ATOMS --> COMPUTED
    COMPUTED --> REACTIONS
    
    RECORDS --> ATOMS
    HISTORY --> RECORDS
    LISTENERS --> RECORDS
    
    EDITOR_STATE --> STORE_LAYER
    SHAPES --> RECORDS
    CAMERA --> ATOMS
    UI_STATE --> ATOMS
```

### Store Record Types

```mermaid
classDiagram
    class BaseRecord {
        +id: string
        +typeName: string
    }
    
    class TLShape {
        +type: string
        +x: number
        +y: number
        +rotation: number
        +parentId: TLParentId
        +props: object
    }
    
    class TLPage {
        +name: string
        +index: string
    }
    
    class TLCamera {
        +x: number
        +y: number
        +z: number
    }
    
    class TLAsset {
        +type: string
        +src: string
        +width: number
        +height: number
    }
    
    class TLBinding {
        +fromId: TLShapeId
        +toId: TLShapeId
        +type: string
    }
    
    BaseRecord <|-- TLShape
    BaseRecord <|-- TLPage
    BaseRecord <|-- TLCamera
    BaseRecord <|-- TLAsset
    BaseRecord <|-- TLBinding
```

## Data Flow

### Editor Data Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Editor
    participant Store
    participant State
    participant Canvas
    
    User->>UI: Interaction (click/drag)
    UI->>Editor: Event dispatch
    Editor->>Editor: Tool processing
    Editor->>Store: Update records
    Store->>State: Trigger atoms
    State->>Canvas: Re-render
    Canvas->>User: Visual update
```

### Shape Creation Flow

```mermaid
flowchart LR
    START[User Action] --> TOOL[Active Tool]
    TOOL --> CREATE[Create Shape]
    CREATE --> VALIDATE[Validate Props]
    VALIDATE --> STORE[Add to Store]
    STORE --> HISTORY[Update History]
    STORE --> BINDINGS[Update Bindings]
    STORE --> RENDER[Trigger Render]
    RENDER --> CANVAS[Update Canvas]
```

## Multiplayer Sync Architecture

### Sync System Overview

```mermaid
graph TB
    subgraph "Client A"
        EDITOR_A[Editor]
        SYNC_CLIENT_A[Sync Client]
        LOCAL_STORE_A[Local Store]
    end
    
    subgraph "Client B"
        EDITOR_B[Editor]
        SYNC_CLIENT_B[Sync Client]
        LOCAL_STORE_B[Local Store]
    end
    
    subgraph "Sync Worker"
        WEBSOCKET[WebSocket Server]
        ROOM_STATE[Room State]
        CONFLICT[Conflict Resolution]
    end
    
    EDITOR_A --> LOCAL_STORE_A
    LOCAL_STORE_A --> SYNC_CLIENT_A
    SYNC_CLIENT_A <--> WEBSOCKET
    
    EDITOR_B --> LOCAL_STORE_B
    LOCAL_STORE_B --> SYNC_CLIENT_B
    SYNC_CLIENT_B <--> WEBSOCKET
    
    WEBSOCKET --> ROOM_STATE
    WEBSOCKET --> CONFLICT
```

### Sync Protocol

```mermaid
sequenceDiagram
    participant Client
    participant SyncWorker
    participant DurableObject
    participant OtherClients
    
    Client->>SyncWorker: Connect WebSocket
    SyncWorker->>DurableObject: Join Room
    DurableObject->>Client: Initial State
    
    Client->>SyncWorker: Send Changes
    SyncWorker->>DurableObject: Process Changes
    DurableObject->>DurableObject: Resolve Conflicts
    DurableObject->>OtherClients: Broadcast Updates
    
    OtherClients->>SyncWorker: Acknowledge
```

## Build and Development

### Build Pipeline

```mermaid
flowchart TD
    SOURCE[Source Code<br/>TypeScript/React] --> LAZY[LazyRepo<br/>Task Runner]
    
    LAZY --> TYPECHECK[TypeScript<br/>Type Checking]
    LAZY --> BUILD[Build Process]
    LAZY --> TEST[Jest Tests]
    LAZY --> LINT[ESLint]
    
    BUILD --> SWC[SWC Compiler]
    BUILD --> API_EXTRACT[API Extractor]
    
    SWC --> DIST[Dist Files]
    API_EXTRACT --> API_DOCS[API Documentation]
    
    TEST --> COVERAGE[Coverage Reports]
    
    DIST --> NPM[NPM Packages]
    DIST --> DEPLOY[Deploy Apps]
```

### Development Workflow

1. **Local Development**: `yarn dev` runs the examples app with hot reload
2. **Type Checking**: `yarn typecheck` validates TypeScript across the monorepo
3. **Testing**: Jest for unit tests, Playwright for E2E tests
4. **Building**: LazyRepo orchestrates parallel builds
5. **Publishing**: Automated via CI/CD pipeline

## Key Design Patterns

### 1. **Record-Based Architecture**
- All data stored as records with unique IDs
- Enables efficient sync and history management
- Type-safe with TypeScript generics

### 2. **Reactive State Management**
- Signal-based reactivity for performance
- Computed values automatically update
- Minimal re-renders through fine-grained updates

### 3. **Extensible Shape System**
- Shape utils define behavior and rendering
- Custom shapes can be added easily
- Consistent API across all shape types

### 4. **Tool State Machine**
- Tools implemented as state nodes
- Clear transitions between tool states
- Composable tool behaviors

### 5. **Plugin Architecture**
- Bindings for shape relationships
- Custom tools and shapes
- UI component overrides

## Performance Considerations

1. **Virtual Canvas**: Only visible shapes are rendered
2. **Spatial Indexing**: Efficient hit testing and selection
3. **Incremental Updates**: Minimal DOM manipulation
4. **Web Workers**: Heavy computations offloaded
5. **Asset Optimization**: Lazy loading and caching

## Security Architecture

- **License Management**: Watermark enforcement
- **Asset Security**: Signed URLs for uploads
- **Authentication**: Clerk integration for tldraw.com
- **Data Isolation**: Per-room data separation in multiplayer

## Future Architecture Considerations

1. **Plugin Marketplace**: Ecosystem for third-party extensions
2. **Advanced Collaboration**: Presence, comments, and permissions
3. **Performance Optimizations**: WebGL rendering, WASM modules
4. **Mobile Optimization**: Touch-specific interactions
5. **AI Integration**: Expanded AI capabilities beyond current module

## Conclusion

tldraw's architecture is designed for flexibility, performance, and developer experience. The modular package structure allows developers to use only what they need, while the reactive state management ensures smooth performance even with complex drawings. The multiplayer sync architecture enables real-time collaboration, and the extensible shape and tool system allows for unlimited customization possibilities.