# React Three Fiber (R3F) Ecosystem

Complete guide to the React Three Fiber ecosystem including component libraries, MCP servers, and development tools.

## Installation Status

**Current Installation:**
```bash
npm install three @react-three/fiber@^8.0.0 @react-three/drei --legacy-peer-deps
```

**Compatibility:**
- React 18.3.1 (current project version)
- Three.js: Latest
- @react-three/fiber: v8.x (React 18 compatible)
- @react-three/drei: Latest

## Core Libraries

### 1. @react-three/fiber
**The React Renderer for Three.js**
- Declarative JSX-based 3D scene creation
- Full React hooks support
- Automatic disposal and memory management
- TypeScript support

```bash
npm install three @react-three/fiber
```

### 2. @react-three/drei
**Helper Components & Utilities**
- Pre-built 3D helpers (OrbitControls, Environment, etc.)
- Performance optimization tools
- HTML/Text components
- Loader utilities (useGLTF, useTexture)

```bash
npm install @react-three/drei
```

**Key Components:**
- `<OrbitControls />` - Camera controls
- `<Environment />` - HDR environment maps
- `<Text />` - 3D text rendering
- `<Html />` - Embed HTML in 3D space
- `<PresentationControls />` - Auto-rotate and interaction
- `<Stage />` - Quick scene setup

## Physics Engines

### 3. @react-three/rapier (Recommended)
**High-Performance Physics Engine**
- Written in Rust, compiled to WebAssembly
- Superior performance to Cannon-es
- Full rigid body and collider support
- Advanced features (CCD, joints, character controllers)

```bash
npm install @react-three/rapier
```

**Usage:**
```jsx
import { Physics, RigidBody } from '@react-three/rapier'

<Physics>
  <RigidBody>
    <mesh>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  </RigidBody>
</Physics>
```

### 4. @react-three/cannon
**JavaScript Physics Engine**
- Based on cannon-es (fork of Cannon.js)
- Lighter bundle size than Rapier
- Good for simpler physics scenarios

```bash
npm install @react-three/cannon
```

## Post-Processing & Visual Effects

### 5. @react-three/postprocessing
**Post-Processing Effects Wrapper**
- Bloom, depth of field, SSAO
- Color grading, vignette, glitch effects
- Custom shader passes
- ESM-only package

```bash
npm install @react-three/postprocessing
```

**Key Effects:**
- `<Bloom />` - Glow effects
- `<DepthOfField />` - Focus/blur
- `<SSAO />` - Ambient occlusion
- `<ChromaticAberration />` - Lens distortion
- `<N8AO />` - High-quality AO

## Development Tools

### 6. gltfjsx (CLI Tool)
**GLTF to JSX Converter**
- Converts .gltf/.glb models to React components
- Automatic optimization (pruning, compression)
- Draco compression support
- Texture resizing and WebP conversion

```bash
npx gltfjsx [Model.glb]
```

**Advanced Options:**
```bash
npx gltfjsx model.glb --transform --simplify --instance
```

**Online Tool:** https://gltf.pmnd.rs/

### 7. Leva
**GUI Controls for Development**
- Real-time parameter tweaking
- TypeScript support
- Multiple input types (slider, color, vector)

```bash
npm install leva
```

**Usage:**
```jsx
import { useControls } from 'leva'

const { scale } = useControls({ scale: 1 })
```

### 8. Theatre.js (@theatre/r3f)
**Animation Editor for R3F**
- Visual timeline editor
- Keyframe animation
- Export to JSON for production
- Non-destructive workflow

```bash
npm install @theatre/core @theatre/r3f
```

## State Management & Utilities

### 9. zustand
**Flux-Based State Management**
- Minimal boilerplate
- Works seamlessly with R3F
- No providers needed

```bash
npm install zustand
```

### 10. maath
**Math Helpers for R3F**
- Easing functions
- Vector operations
- Lerp and damp utilities
- Random generators

```bash
npm install maath
```

## UI Component Libraries

### 11. Koestlich
**UI Component Library for R3F**
- Pre-built 3D UI components
- React-based
- Customizable themes

### 12. Miniplex
**Entity Management System**
- ECS pattern for 3D projects
- Performance optimization
- State synchronization

## MCP Servers for R3F Development

### 1. Three.js MCP Server (Loc Chung)
**Real-Time Scene Manipulation**
- WebSocket-based control
- Natural language commands
- Create, move, rotate objects
- Query scene state

**Installation:**
```json
{
  "mcpServers": {
    "threejs": {
      "command": "npx",
      "args": ["-y", "three-js-mcp"]
    }
  }
}
```

**Features:**
- No code modification needed
- Works with Claude, Cursor, AI tools
- Basic Three.js functionality

### 2. mcp-three (Basement Studio)
**GLTF/GLB to R3F Component Converter**
- Automatic JSX generation
- Model structure analysis
- Performance optimization
- TypeScript support

