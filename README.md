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

  return <div ref={canvasRef} style={{ width: '100%', height: '100vh' }} />;
}

export default Earth;
```

That's it. Just pass your attack data and it renders the same Earth.