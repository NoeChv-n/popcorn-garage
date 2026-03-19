import "./style.css";
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {TransformControls} from "three/addons/controls/TransformControls.js"

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;

const transformControls = new TransformControls(camera, renderer.domElement);

scene.add(transformControls);
scene.add(transformControls.getHelper());

transformControls.addEventListener("dragging-changed", function(event) {controls.enabled = !event.value;});


const roomGeo = new THREE.BoxGeometry(10, 5, 10);
const roomMat = new THREE.MeshBasicMaterial({
  color: 0x444444,
  wireframe: true,
  side: THREE.BackSide
})
const room = new THREE.Mesh(roomGeo, roomMat);
scene.add(room);

const cabinetGroup = new THREE.Group();

cabinetGroup.position.y = -0.5;
cabinetGroup.position.x = 0;
cabinetGroup.position.z = -4.5;

const cabinetGeo = new THREE.BoxGeometry(3, 4, 1);
const cabinetMat = new THREE.MeshBasicMaterial({color: 0xffaa00, wireframe: true});
const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
cabinetGroup.add(cabinet);

const objGeo = new THREE.SphereGeometry(0.2, 8, 8);
const objMat = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});

for (let i = 0; i < 12; i++) {
  const obj = new THREE.Mesh(objGeo, objMat);

  obj.position.z = 0;
  obj.position.x = (Math.random() - 0.5) * 2.5;
  obj.position.y = (Math.random() - 0.5) * 3.5;

  cabinetGroup.add(obj);
}

scene.add(cabinetGroup);


transformControls.attach(cabinetGroup.children[1]);






function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  
}
animate()



window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
})