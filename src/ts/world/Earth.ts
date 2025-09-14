import {
  BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Material, Mesh, MeshBasicMaterial, NormalBlending,
  Object3D,
  Points, PointsMaterial, ShaderMaterial,
  SphereBufferGeometry, Sprite, SpriteMaterial, Texture, TextureLoader, Vector3
} from "three";

import html2canvas from "html2canvas";

import earthVertex from '../../shaders/earth/vertex.vs';
import earthFragment from '../../shaders/earth/fragment.fs';
import { createAnimateLine, createLightPillar, createPointMesh, createWaveMesh, getCirclePoints, lon2xyz } from "../Utils/common";
import gsap from "gsap";
import { flyArc } from "../Utils/arc";

export type punctuation = {
  circleColor: number,
  lightColumn: {
    startColor: number, // Start point color
    endColor: number, // End point color
  },
}

type options = {
  data: {
    startArray: {
      name: string,
      E: number, // Longitude
      N: number, // Latitude
    },
    endArray: {
      name: string,
      E: number, // Longitude
      N: number, // Latitude
    }[]
  }[]
  dom: HTMLElement,
  textures: Record<string, Texture>, // Textures
  earth: {
    radius: number, // Earth radius
    rotateSpeed: number, // Earth rotation speed
    isRotation: boolean // Whether earth group rotates
  }
  satellite: {
    show: boolean, // Whether to show satellites
    rotateSpeed: number, // Rotation speed
    size: number, // Satellite size
    number: number, // Number of spheres per ring
  },
  punctuation: punctuation,
  flyLine: {
    color: number, // Flight line color
    speed: number, // Flight trail speed
    flyLineColor: number // Flying line color
  },
}
type uniforms = {
  glowColor: { value: Color; }
  scale: { type: string; value: number; }
  bias: { type: string; value: number; }
  power: { type: string; value: number; }
  time: { type: string; value: any; }
  isHover: { value: boolean; };
  map: { value: Texture }
}

export default class earth {

  public group: Group;
  public earthGroup: Group;

  public around: BufferGeometry
  public aroundPoints: Points<BufferGeometry, PointsMaterial>;

  public options: options;
  public uniforms: uniforms
  public timeValue: number;

  public earth: Mesh<SphereBufferGeometry, ShaderMaterial>;
  public punctuationMaterial: MeshBasicMaterial;
  public markupPoint: Group;
  public waveMeshArr: Object3D[];

  public circleLineList: any[];
  public circleList: any[];
  public x: number;
  public n: number;
  public isRotation: boolean;
  public flyLineArcGroup: Group;

  constructor(options: options) {

    this.options = options;

    this.group = new Group()
    this.group.name = "group";
    this.group.scale.set(0, 0, 0)
    this.earthGroup = new Group()
    this.group.add(this.earthGroup)
    this.earthGroup.name = "EarthGroup";

    // Marker point effects
    this.markupPoint = new Group()
    this.markupPoint.name = "markupPoint"
    this.waveMeshArr = []

    // Satellites and labels
    this.circleLineList = []
    this.circleList = [];
    this.x = 0;
    this.n = 0;

    // Earth rotation
    this.isRotation = this.options.earth.isRotation

    // Sweep light animation shader
    this.timeValue = 100
    this.uniforms = {
      glowColor: {
        value: new Color(0x0cd1eb),
      },
      scale: {
        type: "f",
        value: -1.0,
      },
      bias: {
        type: "f",
        value: 1.0,
      },
      power: {
        type: "f",
        value: 3.3,
      },
      time: {
        type: "f",
        value: this.timeValue,
      },
      isHover: {
        value: false,
      },
      map: {
        value: null,
      },
    };

  }

  async init(): Promise<void> {
    return new Promise(async (resolve) => {

      this.createEarth(); // Create Earth
      this.createStars(); // Add stars
      this.createEarthGlow() // Create Earth glow
      this.createEarthAperture() // Create Earth atmosphere
      await this.createMarkupPoint() // Create marker points
      await this.createSpriteLabel() // Create city name labels
      // this.createAnimateCircle() // Create orbiting satellites - removed
      this.createFlyLine() // Create attack path lines

      this.show()
      resolve()
    })
  }

