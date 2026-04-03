import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { gsap } from "gsap";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import GUI from "lil-gui";

// ==============================================================================
// 1. CONFIGURATION DE BASE
// ==============================================================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 9; 
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ==============================================================================
// 2. CONTRÔLES DE LA CAMÉRA ET OUTILS
// ==============================================================================

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; 
controls.maxDistance = 8; 
controls.minDistance = 1; 

const cameraTarget = new THREE.Vector3(0, 0, 0);
controls.target = cameraTarget; 

const transformControls = new TransformControls(camera, renderer.domElement);
scene.add(transformControls.getHelper());

let estEnTrainDeGlisser = false;
transformControls.addEventListener("dragging-changed", function(event) {
  controls.enabled = !event.value;
  estEnTrainDeGlisser = event.value;
});

// ==============================================================================
// 3. CONSTRUCTION DE L'ENVIRONNEMENT (Les Combles de Narnia)
// ==============================================================================

const textureLoader = new THREE.TextureLoader();

// --- TEXTURES ---

// Textures PBR du Sol (Plancher)
const texSol = textureLoader.load('/textures/plancher.png'); 
const texSolAO = textureLoader.load('/textures/plancher_ao.png'); 
const texSolNormal = textureLoader.load('/textures/plancher_normal.png'); 
const texSolRoughness = textureLoader.load('/textures/plancher_roughness.png'); 

// Textures PBR du Mur Droit
const texMurDroit = textureLoader.load('/textures/mur_droite.png');
const texMurDroitao = textureLoader.load('/textures/mur_droite_ao.png');
const texMurDroitnormal = textureLoader.load('/textures/mur_droite_normal.png');
const texMurDroitroughness = textureLoader.load('/textures/mur_droite_roughness.png');

// Textures PBR du Toit
const texToit = textureLoader.load('/textures/mur_toit.png');
const texToitAO = textureLoader.load('/textures/mur_toit_ao.png');
const texToitNormal = textureLoader.load('/textures/mur_toit_normal.png');
const texToitRoughness = textureLoader.load('/textures/mur_toit_roughness.png');

// Textures PBR du Mur Fond
const texMurFond = textureLoader.load('/textures/mur_fond.png');
const texMurFondAO = textureLoader.load('/textures/mur_fond_ao.png');
const texMurFondNormal = textureLoader.load('/textures/mur_fond_normal.png');
const texMurFondRoughness = textureLoader.load('/textures/mur_fond_roughness.png');

// 💡 Répétition et échelle des textures du Mur du Fond
const listMapToRepeat = [texMurFond, texMurFondAO, texMurFondNormal, texMurFondRoughness];
listMapToRepeat.forEach(map => {
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(0.2, 0.1); 
});

// Textures PBR du Mur Gauche (CORRIGÉ !)
const texMurGauche = textureLoader.load('/textures/mur_gauche.png');
const texMurGaucheAO = textureLoader.load('/textures/mur_gauche_ao.png');
const texMurGaucheNormal = textureLoader.load('/textures/mur_gauche_normal.png');
const texMurGaucheRoughness = textureLoader.load('/textures/mur_gauche_roughness.png');

// 💡 Répétition pour le Mur Gauche
const listMapGaucheToRepeat = [texMurGauche, texMurGaucheAO, texMurGaucheNormal, texMurGaucheRoughness];
listMapGaucheToRepeat.forEach(map => {
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1, 1); // Valeur de base qu'on règlera dans le GUI
});


// --- CRÉATION DES MATÉRIAUX ---

// MATÉRIAU PBR DU SOL
const solMat = new THREE.MeshStandardMaterial({ 
  color: 0x6e4a2a, // Marron chaud
  map: texSol,
  aoMap: texSolAO,
  aoMapIntensity: 2.5,
  normalMap: texSolNormal,
  normalScale: new THREE.Vector2(1.7, 1.6), 
  roughnessMap: texSolRoughness,
  roughness: 1.11 
}); 

