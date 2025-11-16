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
  animationSpeed?: number, // Optional, defaults to 1.0 (0.5x to 2x range)
  flyLineSpeed?: number, // Optional, speed of moving dots on flight lines (default: 0.015, range: 0.005-0.1)
  maxConcurrentAttacks?: number, // Optional, limits number of attacks shown (default: no limit)
  updateDebounce?: number, // Optional, debounce updateAttackData calls in ms (default: 0 - no debounce)
  enableDifferentialUpdates?: boolean, // Optional, enables smart diffing (default: true)
}

export class EarthModule {
  private world: World | null = null;
  private isInitialized = false;
  private html2canvasElement: HTMLElement | null = null;
  private stylesElement: HTMLElement | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private options: EarthModuleOptions | null = null;

  constructor() {
    // Initialize EarthModule instance
  }

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

    // Store options for later use
    this.options = {
      ...options,
      maxConcurrentAttacks: options.maxConcurrentAttacks || 0, // 0 = no limit
      updateDebounce: options.updateDebounce || 0, // 0 = no debounce
      enableDifferentialUpdates: options.enableDifferentialUpdates !== false, // default true
    };

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

    let attackData = this.options.attackData || defaultAttackData;

    // Apply maxConcurrentAttacks limit if specified
    if (this.options.maxConcurrentAttacks && this.options.maxConcurrentAttacks > 0) {
      attackData = attackData.slice(0, this.options.maxConcurrentAttacks);
    }

    const animationSpeed = Math.max(0.5, Math.min(2.0, this.options.animationSpeed || 2.0));
    const flyLineSpeed = Math.max(0.001, Math.min(0.1, this.options.flyLineSpeed || 0.015));

    this.world = new World({
      dom: this.options.dom,
      data: attackData,
      maxConcurrentAttacks: this.options.maxConcurrentAttacks,
      enableDifferentialUpdates: this.options.enableDifferentialUpdates,
      // Hardcoded settings - keep exact same visual appearance
      earth: {
        radius: 50,
        rotateSpeed: 0.002 * animationSpeed,
        isRotation: false
      },
      satellite: {
        show: true,
        rotateSpeed: -0.01 * animationSpeed,
        size: 1,
        number: 2
      },
      punctuation: {
        circleColor: 0x3892ff,
        lightColumn: {
          startColor: 0xe4007f,
          endColor: 0xffffff,
        },
      },
      flyLine: {
        color: 0xffffff,
        flyLineColor: 0xffffff,
        speed: flyLineSpeed,
      }
    });

    this.isInitialized = true;
  }

  /**
   * Update attack data dynamically (for real-time updates)
   * @param newAttackData New attack data to visualize
   */
  updateAttackData(newAttackData: AttackData[]): void {
    if (!this.isInitialized || !this.world) {
      console.warn('EarthModule is not initialized. Call init() first.');
      return;
    }

    if (!this.world.earth) {
      console.warn('Earth instance not ready yet. Try again after initialization is complete.');
      return;
    }

    // Validate the new attack data
    if (!Array.isArray(newAttackData)) {
      console.error('Invalid attack data format. Expected an array.');
      return;
    }

    // Apply maxConcurrentAttacks limit if specified
    let limitedData = newAttackData;
    if (this.options?.maxConcurrentAttacks && this.options.maxConcurrentAttacks > 0) {
      limitedData = newAttackData.slice(0, this.options.maxConcurrentAttacks);
    }

    // Apply debouncing if specified
    if (this.options?.updateDebounce && this.options.updateDebounce > 0) {
      // Clear existing timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Set new timer
      this.debounceTimer = setTimeout(() => {
        this.world!.earth.updateVisualization(limitedData);
        this.debounceTimer = null;
      }, this.options.updateDebounce);
    } else {
      // No debouncing - update immediately
      this.world.earth.updateVisualization(limitedData);
    }
  }

  /**
   * Update animation speed dynamically
   * @param speed Animation speed multiplier (0.5x to 2x)
   */
  updateAnimationSpeed(speed: number): void {
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));
    if (!this.isInitialized || !this.world) {
      console.warn('EarthModule is not initialized. Call init() first.');
      return;
    }

    console.log('Updating animation speed:', clampedSpeed);
    // TODO: Implement dynamic animation speed updates
  }

  /**
   * Update dot speed dynamically
   * @param speed Dot animation speed (0.001 to 0.1)
   */
  setDotSpeed(speed: number): void {
    const clampedSpeed = Math.max(0.001, Math.min(0.1, speed));
    if (!this.isInitialized || !this.world) {
      console.warn('EarthModule is not initialized. Call init() first.');
      return;
    }

    if (this.world.earth) {
      this.world.earth.setDotSpeed(clampedSpeed);
    }
  }

  /**
   * Cleanup method for React component unmounting
   */
  destroy(): void {
    // Clear any pending debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

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

    this.options = null;
    this.isInitialized = false;
  }

  /**
   * Check if module is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.world !== null;
  }
}

// Export the class - users will instantiate it themselves
export default EarthModule;