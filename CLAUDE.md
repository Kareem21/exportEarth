# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server on port 8088
- `yarn build` - Build for production 
- `yarn lint` - Run ESLint linter
- `yarn prepare` - Install husky hooks (runs automatically)

## Project Architecture

This is a 3D Earth visualization built with Three.js and TypeScript. The application creates an interactive 3D globe with various visual effects including satellite orbits, flight paths, city markers, and atmospheric glow.

### Core Structure

- **Entry Point**: `src/ts/index.ts` - Initializes the World class with the canvas element
- **Main Controller**: `src/ts/world/Word.ts` - Central orchestrator that manages the entire 3D scene
- **Earth Component**: `src/ts/world/Earth.ts` - Handles all earth-related 3D objects and animations

### Key Components

1. **World Class** (`src/ts/world/Word.ts`)
   - Scene setup with camera, renderer, and controls
   - Resource loading coordination
   - Resize handling
   - Main render loop

2. **Earth Class** (`src/ts/world/Earth.ts`)
   - Earth globe with custom shaders
   - Star field background
   - Atmospheric glow and aperture effects
   - City markers with light pillars and wave effects
   - Satellite orbits with animated spheres
   - Flight lines between cities
   - City labels rendered from HTML using html2canvas

3. **Resources System** (`src/ts/world/Resources.ts` and `Assets.ts`)
   - Texture loading and management
   - Asset definitions in `Assets.ts` specify textures from `/static/images/earth/`

4. **Utilities** (`src/ts/Utils/`)
   - `common.ts` - Helper functions for 3D geometry creation
   - `arc.ts` - Flight arc calculations
   - `Sizes.ts` - Viewport size management

### Visual Features

The application renders:
- Textured Earth sphere with custom vertex/fragment shaders
- Particle star field background
- Glowing atmospheric effects
- Animated city markers with light pillars and expanding wave rings
- Three satellite orbit rings with rotating satellites
- Curved flight paths between cities with animated flight lines
- HTML-rendered city labels

### Data Structure

City data is structured as:
```typescript
{
  startArray: { name: string, E: number, N: number }, // Starting city with longitude/latitude
  endArray: [{ name: string, E: number, N: number }] // Destination cities
}[]
```

### Shader System

Custom GLSL shaders are located in `src/shaders/earth/`:
- `vertex.vs` - Vertex shader for earth rendering
- `fragment.fs` - Fragment shader with texture mapping and effects

The webpack configuration uses `ts-shader-loader` to import `.glsl`, `.vs`, and `.fs` files as strings.

### Build Configuration

- **Webpack 5** with TypeScript support
- **Babel** for browser compatibility (IE 11+)
- **ESLint** with TypeScript rules
- **TSLint** configuration (legacy, consider migrating to ESLint)
- Development server runs on port 8088
- Static assets copied from `/static/` directory

### Performance Notes

The application uses requestAnimationFrame for smooth 60fps rendering with:
- Earth rotation animation
- Satellite orbit animations  
- Flight line animations
- Wave effect animations
- Shader uniform updates for atmospheric effects