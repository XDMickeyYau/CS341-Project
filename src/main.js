import * as THREE from '../node_modules/three/build/three.module.js';//three.module.js
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
//import {addLight} from './light'
import { Reflector } from '../node_modules/three/examples/jsm/objects/Reflector.js';

/*
Global variable
*/
const CHUNK_SIZE = 32;
const WORLD_SIZE = 5;
const WORLD_HEIGHT = 64;
const HEIGHT_MULTIPLIER = 32;
const RENDER_DISTANCE = 3;
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

let ambientLight = new THREE.AmbientLight ( 0xffffff, 0.1) //ambient light source
scene.add( ambientLight ) //add ambient light

let directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.shadow.mapSize.width = 4096;  // default
directionalLight.shadow.mapSize.height = 4096; // default
directionalLight.position.set(-100,50,0);
directionalLight.castShadow = true; 

scene.add( directionalLight );

//let pointLight = new THREE.PointLight( 0xffffff, 1 ); //point light source
//pointLight.position.set( 25, 50, 25 ); //set light source position
//scene.add( pointLight ); //add point light


/*
Texture
*/

const loader = new THREE.TextureLoader();
const texture = loader.load('../textures/textures.png', ()=>renderer.render(scene, camera));
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;



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

const MAX_WORKER = 10
const chunkWorker = []
var id = 0;
for (let i = 0; i < MAX_WORKER; i++){
  chunkWorker[i] = new Worker('src/chunk_worker.js', { type: "module" }  );
}

function drawChunk(scene, chunks, chunk_x, chunk_z){
  if (getChunk(chunks, chunk_x, chunk_z) != null)
    return; // chunk already drawn
  setChunk(chunks, chunk_x, chunk_z, 1)
  /* 
  Vortex generation with 2D perlin noise
  */
  chunkWorker[id].postMessage([chunk_x, chunk_z])
  if (++id >= MAX_WORKER) {
    id = 0;
  }
}

for (let i = 0; i < MAX_WORKER; i++){
  chunkWorker[i].onmessage = function(e) {
    console.log(e.data);
    let positions = e.data[0]
    let normals = e.data[1]
    let indices = e.data[2]
    let chunk_x = e.data[3]
    let chunk_z = e.data[4]
    let uvs = e.data[5];
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
  
    setChunk(chunks, chunk_x, chunk_z, mesh);
    scene.add(mesh);

    var mirror_geometry = new THREE.PlaneBufferGeometry( CHUNK_SIZE, CHUNK_SIZE );
    var groundMirror = new Reflector( mirror_geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth*window.devicePixelRatio,
      textureHeight: window.innerHeight*window.devicePixelRatio,
      color: 0x334477
    } );
    groundMirror.position.y = 10.2;
    groundMirror.rotateX( - Math.PI / 2 );
    groundMirror.position.x = chunk_x+CHUNK_SIZE/2
    groundMirror.position.z = chunk_z+CHUNK_SIZE/2
    scene.add( groundMirror );
  }
}

let chunks = [];

renderChunksAroundCamera()


renderer.render( scene, camera ) //render and show it on screen

function removeFarAwayChunks(){
  for (let x_value in chunks){
    for (let z_value in chunks[x_value]){
      if (chunks[x_value][z_value] == null) continue
      let camera_chunk_x = Math.floor(controls.target.x / CHUNK_SIZE);
      let camera_chunk_z = Math.floor(controls.target.z / CHUNK_SIZE);
      if (Math.abs(x_value - camera_chunk_x) > RENDER_DISTANCE * 1.5 || Math.abs(z_value - camera_chunk_z) > RENDER_DISTANCE * 1.5){
        console.log(`remove: ${x_value * CHUNK_SIZE}, ${z_value * CHUNK_SIZE}`)
        scene.remove(chunks[x_value][z_value])
        setChunk(chunks, x_value * CHUNK_SIZE, z_value * CHUNK_SIZE, null)
      }
    }
  }
}


function renderChunksAroundCamera(){
  removeFarAwayChunks();
  let camera_chunk_x = Math.floor(controls.target.x / CHUNK_SIZE);
  let camera_chunk_z = Math.floor(controls.target.z / CHUNK_SIZE);
  for (let x = -RENDER_DISTANCE; x < RENDER_DISTANCE; ++x){
    for (let z = -RENDER_DISTANCE; z < RENDER_DISTANCE; ++z){
      drawChunk(scene, chunks, (camera_chunk_x + x) * CHUNK_SIZE, (camera_chunk_z + z) * CHUNK_SIZE);
    }
  }
}

function animate() {
  requestAnimationFrame( animate )
  renderChunksAroundCamera()
  renderer.render( scene, camera )
}

animate()



