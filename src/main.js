// We need 3 things everytime we use Three.js
// import scene (for holding object), camera and renderer (rasterization)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
const renderer = new THREE.WebGLRenderer({ antialias: true})

/*
Renderer/ screen setting
*/
renderer.setSize( window.innerWidth, window.innerHeight ) //set render size
renderer.setClearColor("#222222") // sets renderer background color
document.body.appendChild( renderer.domElement ) //add render to html

/*
Mesh creation and rendering
*/
//add red cube in center
var geometry = new THREE.BoxGeometry( 1, 1, 1) //create a cube
var material = new THREE.MeshStandardMaterial( { color: 0xff0051 })//color of cube, MeshStandardMaterial can interact with light
var cube = new THREE.Mesh ( geometry, material ) //mesh = geometry+color, what scene will hold
scene.add( cube ) //add cube to scene

//add bigger wireframe  cube
var geometry = new THREE.BoxGeometry( 3, 3, 3)
var material = new THREE.MeshBasicMaterial( {
 color: "#dadada", wireframe: true, transparent: true
})
var wireframeCube = new THREE.Mesh ( geometry, material )
scene.add( wireframeCube )


camera.position.z = 5 //move back camera

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

/*
Lighting
*/
var ambientLight = new THREE.AmbientLight ( 0xffffff, 0.5) //ambient light source
scene.add( ambientLight ) //add ambient light

var pointLight = new THREE.PointLight( 0xffffff, 1 ); //point light source
pointLight.position.set( 25, 50, 25 ); //set light source position
scene.add( pointLight ); //add point light

