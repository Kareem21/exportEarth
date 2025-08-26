import { CatmullRomCurve3, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Texture, TubeGeometry, Vector3 } from "three";
import { punctuation } from "../world/Earth";


/**
 * Convert longitude/latitude coordinates to spherical coordinates  
 * @param {Earth radius} R  
 * @param {Longitude (degree value)} longitude 
 * @param {Latitude (degree value)} latitude
 */
export const lon2xyz = (R:number, longitude:number, latitude:number): Vector3 => {
  let lon = longitude * Math.PI / 180; // Convert to radians
  const lat = latitude * Math.PI / 180; // Convert to radians
  lon = -lon; // JS coordinate system z-axis corresponds to longitude -90 degrees, not 90 degrees

  // Formula for converting longitude/latitude coordinates to spherical coordinates
  const x = R * Math.cos(lat) * Math.cos(lon);
  const y = R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.sin(lon);
  // Return spherical coordinates
  return new Vector3(x, y, z);
}

// Create wave halo
export const createWaveMesh = (options: { radius, lon, lat, textures }) => {
  const geometry = new PlaneBufferGeometry(1, 1); // Default on XOY plane
  const texture = options.textures.aperture;

  const material = new MeshBasicMaterial({
    color: 0xe99f68,
    map: texture,
    transparent: true, // Use transparent PNG texture, note to enable transparency calculation
    opacity: 1.0,
    depthWrite: false, // Disable writing depth buffer data
  });
  const mesh = new Mesh(geometry, material);
  // Convert longitude/latitude to spherical coordinates
  const coord = lon2xyz(options.radius * 1.001, options.lon, options.lat);
  const size = options.radius * 0.12; // Size of rectangular plane Mesh
  mesh.scale.set(size, size, size); // Set mesh size
  mesh.userData['size'] = size; // Custom property representing mesh static size
  mesh.userData['scale'] = Math.random() * 1.0; // Custom property representing mesh scale multiplier from original size - halo varies between 1~2 times the original mesh.size
  mesh.position.set(coord.x, coord.y, coord.z);
  const coordVec3 = new Vector3(coord.x, coord.y, coord.z).normalize();
  const meshNormal = new Vector3(0, 0, 1);
  mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
  return mesh;
}

// Create pillar
export const createLightPillar = (options: { radius: number, lon: number, lat: number, index: number, textures: Record<string, Texture>, punctuation: punctuation }) => {
  const height = options.radius * 0.3;
  const geometry = new PlaneBufferGeometry(options.radius * 0.05, height);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, 0, height / 2);
  const material = new MeshBasicMaterial({
    map: options.textures.light_column,
    color:
      options.index == 0
        ? options.punctuation.lightColumn.startColor
        : options.punctuation.lightColumn.endColor,
    transparent: true,
    side: DoubleSide,
    depthWrite: false, // Whether it affects the depth buffer
  });
  const mesh = new Mesh(geometry, material);
  const group = new Group();
  // Two light pillars cross and overlay
  group.add(mesh, mesh.clone().rotateZ(Math.PI / 2)); // Geometry rotated around x-axis, so mesh rotation axis becomes z
  // Convert longitude/latitude to spherical coordinates
  const SphereCoord = lon2xyz(options.radius, options.lon, options.lat); // SphereCoord spherical coordinates
  group.position.set(SphereCoord.x, SphereCoord.y, SphereCoord.z); // Set mesh position
  const coordVec3 = new Vector3(
    SphereCoord.x,
    SphereCoord.y,
    SphereCoord.z
  ).normalize();
  const meshNormal = new Vector3(0, 0, 1);
  group.quaternion.setFromUnitVectors(meshNormal, coordVec3);
  return group;
}

// Light pillar base rectangular plane
export const createPointMesh = (options: {
  radius: number, lon: number,
  lat: number, material: MeshBasicMaterial
}) => {

  const geometry = new PlaneBufferGeometry(1, 1); // Default on XOY plane
  const mesh = new Mesh(geometry, options.material);
  // Convert longitude/latitude to spherical coordinates
  const coord = lon2xyz(options.radius * 1.001, options.lon, options.lat);
  const size = options.radius * 0.05; // Size of rectangular plane Mesh
  mesh.scale.set(size, size, size); // Set mesh size

  // Set mesh position
  mesh.position.set(coord.x, coord.y, coord.z);
  const coordVec3 = new Vector3(coord.x, coord.y, coord.z).normalize();
  const meshNormal = new Vector3(0, 0, 1);
  mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
  return mesh;

}

// Get points
export const getCirclePoints = (option) => {
  const list = [];
  for (
    let j = 0;
    j < 2 * Math.PI - 0.1;
    j += (2 * Math.PI) / (option.number || 100)
  ) {
    list.push([
      parseFloat((Math.cos(j) * (option.radius || 10)).toFixed(2)),
      0,
      parseFloat((Math.sin(j) * (option.radius || 10)).toFixed(2)),
    ]);
  }
  if (option.closed) list.push(list[0]);
  return list;
}

// Create line

/**
 * Create animated line
 */
export const createAnimateLine = (option) => {
  // Curve composed of multiple point arrays, usually used for roads
  const l = [];
  option.pointList.forEach((e) =>
    l.push(new Vector3(e[0], e[1], e[2]))
  );
  const curve = new CatmullRomCurve3(l); // Curve path

  // Tube geometry
  const tubeGeometry = new TubeGeometry(
    curve,
    option.number || 50,
    option.radius || 1,
    option.radialSegments
  );
  return new Mesh(tubeGeometry, option.material);
}