// MATÉRIAU PBR DU MUR FOND
const murFondMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff, 
  map: texMurFond,
  aoMap: texMurFondAO,
  aoMapIntensity: 1.9,
  normalMap: texMurFondNormal,
  normalScale: new THREE.Vector2(0.3, 2.4),
  roughnessMap: texMurFondRoughness,
  roughness: 1.29
}); 

// MATÉRIAU PBR DU MUR DROIT
const murDroitMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff, 
  map: texMurDroit, 
  aoMap: texMurDroitao, 
  aoMapIntensity: 1.3, 
  normalMap: texMurDroitnormal, 
  normalScale: new THREE.Vector2(2.7, 2.4), 
  roughnessMap: texMurDroitroughness, 
  roughness: 1.23, 
  side: THREE.DoubleSide 
}); 

// MATÉRIAU PBR DU TOIT
const toitMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff, 
  map: texToit, 
  aoMap: texToitAO,
  aoMapIntensity: 1.7,
  normalMap: texToitNormal,
  normalScale: new THREE.Vector2(2, 1.7),
  roughnessMap: texToitRoughness,
  roughness: 1.19,
  side: THREE.DoubleSide 
}); 

// MATÉRIAU PBR DU MUR GAUCHE
const murGaucheMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff, 
  map: texMurGauche,
  aoMap: texMurGaucheAO,
  aoMapIntensity: 1,
  normalMap: texMurGaucheNormal,
  normalScale: new THREE.Vector2(1, 1),
  roughnessMap: texMurGaucheRoughness,
  roughness: 1,
  side: THREE.DoubleSide 
}); 

// --- LE PANNEAU DE CONTRÔLE GLOBAL (GUI) ---
const gui = new GUI(); 

// Le panneau pour le Mur Gauche
const reglagesMurGauche = gui.addFolder('Réglages Mur Gauche');

const parametresMurGauche = { 
  couleurTeinte: murGaucheMat.color.getHex(),
  repeatX: texMurGauche.repeat.x,
  repeatY: texMurGauche.repeat.y 
};

reglagesMurGauche.addColor(parametresMurGauche, 'couleurTeinte').name('Teinte').onChange((val) => { murGaucheMat.color.set(val); });
reglagesMurGauche.add(parametresMurGauche, 'repeatX').min(0.1).max(10).step(0.1).name('Mise à l échelle X').onChange((val) => { listMapGaucheToRepeat.forEach(map => map.repeat.x = val); });
reglagesMurGauche.add(parametresMurGauche, 'repeatY').min(0.1).max(10).step(0.1).name('Mise à l échelle Y').onChange((val) => { listMapGaucheToRepeat.forEach(map => map.repeat.y = val); });
reglagesMurGauche.add(murGaucheMat.normalScale, 'x').min(0).max(5).step(0.1).name('Relief Horizontal');
reglagesMurGauche.add(murGaucheMat.normalScale, 'y').min(0).max(5).step(0.1).name('Relief Vertical');
reglagesMurGauche.add(murGaucheMat, 'aoMapIntensity').min(0).max(5).step(0.1).name('Ombres (AO)');
reglagesMurGauche.add(murGaucheMat, 'roughness').min(0).max(2).step(0.01).name('Mat/Brillant');
reglagesMurGauche.open();

// --- ASSEMBLAGE DE LA PIÈCE ---

const solGeo = new THREE.PlaneGeometry(10, 10);
solGeo.setAttribute('uv2', new THREE.BufferAttribute(solGeo.attributes.uv.array, 2));
const sol = new THREE.Mesh(solGeo, solMat);
sol.rotation.x = -Math.PI / 2; 
sol.position.y = -2.5; 
scene.add(sol);

