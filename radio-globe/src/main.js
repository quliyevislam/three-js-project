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
controls.minDistance = 1.15;
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


let extra = 90;

const stations = [
    {
        name: "station-1",
        lat: 40.329752794739626,
        lng: 50.57553777880485 + extra
    },
    {
        name: "station-0",
        lat: 41.10567638855535,
        lng: 45.42114399550441 + extra
    },
    {
        name: "station-2",
        lat: 41.11351108495903,
        lng: 28.449840089611545 + extra
    },
    {
        name: "station-3",
        lat: 42.24604985990886,
        lng: 13.498293415810641 + extra
    },
    {
        name: "station-4",
        lat: 42.55723792353669,
        lng: -74.77314926952118 + extra
    },
    {
        name: "station-4",
        lat: 0,
        lng: 0
    },
    {
        name: "station-4",
        lat: 0 ,
        lng: 0
    }
]


stations.forEach((element) => {
    let x,y,z;
    let angle1 = element.lat * (Math.PI / 180);
    let angle2 = element.lng * (Math.PI / 180);
    y = Math.sin(angle1);
    let projection = Math.cos(angle1);
    z = projection * Math.cos(angle2);
    x = projection * Math.sin(angle2);
    element.x = x;
    element.y = y;
    element.z = z;
});

console.log(stations);


const createObjects = (stations) => {
    const objects = [];
    let  mesh;
    for (let i = 0; i < stations.length; i++) {
            mesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.005,15,15),
                new THREE.MeshBasicMaterial({color: 0x00ff00})
            );
            mesh.position.x = stations[i].x;
            mesh.position.y = stations[i].y;
            mesh.position.z = stations[i].z;
            scene.add(mesh)
            objects.push(mesh);
    }
    return objects;
}

const objectsArray = createObjects(stations);

console.log(objectsArray);




function onPointerMove( event ) {

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( objectsArray );

    if ( intersects.length > 0 ) {
        const firstIntersection = intersects[ 0 ];
        firstIntersection.object.material.color.r = 1;
        firstIntersection.object.material.color.b = 1;
        console.log( firstIntersection.object);
    }
}


document.addEventListener( 'click', onPointerMove );

const animate = () => {
    // globe.rotation.y += 0.001;
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);