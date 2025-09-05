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