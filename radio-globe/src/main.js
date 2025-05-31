import * as THREE from "three";
import { OrbitControls } from "three/addons";

const canvas = document.querySelector("canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const texture = new THREE.TextureLoader().load(`world-uv-map.jpg`);

camera.position.set(0, 0, 3);
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







const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 50, 50),
    new THREE.MeshBasicMaterial({
        map: texture
    })
);
scene.add(globe);





const getRandomPoints = (r1, r2, count) => {
    const vertices = new Float32Array(count * 3);
    let x, y, z;
    let angle1, angle2;
    let distance, projection;

    for (let i = 0; i < count * 3; i += 3) {
        angle1 = Math.random() * 2 * Math.PI;
        angle2 = Math.random() * 2 * Math.PI;
        distance = r1 + Math.random() * (r2 - r1);
        projection = distance * Math.cos(angle1);
        y = distance * Math.sin(angle1);
        z = projection * Math.cos(angle2);
        x = projection * Math.sin(angle2);
        vertices[i] = x;
        vertices[i + 1] = y;
        vertices[i + 2] = z;
    }
    return vertices;
}

const starField = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(
            getRandomPoints(6, 7, 2000),
            3
        )
    ),
    new THREE.PointsMaterial({
        size: 0.01,
        color: 0xffffff
    })
);
scene.add(starField);










const animate = () => {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);