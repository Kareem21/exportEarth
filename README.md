'# 3D Earth Cybersecurity Threat Visualization Module

A reusable React-compatible 3D Earth visualization module built with Three.js and TypeScript, designed for cybersecurity threat mapping and attack visualization.

![3D Earth Module](https://img.shields.io/badge/3D_Earth-Module-blue) ![Three.js](https://img.shields.io/badge/Three.js-0.143-green) ![TypeScript](https://img.shields.io/badge/TypeScript-4.1-blue) ![React Compatible](https://img.shields.io/badge/React-Compatible-61DAFB)

## Features

- **Interactive 3D Earth Globe** with high-resolution textures
- **Real-time Attack Visualization** with animated flight paths
- **City Markers** with glowing light pillars and expanding wave effects
- **Satellite Orbits** with animated satellites
- **Atmospheric Effects** including glow and particle star field
- **HTML-rendered City Labels** using html2canvas
- **Fully Configurable** colors, speeds, and visual effects
- **React Integration Ready** with proper lifecycle management
- **TypeScript Support** with full type definitions

## Quick Start

### 1. Installation

Copy the built module files to your React project:

```bash
# Copy the built module and assets to your React project
cp -r dist/ /path/to/your/react-project/src/modules/earth-module/
cp -r static/ /path/to/your/react-project/public/
```

### 2. Basic Usage

```jsx
import React, { useEffect, useRef, useState } from 'react';

function ThreatMapComponent() {
  const canvasRef = useRef(null);
  const [EarthModuleClass, setEarthModuleClass] = useState(null);
  const [earthInstance, setEarthInstance] = useState(null);

  useEffect(() => {
    const loadEarthModule = async () => {
      const module = await import('./modules/earth-module/dist/index.js');
      setEarthModuleClass(() => module.EarthModule || module.default);
    };
    loadEarthModule();
  }, []);

  useEffect(() => {
    if (!EarthModuleClass || !canvasRef.current) return;

    const initEarth = async () => {
      const instance = new EarthModuleClass();
      
      await instance.init({
        dom: canvasRef.current,
        attackData: [
          {
            startArray: { name: 'Beijing', N: 39.9042, E: 116.4074 },
            endArray: [
              { name: 'New York', N: 40.7128, E: -74.0060 },
              { name: 'London', N: 51.5074, E: -0.1278 }
            ]
          }
        ]
      });
      
      setEarthInstance(instance);
    };

    initEarth();

    return () => {
      if (earthInstance) {
        earthInstance.destroy();
      }
    };
  }, [EarthModuleClass]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <div 
        ref={canvasRef}
        id="earth-canvas"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default ThreatMapComponent;
```

## Configuration Options

### Attack Data Structure

The module expects attack data in the following format:

```typescript
interface AttackData {
  startArray: {
    name: string;    // City name
    N: number;       // Latitude
    E: number;       // Longitude
  };
  endArray: {
    name: string;    // Target city name
    N: number;       // Latitude  
    E: number;       // Longitude
  }[];
}
```

### Full Configuration Options

```typescript
await instance.init({
  dom: canvasRef.current,              // Required: HTML element for canvas
  attackData: threatData,              // Optional: Array of AttackData
  
  // Earth configuration
  earth: {
    radius: 50,                        // Earth radius
    rotateSpeed: 0.002,                // Rotation speed
    isRotation: true                   // Enable/disable rotation
  },
  
  // Satellite configuration
  satellite: {
    show: true,                        // Show satellites
    rotateSpeed: -0.01,                // Satellite orbit speed
    size: 1,                          // Satellite size
    number: 2                         // Number of satellite rings
  },
  
  // City markers and effects
  punctuation: {
    circleColor: 0x3892ff,            // City marker color
    lightColumn: {
      startColor: 0xe4007f,           // Light pillar start color
      endColor: 0xffffff,             // Light pillar end color
    },
  },
  
  // Flight lines
  flyLine: {
    color: 0xf3ae76,                  // Flight path color
    flyLineColor: 0xff7714,           // Animated line color
    speed: 0.004,                     // Animation speed
  }
});
```

## Integration with React Projects

### Step-by-Step Integration

1. **Copy Module Files**
   ```bash
   # In your 3D Earth module directory
   npm run build-module
   
   # Copy to your React project
   mkdir -p /path/to/your/react-project/src/modules/earth-module
   cp -r dist/ /path/to/your/react-project/src/modules/earth-module/
   cp -r static/ /path/to/your/react-project/public/
   ```

2. **Update Your React Component**
   Use the provided `earthold.jsx` as a template, which includes:
   - Proper module loading with error handling
   - Loading states for better UX
   - Cleanup on component unmount
   - Integration with existing UI components

3. **Add Required Styles**
   ```css
   .threat-map-page {
     position: relative;
     width: 100%;
     height: 100vh;
     overflow: hidden;
   }

   .earth-layer {
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     z-index: 1;
   }

   .earth-canvas {
     width: 100%;
     height: 100%;
   }

   .content-layer {
     position: relative;
     z-index: 2;
     pointer-events: none;
   }

   .earth-error, .earth-loading {
     display: flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     height: 100vh;
     color: white;
     text-align: center;
   }
   ```

### Asset Management

The module requires these static assets to be available at `/static/`:

```
public/
├── static/
│   └── images/
│       └── earth/
│           ├── earth.jpg          # Earth texture
│           ├── label-old.png      # City label background
│           ├── aperture.jpg       # Atmospheric effect
│           ├── glow.png          # Glow effect
│           ├── gradient.png      # Gradient texture
│           ├── guangquan.png     # Light ring effect
│           ├── lightray.png      # Light ray effect
│           ├── redCircle.png     # Red circle marker
│           └── earth-aperture.jpg # Earth aperture effect
```

## API Reference

### EarthModule Class

#### Methods

- **`init(options: EarthModuleOptions): Promise<void>`**  
  Initializes the Earth visualization with the provided configuration.

- **`updateAttackData(newAttackData: AttackData[]): void`**  
  Updates attack data for real-time threat visualization.

- **`destroy(): void`**  
  Cleans up all resources and disposes of Three.js objects.

- **`isReady(): boolean`**  
  Returns `true` if the module is initialized and ready.

## Real-time SIEM Integration

```javascript
// Example: Update threats from your SIEM API
const updateThreats = async () => {
  const response = await fetch('/api/siem/active-threats');
  const threats = await response.json();
  
  // Convert SIEM data to AttackData format
  const attackData = threats.map(threat => ({
    startArray: {
      name: threat.sourceLocation,
      N: threat.sourceLat,
      E: threat.sourceLng
    },
    endArray: threat.targets.map(target => ({
      name: target.location,
      N: target.lat,
      E: target.lng
    }))
  }));
  
  // Update visualization
  earthInstance.updateAttackData(attackData);
};
```

## Development

### Building the Module

```bash
# Install dependencies
npm install

# Development server (for module testing)
npm run dev

# Build for production/distribution
npm run build-module

# Lint code
npm run lint
```

## Browser Compatibility

- **Chrome**: 58+
- **Firefox**: 60+
- **Safari**: 12+
- **Edge**: 79+
- **IE**: 11+ (with polyfills)

## License

MIT License - see LICENSE file for details.