  createEarth() {
    const earth_geometry = new SphereBufferGeometry(
      this.options.earth.radius,
      50,
      50
    );

    const earth_border = new SphereBufferGeometry(
      this.options.earth.radius + 10,
      60,
      60
    );

    const pointMaterial = new PointsMaterial({
      color: 0x81ffff, // Set color, default 0xFFFFFF
      transparent: true,
      sizeAttenuation: true,
      opacity: 0.1,
      vertexColors: false, // Define whether material uses vertex colors, default false - if set to true, color property is ignored
      size: 0.01, // Define particle size. Default is 1.0
    })
    const points = new Points(earth_border, pointMaterial); // Add model to scene

    this.earthGroup.add(points);

    this.uniforms.map.value = this.options.textures.earth;

    const earth_material = new ShaderMaterial({
      // wireframe:true, // Show model wireframe
      uniforms: this.uniforms,
      vertexShader: earthVertex,
      fragmentShader: earthFragment,
    });

    earth_material.needsUpdate = true;
    this.earth = new Mesh(earth_geometry, earth_material);
    this.earth.name = "earth";
    this.earthGroup.add(this.earth);

  }

  createStars() {

    const vertices = []
    const colors = []
    for (let i = 0; i < 500; i++) {
      const vertex = new Vector3();
      vertex.x = 800 * Math.random() - 300;
      vertex.y = 800 * Math.random() - 300;
      vertex.z = 800 * Math.random() - 300;
      vertices.push(vertex.x, vertex.y, vertex.z);
      colors.push(new Color(1, 1, 1));
    }

    // Starry sky effect
    this.around = new BufferGeometry()
    this.around.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
    this.around.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));

    const aroundMaterial = new PointsMaterial({
      size: 2,
      sizeAttenuation: true, // Size attenuation
      color: 0x4d76cf,
      transparent: true,
      opacity: 1,
      map: this.options.textures.gradient,
    });

    this.aroundPoints = new Points(this.around, aroundMaterial);
    this.aroundPoints.name = "stars";
    this.aroundPoints.scale.set(1, 1, 1);
    this.group.add(this.aroundPoints);
  }

  createEarthGlow() {
    const R = this.options.earth.radius; // Earth radius

    // TextureLoader creates a texture loader object that can load images as texture maps
    const texture = this.options.textures.glow; // Load texture map

    // Create sprite material object SpriteMaterial
    const spriteMaterial = new SpriteMaterial({
      map: texture, // Set sprite texture map
      color: 0x4390d1,
      transparent: true, // Enable transparency
      opacity: 0.7, // Overall adjustment of halo through transparency
      depthWrite: false, // Disable writing depth buffer data
    });

    // Create sprite model representing Earth's halo
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(R * 3.0, R * 3.0, 1); // Appropriately scale the sprite
    this.earthGroup.add(sprite);
  }

  createEarthAperture() {

    const vertexShader = [
      "varying vec3	vVertexWorldPosition;",
      "varying vec3	vVertexNormal;",
      "varying vec4	vFragColor;",
      "void main(){",
      "	vVertexNormal	= normalize(normalMatrix * normal);", // Convert normal to view coordinate system
      "	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;", // Convert vertex to world coordinate system
      "	// set gl_Position",
      "	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
      "}",
    ].join("\n");

    // Atmosphere effect
    const AeroSphere = {
      uniforms: {
        coeficient: {
          type: "f",
          value: 1.0,
        },
        power: {
          type: "f",
          value: 3,
        },
        glowColor: {
          type: "c",
          value: new Color(0x4390d1),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: [
        "uniform vec3	glowColor;",
        "uniform float	coeficient;",
        "uniform float	power;",

        "varying vec3	vVertexNormal;",
        "varying vec3	vVertexWorldPosition;",

        "varying vec4	vFragColor;",

        "void main(){",
        "	vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;", // Distance from camera position to vertex position in world coordinates
        "	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;", // Distance from camera position to vertex position in view coordinates
        "	viewCameraToVertex= normalize(viewCameraToVertex);", // Normalize
        "	float intensity	= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);",
        "	gl_FragColor = vec4(glowColor, intensity);",
        "}",
      ].join("\n"),
    };
    // Sphere glow atmosphere
    const material1 = new ShaderMaterial({
      uniforms: AeroSphere.uniforms,
      vertexShader: AeroSphere.vertexShader,
      fragmentShader: AeroSphere.fragmentShader,
      blending: NormalBlending,
      transparent: true,
      depthWrite: false,
    });
    const sphere = new SphereBufferGeometry(
      this.options.earth.radius + 0,
      50,
      50
    );
    const mesh = new Mesh(sphere, material1);
    this.earthGroup.add(mesh);
  }

  async createMarkupPoint() {

    await Promise.all(this.options.data.map(async (item) => {

      const radius = this.options.earth.radius;
      const lon = item.startArray.E; // Longitude
      const lat = item.startArray.N; // Latitude

      this.punctuationMaterial = new MeshBasicMaterial({
        color: this.options.punctuation.circleColor,
        map: this.options.textures.label,
        transparent: true, // Use transparent PNG texture, note to enable transparency calculation
        depthWrite: false, // Disable writing depth buffer data
      });

      const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial }); // Light pillar base rectangular plane
      this.markupPoint.add(mesh);
      const LightPillar = createLightPillar({
        radius: this.options.earth.radius,
        lon,
        lat,
        index: 0,
        textures: this.options.textures,
        punctuation: this.options.punctuation,
      }); // Light pillar
      this.markupPoint.add(LightPillar);
      const WaveMesh = createWaveMesh({ radius, lon, lat, textures: this.options.textures }); // Wave halo
      this.markupPoint.add(WaveMesh);
      this.waveMeshArr.push(WaveMesh);

      await Promise.all(item.endArray.map((obj) => {
        const lon = obj.E; // Longitude
        const lat = obj.N; // Latitude
        const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial }); // Light pillar base rectangular plane
        this.markupPoint.add(mesh);
        const LightPillar = createLightPillar({
          radius: this.options.earth.radius,
          lon,
          lat,
          index: 1,
          textures: this.options.textures,
          punctuation: this.options.punctuation
        }); // Light pillar
        this.markupPoint.add(LightPillar);
        const WaveMesh = createWaveMesh({ radius, lon, lat, textures: this.options.textures }); // Wave halo
        this.markupPoint.add(WaveMesh);
        this.waveMeshArr.push(WaveMesh);
      }))
      this.earthGroup.add(this.markupPoint)
    }))
  }

  async createSpriteLabel() {
    await Promise.all(this.options.data.map(async item => {
      // Process attacker cities (startArray) - RED
      const attackerCity = item.startArray;
      const p1 = lon2xyz(this.options.earth.radius * 1.001, attackerCity.E, attackerCity.N);
      const attackerDiv = `<div class="fire-div" style="
        color: #ff0000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        padding: 2px 6px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 4px;
        border: 1px solid #ff0000;
      ">${attackerCity.name}</div>`;
      
      const shareContent1 = document.getElementById("html2canvas");
      shareContent1.innerHTML = attackerDiv;
      const opts1 = {
        backgroundColor: null,
        scale: 4,
        dpi: window.devicePixelRatio,
      };
      const canvas1 = await html2canvas(document.getElementById("html2canvas"), opts1)
      const dataURL1 = canvas1.toDataURL("image/png");
      const map1 = new TextureLoader().load(dataURL1);
      const material1 = new SpriteMaterial({
        map: map1,
        transparent: true,
      });
      const sprite1 = new Sprite(material1);
      const len1 = Math.max(8, 4 + attackerCity.name.length * 1.2);
      sprite1.scale.set(len1, 4, 1);
      sprite1.position.set(p1.x * 1.15, p1.y * 1.15, p1.z * 1.15);
      this.earth.add(sprite1);
      
      // Process target cities (endArray) - WHITE
      await Promise.all(item.endArray.map(async e => {
        const p = lon2xyz(this.options.earth.radius * 1.001, e.E, e.N);
        const div = `<div class="fire-div" style="
          color: #ffffff;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          padding: 2px 6px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 4px;
          border: 1px solid #ffffff;
        ">${e.name}</div>`;
        const shareContent = document.getElementById("html2canvas");
        shareContent.innerHTML = div;
        const opts = {
          backgroundColor: null,
          scale: 4,
          dpi: window.devicePixelRatio,
        };
        const canvas = await html2canvas(document.getElementById("html2canvas"), opts)
        const dataURL = canvas.toDataURL("image/png");
        const map = new TextureLoader().load(dataURL);
        const material = new SpriteMaterial({
          map: map,
          transparent: true,
        });
        const sprite = new Sprite(material);
        const len = Math.max(8, 4 + e.name.length * 1.2);
        sprite.scale.set(len, 4, 1);
        sprite.position.set(p.x * 1.15, p.y * 1.15, p.z * 1.15);
        this.earth.add(sprite);
      }))
    }))
  }

  createAnimateCircle() {
    // Create ring points
    const list = getCirclePoints({
      radius: this.options.earth.radius + 15,
      number: 150, // Number of divisions
      closed: true, // Closed
    });
    const mat = new MeshBasicMaterial({
      color: "#0c3172",
      transparent: true,
      opacity: 0.4,
      side: DoubleSide,
    });
    const line = createAnimateLine({
      pointList: list,
      material: mat,
      number: 100,
      radius: 0.1,
    });
    this.earthGroup.add(line);

    // Clone two more lines
    const l2 = line.clone();
    l2.scale.set(1.2, 1.2, 1.2);
    l2.rotateZ(Math.PI / 6);
    this.earthGroup.add(l2);

    const l3 = line.clone();
    l3.scale.set(0.8, 0.8, 0.8);
    l3.rotateZ(-Math.PI / 6);
    this.earthGroup.add(l3);

    /**
     * Rotating spheres
     */
    const ball = new Mesh(
      new SphereBufferGeometry(this.options.satellite.size, 32, 32),
      new MeshBasicMaterial({
        color: "#e0b187", // 745F4D
      })
    );

    const ball2 = new Mesh(
      new SphereBufferGeometry(this.options.satellite.size, 32, 32),
      new MeshBasicMaterial({
        color: "#628fbb", // 324A62
      })
    );

    const ball3 = new Mesh(
      new SphereBufferGeometry(this.options.satellite.size, 32, 32),
      new MeshBasicMaterial({
        color: "#806bdf", //6D5AC4
      })
    );

    this.circleLineList.push(line, l2, l3);
    ball.name = ball2.name = ball3.name = "satellite";

    for (let i = 0; i < this.options.satellite.number; i++) {
      const ball01 = ball.clone();
      // How many spheres are on one line, distribute them evenly based on the count
      const num = Math.floor(list.length / this.options.satellite.number)
      ball01.position.set(
        list[num * (i + 1)][0] * 1,
        list[num * (i + 1)][1] * 1,
        list[num * (i + 1)][2] * 1
      );
      line.add(ball01);

      const ball02 = ball2.clone();
      const num02 = Math.floor(list.length / this.options.satellite.number)
      ball02.position.set(
        list[num02 * (i + 1)][0] * 1,
        list[num02 * (i + 1)][1] * 1,
        list[num02 * (i + 1)][2] * 1
      );
      l2.add(ball02);

      const ball03 = ball2.clone();
      const num03 = Math.floor(list.length / this.options.satellite.number)
      ball03.position.set(
        list[num03 * (i + 1)][0] * 1,
        list[num03 * (i + 1)][1] * 1,
        list[num03 * (i + 1)][2] * 1
      );
      l3.add(ball03);
    }
  }

  createFlyLine() {

    this.flyLineArcGroup = new Group();
    this.flyLineArcGroup.userData['flyLineArray'] = []
    this.earthGroup.add(this.flyLineArcGroup)

    this.options.data.forEach((cities) => {
      cities.endArray.forEach(item => {

        // Call function flyArc to draw flight line arc trajectory between any two points on the sphere
        const arcline = flyArc(
          this.options.earth.radius,
          cities.startArray.E,
          cities.startArray.N,
          item.E,
          item.N,
          this.options.flyLine
        );

        this.flyLineArcGroup.add(arcline); // Insert flight line into flyArcGroup
        this.flyLineArcGroup.userData['flyLineArray'].push(arcline.userData['flyLine'])
      });

    })

  }

  show() {
    gsap.to(this.group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 2,
      ease: "Quadratic",
    })
  }

  render() {

    // Attack path animations - showing cyber attacks in progress
    this.flyLineArcGroup?.userData['flyLineArray']?.forEach(fly => {
      fly.rotation.z += this.options.flyLine.speed; // Adjust attack animation speed
      if (fly.rotation.z >= fly.flyEndAngle) fly.rotation.z = 0;
    })

    if (this.isRotation) {
      this.earthGroup.rotation.y += this.options.earth.rotateSpeed;
    }

    // Removed satellite orbit animations - no longer needed
    // this.circleLineList.forEach((e) => {
    //   e.rotateY(this.options.satellite.rotateSpeed);
    // });

    this.uniforms.time.value =
      this.uniforms.time.value < -this.timeValue
        ? this.timeValue
        : this.uniforms.time.value - 1;

    // Keep wave mesh animations for threat activity visualization
    if (this.waveMeshArr.length) {
      this.waveMeshArr.forEach((mesh: Mesh) => {
        mesh.userData['scale'] += 0.007;
        mesh.scale.set(
          mesh.userData['size'] * mesh.userData['scale'],
          mesh.userData['size'] * mesh.userData['scale'],
          mesh.userData['size'] * mesh.userData['scale']
        );
        if (mesh.userData['scale'] <= 1.5) {
          (mesh.material as Material).opacity = (mesh.userData['scale'] - 1) * 2; // 2 equals 1/(1.5-1.0), ensuring opacity varies between 0~1
        } else if (mesh.userData['scale'] > 1.5 && mesh.userData['scale'] <= 2) {
          (mesh.material as Material).opacity = 1 - (mesh.userData['scale'] - 1.5) * 2; // 2 equals 1/(2.0-1.5), mesh scale 2x corresponds to 0, scale 1.5x corresponds to 1
        } else {
          mesh.userData['scale'] = 1;
        }
      });
    }

  }

  // Method to update animation speed from React
  setAnimationSpeed(speed: number) {
    this.options.flyLine.speed = speed;
  }

  // Method to update dot speed from React - allows dynamic control from frontend
  setDotSpeed(speed: number) {
    this.options.flyLine.speed = speed;
  }

  /**
   * Update visualization with new attack data without full recreation
   * @param newData New attack data to visualize
   */
  async updateVisualization(newData: options['data']): Promise<void> {
    try {
      // Store old data for comparison
      const oldData = this.options.data;
      
      // Update internal data
      this.options.data = newData;
      
      // Clear existing dynamic elements
      this.clearDynamicElements();
      
      // Recreate dynamic elements with new data
      await this.createMarkupPoint();
      await this.createSpriteLabel();
      this.createFlyLine();
      
      console.log(`Updated visualization with ${newData.length} attack routes`);
    } catch (error) {
      console.error('Failed to update visualization:', error);
      // Fallback: restore old data if update fails
      if (oldData) {
        this.options.data = oldData;
      }
    }
  }

  /**
   * Clear all dynamic 3D elements that depend on attack data
   */
  private clearDynamicElements(): void {
    // Clear city markers and related elements
    if (this.markupPoint) {
      // Remove all children from markup point group
      while (this.markupPoint.children.length > 0) {
        const child = this.markupPoint.children[0];
        this.markupPoint.remove(child);
        
        // Dispose of materials and geometries to prevent memory leaks
        if ('material' in child && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose && mat.dispose());
          } else {
            child.material.dispose && child.material.dispose();
          }
        }
        if ('geometry' in child && child.geometry) {
          child.geometry.dispose && child.geometry.dispose();
        }
      }
    }

    // Clear flight lines
    if (this.flyLineArcGroup) {
      // Remove all children from flight line group
      while (this.flyLineArcGroup.children.length > 0) {
        const child = this.flyLineArcGroup.children[0];
        this.flyLineArcGroup.remove(child);
        
        // Dispose of materials and geometries
        if ('material' in child && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose && mat.dispose());
          } else {
            child.material.dispose && child.material.dispose();
          }
        }
        if ('geometry' in child && child.geometry) {
          child.geometry.dispose && child.geometry.dispose();
        }
      }
      
      // Clear flight line array
      this.flyLineArcGroup.userData['flyLineArray'] = [];
    }

    // Clear city labels from earth
    if (this.earth) {
      // Remove sprite labels that were added directly to earth
      const spritesToRemove: any[] = [];
      this.earth.traverse((child) => {
        if (child.type === 'Sprite') {
          spritesToRemove.push(child);
        }
      });
      
      spritesToRemove.forEach(sprite => {
        this.earth.remove(sprite);
        if (sprite.material) {
          sprite.material.dispose();
        }
      });
    }

    // Clear wave mesh array
    this.waveMeshArr = [];
  }

}