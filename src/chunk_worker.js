
import VoxelWorld from './Voxelworld.js'; //library for Voxel world
import {perlin_noise} from './noise.js';
import * as THREE from '../node_modules/three/build/three.module.js';//three.module.js
const CHUNK_SIZE = 32;
const WORLD_HEIGHT = 64;
const HEIGHT_MULTIPLIER = 32;
const THRESHOLD = 0.5


/***
 * outputs whether the point contains the root of a tree
 */
function generate_tree(bio_val, x, y) {
  let tree_density = Math.sqrt(-bio_val) / 5
  return tree_density > tree_random();
}
let tree_seed = 1;
function tree_random() {
    var x = Math.sin(tree_seed++) * 10000;
    return x - Math.floor(x);
}
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
  tree_seed = (chunk_x* 100 + chunk_z) * CHUNK_SIZE
    

  for (let y = 0; y < WORLD_HEIGHT; ++y) {
    for (let z = 0; z < CHUNK_SIZE; ++z) {
      for (let x = 0; x < CHUNK_SIZE; ++x) {
        
	      const BASE_HEIGHT = 0.5     // base height offset for perlin noise, increase to increase base height level for terrain
  
        const point = new THREE.Vector3((x + chunk_x) / CHUNK_SIZE, (z + chunk_z) / CHUNK_SIZE,  y / HEIGHT_MULTIPLIER );
        const block_val = (perlin_noise(point) + BASE_HEIGHT) * (WORLD_HEIGHT-y)/WORLD_HEIGHT;
        const upper_point = new THREE.Vector3((x + chunk_x) / CHUNK_SIZE, (z + chunk_z) / CHUNK_SIZE,(y+1) / HEIGHT_MULTIPLIER );
        const upper_block_val = (perlin_noise(upper_point) + BASE_HEIGHT) * (WORLD_HEIGHT-(y+1))/WORLD_HEIGHT;
        const bio_point = new THREE.Vector3((x + chunk_x) / (CHUNK_SIZE*10), (z + chunk_z) / (CHUNK_SIZE*10), 0.0);
        const bio_val = perlin_noise(bio_point);
        const is_snow = bio_val>0.4;
        const is_forest = bio_val < -0;
        const is_desert = bio_val> 0.1 && bio_val < 0.2

        //if (x==10&&z==10) this.console.log('y=',y,'noise=',block_val);
        
        if (block_val>THRESHOLD && upper_block_val<THRESHOLD && y>10){ //surface
          if (is_snow) world.setVoxel(x, y, z, 6);
          else if (is_desert) world.setVoxel(x, y, z, 7)
          else if (is_forest && generate_tree(bio_val, x, y)) {
            world.setVoxel(x, y, z, 4)
          } 
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