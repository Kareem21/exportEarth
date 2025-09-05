# 3D Earth Cybersecurity Threat Map Module

A Three.js-based 3D Earth visualization module designed for cybersecurity threat monitoring. This module displays real-time cyber attacks with animated flight paths between attacker and target locations.

![3D Earth Threat Map](./3d-earth.png)

## Features

- ✅ Interactive 3D Earth with realistic textures
- ✅ Star field background with atmospheric glow effects
- ✅ City markers with pulsing wave animations
- ✅ Animated attack paths showing source → destination
- ✅ Color-coded threat visualization (Red attackers, White targets)
- ✅ Configurable attack line speed
- ✅ Manual rotation controls (no auto-rotation)

## Installation & Development

### Prerequisites
- Node.js 14+
- npm or yarn

### Development Setup
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:8088)
npm run dev

# Build for production
npm run build

# Build as module for external use
npm run build-module
```

## Module Export & React Integration

### 1. Building the Module

To export this project as a reusable module:

```bash
npm run build-module
```

This generates the module files in the `dist/` directory.

### 2. React Integration

#### Installation in your React project:

Option A - Local module:
```bash
# Copy the built module to your React project
cp -r dist/ /path/to/your/react-app/src/modules/earth-module/
```

Option B - NPM package (if published):
```bash
npm install 3d-earth-threat-map
```

#### Usage in Earth.jsx:

```jsx
import React, { useEffect, useRef } from 'react';
import EarthModule from './modules/earth-module'; // Adjust path as needed

const Earth = ({ attackData, attackSpeed = 0.015 }) => {
  const canvasRef = useRef();
  const earthInstanceRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Earth module
    earthInstanceRef.current = new EarthModule({
      dom: canvasRef.current,
      data: attackData,
      flyLine: {
        speed: attackSpeed, // Configurable attack line speed
      }
    });

    // Cleanup on unmount
    return () => {
      if (earthInstanceRef.current) {
        earthInstanceRef.current.destroy?.();
      }
    };
  }, [attackData, attackSpeed]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <canvas 
        ref={canvasRef} 
        id="earth-canvas"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Earth;
```

#### Usage in your app:

```jsx
import Earth from './components/Earth';

const App = () => {
  const threatData = [
    {
      startArray: { name: 'Russia', N: 61.52401, E: 105.318756 },
      endArray: [{ name: 'Dubai', N: 25.2048, E: 55.2708 }]
    },
    {
      startArray: { name: 'China', N: 35.8617, E: 104.1954 },
      endArray: [
        { name: 'Tokyo', N: 35.6762, E: 139.6503 },
        { name: 'Seoul', N: 37.5665, E: 126.9780 }
      ]
    }
  ];

  return (
    <div>
      <Earth 
        attackData={threatData} 
        attackSpeed={0.020} // Optional: control animation speed
      />
    </div>
  );
};
```

## Data Structure

### Attack Data Format

The module expects an array of attack objects with this structure:

```typescript
interface AttackData {
  startArray: {
    name: string;     // Attacker city/country name
    N: number;        // Latitude (-90 to 90)
    E: number;        // Longitude (-180 to 180)
  };
  endArray: Array<{
    name: string;     // Target city/country name  
    N: number;        // Latitude (-90 to 90)
    E: number;        // Longitude (-180 to 180)
  }>;
}

type ThreatData = AttackData[];
```

### Configuration Options

```typescript
interface EarthConfig {
  dom: HTMLElement;           // Canvas container element
  data?: AttackData[];        // Attack data (optional, uses sample data if not provided)
  flyLine?: {
    speed?: number;           // Attack line animation speed (default: 0.015)
    color?: number;           // Attack line color (default: 0xffffff - white)
    flyLineColor?: number;    // Flying animation color (default: 0xffffff)
  };
  earth?: {
    radius?: number;          // Earth radius (default: 50)
    rotateSpeed?: number;     // Auto-rotation speed (default: 0.002, set to 0 to disable)
    isRotation?: boolean;     // Enable/disable auto-rotation (default: false)
  };
}
```

## Visual Design

- **Red text labels**: Attacker cities/countries
- **White text labels**: Target cities/countries  
- **White attack lines**: Animated paths showing attack flow
- **Pulsing markers**: City locations with wave animations
- **Manual controls**: Click and drag to rotate, scroll to zoom

## Performance

- Optimized for real-time threat monitoring
- Smooth 60fps animations
- Efficient rendering with Three.js WebGL
- Supports dozens of simultaneous attack paths

## File Structure

```
src/
├── ts/
│   ├── world/
│   │   ├── Earth.ts        # Main Earth visualization class
│   │   ├── Word.ts         # World controller and configuration
│   │   └── Resources.ts    # Asset loading
│   ├── Utils/
│   │   ├── common.ts       # 3D geometry utilities
│   │   └── arc.ts         # Flight path calculations
│   └── EarthModule.ts     # Module export interface
static/
└── images/earth/          # Earth textures and assets
```

## Browser Support

- Chrome 60+
- Firefox 60+  
- Safari 12+
- Edge 79+

## License

MIT License - see LICENSE file for details.