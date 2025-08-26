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

  constructor() {}

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