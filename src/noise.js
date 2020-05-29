import * as THREE from '../node_modules/three/build/three.module.js';//three.module.js


function gradients(j) {
    let i = Math.floor(j)
	if (i == 0) return new THREE.Vector3( 1.0,  1.0, 0.0);
	if (i == 1) return new THREE.Vector3(-1.0,  1.0, 0.0);
	if (i == 2) return new THREE.Vector3( 1.0, -1.0, 0.0);
	if (i == 3) return new THREE.Vector3(-1.0, -1.0, 0.0);
	if (i == 4) return new THREE.Vector3( 1.0,  0.0, 1.0);
	if (i == 5) return new THREE.Vector3(-1.0,  0.0, 1.0);
	if (i == 6) return new THREE.Vector3( 1.0,  0.0, -1.0);
	if (i == 7) return new THREE.Vector3(-1.0,  0.0, -1.0);
	if (i == 8) return new THREE.Vector3( 0.0,  1.0, 1.0);
	if (i == 9) return new THREE.Vector3( 0.0, -1.0, 1.0);
	if (i == 10) return new THREE.Vector3( 0.0,  1.0, -1.0);
	if (i == 11) return new THREE.Vector3( 0.0, -1.0, -1.0);
	return new THREE.Vector3(0.0, 0.0, 0.0);
}


function hash_poly(x) {
	return ((x*34.0)+1.0)*x % 289.0;
} 

function hash_func(grid_point) {
    return Math.floor(hash_poly(hash_poly(hash_poly(grid_point.x) + grid_point.y)+grid_point.z) % 12.0);
}

function blending_weight_poly(t) {
    return t*t*t*(t*(t*6.0 - 15.0)+10.0);
}

function mix(a, b, w){
    return  a*(1-w)+b*(w);
  }
// Constants for FBM
const  freq_multiplier = 2.17;
const  ampl_multiplier = 0.5;
const  num_octaves = 4;

function perlin_noise(point) {
	const c_000 = point.clone().floor();
	const c_100 = point.clone().floor().add(new THREE.Vector3(1.0,0.0,0.0));
	const c_010 = point.clone().floor().add(new THREE.Vector3(0.0,1.0,0.0));
	const c_110 = point.clone().floor().add(new THREE.Vector3(1.0,1.0,0.0));
	const c_001 = point.clone().floor().add(new THREE.Vector3(0.0,0.0,1.0));
	const c_101 = point.clone().floor().add(new THREE.Vector3(1.0,0.0,1.0));
	const c_011 = point.clone().floor().add(new THREE.Vector3(0.0,1.0,1.0));
	const c_111 = point.clone().floor().add(new THREE.Vector3(1.0,1.0,1.0));


	const g_000 = gradients(hash_func(c_000));
	const g_100 = gradients(hash_func(c_100));
	const g_010 = gradients(hash_func(c_010));
	const g_110 = gradients(hash_func(c_110));
	const g_001 = gradients(hash_func(c_001));
	const g_101 = gradients(hash_func(c_101));
	const g_011 = gradients(hash_func(c_011));
	const g_111 = gradients(hash_func(c_111));

	const d_000 = point.clone().sub(c_000);
	const d_100 = point.clone().sub(c_100);
	const d_010 = point.clone().sub(c_010);
	const d_110 = point.clone().sub(c_110);
	const d_001 = point.clone().sub(c_001);
	const d_101 = point.clone().sub(c_101);
	const d_011 = point.clone().sub(c_011);
	const d_111 = point.clone().sub(c_111);

	const phi_000 = g_000.clone().dot(d_000);
	const phi_100 = g_100.clone().dot(d_100);
	const phi_010 = g_010.clone().dot(d_010);
	const phi_110 = g_110.clone().dot(d_110);
	const phi_001 = g_001.clone().dot(d_001);
	const phi_101 = g_101.clone().dot(d_101);
	const phi_011 = g_011.clone().dot(d_011);
	const phi_111 = g_111.clone().dot(d_111);

	const st0 = mix(phi_000,phi_100,blending_weight_poly(d_000.x));
	const uv0 = mix(phi_010,phi_110,blending_weight_poly(d_000.x));
	const ans0 = mix(st0,uv0,blending_weight_poly(d_000.y)) ;
	const st1 = mix(phi_001,phi_101,blending_weight_poly(d_000.x));
	const uv1 = mix(phi_011,phi_111,blending_weight_poly(d_000.x));
	const ans1 = mix(st1,uv1,blending_weight_poly(d_000.y)) ;
	//console.log('noise val',ans0,ans1,'height=',d_000.z)
	const ans = mix(ans0,ans1,blending_weight_poly(d_000.z));

	return ans;
}

export  { perlin_noise };