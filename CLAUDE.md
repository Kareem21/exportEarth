# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server on port 8088 (demo mode)
- `yarn build` - Build for production (demo/development build)
- `yarn build-module` - Build as reusable NPM module (exports EarthModule class)
- `yarn lint` - Run ESLint linter
- `yarn prepare` - Install husky hooks (runs automatically)

## Project Architecture

This is a **3D Earth Module** designed for cybersecurity visualization, specifically threat/attack mapping. Built with Three.js and TypeScript, it can be integrated into React applications or used as a standalone visualization tool.

The project has **dual build modes**:
1. **Demo mode** (`yarn dev`/`yarn build`) - Standalone demonstration
2. **Module mode** (`yarn build-module`) - Exportable NPM package for integration

### Project Structure

```
src/
├── index.ts              # Module export entry point
├── ts/
│   ├── EarthModule.ts    # Main exportable class for React integration
│   ├── demo.ts           # Demo application entry point
│   ├── index.ts          # Internal entry point for module
│   ├── world/
│   │   ├── Word.ts       # Core 3D scene controller
│   │   ├── Earth.ts      # Earth visualization and animations
│   │   ├── Basic.ts      # Three.js scene setup
│   │   ├── Resources.ts  # Texture/asset loading
│   │   ├── Assets.ts     # Asset definitions
│   │   └── Data.ts       # Default demo data
│   ├── Utils/
│   │   ├── common.ts     # 3D geometry utilities
│   │   ├── arc.ts        # Flight path calculations
│   │   └── Sizes.ts      # Viewport management
│   └── interfaces/
│       ├── IWord.ts      # World configuration interface
│       └── IEvents.ts    # Event system interface
├── shaders/earth/
│   ├── vertex.vs         # Earth vertex shader
│   └── fragment.fs       # Earth fragment shader
└── index.html            # Demo HTML template
```

### Key Classes

#### 1. **EarthModule** (`src/ts/EarthModule.ts`)
**Main exported class for React/external integration**
- Provides clean API for initializing 3D Earth visualization
- Manages lifecycle (init, updateAttackData, destroy)
- Handles HTML2Canvas element creation for city labels
- Controls animation speeds and dot speeds
- Thread-safe initialization/cleanup

**Key Methods:**
- `init(options)` - Initialize with DOM element and attack data
- `updateAttackData(data)` - Update threat visualization data
- `setDotSpeed(speed)` - Control animation speed (0.001-0.1)
- `destroy()` - Clean up resources for unmounting

#### 2. **World Class** (`src/ts/world/Word.ts`)
**Core 3D scene controller**
- Three.js scene, camera, renderer setup
- OrbitControls for user interaction
- Resource loading coordination
- Main render loop management
- Responsive viewport handling

#### 3. **Earth Class** (`src/ts/world/Earth.ts`)
**Primary visualization component**
- Textured Earth sphere with custom shaders
- Star field background (500 particles)
- Atmospheric glow and aperture effects
- **Threat visualization features:**
  - City markers with light pillars
  - Expanding wave rings for activity indication
  - Flight lines showing attack paths
  - Color-coded labels (red for attackers, white for targets)
- City labels rendered via HTML2Canvas
- ~~Satellite orbits~~ (disabled for cybersecurity focus)

### Data Format

Attack/threat data uses this interface:

```typescript
interface AttackData {
  startArray: {
    name: string,    // Attacker location name
    N: number,       // Latitude
    E: number,       // Longitude
  },
  endArray: {
    name: string,    // Target location name  
    N: number,       // Latitude
    E: number,       // Longitude
  }[]
}[]
```

### Visual Design (Cybersecurity Focus)

**Color Scheme:**
- **Red markers/labels** - Attack sources/threat actors
- **White markers/labels** - Targets/victims
- **White flight lines** - Attack vectors/traffic flows
- **Blue atmospheric glow** - Earth ambience
- **Expanding waves** - Real-time activity indicators

**Animations:**
- Fast-moving dots on flight lines (3.75x speed) represent active attacks
- Pulsing wave rings around cities show ongoing threat activity
- ~~Earth auto-rotation disabled~~ for better manual navigation
- Smooth scaling transitions on module initialization

### Integration Example

```jsx
// React component integration
import EarthModule from '3d-earth-module';

const SIEMDashboard = () => {
  useEffect(() => {
    const earth = new EarthModule();
    await earth.init({
      dom: containerRef.current,
      attackData: siemData,
      animationSpeed: 1.5
    });
    return () => earth.destroy();
  }, []);
};
```

### Build System

#### Development Build (`webpack.config.js`)
- **Entry:** `src/ts/demo.ts`
- **Output:** UMD bundle for browser demo
- **Dev Server:** Port 8088
- **Target:** Chrome 58+, IE 11+

#### Module Build (`webpack.module.config.js`) 
- **Entry:** `src/ts/index.ts`
- **Output:** UMD library as `EarthModule`
- **Externals:** React, React-DOM (peer dependencies)
- **Target:** NPM package distribution

#### Shared Configuration
- **TypeScript + Babel** compilation pipeline
- **ts-shader-loader** for GLSL shader imports
- **ESLint** integration with TypeScript rules
- **Asset inlining** for standalone module distribution

### Assets

Located in `/static/images/earth/`:
- `earth.jpg` - Earth diffuse texture
- `glow.png` - Atmospheric glow sprite
- `gradient.png` - Star particle texture
- `label.png` - City marker base texture
- `light_column.png` - Light pillar texture
- `redCircle.png` - Threat indicator texture
- `aperture.png` - Atmospheric ring texture

### Performance Characteristics

- **60fps** rendering via requestAnimationFrame
- **Efficient particle systems** (500 stars, optimized geometry)
- **Shader-based** earth rendering for GPU acceleration
- **HTML2Canvas** texture generation for dynamic labels
- **Memory-conscious** resource cleanup on destroy()
- **Responsive** viewport handling for various screen sizes

### Security Considerations

This module is designed for **defensive cybersecurity visualization only**:
- Visualizes threat intelligence data
- Shows attack patterns and sources
- Aids in security operations center (SOC) environments
- Educational/analysis purposes for cybersecurity professionals