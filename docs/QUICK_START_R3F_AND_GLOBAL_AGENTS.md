# Quick Start: React Three Fiber & Global Agents

**TL;DR:** You now have professional 3D development and a global agent system ready to use across all projects.

---

## 🚀 Quick Start (3 Minutes)

### Test R3F Installation

**Create a 3D scene in React:**

```jsx
// src/components/3d/SimpleScene.jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Environment } from '@react-three/drei'

export default function SimpleScene() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <OrbitControls />
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Box args={[1, 1, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="hotpink" />
        </Box>
      </Canvas>
    </div>
  )
}
```

**Import and use:**
```jsx
import SimpleScene from '@/components/3d/SimpleScene'

<SimpleScene />
```

### Test Leva GUI Controls

```jsx
import { useControls } from 'leva'

export default function InteractiveBox() {
  const { scale, color } = useControls({
    scale: { value: 1, min: 0.5, max: 3 },
    color: '#ff0000'
  })

  return (
    <Canvas>
      <Box scale={scale}>
        <meshStandardMaterial color={color} />
      </Box>
    </Canvas>
  )
}
```

### Test Global Agents

**Ask the UI/UX Master Orchestrator:**
```
"Search Magic UI for a hero component"
"Show me trending UI patterns for 2025"
"Create a 3D product showcase component"
"Optimize this scene for mobile performance"
```

---

## 📦 Installed Packages

**Core 3D:**
- `three` - WebGL library
- `@react-three/fiber` - React renderer
- `@react-three/drei` - Helpers (OrbitControls, Box, Environment, etc.)

**Advanced:**
- `@react-three/postprocessing` - Visual effects
- `@react-three/rapier` - Physics
- `leva` - GUI controls
- `@theatre/core` + `@theatre/r3f` - Animation editor

---

## 🎮 Common Use Cases

### 1. Animated Background

```jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function RotatingBox() {
  const ref = useRef()
  useFrame((state, delta) => {
    ref.current.rotation.x += delta
    ref.current.rotation.y += delta * 0.5
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2, 2, 2]} />
      <meshNormalMaterial />
    </mesh>
  )
}

export default function AnimatedBackground() {
  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
      <RotatingBox />
    </Canvas>
  )
}
```

### 2. 3D Product Showcase

```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'

function Model({ url }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export default function ProductShowcase({ modelUrl }) {
  return (
    <Canvas>
      <Stage environment="city" intensity={0.6}>
        <Model url={modelUrl} />
      </Stage>
      <OrbitControls autoRotate />
    </Canvas>
  )
}
```

### 3. Physics Simulation

```jsx
import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Box, Plane } from '@react-three/drei'

export default function PhysicsScene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />

      <Physics gravity={[0, -9.81, 0]}>
        {/* Falling box */}
        <RigidBody>
          <Box position={[0, 5, 0]}>
            <meshStandardMaterial color="hotpink" />
          </Box>
        </RigidBody>

        {/* Ground */}
        <RigidBody type="fixed">
          <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="lightblue" />
          </Plane>
        </RigidBody>
      </Physics>
    </Canvas>
  )
}
```

### 4. Post-Processing Effects

```jsx
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'
import { Box, OrbitControls } from '@react-three/drei'

export default function EffectsScene() {
  return (
    <Canvas>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <Box>
        <meshStandardMaterial color="hotpink" emissive="hotpink" />
      </Box>

      <EffectComposer>
        <Bloom intensity={1.5} />
        <DepthOfField focusDistance={0.01} focalLength={0.02} />
      </EffectComposer>
    </Canvas>
  )
}
```

---

## 🌍 Global Agents Usage

### For New Projects

**Step 1: Sync agents to new project**
```bash
cd your-new-project
powershell -ExecutionPolicy Bypass -File "C:\Users\Will\.claude\sync-agents.ps1"
```

**Step 2: Install dependencies**
```bash
npm install three @react-three/fiber@^8.0.0 @react-three/drei --legacy-peer-deps
```

**Step 3: Start using global agents**
- All 18 MCP servers automatically available
- 3 global agents ready in `.claude/agents/`

### Available Global Agents

**1. UI/UX Master Orchestrator** - `ui-ux-master-orchestrator.md`
- Multi-library component expertise
- Automatic trend monitoring
- Best practices enforcement
- AI-powered generation

**Example prompts:**
```
"Create a modern hero section with 3D background"
"Research latest UI trends for SaaS dashboards"
"Generate a pricing table inspired by Stripe"
"Show me trending animation patterns"
```

**2. GSAP Animation Master** - `gsap-animation-master.md`
- Timeline-based animations
- Scroll-triggered effects
- 3D integration

**Example prompts:**
```
"Create a scroll-triggered 3D animation"
"Add GSAP timeline to this component"
"Optimize animation performance"
```

