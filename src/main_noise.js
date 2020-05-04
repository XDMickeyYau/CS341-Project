// Three.js - Voxel Geometry - Culled Faces
// from https://threejsfundamentals.org/threejs/threejs-voxel-geometry-culled-faces.html


import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';

class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cellSliceSize = cellSize * cellSize;
    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }
  computeVoxelOffset(x, y, z) {
    const {cellSize, cellSliceSize} = this;
    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
    return voxelY * cellSliceSize +
           voxelZ * cellSize +
           voxelX;
  }
  getCellForVoxel(x, y, z) {
    const {cellSize} = this;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellZ = Math.floor(z / cellSize);
    if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
      return null;
    }
    return this.cell;
  }
  setVoxel(x, y, z, v) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return;  // TODO: add a new cell?
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    cell[voxelOffset] = v;
  }
  getVoxel(x, y, z) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return 0;
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    return cell[voxelOffset];
  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {
    const {cellSize} = this;
    const positions = [];
    const normals = [];
    const indices = [];
    const startX = cellX * cellSize;
    const startY = cellY * cellSize;
    const startZ = cellZ * cellSize;

    for (let y = 0; y < cellSize; ++y) {
      const voxelY = startY + y;
      for (let z = 0; z < cellSize; ++z) {
        const voxelZ = startZ + z;
        for (let x = 0; x < cellSize; ++x) {
          const voxelX = startX + x;
          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
          if (voxel) {
            // There is a voxel here but do we need faces for it?
            for (const {dir, corners} of VoxelWorld.faces) {
              const neighbor = this.getVoxel(
                  voxelX + dir[0],
                  voxelY + dir[1],
                  voxelZ + dir[2]);
              if (!neighbor) {
                // this voxel has no neighbor in this direction so we need a face.
                const ndx = positions.length / 3;
                for (const pos of corners) {
                  positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                  normals.push(...dir);
                }
                indices.push(
                  ndx, ndx + 1, ndx + 2,
                  ndx + 2, ndx + 1, ndx + 3,
                );
              }
            }
          }
        }
      }
    }

    return {
      positions,
      normals,
      indices,
    };
  }
}

VoxelWorld.faces = [
  { // left
    dir: [ -1,  0,  0, ],
    corners: [
      [ 0, 1, 0 ],
      [ 0, 0, 0 ],
      [ 0, 1, 1 ],
      [ 0, 0, 1 ],
    ],
  },
  { // right
    dir: [  1,  0,  0, ],
    corners: [
      [ 1, 1, 1 ],
      [ 1, 0, 1 ],
      [ 1, 1, 0 ],
      [ 1, 0, 0 ],
    ],
  },
  { // bottom
    dir: [  0, -1,  0, ],
    corners: [
      [ 1, 0, 1 ],
      [ 0, 0, 1 ],
      [ 1, 0, 0 ],
      [ 0, 0, 0 ],
    ],
  },
  { // top
    dir: [  0,  1,  0, ],
    corners: [
      [ 0, 1, 1 ],
      [ 1, 1, 1 ],
      [ 0, 1, 0 ],
      [ 1, 1, 0 ],
    ],
  },
  { // back
    dir: [  0,  0, -1, ],
    corners: [
      [ 1, 0, 0 ],
      [ 0, 0, 0 ],
      [ 1, 1, 0 ],
      [ 0, 1, 0 ],
    ],
  },
  { // front
    dir: [  0,  0,  1, ],
    corners: [
      [ 0, 0, 1 ],
      [ 1, 0, 1 ],
      [ 0, 1, 1 ],
      [ 1, 1, 1 ],
    ],
  },
];

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const cellSize = 32;

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(-cellSize * .3, cellSize * .8, -cellSize * .3);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(cellSize / 2, cellSize / 3, cellSize / 2);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('lightblue');

  function addLight(x, y, z) {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(x, y, z);
    scene.add(light);
  }
  addLight(-1,  2,  4);
  addLight( 1, -1, -2);

  const world = new VoxelWorld(cellSize);
  
  
  function gradients(i) {
	if (i < 1) return new THREE.Vector2( 1.0,  1.0);
	if (i < 2 ) return new THREE.Vector2(-1.0,  1.0);
	if (i < 3 ) return new THREE.Vector2( 1.0, -1.0);
	if (i <  4) return new THREE.Vector2(-1.0, -1.0);
	if (i <  5) return new THREE.Vector2( 1.0,  0.0);
	if (i <  6) return new THREE.Vector2(-1.0,  0.0);
	if (i <  7) return new THREE.Vector2( 1.0,  0.0);
	if (i <  8) return new THREE.Vector2(-1.0,  0.0);
	if (i <  9) return new THREE.Vector2( 0.0,  1.0);
	if (i <  10) return new THREE.Vector2( 0.0, -1.0);
	if (i < 11) return new THREE.Vector2( 0.0,  1.0);
	if (i < 12) return new THREE.Vector2( 0.0, -1.0);
	return new THREE.Vector2(0.0, 0.0);
}
  

  function hash_poly(x) {
	return ((x*34.0)+1.0)*x % 289.0;
} 

  
   function hash_func(grid_point) {
	  return Math.floor(hash_poly(hash_poly(grid_point.x) + grid_point.y) % 12.0);
}

  
  function blending_weight_poly(t) {
	  return t*t*t*(t*(t*6.0 - 15.0)+10.0);
}

  
  function mix(a, b, w){
    let ans = a*(1-w)+b*(w);
    return ans;
  }
  

  
  
  // Constants for FBM
