import * as THREE from "three";
import { OrbitControls } from "three/addons";
import "./countries.js"
import countries from "./countries.js";

class RadioGlobe {
    #canvas;
    #texture;
    #scene;
    #camera;
    #controls;
    #renderer;
    #loader;
    #raycaster;
    #pointer;
    #globe;
    #starField;
    #invisiblePins;
    #visiblePins;
    #audio;
    #playPauseBtn;
    #volumeSlider;
    #stationName;
    #countryName;
    constructor(canvas, img) {
        this.#canvas = canvas;
        this.#stationName = document.querySelector(".station");
        this.#countryName = document.querySelector(".country");
        this.#audio = document.querySelector("audio");
        this.#playPauseBtn = document.querySelector(".pause-start-button");
        this.#volumeSlider = document.querySelector(".volume");
        this.#loader = new THREE.TextureLoader();
        this.#texture = this.#loader.load(img);
        this.#scene = new THREE.Scene();
        this.#camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        this.#controls = new OrbitControls(this.#camera, this.#canvas);
        this.#renderer = new THREE.WebGLRenderer({ canvas: this.#canvas, antialias: true });
        this.#raycaster = new THREE.Raycaster(undefined, undefined, 0.1, 10);
        this.#pointer = new THREE.Vector2();

        this.#camera.position.set(0, 0, 3);
        this.#controls.update();
        this.#controls.enablePan = false;
        this.#controls.maxDistance = 5;
        this.#controls.minDistance = 1.15;
        this.#renderer.setSize(innerWidth + 2, innerHeight + 2);
        this.#renderer.setPixelRatio(devicePixelRatio);
        this.#texture.colorSpace = THREE.SRGBColorSpace;

        this.#globe = new THREE.Mesh(
            new THREE.SphereGeometry(1, 50, 50),
            new THREE.MeshBasicMaterial({
                map: this.#texture
            })
        );


        this.#starField = new THREE.Points(
            new THREE.BufferGeometry().setAttribute(
                "position",
                new THREE.BufferAttribute(
                    this.#getRandomPoints(6, 7, 2000),
                    3
                )
            ),
            new THREE.PointsMaterial({
                size: 0.01,
                color: 0xffffff
            })
        );

    }


    #changeVolume = () => {
        this.#audio.volume = this.#volumeSlider.value;
    }

    #isPlaying = false;
    #playPause = () => {
        if (this.#isPlaying) {
            this.#audio.pause();
            this.#playPauseBtn.src = "play-icon.svg";
            this.#isPlaying = !this.#isPlaying;
        }
        else {
            this.#playPauseBtn.src = "pause-icon.svg";
            this.#audio.play();
            this.#isPlaying = !this.#isPlaying;
        }
    }

    #resizeWindow = () => {
        this.#camera.aspect = innerWidth / innerHeight;
        this.#camera.updateProjectionMatrix()
        this.#renderer.setSize(innerWidth + 2, innerHeight + 2);
    }

    #updateControlSensitivity = () => {
        this.#controls.rotateSpeed = this.#camera.position.length() / 10;
        this.#controls.zoomSpeed = this.#camera.position.length() / 10;
    }

    #animate = () => {
        this.#renderer.render(this.#scene, this.#camera);
        this.#controls.update();
    }

    #getRandomPoints = (r1, r2, count) => {
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

    #createPins = () => {
        let invisibleMesh;
        let visibleMesh;
        this.#invisiblePins = [this.#globe];
        this.#visiblePins = [this.#globe];

        for (let i = 0; i < countries.length; i++) {
            visibleMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.005, 10, 10),
                new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            );
            visibleMesh.position.set(
                countries[i].position.x,
                countries[i].position.y,
                countries[i].position.z
            );

            this.#scene.add(visibleMesh);
            this.#visiblePins.push(visibleMesh);

            invisibleMesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.03, 3, 3),
                new THREE.MeshBasicMaterial({ visible: false })
            );

            invisibleMesh.position.set(
                countries[i].position.x,
                countries[i].position.y,
                countries[i].position.z
            );

            this.#scene.add(invisibleMesh)
            this.#invisiblePins.push(invisibleMesh);
        }
    }

    #clickedPin = null;
    #clickRayCasting = (event) => {
        this.#pointer.x = (event.clientX / innerWidth) * 2 - 1;
        this.#pointer.y = -(event.clientY / innerHeight) * 2 + 1;

        this.#raycaster.setFromCamera(this.#pointer, this.#camera);
        const intersects = this.#raycaster.intersectObjects(this.#invisiblePins);

        if (intersects.length > 0) {
            const firstIntersection = this.#visiblePins[this.#invisiblePins.indexOf(intersects[0].object)];
            const clicked = intersects[0].object;

            if (this.#clickedPin && this.#clickedPin !== clicked && this.#clickedPin !== this.#globe) {
                this.#visiblePins[this.#invisiblePins.indexOf(this.#clickedPin)].scale.set(1, 1, 1);
            }

            if (clicked !== this.#globe) {
                const country = countries[this.#invisiblePins.indexOf(clicked) - 1];
                fetch(`https://de2.api.radio-browser.info/json/stations/search?country=${country.name}&limit=20`)
                    .then(res => res.json())
                    .then(data => {
                        const station = data[Math.floor(Math.random() * data.length)]
                        this.#audio.src = station.url_resolved;
                        this.#audio.play();
                        this.#isPlaying = !this.#isPlaying;
                        this.#playPauseBtn.src = "pause-icon.svg";
                        this.#countryName.innerText = station.country;
                        this.#stationName.innerText = station.name;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }

            if (firstIntersection !== this.#globe) {
                firstIntersection.scale.set(2, 2, 2);
            }

            this.#clickedPin = clicked;
        }
    }

    #hoveredPin = null;
    #hoverRayCasting = (event) => {
        this.#pointer.x = (event.clientX / innerWidth) * 2 - 1;
        this.#pointer.y = -(event.clientY / innerHeight) * 2 + 1;

        this.#raycaster.setFromCamera(this.#pointer, this.#camera);
        const intersects = this.#raycaster.intersectObjects(this.#invisiblePins);

        if (intersects.length > 0) {
            const firstIntersection = this.#visiblePins[this.#invisiblePins.indexOf(intersects[0].object)];
            const hovered = intersects[0].object;

            if (this.#hoveredPin && this.#hoveredPin !== hovered && this.#hoveredPin !== this.#globe) {
                this.#visiblePins[this.#invisiblePins.indexOf(this.#hoveredPin)].material.color.set(0x00ff00)
            }

            if (firstIntersection !== this.#globe) {
                firstIntersection.material.color.set(0xffffff);
            }
            this.#hoveredPin = hovered;
        }
    }

    render = () => {
        this.#createPins();
        canvas.addEventListener("click", this.#clickRayCasting);
        canvas.addEventListener("mousemove", this.#hoverRayCasting);
        this.#scene.add(this.#starField);
        this.#scene.add(this.#globe);
        window.addEventListener("resize", this.#resizeWindow);
        this.#volumeSlider.addEventListener("input", this.#changeVolume);
        this.#playPauseBtn.addEventListener("click", this.#playPause);
        this.#controls.addEventListener("change", this.#updateControlSensitivity);
        this.#renderer.setAnimationLoop(this.#animate);
    }
}


const canvas = document.querySelector("canvas");
const globe = new RadioGlobe(canvas, "world-uv-map.jpg");
globe.render();

//
// fetch("http://162.55.180.156/json/countries?limit=100")
//     .then(res => res.json())
//     .then(data => {
//         console.log(data);
//     })
//     .catch(err => {
//         console.log(err);
// });
//

