import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "dat.gui";
import gsap from "gsap";

const gui = new GUI();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("canvas")});
const controls = new OrbitControls(camera, renderer.domElement);
const ray = new THREE.Raycaster();
const pointer = new THREE.Vector3();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
camera.position.set(0, 0, 50);

function animatePlane() {
  
  //change plane based on dat.gui settings
  plane.geometry.dispose();
  plane.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );

  //vertice position randomization
  const { array } = plane.geometry.attributes.position;
  const randomValues = [];
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 3;
      array[i + 1] = y + (Math.random() - 0.05) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 9;
    }
    randomValues.push(Math.random() * (Math.PI * 2));
  }

  //color attribute addition on hover
  const colors = [];
  for (let i = 0; i < plane.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }
  plane.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );

  const { position } = plane.geometry.attributes;
  position.originalPosition = position.array; //position.originalPosition created here
  position.randomValues = randomValues; // position.randomValues created here
}

const world = {
  plane: { width: 400, height: 400, widthSegments: 50, heightSegments: 50 },
};

gui.add(world.plane, "width", 1, 500).onChange(animatePlane);
gui.add(world.plane, "height", 1, 500).onChange(animatePlane);
gui.add(world.plane, "widthSegments", 1, 100).onChange(animatePlane);
gui.add(world.plane, "heightSegments", 1, 100).onChange(animatePlane);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0.5, 1);
const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, -1, -1);
scene.add(light, backLight);

const geometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
);
const material = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true,
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

animatePlane()

let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  frame += 0.01
  
  ray.setFromCamera(pointer, camera);

  const {array, originalPosition, randomValues} = plane.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    //x
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01
    //y
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.01
  }

  plane.geometry.attributes.position.needsUpdate = true;

  const intersects = ray.intersectObject(plane);
  if (intersects.length > 0) {
    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };
    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        const { color } = intersects[0].object.geometry.attributes;

        //vertice 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        //vertice 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        //vertice 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);

        color.needsUpdate = true;
      },
    });
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / innerHeight) * 2 + 1;
});