const murFondShape = new THREE.Shape();
murFondShape.moveTo(-5, 0); 
murFondShape.lineTo(5, 0);  
murFondShape.lineTo(5, 4);  
murFondShape.lineTo(0, 7);  
murFondShape.lineTo(-5, 4); 
murFondShape.lineTo(-5, 0); 
const murFondGeo = new THREE.ShapeGeometry(murFondShape);
murFondGeo.setAttribute('uv2', new THREE.BufferAttribute(murFondGeo.attributes.uv.array, 2)); 
const murFond = new THREE.Mesh(murFondGeo, murFondMat);
murFond.position.set(0, -2.5, -5); 
scene.add(murFond);

const murDroitGeo = new THREE.PlaneGeometry(10, 4);
murDroitGeo.setAttribute('uv2', new THREE.BufferAttribute(murDroitGeo.attributes.uv.array, 2));
const murDroit = new THREE.Mesh(murDroitGeo, murDroitMat);
murDroit.rotation.y = -Math.PI / 2;
murDroit.position.set(5, -0.5, 0); 
scene.add(murDroit);

const murGaucheShape = new THREE.Shape();
murGaucheShape.moveTo(-5, 0); 
murGaucheShape.lineTo(5, 0);
murGaucheShape.lineTo(5, 4); 
murGaucheShape.lineTo(-5, 4);

const trouFenetre = new THREE.Path();
trouFenetre.moveTo(1.5, 1);  
trouFenetre.lineTo(4.5, 1);  
trouFenetre.lineTo(4.5, 3);  
trouFenetre.lineTo(1.5, 3);  
murGaucheShape.holes.push(trouFenetre);

const murGaucheGeo = new THREE.ShapeGeometry(murGaucheShape);
murGaucheGeo.setAttribute('uv2', new THREE.BufferAttribute(murGaucheGeo.attributes.uv.array, 2));
const murGauche = new THREE.Mesh(murGaucheGeo, murGaucheMat);
murGauche.rotation.y = Math.PI / 2; 
murGauche.position.set(-5, -2.5, 0); 
scene.add(murGauche);

const longueurPente = Math.sqrt(5*5 + 3*3); 
const anglePente = Math.atan2(3, 5); 
const toitGeo = new THREE.PlaneGeometry(longueurPente, 10);
toitGeo.setAttribute('uv2', new THREE.BufferAttribute(toitGeo.attributes.uv.array, 2));

const toitGauche = new THREE.Mesh(toitGeo, toitMat);
toitGauche.position.set(-2.5, 3, 0); 
toitGauche.rotation.order = 'ZYX'; 
toitGauche.rotation.z = anglePente; 
toitGauche.rotation.x = -Math.PI / 2; 
scene.add(toitGauche);

const toitDroit = new THREE.Mesh(toitGeo, toitMat);
toitDroit.position.set(2.5, 3, 0); 
toitDroit.rotation.order = 'ZYX';
toitDroit.rotation.z = -anglePente;
toitDroit.rotation.x = -Math.PI / 2;
scene.add(toitDroit);

// --- LUMIÈRES ---

const lumiereAmbiante = new THREE.AmbientLight(0xffffff, 0.3); 
scene.add(lumiereAmbiante);

const lumiereFenetre = new THREE.DirectionalLight(0xffddaa, 2.5); 
lumiereFenetre.position.set(-10, 2, -3); 
scene.add(lumiereFenetre);
lumiereFenetre.target.position.set(0, -1, -4.5);
scene.add(lumiereFenetre.target);

// Lumière de rebond douce pour déboucher les ombres
const lumiereRebond = new THREE.PointLight(0xffeedd, 2.5, 12);
lumiereRebond.position.set(0, 1, -2); 
scene.add(lumiereRebond);


// ==============================================================================
// 4. L'ARMOIRE ET LES OBJETS
// ==============================================================================

