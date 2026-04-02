import "./style.css";
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {TransformControls} from "three/addons/controls/TransformControls.js"
import { gsap } from "gsap";


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.maxDistance = 8; 
controls.minDistance = 1;

const cameraTarget = new THREE.Vector3(0, 0, 0);

controls.target = cameraTarget; 

camera.position.z = 9; 
camera.position.y = 1;

const transformControls = new TransformControls(camera, renderer.domElement);

scene.add(transformControls.getHelper());

let estEnTrainDeGlisser = false;

transformControls.addEventListener("dragging-changed", function(event) {
  controls.enabled = !event.value;
  estEnTrainDeGlisser = event.value;
});


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
const distinctCabinetMat = cabinetMat.clone();

const cabinet = new THREE.Mesh(cabinetGeo, distinctCabinetMat);
cabinet.name = "armoireFinale"; 
cabinetGroup.add(cabinet);

const objGeo = new THREE.SphereGeometry(0.2, 8, 8);
const baseObjMat = new THREE.MeshBasicMaterial({color: 0xff0000});

for (let i = 0; i < 12; i++) {
  const distinctMat = baseObjMat.clone();
  
  const obj = new THREE.Mesh(objGeo, distinctMat);
  obj.name = "referenceFilm";

  obj.userData = {
    titreAttendu: "matrix",
    description: "La pilule bleue ou la pilule rouge ? Un grand classique de la science-fiction réalisé par les Wachowski."
  };


  obj.position.z = 0;
  obj.position.x = (Math.random() - 0.5) * 2.5;
  obj.position.y = (Math.random() - 0.5) * 3.5;

  cabinetGroup.add(obj);
}

scene.add(cabinetGroup);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); 

// --- LOGIQUE DU QUIZ ET DES BOUTONS RETOUR ---

const fenetreQuestion = document.getElementById('fenetre-question');
const fenetreInfo = document.getElementById('fenetre-info');
const inputReponse = document.getElementById('input-reponse');
const btnValider = document.getElementById('btn-valider');
const msgErreur = document.getElementById('msg-erreur');
const boutonsRetour = document.querySelectorAll('.btn-retour');

let objetEnCoursDExamen = null; 


let scoreActuel = 0;
const totalObjets = 13; 
const elementScore = document.getElementById('compteur-score');

function ajouterUnPoint() {
  scoreActuel++;
  elementScore.innerText = "Trouvés : " + scoreActuel + " / " + totalObjets;
}


btnValider.addEventListener('click', () => {
  const reponseJoueur = inputReponse.value.toLowerCase().trim();
  const reponseSecrete = objetEnCoursDExamen.userData.titreAttendu.toLowerCase();

  if (reponseJoueur === reponseSecrete) {
    ajouterUnPoint();
    fenetreQuestion.style.display = 'none'; 
    
    
    document.getElementById('info-titre').innerText = "Bravo ! C'était " + objetEnCoursDExamen.userData.titreAttendu.toUpperCase();
    document.getElementById('info-desc').innerText = objetEnCoursDExamen.userData.description;
    
    fenetreInfo.style.display = 'block'; 
    
    
    objetEnCoursDExamen.material.color.setHex(0x00ff00);
    objetEnCoursDExamen.currentHex = 0x00ff00; 
    objetEnCoursDExamen.name = "referenceTrouvee"; 

  } else {
    
    msgErreur.style.display = 'block';
  }
});


boutonsRetour.forEach(bouton => {
  bouton.addEventListener('click', () => {
    
    fenetreQuestion.style.display = 'none';
    fenetreInfo.style.display = 'none';
    objetEnCoursDExamen = null;

   
    cameraEnMouvement = true;
    controls.enabled = false;

    gsap.to(camera.position, {
      x: 0, y: 0, z: -1, 
      duration: 1.5, ease: "power2.inOut",
      onComplete: () => {
        cameraEnMouvement = false;
        controls.enabled = true;
        controls.update();
      }
    });

    gsap.to(controls.target, {
      x: 0, y: -0.5, z: -4.5,
      duration: 1.5, ease: "power2.inOut"
    });
  });
});

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

