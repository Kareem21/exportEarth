/**
 * Create Three.js four essential components
 * Scene, Camera, Renderer, Controls
 */

import * as THREE from 'three';
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls";

export class Basic {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer
  public controls: OrbitControls;
  public dom: HTMLElement;

  constructor(dom: HTMLElement) {
    this.dom = dom
    this.initScenes()
    this.setControls()
  }

  /**
   * Initialize scene
   */
  initScenes() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      100000
    );
    this.camera.position.set(0, 30, -250)


    this.renderer = new THREE.WebGLRenderer({
      alpha: true, // Transparent
      antialias: true, // Anti-aliasing
    });
    this.renderer.setPixelRatio(window.devicePixelRatio); // Set screen pixel ratio
    this.renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer width and height
    this.dom.appendChild(this.renderer.domElement); // Add to DOM
  }

  /**
   * Set up controls
   */
  setControls() {
    // Mouse controls for camera and rendering DOM
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    this.controls.autoRotateSpeed = 3
    // Enable damping or auto-rotation for animation loop - controls inertia
    this.controls.enableDamping = true;
    // Dynamic damping factor - mouse drag rotation sensitivity
    this.controls.dampingFactor = 0.05;
    // Enable zoom
    this.controls.enableZoom = true;
    // Set minimum distance from camera to origin
    this.controls.minDistance = 100;
    // Set maximum distance from camera to origin
    this.controls.maxDistance = 300;
    // Enable right-click drag
    this.controls.enablePan = false;
  }
}