import * as THREE from '../node_modules/three/build/three.module.js';//three.module.js


function gradients(j) {
    let i = Math.floor(j)
	if (i == 0) return new THREE.Vector2( 1.0,  1.0);
	if (i == 1) return new THREE.Vector2(-1.0,  1.0);
	if (i == 2) return new THREE.Vector2( 1.0, -1.0);
	if (i == 3) return new THREE.Vector2(-1.0, -1.0);
	if (i == 4) return new THREE.Vector2( 1.0,  0.0);
	if (i == 5) return new THREE.Vector2(-1.0,  0.0);
	if (i == 6) return new THREE.Vector2( 1.0,  0.0);
	if (i == 7) return new THREE.Vector2(-1.0,  0.0);
	if (i == 8) return new THREE.Vector2( 0.0,  1.0);
	if (i == 9) return new THREE.Vector2( 0.0, -1.0);
	if (i == 10) return new THREE.Vector2( 0.0,  1.0);
	if (i == 11) return new THREE.Vector2( 0.0, -1.0);
	return new THREE.Vector2(0.0, 0.0);
}


function hash_poly(x) {
	return ((x*34.0)+1.0)*x % 289.0;
} 

function hash_func(grid_point) {
    return Math.floor(hash_poly(hash_poly(grid_point.x) + grid_point.y) % 12.0);
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
  
	const c_00 = point.clone().floor();
	const c_10 = point.clone().floor().add(new THREE.Vector2(1.0,0.0));
	const c_01 = point.clone().floor().add(new THREE.Vector2(0.0,1.0));
	const c_11 = point.clone().floor().add(new THREE.Vector2(1.0,1.0));


	const g_00 = gradients(hash_func(c_00));
	const g_10 = gradients(hash_func(c_10));
	const g_01 = gradients(hash_func(c_01));
	const g_11 = gradients(hash_func(c_11));

	const d_00 = point.clone().sub(c_00);
	const d_10 = point.clone().sub(c_10);
	const d_01 = point.clone().sub(c_01);
	const d_11 = point.clone().sub(c_11);

	const phi_00 = g_00.clone().dot(d_00);
	const phi_10 = g_10.clone().dot(d_10);
	const phi_01 = g_01.clone().dot(d_01);
	const phi_11 = g_11.clone().dot(d_11);

	const st = mix(phi_00,phi_10,blending_weight_poly(d_00.x));
	const uv = mix(phi_01,phi_11,blending_weight_poly(d_00.x));
	const ans = mix(st,uv,blending_weight_poly(d_00.y));

	return ans;
}

export  { perlin_noise };