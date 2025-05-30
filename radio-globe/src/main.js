import * as THREE from "three";
import { OrbitControls } from "three/addons";

const canvas = document.querySelector("canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const texture = new THREE.TextureLoader().load(`world-uv-map.jpg`);

camera.position.set(0, 0, 2);
controls.update();
controls.enablePan = false;
controls.maxDistance = 5;
controls.minDistance = 1.5;
controls.addEventListener("change", () => {
    controls.rotateSpeed = camera.position.length() / 10;
    controls.zoomSpeed = camera.position.length() / 10;
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
texture.colorSpace = THREE.SRGBColorSpace;

window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight);
});




// GLOBE
const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 50, 50),
    new THREE.MeshBasicMaterial({
        map: texture
    })
);
scene.add(globe);






const animate = () => {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);