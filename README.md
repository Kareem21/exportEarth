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
      const EarthModule = (await import('../../dist/index.js')).default;
      const instance = new EarthModule();
      
      const attackData = [
        {
          startArray: { name: 'Beijing', N: 39.9042, E: 116.4074 },
          endArray: [{ name: 'New York', N: 40.7128, E: -74.0060 }]
        },
        {
          startArray: { name: 'Moscow', N: 55.7558, E: 37.6176 },
          endArray: [{ name: 'London', N: 51.5074, E: -0.1278 }, { name: 'Paris', N: 48.8566, E: 2.3522 }]
        },
        {
          startArray: { name: 'Tokyo', N: 35.6762, E: 139.6503 },
          endArray: [{ name: 'Seoul', N: 37.5665, E: 126.9780 }, { name: 'Sydney', N: -33.8688, E: 151.2093 }]
        },
        {
          startArray: { name: 'Los Angeles', N: 34.0522, E: -118.2437 },
          endArray: [{ name: 'Chicago', N: 41.8781, E: -87.6298 }, { name: 'Miami', N: 25.7617, E: -80.1918 }]
        },
        {
          startArray: { name: 'Mumbai', N: 19.0760, E: 72.8777 },
          endArray: [{ name: 'Delhi', N: 28.7041, E: 77.1025 }, { name: 'Bangkok', N: 13.7563, E: 100.5018 }]
        },
        {
          startArray: { name: 'Cairo', N: 30.0444, E: 31.2357 },
          endArray: [{ name: 'Istanbul', N: 41.0082, E: 28.9784 }, { name: 'Dubai', N: 25.2048, E: 55.2708 }]
        },
        {
          startArray: { name: 'São Paulo', N: -23.5558, E: -46.6396 },
          endArray: [{ name: 'Buenos Aires', N: -34.6118, E: -58.3960 }, { name: 'Lima', N: -12.0464, E: -77.0428 }]
        },
        {
          startArray: { name: 'Berlin', N: 52.5200, E: 13.4050 },
          endArray: [{ name: 'Rome', N: 41.9028, E: 12.4964 }, { name: 'Madrid', N: 40.4168, E: -3.7038 }]
        },
        {
          startArray: { name: 'Toronto', N: 43.6532, E: -79.3832 },
          endArray: [{ name: 'Vancouver', N: 49.2827, E: -123.1207 }, { name: 'Mexico City', N: 19.4326, E: -99.1332 }]
        },
        {
          startArray: { name: 'Singapore', N: 1.3521, E: 103.8198 },
          endArray: [{ name: 'Hong Kong', N: 22.3193, E: 114.1694 }, { name: 'Kuala Lumpur', N: 3.1390, E: 101.6869 }]
        },
        {
          startArray: { name: 'Cape Town', N: -33.9249, E: 18.4241 },
          endArray: [{ name: 'Lagos', N: 6.5244, E: 3.3792 }, { name: 'Nairobi', N: -1.2921, E: 36.8219 }]
        },
        {
          startArray: { name: 'Tehran', N: 35.6892, E: 51.3890 },
          endArray: [{ name: 'Riyadh', N: 24.7136, E: 46.6753 }, { name: 'Baghdad', N: 33.3152, E: 44.3661 }]
        },
        {
          startArray: { name: 'Stockholm', N: 59.3293, E: 18.0686 },
          endArray: [{ name: 'Helsinki', N: 60.1699, E: 24.9384 }, { name: 'Oslo', N: 59.9139, E: 10.7522 }]
        },
        {
          startArray: { name: 'Jakarta', N: -6.2088, E: 106.8456 },
          endArray: [{ name: 'Manila', N: 14.5995, E: 120.9842 }, { name: 'Ho Chi Minh City', N: 10.8231, E: 106.6297 }]
        },
        {
          startArray: { name: 'Johannesburg', N: -26.2041, E: 28.0473 },
          endArray: [{ name: 'Kinshasa', N: -4.4419, E: 15.2663 }, { name: 'Addis Ababa', N: 9.1450, E: 38.7577 }]
        },
        {
          startArray: { name: 'Melbourne', N: -37.8136, E: 144.9631 },
          endArray: [{ name: 'Perth', N: -31.9505, E: 115.8605 }, { name: 'Auckland', N: -36.8485, E: 174.7633 }]
        },
        {
          startArray: { name: 'Karachi', N: 24.8607, E: 67.0011 },
          endArray: [{ name: 'Lahore', N: 31.5204, E: 74.3587 }, { name: 'Islamabad', N: 33.7294, E: 73.0931 }]
        },
        {
          startArray: { name: 'Atlanta', N: 33.7490, E: -84.3880 },
          endArray: [{ name: 'Houston', N: 29.7604, E: -95.3698 }, { name: 'Phoenix', N: 33.4484, E: -112.0740 }]
        },
        {
          startArray: { name: 'Kiev', N: 50.4501, E: 30.5234 },
          endArray: [{ name: 'Warsaw', N: 52.2297, E: 21.0122 }, { name: 'Prague', N: 50.0755, E: 14.4378 }]
        },
        {
          startArray: { name: 'Riyadh', N: 24.7136, E: 46.6753 },
          endArray: [{ name: 'Kuwait City', N: 29.3117, E: 47.4818 }, { name: 'Doha', N: 25.2854, E: 51.5310 }]
        }
      ];
      
      await instance.init({
        dom: canvasRef.current,
        attackData: attackData,
        animationSpeed: 2.0 // Fast animation speed
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

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Canvas for 3D Earth */}
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Hidden element required for city name text rendering */}
      <div id="html2canvas" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}></div>
    </div>
  );
}

export default Earth;
```

That's it. Just pass your attack data and it renders the same Earth.