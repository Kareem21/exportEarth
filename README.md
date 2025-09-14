# 3D Earth Module for Cybersecurity Visualization

A powerful 3D Earth visualization module built with Three.js and TypeScript, specifically designed for cybersecurity threat mapping and attack visualization. Perfect for SOC dashboards, threat intelligence displays, and security monitoring applications.

## Features

- 🌍 **Interactive 3D Earth** with realistic textures and atmospheric effects
- 🚨 **Real-time Attack Visualization** with dynamic data updates
- ⚡ **High Performance** - 60fps rendering with optimized Three.js
- 🎯 **Cybersecurity Focused** - Color-coded threats (red attackers, white targets)
- 🔄 **Dynamic Updates** - Update attack data without re-rendering the entire globe
- 📱 **Responsive Design** - Works on various screen sizes
- 🎮 **Interactive Controls** - Zoom, rotate, and pan with mouse/touch
- 🏷️ **Smart Labels** - City names rendered dynamically via HTML2Canvas

## Installation & Build

### For Development
```bash
yarn dev          # Start development server on port 8088
yarn build        # Build for production (demo)
yarn lint         # Run ESLint linter
```

### Build as NPM Module
```bash
yarn build-module
```

This creates a `dist/` folder with the complete bundled module ready for integration.

## Integration in React Applications

### 1. Copy Module Files
After building, copy the `dist/` folder to your React project.

### 2. Complete React Component Example

Here's a full `earth.jsx` component ready for your frontend:

```jsx
import React, { useRef, useEffect, useState } from 'react';

const Earth = () => {
  const containerRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [earthInstance, setEarthInstance] = useState(null);
  const [attackData, setAttackData] = useState([]);

  // Initialize Earth Module
  useEffect(() => {
    if (!containerRef.current) return;

    const initEarth = async () => {
      try {
        // Import the EarthModule from your dist folder
        const EarthModule = (await import('./path/to/dist/index.js')).default;
        const instance = new EarthModule();
        
        // Initial attack data for demonstration
        const initialData = [
          {
            startArray: {
              name: 'Beijing (Threat Actor)',
              N: 39.9042,
              E: 116.4074,
            },
            endArray: [
              {
                name: 'New York (Target)',
                N: 40.7128,
                E: -74.0060,
              },
              {
                name: 'Washington DC (Target)',
                N: 38.9072,
                E: -77.0369,
              }
            ]
          },
          {
            startArray: {
              name: 'Moscow (Threat Actor)',
              N: 55.7558,
              E: 37.6176,
            },
            endArray: [
              {
                name: 'London (Target)',
                N: 51.5074,
                E: -0.1278,
              },
              {
                name: 'Berlin (Target)',
                N: 52.5200,
                E: 13.4050,
              }
            ]
          }
        ];

        await instance.init({
          dom: containerRef.current,
          attackData: initialData,
          animationSpeed: 1.5 // Animation speed multiplier (0.5x to 2x)
        });
        
        setEarthInstance(instance);
        setAttackData(initialData);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Earth:', error);
      }
    };

    initEarth();

    // Cleanup on unmount
    return () => {
      if (earthInstance) {
        earthInstance.destroy();
        setEarthInstance(null);
      }
      setIsLoaded(false);
    };
  }, []);

  // Simulate real-time SIEM data updates
  useEffect(() => {
    if (!isLoaded || !earthInstance) return;

    const simulateRealTimeUpdates = () => {
      // Simulate new threat intelligence data
      const newAttackData = [
        {
          startArray: {
            name: 'Tehran (APT Group)',
            N: 35.6892,
            E: 51.3890,
          },
          endArray: [
            {
              name: 'Tel Aviv (Critical Infrastructure)',
              N: 32.0853,
              E: 34.7818,
            }
          ]
        },
        {
          startArray: {
            name: 'Pyongyang (State Actor)',
            N: 39.0392,
            E: 125.7625,
          },
          endArray: [
            {
              name: 'Seoul (Financial Sector)',
              N: 37.5665,
              E: 126.9780,
            },
            {
              name: 'Tokyo (Government)',
              N: 35.6762,
              E: 139.6503,
            }
          ]
        }
      ];

      // Update visualization without re-rendering entire Earth
      earthInstance.updateAttackData(newAttackData);
      setAttackData(newAttackData);
    };

    // Simulate updates every 10 seconds
    const interval = setInterval(simulateRealTimeUpdates, 10000);
    return () => clearInterval(interval);
  }, [isLoaded, earthInstance]);

  // Handle manual data updates (e.g., from your SIEM API)
  const handleUpdateAttacks = (newData) => {
    if (earthInstance && isLoaded) {
      earthInstance.updateAttackData(newData);
      setAttackData(newData);
    }
  };

  // Control panel for testing
  const [dotSpeed, setDotSpeed] = useState(0.004);
  const handleDotSpeedChange = (event) => {
    const newSpeed = parseFloat(event.target.value);
    setDotSpeed(newSpeed);
    
    if (earthInstance && isLoaded) {
      earthInstance.setDotSpeed(newSpeed);
    }
  };

  return (
    <div className="siem-earth-container" style={{ width: '100%', height: '100vh', position: 'relative', background: '#000' }}>
      {/* Control Panel */}
      {isLoaded && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '14px',
          minWidth: '250px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#0cd1eb' }}>
            🛡️ Threat Visualization Control
          </h3>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Active Attacks:</strong> {attackData.length}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Attack Speed: {dotSpeed.toFixed(3)}
            </label>
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={dotSpeed}
              onChange={handleDotSpeedChange}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
              Slow ← → Fast
            </div>
          </div>

          <button
            onClick={() => {
              const randomAttacks = generateRandomAttacks();
              handleUpdateAttacks(randomAttacks);
            }}
            style={{
              background: '#e4007f',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginTop: '8px'
            }}
          >
            🔄 Simulate New Threats
          </button>
        </div>
      )}

      {/* Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: isLoaded ? 'rgba(0, 128, 0, 0.8)' : 'rgba(128, 128, 0, 0.8)',
        padding: '10px 15px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        {isLoaded ? '🟢 SIEM Active' : '🟡 Loading...'}
      </div>

      {/* 3D Earth Container */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%'
        }} 
      />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px'
        }}>
          <div style={{ marginBottom: '20px' }}>⚡ Initializing Threat Map...</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>Loading 3D Earth visualization</div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate random attack data for testing
const generateRandomAttacks = () => {
  const threatActors = [
    { name: 'APT29 (Russia)', N: 55.7558, E: 37.6176 },
    { name: 'Lazarus (North Korea)', N: 39.0392, E: 125.7625 },
    { name: 'APT1 (China)', N: 39.9042, E: 116.4074 },
    { name: 'Charming Kitten (Iran)', N: 35.6892, E: 51.3890 }
  ];

  const targets = [
    { name: 'US Financial Sector', N: 40.7128, E: -74.0060 },
    { name: 'EU Critical Infrastructure', N: 50.1109, E: 8.6821 },
    { name: 'UK Government', N: 51.5074, E: -0.1278 },
    { name: 'Japanese Tech Companies', N: 35.6762, E: 139.6503 },
    { name: 'South Korean Banks', N: 37.5665, E: 126.9780 }
  ];

  return threatActors.slice(0, Math.floor(Math.random() * 3) + 1).map(actor => ({
    startArray: actor,
    endArray: targets.slice(0, Math.floor(Math.random() * 2) + 1)
  }));
};

export default Earth;
```

