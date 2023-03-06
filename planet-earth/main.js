import './style.css'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphereFragment.glsl";

const canvas = document.querySelector("#canvas-div");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("canvas"), antialias: true});
const controls = new OrbitControls(camera, renderer.domElement);
const pointer = new THREE.Vector3();

camera.position.set(0, 0, 15);
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
renderer.setPixelRatio(devicePixelRatio);
addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / innerHeight) * 2 + 1;
});

const light = new THREE.AmbientLight({ color: 0xffffff });
scene.add(light);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      earthTexture: {
        value: new THREE.TextureLoader().load("./img/earth.jpeg"),
      },
    },
  })
);
const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(6, 60, 60),
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
);
scene.add(atmosphere);

const starGeometry = new THREE.SphereGeometry(0.25, 24, 24);
const starMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
function addStar() {
  const star = new THREE.Mesh(starGeometry, starMaterial);
  scene.add(star);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(200));
  star.position.set(x, y, z);
}
Array(150).fill().forEach(addStar);

const starVertices = [];
const pointsGeometry = new THREE.BufferGeometry();
const pointsMaterial = new THREE.PointsMaterial({ color: 0xffffff });
for (let i = 0; i < 1000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -Math.random() * 3000;
  starVertices.push(x, y, z);
}
pointsGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const stars = new THREE.Points(pointsGeometry, pointsMaterial);
scene.add(stars);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();

  sphere.rotation.y += 0.002;
  gsap.to(group.rotation, {
    x: -pointer.y * 0.3,
    y: pointer.x * 0.3,
    duration: 1.5,
  });
}
animate();