const cabinetGroup = new THREE.Group();
cabinetGroup.position.set(0, -2.5, -4.5); 
scene.add(cabinetGroup);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Chargement de l'armoire
gltfLoader.load(
  '/modeles/armoire.glb', 
  (gltf) => {
    const armoire = gltf.scene;
    armoire.name = "armoireFinale";
    armoire.scale.set(5, 5, 5);
    armoire.position.set(0, 0, 0.5); 
    cabinetGroup.add(armoire);
  },
  undefined,
  (erreur) => console.error("Erreur armoire :", erreur)
);

// Objets temporaires (boules rouges)
const objGeo = new THREE.SphereGeometry(0.2, 8, 8);
const baseObjMat = new THREE.MeshStandardMaterial({color: 0xff0000});

for (let i = 0; i < 12; i++) {
  const distinctMat = baseObjMat.clone(); 
  const obj = new THREE.Mesh(objGeo, distinctMat);
  obj.name = "referenceFilm";
  obj.userData = {
    titreAttendu: "matrix",
    description: "La pilule bleue ou la pilule rouge ? Un grand classique."
  };
  obj.position.set((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 3.5 + 2, 0); 
  cabinetGroup.add(obj);
}

// ==============================================================================
// 5. FONCTIONS OUTILS (Raycaster & Couleurs)
// ==============================================================================

function trouverObjetJeu(objetTouche, nomRecherche) {
  if (!objetTouche) return null;
  if (objetTouche.name === nomRecherche) return { object: objetTouche };
  if (objetTouche.parent) return trouverObjetJeu(objetTouche.parent, nomRecherche);
  return null;
}

function appliquerCouleur(objet, couleurHex) {
  if (!objet) return;
  objet.traverse((enfant) => {
    if (enfant.isMesh && enfant.material) {
      if (enfant.currentHex === undefined) {
        enfant.material = enfant.material.clone(); 
        enfant.currentHex = enfant.material.color.getHex();
      }
      if (couleurHex === null) {
        enfant.material.color.setHex(enfant.currentHex); 
      } else {
        enfant.material.color.setHex(couleurHex); 
      }
    }
  });
}

// ==============================================================================
// 6. SYSTÈME DE JEU (Logique, UI, Clics)
// ==============================================================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(); 

const fenetreQuestion = document.getElementById('fenetre-question');
const fenetreInfo = document.getElementById('fenetre-info');
const inputReponse = document.getElementById('input-reponse');
const btnValider = document.getElementById('btn-valider');
const msgErreur = document.getElementById('msg-erreur');
const boutonsRetour = document.querySelectorAll('.btn-retour');
const elementScore = document.getElementById('compteur-score');

let objetEnCoursDExamen = null; 
let scoreActuel = 0;
const totalObjets = 13; 
let jeuDemarre = false; 
let cameraEnMouvement = false; 

function ajouterUnPoint() {
  scoreActuel++;
  elementScore.innerText = "Trouvés : " + scoreActuel + " / " + totalObjets;
}

// Validation du Quiz
btnValider.addEventListener('click', () => {
  const reponseJoueur = inputReponse.value.toLowerCase().trim();
  const reponseSecrete = objetEnCoursDExamen.userData.titreAttendu.toLowerCase();

  if (reponseJoueur === reponseSecrete) {
    ajouterUnPoint();
    fenetreQuestion.style.display = 'none'; 
    document.getElementById('info-titre').innerText = "Bravo ! C'était " + objetEnCoursDExamen.userData.titreAttendu.toUpperCase();
    document.getElementById('info-desc').innerText = objetEnCoursDExamen.userData.description;
    fenetreInfo.style.display = 'block'; 
    
    appliquerCouleur(objetEnCoursDExamen, 0x00ff00); 
    objetEnCoursDExamen.name = "referenceTrouvee"; 
  } else {
    msgErreur.style.display = 'block';
  }
});

// Boutons Retour
boutonsRetour.forEach(bouton => {
  bouton.addEventListener('click', () => {
    fenetreQuestion.style.display = 'none';
    fenetreInfo.style.display = 'none';
    objetEnCoursDExamen = null;

    cameraEnMouvement = true;
    controls.enabled = false;

    gsap.to(camera.position, { x: 0, y: 0, z: -1, duration: 1.5, ease: "power2.inOut",
      onComplete: () => {
        cameraEnMouvement = false;
        controls.enabled = true; 
        controls.update();
      }
    });
    gsap.to(controls.target, { x: 0, y: -0.5, z: -4.5, duration: 1.5, ease: "power2.inOut" });
  });
});

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Gestion du Clic dans la scène
window.addEventListener('click', (event) => {
  if (event.target.tagName !== 'CANVAS' || cameraEnMouvement || !jeuDemarre) return;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cabinetGroup.children, true);
  
  const objetTrouve = intersects.length > 0 ? trouverObjetJeu(intersects[0].object, "referenceFilm") : null;
  const armoireTrouvee = intersects.length > 0 ? trouverObjetJeu(intersects[0].object, "armoireFinale") : null;

  if (objetTrouve) {
    controls.enabled = false; 
    cameraEnMouvement = true; 
    objetEnCoursDExamen = objetTrouve.object;

    const positionAbsolue = new THREE.Vector3();
    objetTrouve.object.getWorldPosition(positionAbsolue);
    
    gsap.to(controls.target, { x: positionAbsolue.x, y: positionAbsolue.y, z: positionAbsolue.z, duration: 1, ease: "power2.out" });
    gsap.to(camera.position, { x: positionAbsolue.x, y: positionAbsolue.y, z: positionAbsolue.z + 1.5, duration: 1.5, ease: "power2.inOut",
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
      appliquerCouleur(armoireTrouvee.object, 0x00ff00);
      armoireTrouvee.object.name = "armoireTrouvee_Fini"; 
    }
  }
}); 

// Lancement du jeu (Play)
document.getElementById('bouton-play').addEventListener('click', () => {
  const menuEcran = document.getElementById('menu-ecran');
  menuEcran.style.opacity = '0';
  setTimeout(() => { menuEcran.style.display = 'none'; }, 1000);
  document.getElementById('compteur-score').style.display = 'block';

  cameraEnMouvement = true; 
  controls.enabled = false;

  gsap.to(camera.position, { x: 0, y: 0, z: -1, duration: 2.5, ease: "power2.inOut",
    onComplete: () => {
      cameraEnMouvement = false; 
      controls.enabled = true; 
      controls.update(); 
      jeuDemarre = true; 
    }
  });
  gsap.to(controls.target, { x: 0, y: -0.5, z: -4.5, duration: 2.5, ease: "power2.inOut" });
});

// ==============================================================================
// 7. BOUCLE D'ANIMATION ET HOVER
// ==============================================================================

let objetActuellementSurvole = null;
const couleurHover = 0x00aaff;

function animate() {
  requestAnimationFrame(animate);

  if (!cameraEnMouvement && jeuDemarre) {
    controls.update();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cabinetGroup.children, true);

    let validHoverTarget = intersects.length > 0 ? trouverObjetJeu(intersects[0].object, "referenceFilm") : null;
    if (!validHoverTarget && intersects.length > 0) {
      validHoverTarget = trouverObjetJeu(intersects[0].object, "armoireFinale");
    }

    if (validHoverTarget) {
      const nouvelObjet = validHoverTarget.object;
      if (objetActuellementSurvole !== nouvelObjet) {
        appliquerCouleur(objetActuellementSurvole, null); // Restaure l'ancien
        objetActuellementSurvole = nouvelObjet;
        appliquerCouleur(objetActuellementSurvole, couleurHover); // Colore le nouveau
        document.body.style.cursor = 'pointer'; 
      }
    } else {
      if (objetActuellementSurvole) {
        appliquerCouleur(objetActuellementSurvole, null);
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
});