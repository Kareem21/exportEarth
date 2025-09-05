# 3D Earth Module for React

A Three.js-based 3D Earth visualization module that can be easily integrated into React applications. Perfect for SIEM tools, network monitoring, and attack visualization.

## Features

- **Interactive 3D Earth** with realistic textures and atmospheric effects
- **Dynamic Attack Visualization** with flight paths between locations
- **Satellite Orbits** with animated satellites
- **City Markers** with glowing pillars and labels
- **Real-time Data Updates** for SIEM integration
- **Customizable Configuration** for colors, speeds, and effects

## Installation

```bash
# Install the module (after building)
npm install ./dist

# Or if published to npm
npm install 3d-earth-module
```

## Quick Start

```jsx
 import { useEffect, useRef, useState } from 'react';

  function Earth() {
    const canvasRef = useRef(null);
    const [EarthModule, setEarthModule] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
      // Dynamic import to ensure module loads properly
      const loadEarthModule = async () => {
        try {
          const module = await import('../dist/index.js');
          setEarthModule(module.EarthModule || module.default);
        } catch (err) {
          console.error('Failed to load Earth module:', err);
          setError('Failed to load 3D Earth module');
        }
      };

      loadEarthModule();
    }, []);

    useEffect(() => {
      if (!EarthModule || !canvasRef.current) return;

      const initEarth = async () => {
        try {
          // Small delay to ensure DOM is fully ready
          setTimeout(async () => {
            if (canvasRef.current) {
              await EarthModule.init({
                dom: canvasRef.current,
                attackData: [
                  {
                    startArray: {
                      name: 'New York',
                      N: 40.7128,
                      E: -74.0060,
                    },
                    endArray: [{
                      name: 'London',
                      N: 51.5074,
                      E: -0.1278,
                    }]
                  }
                ],
                earth: {
                  radius: 50,
                  rotateSpeed: 0.002,
                  isRotation: true
                }
              });
            }
          }, 100);
        } catch (error) {
          console.error('Failed to initialize Earth:', error);
          setError('Failed to initialize 3D Earth');
        }
      };

      initEarth();

      return () => {
        if (EarthModule) {
          EarthModule.destroy();
        }
      };
    }, [EarthModule]);

    if (error) {
      return <div>Error: {error}</div>;
    }

    return (
      <div style={{ width: '100%', height: '100vh', background: 'black' }}>
        <div 
          ref={canvasRef} 
          id="earth-canvas" 
          style={{ 
            width: '100%', 
            height: '100%',
          }} 
        />
      </div>
    );
  }

  export default Earth;



## API Reference

### EarthModule.init(options)

Initialize the 3D Earth visualization.

**Parameters:**
- `options.dom` (HTMLElement, required) - Container element for the Earth
- `options.attackData` (AttackData[], optional) - Array of attack/connection data
- `options.earth` (object, optional) - Earth configuration
- `options.satellite` (object, optional) - Satellite configuration  
- `options.punctuation` (object, optional) - Marker configuration
- `options.flyLine` (object, optional) - Flight line configuration

### AttackData Interface

```typescript
interface AttackData {
  startArray: {
    name: string,
    N: number, // Latitude (-90 to 90)
    E: number, // Longitude (-180 to 180)
  },
  endArray: {
    name: string,
    N: number, // Latitude
    E: number, // Longitude
  }[]
}
```

### Configuration Options

```typescript
{
  earth: {
    radius: 50,           // Earth radius
    rotateSpeed: 0.002,   // Rotation speed
    isRotation: true      // Enable rotation
  },
  satellite: {
    show: true,           // Show satellites
    rotateSpeed: -0.01,   // Orbit speed
    size: 1,              // Satellite size
    number: 2             // Satellites per orbit
  },
  punctuation: {
    circleColor: 0x3892ff,  // Marker color
    lightColumn: {
      startColor: 0xe4007f,  // Pillar start color
      endColor: 0xffffff,    // Pillar end color
    },
  },
  flyLine: {
    color: 0xf3ae76,        // Flight line color
    flyLineColor: 0xff7714, // Active flight color
    speed: 0.004,           // Animation speed
  }
}
```

## SIEM Integration Example

```jsx
const SIEMEarth = () => {
  const [attacks, setAttacks] = useState([]);

  useEffect(() => {
    // Connect to your SIEM API
    const fetchAttacks = async () => {
      const response = await fetch('/api/siem/attacks');
      const data = await response.json();
      
      const formattedAttacks = data.map(attack => ({
        startArray: {
          name: attack.sourceCountry,
          N: attack.sourceLat,
          E: attack.sourceLon,
        },
        endArray: [{
          name: attack.targetCountry,
          N: attack.targetLat,
          E: attack.targetLon,
        }]
      }));
      
      setAttacks(formattedAttacks);
    };

    fetchAttacks();
    const interval = setInterval(fetchAttacks, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  return <Earth attackData={attacks} />;
};
```

## Methods

- `EarthModule.init(options)` - Initialize the Earth
- `EarthModule.updateAttackData(newData)` - Update attack data (future feature)
- `EarthModule.destroy()` - Clean up resources
- `EarthModule.isReady()` - Check if initialized

## Building the Module

```bash
# Build for production
npm run build-module

# Development
npm run dev
```

## Asset Requirements

The module requires texture assets to be available at:
- `/static/images/earth/` (when used as standalone)
- Ensure your React build includes the static assets from this module

## Browser Support

- Chrome 58+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT License