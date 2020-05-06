
import VoxelWorld from './Voxelworld.js'; //library for Voxel world
import {perlin_noise} from './noise.js';
import * as THREE from '../node_modules/three/build/three.module.js';//three.module.js

const CHUNK_SIZE = 32;
const WORLD_HEIGHT = 64;
const HEIGHT_MULTIPLIER = 32;

onmessage = function(e) {
  let chunk_x = e.data[0];
  let chunk_z = e.data[1];
  const world = new VoxelWorld(CHUNK_SIZE);

  for (let y = 0; y < WORLD_HEIGHT; ++y) {
    for (let z = 0; z < CHUNK_SIZE; ++z) {
      for (let x = 0; x < CHUNK_SIZE; ++x) {
        const point = new THREE.Vector2((x + chunk_x) / CHUNK_SIZE, (z + chunk_z) / CHUNK_SIZE);
        const height = perlin_noise(point) * HEIGHT_MULTIPLIER;

        if (y < height) {
          world.setVoxel(x, y, z, 1);
        }
      }
    }
  }
  const {
    positions,
    normals,
    indices
  } = world.generateGeometryDataForCell(chunk_x / CHUNK_SIZE, 0, chunk_z / CHUNK_SIZE);
  postMessage([positions, normals, indices, chunk_x, chunk_z]);
}