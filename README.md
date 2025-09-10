# 3D Earth Module

## How to export

```bash
npm run build-module
```

This creates `dist/` folder with everything bundled.

## How to use in your React app

1. Copy the `dist/` folder to your React project
2. In your `earth.jsx`:

```jsx
import React, { useEffect, useRef, useState } from 'react';

function Earth() {
  const canvasRef = useRef(null);
  const [earthInstance, setEarthInstance] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(0.01);

  useEffect(() => {
    const loadEarth = async () => {
      const EarthModule = (await import('./dist/index.js')).default;
      const instance = new EarthModule();
      
      const attackData = [
        {
          startArray: { name: 'Beijing', N: 39.9042, E: 116.4074 },
          endArray: [
            { name: 'New York', N: 40.7128, E: -74.0060 }
          ]
        }
      ];
      
      await instance.init({
        dom: canvasRef.current,
        attackData: attackData
      });
      
      setEarthInstance(instance);
    };

    if (canvasRef.current) {
      loadEarth();
    }

    return () => {
      if (earthInstance) {
        earthInstance.destroy();
      }
    };
  }, []);

  // Update animation speed when slider changes
  useEffect(() => {
    if (earthInstance) {
      earthInstance.setAnimationSpeed(animationSpeed);
    }
  }, [animationSpeed, earthInstance]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Canvas for 3D Earth */}
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Hidden element required for city name text rendering */}
      <div id="html2canvas" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}></div>
      
      {/* Animation speed control */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', zIndex: 1000 }}>
        <label>
          Animation Speed: {animationSpeed.toFixed(3)}
          <input
            type="range"
            min="0.001"
            max="0.05"
            step="0.001"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            style={{ display: 'block', marginTop: '5px' }}
          />
        </label>
      </div>
    </div>
  );
}

export default Earth;
```

That's it. Just pass your attack data and it renders the same Earth.