**Installation:**
```json
{
  "mcpServers": {
    "mcp-three": {
      "command": "npx",
      "args": ["mcp-three"]
    }
  }
}
```

**Features:**
- Instancing support
- Mesh simplification
- Texture optimization
- Type-safe components

### 3. Magic UI MCP Server
**React Component Library Access**
- 40+ animated UI components
- Copy-paste ready code
- Tailwind CSS based
- shadcn/ui compatible

**Installation:**
```json
{
  "mcpServers": {
    "magic-ui": {
      "command": "npx",
      "args": ["-y", "@magicuidesign/mcp@latest"]
    }
  }
}
```

**Component Categories:**
- Layout (bento-grid, dock, file-tree)
- Interactive (hero-video-dialog, terminal, marquee)
- Animations (blur-fade, scroll-progress, orbiting-circles)
- Text effects (text-animate, morphing-text, typing-animation)

### 4. Aceternity UI MCP Server
**AI-Powered Component Discovery**
- Search Aceternity UI components
- Installation commands
- Component information
- Category browsing

**Installation:**
```json
{
  "mcpServers": {
    "aceternity-ui": {
      "command": "npx",
      "args": ["aceternityui-mcp"]
    }
  }
}
```

**Available Tools:**
- `search_components` - Search by name/description/tags
- `get_component_info` - Detailed component info
- `get_installation_info` - Setup instructions
- `list_categories` - Browse categories
- `get_all_components` - Full component list

## Best Practices

### Performance Optimization
1. **Use instancing for repeated geometry:**
   ```jsx
   <instancedMesh args={[geometry, material, 1000]} />
   ```

2. **Lazy load heavy assets:**
   ```jsx
   const Model = lazy(() => import('./Model'))
   ```

3. **Enable shadows selectively:**
   ```jsx
   <mesh castShadow receiveShadow>
   ```

4. **Use drei's Detailed component for LOD:**
   ```jsx
   <Detailed distances={[0, 10, 20]}>
     <HighRes />
     <MediumRes />
     <LowRes />
   </Detailed>
   ```

### Development Workflow
1. **Use Leva for tweaking parameters during development**
2. **Install gltfjsx globally for quick model conversion**
3. **Use Theatre.js for complex animations**
4. **Enable React DevTools for debugging**

### Claude Code Integration Tips
From developer experience (Alec Velikanov):
> "After 3 days of fighting to get Claude 3.7 to make usable 3D Three.js animations, the trick was to ask Claude to come up with a plan, then a plan for that plan, and ONLY THEN implement."

**Multi-Step Planning for 3D:**
1. Ask Claude to create an architectural plan
2. Ask Claude to create a meta-plan for that plan
3. Only then start implementation
4. Use MCP servers to accelerate development

## Real-World Examples (2025)

1. **3D Cosmos Visualization** - Claude Code official example
   - 50,000 real stars from catalog data
   - Interactive navigation
   - Real-time rendering

2. **PlanetHop 3D Space Game** - 6 hours development time
   - Built entirely with AI + Three.js
   - Complete game mechanics
   - Deployed to production

3. **Interactive Particle Systems**
   - Mouse-controlled dynamics
   - GPU-accelerated
   - Custom shaders

## Additional Resources

- **React Three Fiber Docs:** https://docs.pmnd.rs/react-three-fiber
- **pmndrs Ecosystem:** https://github.com/pmndrs
- **Three.js Journey (R3F Course):** https://threejs-journey.com
- **Drei Docs:** https://github.com/pmndrs/drei
- **Wawa Sensei R3F Tutorials:** https://wawasensei.dev/courses/react-three-fiber

## Installation Script

```bash
# Core R3F ecosystem
npm install three @react-three/fiber @react-three/drei --legacy-peer-deps

# Physics (choose one)
npm install @react-three/rapier  # Recommended
# OR
npm install @react-three/cannon

# Post-processing
npm install @react-three/postprocessing

# Development tools
npm install leva
npm install zustand
npm install maath

# Animation
npm install @theatre/core @theatre/r3f

# Global CLI tools
npm install -g gltfjsx
```

## Current Project Integration

The Disruptors AI Marketing Hub now has:
- ✅ React Three Fiber v8.x installed (React 18 compatible)
- ✅ @react-three/drei installed
- ✅ Four MCP servers configured (threejs, mcp-three, magic-ui, aceternity-ui)
- ✅ Existing Spline 3D integration (@splinetool/react-spline 4.1.0)
- ✅ GSAP 3.13.0 for animations

**Next Steps:**
1. Install additional R3F packages as needed
2. Create example R3F components
3. Integrate with existing GSAP/Spline animations
4. Build 3D UI components using MCP servers

## Version History

- **2025-10-21:** Initial R3F ecosystem integration
  - Installed three, @react-three/fiber v8.x, @react-three/drei
  - Configured 4 MCP servers for UI/3D development
  - Created comprehensive ecosystem documentation
