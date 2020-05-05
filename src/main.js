import * as THREE from '../node_modules/three/build/three.module.js';//three.module.js
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import VoxelWorld from './Voxelworld.js'; //library for Voxel world
import {perlin_noise} from './noise.js';
//import {addLight} from './light'

/*
Global variable
*/
const cellSize = 32;
const worldSize = 5;
const worldHeight = 2;

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
camera.position.set(-cellSize * .3, worldHeight * cellSize * .8, -cellSize * .3);

/*
Orbit control
*/
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(cellSize / 2, cellSize / 3, cellSize / 2);
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

var ambientLight = new THREE.AmbientLight ( 0xffffff, 0.5) //ambient light source
scene.add( ambientLight ) //add ambient light

var pointLight = new THREE.PointLight( 0xffffff, 1 ); //point light source
pointLight.position.set( 25, 50, 25 ); //set light source position
scene.add( pointLight ); //add point light

/*
Texture
*/

const loader = new THREE.TextureLoader();
const texture = loader.load('../textures/textures.png', ()=>renderer.render(scene, camera));
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;

/*
Draw
*/

function drawWorld(scene, new_x, new_z){
  base_x = new_x;
  base_z = new_z;
  /*
  Remove all mesh
  */
  for (let i = scene.children.length - 1; i >= 0; i--) {
    if(scene.children[i].type === "Mesh")
        scene.remove(scene.children[i]);
  }


  /* 
  Vortex generation with 2D perlin noise
  */
 const tileSize = 16;
 const tileTextureWidth = 256;
 const tileTextureHeight = 64;
 const world = new VoxelWorld({
   cellSize,
   tileSize,
   tileTextureWidth,
   tileTextureHeight,
 });

  for (let y = 0; y < cellSize * worldHeight; ++y) {
    for (let z = 0; z < cellSize * worldSize; ++z) {
      for (let x = 0; x < cellSize * worldSize; ++x) {
        const point = new THREE.Vector2(x / cellSize - base_x, z / cellSize - base_z);
        const height = perlin_noise(point) * cellSize;

        if (y < height && y+2 > height){
          world.setVoxel(x, y, z, 1);
        }
        else if (y < height) {
          world.setVoxel(x, y, z, 2);
        }
      }
    }
  }
  const {positions, normals, uvs, indices} = world.generateGeometryDataForCell(0, 0, 0);
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
    transparent: true,
  });

  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
  geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
  geometry.setIndex(indices);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

}
var base_x, base_z;
drawWorld(scene, 1.5, 1.5)


renderer.render( scene, camera ) //render and show it on screen

/*
Animation of cube
*/

function updateCameraPosition(camera) {
  if (camera.position.x > 50){
    camera.position.x -= 50
    controls.target.x -= 50
    drawWorld(scene, base_x - 50/cellSize, base_z)
  }
  if (camera.position.z > 50){
    camera.position.z -= 50
    controls.target.z -= 50
    drawWorld(scene, base_x, base_z - 50/cellSize)
  }

  if (camera.position.x < -10){
    camera.position.x += 50
    controls.target.x += 50
    drawWorld(scene, base_x + 50/cellSize, base_z)
  }
  if (camera.position.z < -10){
    camera.position.z += 50
    controls.target.z += 50
    drawWorld(scene, base_x, base_z + 50/cellSize)
  }
}

function animate() {
  requestAnimationFrame( animate )
  updateCameraPosition(camera)
  console.log(camera.position)
  renderer.render( scene, camera )
 }

animate()



