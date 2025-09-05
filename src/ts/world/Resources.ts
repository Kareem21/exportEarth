/**
 * Resource management and loading
 */
import { LoadingManager, Texture, TextureLoader } from 'three';
import { resources } from './Assets'
export class Resources {
  private manager: LoadingManager
  private callback: () => void;
  private textureLoader!: InstanceType<typeof TextureLoader>;
  public textures: Record<string, Texture>;
  constructor(callback: () => void) {
    this.callback = callback // Callback for resource loading completion

    this.textures = {} // Texture objects

    this.setLoadingManager()
    this.loadResources()
  }

  /**
   * Manage loading state
   */
  private setLoadingManager() {

    this.manager = new LoadingManager()
    // Start loading
    this.manager.onStart = () => {
      console.log('Start loading resource files')
    }
    // Loading complete
    this.manager.onLoad = () => {
      this.callback()
    }
    // In progress
    this.manager.onProgress = (url) => {
      console.log(`Loading: ${url}`)
    }

    this.manager.onError = url => {
      console.log('Loading failed: ' + url)
    }

  }

  /**
   * Load resources
   */
  private loadResources(): void {
    this.textureLoader = new TextureLoader(this.manager)
    resources.textures?.forEach((item) => {
      this.textureLoader.load(item.url, (t) => {
        this.textures[item.name] = t
      })
    })
  }
}
