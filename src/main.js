import * as THREE from '../node_modules/three/build/three.module.js';//three.module.js
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import VoxelWorld from './Voxelworld.js'; //library for Voxel world
import {perlin_noise} from './noise.js';
//import {addLight} from './light'

/*
Global variable
*/
const CHUNK_SIZE = 32;
const WORLD_SIZE = 5;
const WORLD_HEIGHT = 64;
const HEIGHT_MULTIPLIER = 32;
const RENDER_DISTANCE = 1;
/*
Renderer/ screen setting
*/
const renderer = new THREE.WebGLRenderer({ antialias: true})
renderer.setSize( window.innerWidth, window.innerHeight ) //set render size
renderer.setClearColor("#222222") // sets renderer background color
document.body.appendChild( renderer.domElement ) //add render to html

/*
Scene setting
*/
const scene = new THREE.Scene()
scene.background = new THREE.Color('lightblue');

/*
Camera setting
*/
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(WORLD_SIZE * CHUNK_SIZE / 2, WORLD_HEIGHT * .8, WORLD_SIZE * CHUNK_SIZE / 2);

/*
Orbit control
*/
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(CHUNK_SIZE / 2, CHUNK_SIZE / 3, CHUNK_SIZE / 2);
controls.update();

// resize canvas on resize window
window.addEventListener( 'resize', () => {
	let width = window.innerWidth
	let height = window.innerHeight
	renderer.setSize( width, height )
	camera.aspect = width / height
	camera.updateProjectionMatrix()
})

/*
Lighting
*/

let ambientLight = new THREE.AmbientLight ( 0xffffff, 0.5) //ambient light source
scene.add( ambientLight ) //add ambient light

let pointLight = new THREE.PointLight( 0xffffff, 1 ); //point light source
pointLight.position.set( 25, 50, 25 ); //set light source position
scene.add( pointLight ); //add point light

function getChunk(chunks, chunk_x, chunk_z){
  let index_x = Math.floor(chunk_x / CHUNK_SIZE);
  let index_z = Math.floor(chunk_z / CHUNK_SIZE);
  if (index_x in chunks)
    return chunks[index_x][index_z];
  else
    return null;
}

function setChunk(chunks, chunk_x, chunk_z, meshes){
  let index_x = Math.floor(chunk_x / CHUNK_SIZE);
  let index_z = Math.floor(chunk_z / CHUNK_SIZE);
  
  if (!(index_x in chunks)) {
    chunks[index_x] = []
  }
  chunks[index_x][index_z] = meshes;
}

function unloadChunk(scene, chunks, chunk_x, chunk_z){
  let chunk = getChunk(chunks, chunk_x, chunk_z)
  scene.remove(chunk)
}

function drawChunk(scene, chunks, chunk_x, chunk_z){
  if (getChunk(chunks, chunk_x, chunk_z) != null)
    return; // chunk already drawn
  /* 
  Vortex generation with 2D perlin noise
  */
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
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshLambertMaterial({
    color: 'green'
  });

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
  setChunk(chunks, chunk_x, chunk_z, mesh);
  scene.add(mesh);
}

let chunks = [];

renderChunksAroundCamera()


renderer.render( scene, camera ) //render and show it on screen

/*
Animation of cube
*/

function renderChunksAroundCamera(){
  let camera_chunk_x = Math.floor(camera.position.x / CHUNK_SIZE);
  let camera_chunk_z = Math.floor(camera.position.z / CHUNK_SIZE);
  for (let x = -RENDER_DISTANCE; x < RENDER_DISTANCE; ++x){
    for (let z = -RENDER_DISTANCE; z < RENDER_DISTANCE; ++z){
      drawChunk(scene, chunks, (camera_chunk_x + x) * CHUNK_SIZE, (camera_chunk_z + z) * CHUNK_SIZE);
    }
  }
}

function updateCameraPosition(camera) {
  if (camera.position.x > 50){
    drawChunk(scene, chunks, 32, 0)
  }
  // if (camera.position.z > 50){
  //   camera.position.z -= 50
  //   controls.target.z -= 50
  //   drawWorld(scene, base_x, base_z - 50/chunkSize)
  // }

  // if (camera.position.x < -10){
  //   camera.position.x += 50
  //   controls.target.x += 50
  //   drawWorld(scene, base_x + 50/chunkSize, base_z)
  // }
  // if (camera.position.z < -10){
  //   camera.position.z += 50
  //   controls.target.z += 50
  //   drawWorld(scene, base_x, base_z + 50/chunkSize)
  // }
}

function animate() {
  requestAnimationFrame( animate )
  //updateCameraPosition(camera)
  renderChunksAroundCamera()
  console.log(camera.position)
  renderer.render( scene, camera )
 }

animate()