const  freq_multiplier = 2.17;
const  ampl_multiplier = 0.5;
const  num_octaves = 4;

function perlin_noise(point) {
  
	const c_00 = point.floor();
	const c_10 = point.floor().add(new THREE.Vector2(1.0,0.0));
	const c_01 = point.floor().add(new THREE.Vector2(0.0,1.0));
	const c_11 = point.floor().add(new THREE.Vector2(1.0,1.0));


	const g_00 = gradients(hash_func(c_00));
	const g_10 = gradients(hash_func(c_10));
	const g_01 = gradients(hash_func(c_01));
	const g_11 = gradients(hash_func(c_11));

	const d_00 = point.sub(c_00);
	const d_10 = point.sub(c_10);
	const d_01 = point.sub(c_01);
	const d_11 = point.sub(c_11);

	const phi_00 = g_00.dot(d_00);
	const phi_10 = g_10.dot(d_10);
	const phi_01 = g_01.dot(d_01);
	const phi_11 = g_11.dot(d_11);

	const st = mix(phi_00,phi_10,blending_weight_poly(d_00.x));
	const uv = mix(phi_01,phi_11,blending_weight_poly(d_00.x));
	const ans = mix(st,uv,blending_weight_poly(d_00.y));

	return ans;
}
  
  

  

  for (let y = 0; y < cellSize; ++y) {
    for (let z = 0; z < cellSize; ++z) {
      for (let x = 0; x < cellSize; ++x) {
        const point = new THREE.Vector2(x*21 ,z*234);
        const height = perlin_noise(point)*256.0*256.0;
        
        //if (y<5 && z<5 && x<5) console.log(height);

        if (y < height) {
          world.setVoxel(x, y, z, 1);
        }
      }
    }
  }

  const {positions, normals, indices} = world.generateGeometryDataForCell(0, 0, 0);
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshLambertMaterial({color: 'green'});

  const positionNumComponents = 3;
  const normalNumComponents = 3;
  geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
  geometry.setIndex(indices);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let renderRequested = false;

  function render() {
    renderRequested = undefined;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    controls.update();
    renderer.render(scene, camera);
  }
  render();

  function requestRenderIfNotRequested() {
    if (!renderRequested) {
      renderRequested = true;
      requestAnimationFrame(render);
    }
  }

  controls.addEventListener('change', requestRenderIfNotRequested);
  window.addEventListener('resize', requestRenderIfNotRequested);
}

main();