**3. Performance Auditor** - `performance-auditor.md`
- Lighthouse audits
- Bundle analysis
- Optimization recommendations

**Example prompts:**
```
"Run performance audit on 3D scene"
"Analyze bundle size impact of R3F"
"Optimize for mobile performance"
```

---

## 🔧 MCP Servers Available

### UI/UX Development
- **threejs** - Three.js scene manipulation
- **mcp-three** - GLTF → React conversion
- **magic-ui** - 40+ UI components
- **aceternity-ui** - Component discovery

**Example usage:**
```
"Use mcp-three to convert model.glb to React component"
"Search Magic UI for a pricing table"
"Show Aceternity UI card components"
```

### Browser Automation
- **playwright** - Browser testing
- **puppeteer** - Headless browser
- **firecrawl** - Web scraping

**Example usage:**
```
"Scrape trending designs from Awwwards"
"Take screenshots of component examples"
"Test 3D scene across browsers"
```

### AI Services
- **nano-banana** - Google Gemini
- **replicate** - AI models

**Example usage:**
```
"Generate variations of this UI using Gemini"
"Use Replicate to create product images"
```

---

## 📚 Documentation

**Quick References:**
- **R3F Ecosystem:** `docs/integrations/REACT_THREE_FIBER_ECOSYSTEM.md`
- **Global Setup:** `docs/GLOBAL_MCP_AND_AGENTS_SETUP.md`
- **Setup Complete:** `docs/GLOBAL_SETUP_COMPLETE.md`
- **This Guide:** `docs/QUICK_START_R3F_AND_GLOBAL_AGENTS.md`

**Agent Files:**
- `.claude/agents/ui-ux-master-orchestrator.md` (500+ lines)
- `.claude/agents/gsap-animation-master.md`
- `.claude/agents/performance-auditor.md`

**Global Config:**
- `C:\Users\Will\.claude\mcp.json` - 18 MCP servers
- `C:\Users\Will\.claude\global-agents\` - 3 agents
- `C:\Users\Will\.claude\sync-agents.ps1` - Sync script

---

## 🎯 Common Commands

### Package Management
```bash
# Install core R3F
npm install three @react-three/fiber@^8.0.0 @react-three/drei --legacy-peer-deps

# Install all advanced packages
npm install @react-three/postprocessing @react-three/rapier leva @theatre/core @theatre/r3f --legacy-peer-deps

# Verify installation
npm list three @react-three/fiber @react-three/drei
```

### Agent Management
```bash
# Sync global agents to current project
powershell -ExecutionPolicy Bypass -File "C:\Users\Will\.claude\sync-agents.ps1"

# List global agents
dir C:\Users\Will\.claude\global-agents

# Check global MCP config
cat C:\Users\Will\.claude\mcp.json
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚡ Performance Tips

### 1. Lazy Load 3D Components
```jsx
import { lazy, Suspense } from 'react'

const Scene3D = lazy(() => import('./components/3d/Scene'))

<Suspense fallback={<div>Loading 3D...</div>}>
  <Scene3D />
</Suspense>
```

### 2. Optimize for Mobile
```jsx
import { useMediaQuery } from 'react-responsive'

const isMobile = useMediaQuery({ maxWidth: 768 })

<Canvas dpr={isMobile ? [1, 1] : [1, 2]}>
  {/* Reduce quality on mobile */}
</Canvas>
```

### 3. Use LOD (Level of Detail)
```jsx
import { Detailed } from '@react-three/drei'

<Detailed distances={[0, 10, 20]}>
  <HighResModel />
  <MediumResModel />
  <LowResModel />
</Detailed>
```

### 4. Monitor Performance
```jsx
import { Perf } from 'r3f-perf'

<Canvas>
  <Perf position="top-left" />
  {/* Your scene */}
</Canvas>
```

---

## 🚀 What's Next?

**Immediate:**
1. ✅ Restart Claude Code to load global config
2. ✅ Test R3F with simple scene
3. ✅ Test global agents
4. ✅ Create first 3D component

**This Week:**
1. Build 3D product showcase
2. Create animated hero section
3. Implement physics demo
4. Add post-processing effects

**This Month:**
1. Build comprehensive 3D component library
2. Create animation presets
3. Optimize performance
4. Document best practices

---

## 🎉 You're Ready!

Your development environment now has:
- ✅ Professional 3D graphics (React Three Fiber)
- ✅ Physics simulations (Rapier)
- ✅ Visual effects (Postprocessing)
- ✅ Animation timeline (Theatre.js)
- ✅ Development GUI (Leva)
- ✅ Global agent system
- ✅ 27 MCP servers
- ✅ AI-powered UI/UX development

**Start creating amazing 3D web experiences!** 🚀
