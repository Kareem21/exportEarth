# 3D Earth Cybersecurity Threat Visualization Module

A reusable React-compatible 3D Earth visualization module built with Three.js and TypeScript, designed for cybersecurity threat mapping and attack visualization.

![3D Earth Module](https://img.shields.io/badge/3D_Earth-Module-blue) ![Three.js](https://img.shields.io/badge/Three.js-0.143-green) ![TypeScript](https://img.shields.io/badge/TypeScript-4.1-blue) ![React Compatible](https://img.shields.io/badge/React-Compatible-61DAFB)

## Features

- **Interactive 3D Earth Globe** with high-resolution textures
- **Real-time Attack Visualization** with animated flight paths
- **City Markers** with glowing light pillars and expanding wave effects
- **Satellite Orbits** with animated satellites
- **Atmospheric Effects** including glow and particle star field
- **HTML-rendered City Labels** using html2canvas
- **Simple API** - just pass attack data and animation speed
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

### 2. Simple Usage

The EarthModule now has a simplified API with only 2 configurable parameters:

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
      
      // Simplified API - only 2 parameters!
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
        ],
        animationSpeed: 1.2 // Optional: 0.5x to 2x speed multiplier
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

### Simplified Interface

The EarthModule now has a clean, simple interface with hardcoded styling and only 2 configurable parameters:

```typescript
interface EarthModuleOptions {
  dom: HTMLElement;                    // Required: HTML element for canvas
  attackData?: AttackData[];           // Optional: Array of AttackData
  animationSpeed?: number;             // Optional: Speed multiplier (0.5x to 2x, defaults to 1.0)
}
```

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

### Hardcoded Visual Settings

All visual settings are now hardcoded to maintain consistency:
- **Earth**: 50 radius, no automatic rotation, high-quality textures
- **Satellites**: 2 orbital rings with animated satellites
- **Colors**: Blue markers (0x3892ff), pink-to-white light columns (0xe4007f → 0xffffff)
- **Flight Lines**: White paths (0xffffff) with white animated lines (0xffffff)
- **Effects**: Atmospheric glow, particle stars, expanding wave rings

## Complete React Component Example

Here's the complete `Earth.jsx` file for your React app:

```jsx
import React, { useEffect, useRef, useState } from 'react';
import ThreatSidebar from './ThreatSidebar.jsx';
import AttackLog from './AttackLog.jsx';
import './Earth.css';

function Earth() {
  const canvasRef = useRef(null);
  const [EarthModuleClass, setEarthModuleClass] = useState(null);
  const [earthInstance, setEarthInstance] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);

  useEffect(() => {
    // Dynamic import to load the Earth module
    const loadEarthModule = async () => {
      try {
        setIsLoading(true);
        const module = await import('../../dist/index.js');
        
        // The module exports both named exports and default
        // We want the EarthModule class
        const EarthModuleConstructor = module.EarthModule || module.default;
        
        if (!EarthModuleConstructor) {
          throw new Error('EarthModule class not found in module exports');
        }
        
        setEarthModuleClass(() => EarthModuleConstructor);
        setError(null);
      } catch (err) {
        console.error('Failed to load Earth module:', err);
        setError(`Failed to load 3D Earth module: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadEarthModule();
  }, []);

  useEffect(() => {
    if (!EarthModuleClass || !canvasRef.current || isLoading) return;

    const initEarth = async () => {
      try {
        // Clean up any existing instance
        if (earthInstance) {
          earthInstance.destroy();
        }

        // Create a new instance of the EarthModule class
        const instance = new EarthModuleClass();

        // Sample attack data - customize this with your real threat data
        const threatData = [
          {
            startArray: {
              name: 'Beijing',
              N: 39.9042,
              E: 116.4074,
            },
            endArray: [
              {
                name: 'New York',
                N: 40.7128,
                E: -74.0060,
              },
              {
                name: 'London',
                N: 51.5074,
                E: -0.1278,
              }
            ]
          },
          {
            startArray: {
              name: 'Moscow',
              N: 55.7558,
              E: 37.6176,
            },
            endArray: [
              {
                name: 'Tokyo',
                N: 35.6762,
                E: 139.6503,
              },
              {
                name: 'Sydney',
                N: -33.8688,
                E: 151.2093,
              }
            ]
          }
        ];

        // Simplified API - just pass attackData and animationSpeed
        await instance.init({
          dom: canvasRef.current,
          attackData: threatData,
          animationSpeed: animationSpeed
        });

        setEarthInstance(instance);
        setError(null);
      } catch (error) {
        console.error('Failed to initialize Earth:', error);
        setError(`Failed to initialize 3D Earth: ${error.message}`);
      }
    };

    initEarth();

    // Cleanup function
    return () => {
      if (earthInstance) {
        earthInstance.destroy();
      }
    };
  }, [EarthModuleClass, isLoading, animationSpeed]);

  // Update animation speed dynamically
  const handleAnimationSpeedChange = (newSpeed) => {
    setAnimationSpeed(Math.max(0.5, Math.min(2.0, newSpeed)));
    if (earthInstance) {
      earthInstance.updateAnimationSpeed(newSpeed);
    }
  };

  // Update attack data dynamically
  const updateAttackData = (newAttackData) => {
    if (earthInstance) {
      earthInstance.updateAttackData(newAttackData);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (earthInstance) {
        earthInstance.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="threat-map-page">
        <div className="earth-error">
          <h2>Earth Module Error</h2>
          <p>{error}</p>
          <p>Please check the console for more details.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="threat-map-page">
        <div className="earth-loading">
          <h2>Loading 3D Earth...</h2>
          <p>Initializing threat visualization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="threat-map-page">
      {/* Fixed background layer with Earth */}
      <div className="earth-layer">
        <div
          ref={canvasRef}
          className="earth-canvas"
          id="earth-canvas"
        />
        
        {/* Optional: Animation speed control */}
        <div className="speed-control" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.7)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white'
        }}>
          <label>
            Animation Speed: {animationSpeed.toFixed(1)}x
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => handleAnimationSpeedChange(parseFloat(e.target.value))}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
      </div>

      {/* Scrollable content layer */}
      <div className="content-layer">
        <div className="content-wrapper">
          <ThreatSidebar />
        </div>

        {/* Attack log fixed at bottom */}
        <div className="attack-log-wrapper">
          <AttackLog />
        </div>
      </div>
    </div>
  );
}

export default Earth;
```

## Required CSS

Add this to your `Earth.css`:

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

.content-wrapper {
  pointer-events: auto;
}

.attack-log-wrapper {
  pointer-events: auto;
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

.speed-control {
  pointer-events: auto;
}

.speed-control label {
  display: flex;
  align-items: center;
  font-size: 14px;
}
```

## API Reference

### EarthModule Class

#### Methods

- **`init(options: EarthModuleOptions): Promise<void>`**  
  Initializes the Earth visualization with the provided configuration.

- **`updateAttackData(newAttackData: AttackData[]): void`**  
  Updates attack data for real-time threat visualization.

- **`updateAnimationSpeed(speed: number): void`**  
  Updates animation speed (0.5x to 2x multiplier).

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

// Update animation speed based on threat severity
const updateSpeed = (severityLevel) => {
  const speed = severityLevel === 'high' ? 2.0 : severityLevel === 'medium' ? 1.5 : 1.0;
  earthInstance.updateAnimationSpeed(speed);
};
```

## Asset Management

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

## Development

### Building the Module

```bash
# Install dependencies
npm install

# Development server (for module testing)
npm run dev

# Build for production/distribution
npm run build

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