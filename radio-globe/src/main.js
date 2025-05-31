import * as THREE from "three";
import { OrbitControls } from "three/addons";

const canvas = document.querySelector("canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const texture = new THREE.TextureLoader().load(`world-uv-map.jpg`);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


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



const objectsArray = [];

const testGlobe1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.005, 5, 5),
    new THREE.MeshBasicMaterial({
        color: 0x00ff00
    })
);
testGlobe1.position.set(0, 0, 1);
scene.add(testGlobe1);
console.log(`testGlobe1.uuid: ${testGlobe1.uuid}`);


const testGlobe2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.005, 10, 10),
    new THREE.MeshBasicMaterial({
        color: 0x00ff00
    })
);
testGlobe2.position.set(0, 1, 0);
scene.add(testGlobe2);
console.log(`testGlobe2.uuid: ${testGlobe2.uuid}`);


const testGlobe3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.005, 10, 10),
    new THREE.MeshBasicMaterial({
        color: 0x00ff00
    })
);
testGlobe3.position.set(1, 0, 0);
scene.add(testGlobe3);
console.log(`testGlobe3.uuid: ${testGlobe3.uuid}`);


objectsArray.push(testGlobe1, testGlobe2, testGlobe3);



function onPointerMove( event ) {

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( pointer, camera );

    // Get an array of all intersections with testGlobe
    const intersects = raycaster.intersectObjects( objectsArray );

    // Check if the intersects array has any elements
    if ( intersects.length > 0 ) {
        const firstIntersection = intersects[ 0 ];
        // console.log( 'testGlobe was intersected!', firstIntersection.point );
        console.log( firstIntersection.object);
    }
}


document.addEventListener( 'click', onPointerMove );

const animate = () => {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);