## API Reference

### EarthModule Class

#### Constructor
```javascript
const earthModule = new EarthModule();
```

#### Methods

##### `init(options)`
Initialize the 3D Earth visualization.

```javascript
await earthModule.init({
  dom: containerElement,           // Required: DOM element to render in
  attackData: attackDataArray,     // Optional: Initial attack data
  animationSpeed: 1.5             // Optional: Animation speed (0.5-2.0)
});
```

##### `updateAttackData(newData)`
**🚀 NEW: Dynamic Updates**
Update attack visualization without re-rendering the entire Earth.

```javascript
earthModule.updateAttackData([
  {
    startArray: {
      name: 'Attacker Location',
      N: 39.9042,    // Latitude
      E: 116.4074,   // Longitude
    },
    endArray: [
      {
        name: 'Target Location',
        N: 40.7128,   // Latitude
        E: -74.0060,  // Longitude
      }
    ]
  }
]);
```

##### `setDotSpeed(speed)`
Control the speed of moving attack indicators.

```javascript
earthModule.setDotSpeed(0.01); // Range: 0.001 - 0.1
```

##### `destroy()`
Clean up resources when component unmounts.

```javascript
earthModule.destroy();
```

## Data Format

### Attack Data Structure

```typescript
interface AttackData {
  startArray: {
    name: string,    // Attacker/source name (appears in RED)
    N: number,       // Latitude (-90 to 90)
    E: number,       // Longitude (-180 to 180)
  },
  endArray: {
    name: string,    // Target/destination name (appears in WHITE)
    N: number,       // Latitude (-90 to 90)
    E: number,       // Longitude (-180 to 180)
  }[]
}[]
```

### Example Data for Different Use Cases

#### 1. APT Attack Campaign
```javascript
const aptCampaign = [
  {
    startArray: {
      name: 'APT29 C2 Server',
      N: 55.7558,
      E: 37.6176,
    },
    endArray: [
      { name: 'US Government Agency', N: 38.9072, E: -77.0369 },
      { name: 'EU Parliament', N: 50.8503, E: 4.3517 }
    ]
  }
];
```

#### 2. Financial Sector Attacks
```javascript
const financialAttacks = [
  {
    startArray: {
      name: 'Carbanak Group',
      N: 50.4501,
      E: 30.5234,
    },
    endArray: [
      { name: 'Wall Street Bank', N: 40.7074, E: -74.0113 },
      { name: 'London Financial District', N: 51.5156, E: -0.0919 }
    ]
  }
];
```

## Visual Design

- **🔴 Red markers/labels** - Attack sources/threat actors
- **⚪ White markers/labels** - Targets/victims  
- **⚪ White flight lines** - Attack vectors/data flows
- **🔵 Blue atmospheric glow** - Earth ambience
- **💫 Expanding waves** - Real-time activity indicators
- **⚡ Moving dots** - Active attack traffic

## Performance

- **60fps** rendering via requestAnimationFrame
- **Memory efficient** - Proper cleanup of 3D resources
- **Optimized updates** - Only recreates changed elements
- **Responsive** - Handles various screen sizes
- **WebGL accelerated** - Uses GPU shaders for best performance

## Browser Support

- Chrome 58+
- Firefox 60+
- Safari 12+
- Edge 79+
- IE 11+ (with polyfills)

## Use Cases

- 🛡️ **SOC Dashboards** - Real-time threat monitoring
- 📊 **Threat Intelligence** - Geographic attack pattern analysis  
- 🎓 **Security Training** - Interactive cybersecurity education
- 📈 **Executive Reports** - Visual threat landscape presentations
- 🔍 **Incident Response** - Attack correlation and mapping

## Contributing

This module is designed specifically for defensive cybersecurity purposes. All contributions should maintain focus on threat visualization and security analysis applications.

---

**⚠️ Security Notice**: This tool is intended for defensive cybersecurity visualization only. It should be used for threat analysis, security operations, and educational purposes by cybersecurity professionals.