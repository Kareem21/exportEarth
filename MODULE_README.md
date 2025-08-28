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

```jsx import { useEffect, useRef, useState } from 'react';

  function Earth() {
    const canvasRef = useRef(null);
    const [EarthModule, setEarthModule] = useState(null);
    const [earthInstance, setEarthInstance] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
      // Dynamic import to ensure module loads properly
      const loadEarthModule = async () => {
        try {
          const module = await import('../dist/index.js');
          // Use the class, not the singleton instance
          setEarthModule(() => module.EarthModule);
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
          // Create a new instance of the EarthModule class
          const instance = new EarthModule();

          await instance.init({
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

          setEarthInstance(instance);
        } catch (error) {
          console.error('Failed to initialize Earth:', error);
          setError('Failed to initialize 3D Earth');
        }
      };

      initEarth();

      return () => {
        if (earthInstance) {
          earthInstance.destroy();
          setEarthInstance(null);
        }
      };
    }, [EarthModule]); // Remove earthInstance from dependencies to avoid cleanup loop

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (earthInstance) {
          earthInstance.destroy();
        }
      };
    }, [earthInstance]);

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

```

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
import World from './world/Word'

export interface AttackData {
  startArray: {
    name: string,
    N: number, // Latitude
    E: number, // Longitude
  },
  endArray: {
    name: string,
    N: number, // Latitude  
    E: number, // Longitude
  }[]
}

export interface EarthModuleOptions {
  dom: HTMLElement,
  attackData?: AttackData[], // Optional, defaults to demo data if not provided
  earth?: {
    radius?: number,
    rotateSpeed?: number,
    isRotation?: boolean
  },
  satellite?: {
    show?: boolean,
    rotateSpeed?: number,
    size?: number,
    number?: number
  },
  punctuation?: {
    circleColor?: number,
    lightColumn?: {
      startColor?: number,
      endColor?: number,
    },
  },
  flyLine?: {
    color?: number,
    flyLineColor?: number,
    speed?: number,
  }
}

export class EarthModule {
  private world: World | null = null;
  private isInitialized = false;
  private html2canvasElement: HTMLElement | null = null;
  private stylesElement: HTMLElement | null = null;

  constructor() {}

  /**
   * Creates the html2canvas element required for city label rendering
   */
  private createHtml2CanvasElement(): void {
    // Check if element already exists
    if (document.getElementById('html2canvas')) {
      return;
    }

    // Create styles if they don't exist
    this.createRequiredStyles();

    // Create the html2canvas div with required styling
    const html2canvasDiv = document.createElement('div');
    html2canvasDiv.id = 'html2canvas';
    html2canvasDiv.className = 'css3d-wapper';
    html2canvasDiv.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      pointer-events: none;
      z-index: -1;
      background: rgba(0, 0, 0, 0);
    `;

    // Create inner div for fire-div class
    const innerDiv = document.createElement('div');
    innerDiv.className = 'fire-div';
    html2canvasDiv.appendChild(innerDiv);

    // Append to document body
    document.body.appendChild(html2canvasDiv);
    this.html2canvasElement = html2canvasDiv;
  }

  /**
   * Creates required CSS styles for the html2canvas element
   */
  private createRequiredStyles(): void {
    const styleId = 'earth-module-styles';
    
    // Check if styles already exist
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .css3d-wapper {
        pointer-events: none;
        color: #fff;
      }
      
      .css3d-wapper .fire-div {
        font-size: 20px;
        font-weight: 600;
        border-top: 3px solid #0cd1eb;
        padding: 6px 8px;
        min-width: 50px;
        background: rgba(40, 108, 181, 0.5);
        display: flex;
      }
    `;
    
    document.head.appendChild(style);
    this.stylesElement = style;
  }

  /**
   * Initialize the Earth visualization
   * @param options Configuration options including DOM element and attack data
   */
  async init(options: EarthModuleOptions): Promise<void> {
    if (this.isInitialized) {
      console.warn('EarthModule is already initialized. Call destroy() first.');
      return;
    }

    if (!options.dom) {
      throw new Error('DOM element is required for EarthModule initialization');
    }

    // Create the html2canvas element required for city labels
    this.createHtml2CanvasElement();

    // Default demo data if no attack data provided
    const defaultAttackData: AttackData[] = [
      {
        startArray: {
          name: 'Dubai',
          N: 25.2048,
          E: 55.2708,
        },
        endArray: [{
          name: 'Russia',
          N: 61.52401,
          E: 105.318756,
        }]
      }
    ];

    const attackData = options.attackData || defaultAttackData;

    this.world = new World({
      dom: options.dom,
      data: attackData,
      earth: {
        radius: options.earth?.radius || 50,
        rotateSpeed: options.earth?.rotateSpeed || 0.002,
        isRotation: options.earth?.isRotation !== false
      },
      satellite: {
        show: options.satellite?.show !== false,
        rotateSpeed: options.satellite?.rotateSpeed || -0.01,
        size: options.satellite?.size || 1,
        number: options.satellite?.number || 2
      },
      punctuation: {
        circleColor: options.punctuation?.circleColor || 0x3892ff,
        lightColumn: {
          startColor: options.punctuation?.lightColumn?.startColor || 0xe4007f,
          endColor: options.punctuation?.lightColumn?.endColor || 0xffffff,
        },
      },
      flyLine: {
        color: options.flyLine?.color || 0xf3ae76,
        flyLineColor: options.flyLine?.flyLineColor || 0xff7714,
        speed: options.flyLine?.speed || 0.004,
      }
    });

    this.isInitialized = true;
  }

  /**
   * Update attack data dynamically (for real-time SIEM updates)
   * @param newAttackData New attack data to visualize
   */
  updateAttackData(newAttackData: AttackData[]): void {
    if (!this.isInitialized || !this.world) {
      console.warn('EarthModule is not initialized. Call init() first.');
      return;
    }

    // For now, we'll need to recreate the earth with new data
    // In a more advanced version, we could implement dynamic updates
    console.log('Updating attack data:', newAttackData);
    // TODO: Implement dynamic data updates without full recreation
  }

  /**
   * Cleanup method for React component unmounting
   */
  destroy(): void {
    if (this.world) {
      // Stop the render loop
      if (this.world.renderer) {
        this.world.renderer.dispose();
      }
      
      // Clean up Three.js resources
      if (this.world.scene) {
        this.world.scene.clear();
      }
      
      this.world = null;
    }

    // Clean up html2canvas element
    if (this.html2canvasElement) {
      this.html2canvasElement.remove();
      this.html2canvasElement = null;
    }

    // Clean up styles element  
    if (this.stylesElement) {
      this.stylesElement.remove();
      this.stylesElement = null;
    }

    this.isInitialized = false;
  }

  /**
   * Check if module is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.world !== null;
  }
}

// Export singleton instance for easy use
export default new EarthModule();
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
