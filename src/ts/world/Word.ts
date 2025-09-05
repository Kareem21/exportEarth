import {
  MeshBasicMaterial, PerspectiveCamera,
  Scene, ShaderMaterial, WebGLRenderer
} from "three";
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls";

// interfaces
import { IWord } from '../interfaces/IWord'

import { Basic } from './Basic'
import Sizes from '../Utils/Sizes'
import { Resources } from './Resources';

// earth 
import Earth from './Earth'
// import Data from './Data' // Now using dynamic data

export default class World {
  public basic: Basic;
  public scene: Scene;
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer
  public controls: OrbitControls;
  public sizes: Sizes;
  public material: ShaderMaterial | MeshBasicMaterial;
  public resources: Resources;
  public option: IWord;
  public earth: Earth;


  constructor(option: IWord) {
    /**
     * Load resources
     */
    this.option = option

    this.basic = new Basic(option.dom)
    this.scene = this.basic.scene
    this.renderer = this.basic.renderer
    this.controls = this.basic.controls
    this.camera = this.basic.camera

    this.sizes = new Sizes({ dom: option.dom })

    this.sizes.$on('resize', () => {
      this.renderer.setSize(Number(this.sizes.viewport.width), Number(this.sizes.viewport.height))
      this.camera.aspect = Number(this.sizes.viewport.width) / Number(this.sizes.viewport.height)
      this.camera.updateProjectionMatrix()
    })

    this.resources = new Resources(async () => {
      await this.createEarth()
      // Start rendering
      this.render()
    })
  }

  async createEarth() {

    // Sample cybersecurity attack data - Clean demo with 5 attacks
    const defaultData = [
      {
        startArray: { name: 'Russia', N: 61.52401, E: 105.318756 },
        endArray: [{ name: 'Dubai', N: 25.2048, E: 55.2708 }]
      },
      {
        startArray: { name: 'China', N: 35.8617, E: 104.1954 },
        endArray: [
          { name: 'Tokyo', N: 35.6762, E: 139.6503 },
          { name: 'Seoul', N: 37.5665, E: 126.9780 }
        ]
      },
      {
        startArray: { name: 'North Korea', N: 40.3399, E: 127.5101 },
        endArray: [
          { name: 'Washington DC', N: 38.9072, E: -77.0369 },
          { name: 'New York', N: 40.7128, E: -74.0060 }
        ]
      },
      {
        startArray: { name: 'Iran', N: 32.4279, E: 53.6880 },
        endArray: [
          { name: 'London', N: 51.5074, E: -0.1278 },
          { name: 'Frankfurt', N: 50.1109, E: 8.6821 }
        ]
      },
      {
        startArray: { name: 'Brazil', N: -14.2350, E: -51.9253 },
        endArray: [
          { name: 'Miami', N: 25.7617, E: -80.1918 },
          { name: 'Mexico City', N: 19.4326, E: -99.1332 }
        ]
      }
    ];

    // Resources loaded, start creating the Earth, comments are in the Earth() class
    this.earth = new Earth({
      data: this.option.data || defaultData,
      dom: this.option.dom,
      textures: this.resources.textures,
      earth: {
        radius: this.option.earth?.radius || 50,
        rotateSpeed: this.option.earth?.rotateSpeed || 0.002,
        isRotation: this.option.earth?.isRotation || false // Disabled auto-rotation, manual controls still work
      },
      satellite: {
        show: false, // Disabled for threat map
        rotateSpeed: 0,
        size: 0,
        number: 0
      },
      punctuation: {
        circleColor: this.option.punctuation?.circleColor || 0xff4444, // Red for threats
        lightColumn: {
          startColor: this.option.punctuation?.lightColumn?.startColor || 0xff0000, // Red for threats
          endColor: this.option.punctuation?.lightColumn?.endColor || 0xffffff, // White end
        },
      },
      flyLine: {
        color: this.option.flyLine?.color || 0xffffff, // Bold white attack lines
        flyLineColor: this.option.flyLine?.flyLineColor || 0xffffff, // White for active attacks
        speed: this.option.flyLine?.speed || 0.015, // Much faster speed for cyber attacks (3.75x original)
      }
    })

    this.scene.add(this.earth.group)

    await this.earth.init()

    // Hide loading DOM element (only if it exists)
    const loading = document.querySelector('#loading')
    if (loading) {
      loading.classList.add('out')
    }

  }

  /**
   * Render function
   */
  public render() {
    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
    this.controls && this.controls.update()
    this.earth && this.earth.render()
  }
}