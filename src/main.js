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
camera.position.set(-cellSize * .3, cellSize * .8, -cellSize * .3);

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
Vortex generation with 2D perlin noise
*/
const world = new VoxelWorld(cellSize * worldSize);

for (let y = 0; y < cellSize * worldHeight; ++y) {
  for (let z = 0; z < cellSize * worldSize; ++z) {
    for (let x = 0; x < cellSize * worldSize; ++x) {
      const point = new THREE.Vector2(x / cellSize, z / cellSize);
      const height = perlin_noise(point) * cellSize;

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
} = world.generateGeometryDataForCell(0, 0, 0);
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
scene.add(mesh);

/*
Mesh creation and rendering
*/

//add red cube in center
var geometry_cube = new THREE.BoxGeometry( 1, 1, 1) //create a cube
var material_cube = new THREE.MeshStandardMaterial( { color: 0xff0051 })//color of cube, MeshStandardMaterial can interact with light
var cube = new THREE.Mesh ( geometry_cube, material_cube ) //mesh = geometry+color, what scene will hold
scene.add( cube ) //add cube to scene

//add bigger wireframe  cube
var geometry_WC = new THREE.BoxGeometry( 3, 3, 3)
var material_WC = new THREE.MeshBasicMaterial( {
 color: "#dadada", wireframe: true, transparent: true
})
var wireframeCube = new THREE.Mesh ( geometry_WC, material_WC )
scene.add( wireframeCube )

/*
Lighting
*/

var ambientLight = new THREE.AmbientLight ( 0xffffff, 0.5) //ambient light source
scene.add( ambientLight ) //add ambient light

var pointLight = new THREE.PointLight( 0xffffff, 1 ); //point light source
pointLight.position.set( 25, 50, 25 ); //set light source position
scene.add( pointLight ); //add point light

renderer.render( scene, camera ) //render and show it on screen

/*
Animation of cube
*/

function animate() {
    requestAnimationFrame( animate )
    //for cube
    cube.rotation.x += 0.04;
    cube.rotation.y += 0.04;
    //for wireframeCube
    wireframeCube.rotation.x -= 0.01;
    wireframeCube.rotation.y -= 0.01;
    renderer.render( scene, camera )
   }

animate()



