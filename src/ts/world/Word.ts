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

    // Default data if none provided
    const defaultData = [{
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
    }];

    // Resources loaded, start creating the Earth, comments are in the Earth() class
    this.earth = new Earth({
      data: this.option.data || defaultData,
      dom: this.option.dom,
      textures: this.resources.textures,
      earth: {
        radius: this.option.earth?.radius || 50,
        rotateSpeed: this.option.earth?.rotateSpeed || 0.002,
        isRotation: this.option.earth?.isRotation !== false
      },
      satellite: {
        show: this.option.satellite?.show !== false,
        rotateSpeed: this.option.satellite?.rotateSpeed || -0.01,
        size: this.option.satellite?.size || 1,
        number: this.option.satellite?.number || 2
      },
      punctuation: {
        circleColor: this.option.punctuation?.circleColor || 0x3892ff,
        lightColumn: {
          startColor: this.option.punctuation?.lightColumn?.startColor || 0xe4007f, // Start point color
          endColor: this.option.punctuation?.lightColumn?.endColor || 0xffffff, // End point color
        },
      },
      flyLine: {
        color: this.option.flyLine?.color || 0xf3ae76, // Flight line color
        flyLineColor: this.option.flyLine?.flyLineColor || 0xff7714, // Flying line color
        speed: this.option.flyLine?.speed || 0.004, // Flight trail speed
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