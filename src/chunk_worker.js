
import VoxelWorld from './Voxelworld.js'; //library for Voxel world
import {perlin_noise} from './noise.js';
import * as THREE from '../node_modules/three/build/three.module.js';//three.module.js

const CHUNK_SIZE = 32;
const WORLD_HEIGHT = 64;
const HEIGHT_MULTIPLIER = 32;
const THRESHOLD = 0.5

onmessage = function(e) {

  const tileSize = 16;
  const tileTextureWidth = 256;
  const tileTextureHeight = 64;

  let chunk_x = e.data[0];
  let chunk_z = e.data[1];

  const world = new VoxelWorld({
    cellSize: CHUNK_SIZE,
    tileSize: tileSize,
    tileTextureWidth: tileTextureWidth,
    tileTextureHeight: tileTextureHeight,
  });
    

  for (let y = 0; y < WORLD_HEIGHT; ++y) {
    for (let z = 0; z < CHUNK_SIZE; ++z) {
      for (let x = 0; x < CHUNK_SIZE; ++x) {
        const point = new THREE.Vector3((x + chunk_x) / CHUNK_SIZE, (z + chunk_z) / CHUNK_SIZE,  y / HEIGHT_MULTIPLIER );
        const block_val = perlin_noise(point) * (WORLD_HEIGHT-y)/WORLD_HEIGHT;
        const upper_point = new THREE.Vector3((x + chunk_x) / CHUNK_SIZE, (z + chunk_z) / CHUNK_SIZE,(y+1) / HEIGHT_MULTIPLIER );
        const upper_block_val = perlin_noise(upper_point) * (WORLD_HEIGHT-(y+1))/WORLD_HEIGHT;
        const bio_point = new THREE.Vector3((x + chunk_x) / (CHUNK_SIZE*10), (z + chunk_z) / (CHUNK_SIZE*10), 0.0);
        const bio_val = perlin_noise(bio_point);
        const is_snow = bio_val>0.9;

        //if (x==10&&z==10) this.console.log('y=',y,'noise=',block_val);
        
        if (block_val>THRESHOLD && upper_block_val<THRESHOLD && y>10){ //surface
          if (is_snow) world.setVoxel(x, y, z, 6);
          else world.setVoxel(x, y, z, 1);
        }
        else if (block_val>THRESHOLD) { //rock
          world.setVoxel(x, y, z, 2);
        }
        
        
      }
    }
  }
  const {
    positions,
    normals,
    uvs,
    indices
  } = world.generateGeometryDataForCell(chunk_x / CHUNK_SIZE, 0, chunk_z / CHUNK_SIZE);
  postMessage([positions, normals, indices, chunk_x, chunk_z,uvs]);
}