let jeuDemarre = false; 

window.addEventListener('click', (event) => {
  // --- LE CADENAS DE SÉCURITÉ ---
  // Si on clique sur un bouton HTML, ou si la caméra bouge, ou si le jeu n'a pas commencé : ON ANNULE LE CLIC !
  if (event.target.tagName !== 'CANVAS' || cameraEnMouvement || !jeuDemarre) return;
  
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(cabinetGroup.children);
  const objetTrouve = intersects.find((touche) => touche.object.name === "referenceFilm");
  const armoireTrouvee = intersects.find((touche) => touche.object.name === "armoireFinale");

 
  if (objetTrouve) {
    controls.enabled = false; 
    objetEnCoursDExamen = objetTrouve.object; 

    const positionAbsolue = new THREE.Vector3();
    objetTrouve.object.getWorldPosition(positionAbsolue);
    
    gsap.to(controls.target, { x: positionAbsolue.x, y: positionAbsolue.y, z: positionAbsolue.z, duration: 1, ease: "power2.out" });
    gsap.to(camera.position, { 
      x: positionAbsolue.x, y: positionAbsolue.y, z: positionAbsolue.z + 1.5, 
      duration: 1.5, ease: "power2.inOut",
      onComplete: () => {
        
        inputReponse.value = ''; 
        msgErreur.style.display = 'none'; 
        fenetreQuestion.style.display = 'block';
      }
    });
  }
  
  else if (armoireTrouvee) {
    const distanceCamera = camera.position.distanceTo(cabinetGroup.position);
    
    if (distanceCamera > 6) {
      console.log("BRAVO ! Armoire trouvée.");
      ajouterUnPoint();
      armoireTrouvee.object.material.color.setHex(0x00ff00);
      armoireTrouvee.object.name = "armoireTrouvee_Fini"; 
    }
  }
}); 


const menuEcran = document.getElementById('menu-ecran');
const boutonPlay = document.getElementById('bouton-play');


boutonPlay.addEventListener('click', () => {
  menuEcran.style.opacity = '0';
  setTimeout(() => { menuEcran.style.display = 'none'; }, 1000);

  document.getElementById('compteur-score').style.display = 'block';

  cameraEnMouvement = true; 
  controls.enabled = false;

  gsap.to(camera.position, {
    x: 0,
    y: 0, 
    z: -1, 
    duration: 2.5,
    ease: "power2.inOut",

    onComplete: () => {
      cameraEnMouvement = false; 
      controls.enabled = true; 

      controls.update(); 
  

  jeuDemarre = true; 
    }
});

  gsap.to(controls.target, {
    x: 0,
    y: -0.5,
    z: -4.5,
    duration: 2.5,
    ease: "power2.inOut"
  });
});



let objetActuellementSurvole = null;
const couleurHover = 0x00aaff;


let cameraEnMouvement = false;

function animate() {
  requestAnimationFrame(animate);

  if (!cameraEnMouvement) {
    controls.update();

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cabinetGroup.children);

    const validHoverTarget = intersects.find(t => 
        t.object.name === "referenceFilm" || t.object.name === "armoireFinale"
    );

    if (validHoverTarget) {
      const nouvelObjet = validHoverTarget.object;

      if (objetActuellementSurvole !== nouvelObjet) {

        if (objetActuellementSurvole) {
          objetActuellementSurvole.material.color.setHex(objetActuellementSurvole.currentHex);
        }

        objetActuellementSurvole = nouvelObjet;
        objetActuellementSurvole.currentHex = objetActuellementSurvole.material.color.getHex(); 
        objetActuellementSurvole.material.color.setHex(couleurHover); 

        document.body.style.cursor = 'pointer';
      }
    } else {

      if (objetActuellementSurvole) {
        objetActuellementSurvole.material.color.setHex(objetActuellementSurvole.currentHex);
      }
      objetActuellementSurvole = null;

      document.body.style.cursor = 'auto';
    }
  }

  renderer.render(scene, camera);
}



animate();


window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
})