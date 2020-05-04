### How to start

1. download node.js
2. run `npm init`
3. run `npm install three`
4. run `npm install http-server`
5. run `npm http-server -c-1 -p 8000`

### Essential setting
1. renderer: for render scene into screen with camera
 `renderer = new THREE.WebGLRenderer({ antialias: true})`
2. scene: hold mesh (e.g. cube, voxels, etc)
`scene = new THREE.Scene()` 
3. camera: perspective camera
` camera = new THREE.PerspectiveCamera(fov, aspect, near, far);`

### optional setting
1. OrbitControls: for changing camera view
    - Orbit - left mouse 
    - Zoom - middle mouse, or mousewheel 
    - Pan - right mouse, or left mouse + ctrl/meta/shiftKey
` controls = new OrbitControls(camera, renderer.domElement);`

### How to make a mesh 
1. set geometry (shpae, size, etc)
`geometry_cube = new THREE.BoxGeometry( 1, 1, 1)`
2. set material (testure, color, etc)
`material_cube = new THREE.MeshStandardMaterial( { color: 0xff0051 })`
3. combine geometry and material together to from a mesh
` mesh = new THREE.Mesh(geometry, material);`
4. add mesh to screen
`scene.add( mesh )`
p.s. you need to set position of mesh using:
`mesh.position.set(100, 100, 100); `

### Add lightsource
1. set lightsource (e.g. source type, color, intensity, etc.)
` pointLight = new THREE.PointLight( 0xffffff, 1 );`
2. set position (except ambient)
`pointLight.position.set( 25, 50, 25 );`
3. add lightsource to screen
`scene.add( pointLight );`

### render scene with camera
`renderer.render( scene, camera )`