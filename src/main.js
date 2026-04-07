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

// ==============================================================================
// 2. CONTRÔLES DE LA CAMÉRA ET OUTILS
// ==============================================================================

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; 

// --- LES LIMITES DE LA CAMÉRA (Sur mesure pour le grenier !) ---
controls.maxDistance = 7; // Assez de recul pour l'armoire
controls.minDistance = 1; 

// 1. Limite Haut / Bas (Plancher et Toit)
// Math.PI / 3 (soit 60 degrés) empêche la caméra de s'élever au-delà de Y=3. 
// Comme le bord de ton toit est à Y=4, tu ne passeras plus jamais au travers !
controls.minPolarAngle = Math.PI / 3; 
controls.maxPolarAngle = (Math.PI / 2) - 0.05; // Butée contre le plancher

// 2. Limite Gauche / Droite (Plus stricte pour contrer le grand angle !)
// On passe à Math.PI / 8 (soit environ 22 degrés de chaque côté).
// Ça laisse largement la place d'inspecter l'armoire, sans risquer de voir à travers les murs.
controls.minAzimuthAngle = -Math.PI / 8; 
controls.maxAzimuthAngle = Math.PI / 8;

// 💡 NOUVEAU : Blocage de la rotation derrière l'armoire
// 0 = face à l'armoire. On autorise 60 degrés de chaque côté (Math.PI / 3)
controls.minAzimuthAngle = -Math.PI / 3; // Limite à gauche
controls.maxAzimuthAngle = Math.PI / 3;  // Limite à droite

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
// 3. LE MANAGER DE CHARGEMENT (Loading Screen)
// ==============================================================================

const manager = new THREE.LoadingManager();

const ecranChargement = document.getElementById('ecran-chargement');
const texteChargement = document.getElementById('texte-chargement');
const boutonPlay = document.getElementById('bouton-play');

if (boutonPlay) boutonPlay.style.display = 'none';

manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const pourcentage = Math.round((itemsLoaded / itemsTotal) * 100);
  if (texteChargement) texteChargement.innerText = `Chargement en cours : ${pourcentage}%`;
};

manager.onLoad = () => {
  if (ecranChargement) ecranChargement.style.display = 'none'; 
  if (boutonPlay) boutonPlay.style.display = 'block'; 
};

// ==============================================================================
// 4. CONSTRUCTION DE L'ENVIRONNEMENT (Les Combles de Narnia)
// ==============================================================================

const textureLoader = new THREE.TextureLoader(manager); // Connecté au manager

// --- TEXTURES DES MURS ET SOL ---

const texSol = textureLoader.load('/textures/plancher.png'); 
const texSolAO = textureLoader.load('/textures/plancher_ao.png'); 
const texSolNormal = textureLoader.load('/textures/plancher_normal.png'); 
const texSolRoughness = textureLoader.load('/textures/plancher_roughness.png'); 

const texMurDroit = textureLoader.load('/textures/mur_droite.png');
const texMurDroitao = textureLoader.load('/textures/mur_droite_ao.png');
const texMurDroitnormal = textureLoader.load('/textures/mur_droite_normal.png');
const texMurDroitroughness = textureLoader.load('/textures/mur_droite_roughness.png');

const texToit = textureLoader.load('/textures/mur_toit.png');
const texToitAO = textureLoader.load('/textures/mur_toit_ao.png');
const texToitNormal = textureLoader.load('/textures/mur_toit_normal.png');
const texToitRoughness = textureLoader.load('/textures/mur_toit_roughness.png');

const texMurFond = textureLoader.load('/textures/mur_fond.png');
const texMurFondAO = textureLoader.load('/textures/mur_fond_ao.png');
const texMurFondNormal = textureLoader.load('/textures/mur_fond_normal.png');
const texMurFondRoughness = textureLoader.load('/textures/mur_fond_roughness.png');

const listMapToRepeat = [texMurFond, texMurFondAO, texMurFondNormal, texMurFondRoughness];
listMapToRepeat.forEach(map => {
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(0.2, 0.1); 
});

const texMurGauche = textureLoader.load('/textures/mur_gauche.png');
const texMurGaucheAO = textureLoader.load('/textures/mur_gauche_ao.png');
const texMurGaucheNormal = textureLoader.load('/textures/mur_gauche_normal.png');
const texMurGaucheRoughness = textureLoader.load('/textures/mur_gauche_roughness.png');

const listMapGaucheToRepeat = [texMurGauche, texMurGaucheAO, texMurGaucheNormal, texMurGaucheRoughness];
listMapGaucheToRepeat.forEach(map => {
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(0.2, 0.2); 
});

// --- CRÉATION DES MATÉRIAUX ---

const solMat = new THREE.MeshStandardMaterial({ 
  color: 0x6e4a2a, map: texSol, aoMap: texSolAO, aoMapIntensity: 2.5,
  normalMap: texSolNormal, normalScale: new THREE.Vector2(1.7, 1.6), 
  roughnessMap: texSolRoughness, roughness: 1.11 
}); 

const murFondMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff, map: texMurFond, aoMap: texMurFondAO, aoMapIntensity: 1.9,
  normalMap: texMurFondNormal, normalScale: new THREE.Vector2(0.3, 2.4),
  roughnessMap: texMurFondRoughness, roughness: 1.29
}); 

const murDroitMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff, map: texMurDroit, aoMap: texMurDroitao, aoMapIntensity: 1.3, 
  normalMap: texMurDroitnormal, normalScale: new THREE.Vector2(2.7, 2.4), 
  roughnessMap: texMurDroitroughness, roughness: 1.23, side: THREE.DoubleSide 
}); 

const toitMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff, map: texToit, aoMap: texToitAO, aoMapIntensity: 1.7,
  normalMap: texToitNormal, normalScale: new THREE.Vector2(2, 1.7),
  roughnessMap: texToitRoughness, roughness: 1.19, side: THREE.DoubleSide 
}); 

const murGaucheMat = new THREE.MeshStandardMaterial({ 
  color: 0xffffff, map: texMurGauche, aoMap: texMurGaucheAO, aoMapIntensity: 1.9,
  normalMap: texMurGaucheNormal, normalScale: new THREE.Vector2(1.9, 1.9),
  roughnessMap: texMurGaucheRoughness, roughness: 1.39, side: THREE.DoubleSide 
}); 

const gui = new GUI(); 

// --- ASSEMBLAGE DE LA PIÈCE ---

const solGeo = new THREE.PlaneGeometry(10, 10);
solGeo.setAttribute('uv2', new THREE.BufferAttribute(solGeo.attributes.uv.array, 2));
const sol = new THREE.Mesh(solGeo, solMat);
sol.rotation.x = -Math.PI / 2; 
sol.position.y = -2.5; 
scene.add(sol);

const murFondShape = new THREE.Shape();
murFondShape.moveTo(-5, 0); murFondShape.lineTo(5, 0); murFondShape.lineTo(5, 4);  
murFondShape.lineTo(0, 7); murFondShape.lineTo(-5, 4); murFondShape.lineTo(-5, 0); 
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
murGaucheShape.moveTo(-5, 0); murGaucheShape.lineTo(5, 0);
murGaucheShape.lineTo(5, 4); murGaucheShape.lineTo(-5, 4);

const trouFenetre = new THREE.Path();
trouFenetre.moveTo(1.5, 1); trouFenetre.lineTo(4.5, 1);  
trouFenetre.lineTo(4.5, 3); trouFenetre.lineTo(1.5, 3);  
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

// ==============================================================================
// 5. LE "FAUX CIEL" ET LA VITRE SALE (FENÊTRE)
// ==============================================================================

// 1. Le ciel texturé de fond (Teinte validée !)
const texCiel = textureLoader.load('/textures/overcast_sky.jpg'); 
const cielPlancheGeo = new THREE.PlaneGeometry(5, 5);
const cielMat = new THREE.MeshBasicMaterial({ 
  color: 0xd3d3d3, // Ta teinte de ciel
  map: texCiel, 
  side: THREE.DoubleSide 
});
const cielMesh = new THREE.Mesh(cielPlancheGeo, cielMat);
cielMesh.position.set(-5.5, 0, -3); 
cielMesh.rotation.y = Math.PI / 2; 
scene.add(cielMesh);

// 2. La crasse PBR (Paramètres validés !)
const texVitreColor = textureLoader.load('/textures/Metal053B_1K-JPG_Color.jpg');
const texVitreNormal = textureLoader.load('/textures/Metal053B_1K-JPG_NormalGL.jpg'); 
const texVitreRoughness = textureLoader.load('/textures/Metal053B_1K-JPG_Roughness.jpg');
const texVitreMetalness = textureLoader.load('/textures/Metal053B_1K-JPG_Metalness.jpg');
const texVitreDisplacement = textureLoader.load('/textures/Metal053B_1K-JPG_Displacement.jpg');

const vitreMat = new THREE.MeshStandardMaterial({
  map: texVitreColor, 
  normalMap: texVitreNormal, 
  roughnessMap: texVitreRoughness,
  metalnessMap: texVitreMetalness, 
  displacementMap: texVitreDisplacement, 
  displacementScale: 0.5, // Ton relief
  transparent: true, 
  opacity: 0.96, // Ton niveau de crasse
  depthWrite: false, 
  side: THREE.DoubleSide
});

const vitreMesh = new THREE.Mesh(cielPlancheGeo, vitreMat);
vitreMesh.position.set(-4.95, 0, -3); 
vitreMesh.rotation.y = Math.PI / 2;
scene.add(vitreMesh);

// ==============================================================================
// 6. LUMIÈRES ET HALO
// ==============================================================================

const lumiereAmbiante = new THREE.AmbientLight(0xffffff, 0.3); 
scene.add(lumiereAmbiante);

const lumiereFenetre = new THREE.DirectionalLight(0xffddaa, 2.5); 
lumiereFenetre.position.set(-10, 2, -3); 
scene.add(lumiereFenetre);
lumiereFenetre.target.position.set(0, -1, -4.5);
scene.add(lumiereFenetre.target);

const lumiereRebond = new THREE.PointLight(0xffeedd, 2.5, 12);
lumiereRebond.position.set(0, 1, -2); 
scene.add(lumiereRebond);

const canvasRayon = document.createElement('canvas');
canvasRayon.width = 1; canvasRayon.height = 256;
const ctxRayon = canvasRayon.getContext('2d');
const gradientRayon = ctxRayon.createLinearGradient(0, 0, 0, 256);
gradientRayon.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
gradientRayon.addColorStop(1, 'rgba(255, 255, 255, 0)'); 
ctxRayon.fillStyle = gradientRayon; ctxRayon.fillRect(0, 0, 1, 256);
const texRayonFade = new THREE.CanvasTexture(canvasRayon);

const rayonGeo = new THREE.CylinderGeometry(1, 2.5, 8, 4, 1, true);
rayonGeo.rotateY(Math.PI / 4); rayonGeo.translate(0, -4, 0); rayonGeo.rotateX(-Math.PI / 2); 

const rayonMat = new THREE.MeshBasicMaterial({
  color: 0xffede6, map: texRayonFade, transparent: true, opacity: 0.07,
  blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
});

const rayonMesh = new THREE.Mesh(rayonGeo, rayonMat);
rayonMesh.position.set(-5, -0.5, -3); 
rayonMesh.scale.set(2, 1.5, 1.6);
scene.add(rayonMesh);

const cibleRayon = new THREE.Object3D();
cibleRayon.position.set(5, -2.5, -2.7); 
scene.add(cibleRayon);
rayonMesh.lookAt(cibleRayon.position);

// ==============================================================================
// 7. L'ARMOIRE ET LES OBJETS
// ==============================================================================

const cabinetGroup = new THREE.Group();
cabinetGroup.position.set(0, -2.5, -4.5); 
scene.add(cabinetGroup);

// 💡 LE CORRECTIF EST ICI : Configuration parfaite des chargeurs
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const gltfLoader = new GLTFLoader(manager); 
gltfLoader.setDRACOLoader(dracoLoader);

// Chargement de l'armoire
gltfLoader.load(
  '/modeles/armoire.glb', 
  (gltf) => {
    const armoire = gltf.scene;
    armoire.name = "armoireFinale";
    armoire.userData = {
      titreAttendu: "narnia",
      description: "Le Monde de Narnia. Une simple porte vers un univers magique et glacé..."
    };
    armoire.scale.set(5, 5, 5);
    armoire.position.set(0, 0, 0.5); 
    cabinetGroup.add(armoire);
  },
  undefined,
  (erreur) => console.error("Erreur armoire :", erreur)
);

// Base de données des objets
const listeObjets = [
  {
    fichier: '/modeles/anneau.glb', titre: 'Le Seigneur des Anneaux', description: 'Un anneau pour les gouverner tous...',
    pos: { x: -0.84, y: 2.68, z: 0 }, scale: 0.2, rot: { x: -0.00159, y: 2.5784, z: 0 }
  },
  {
    fichier: '/modeles/arthur.glb', titre: 'Arthur et les Minimoys', description: 'Une aventure minuscule dans le jardin...',
    pos: { x: 0.56, y: 0.9, z: 0.58 }, scale: 1, rot: { x: -1.49159, y: -0.00159, z: 0.3484 }
  },
  {
    fichier: '/modeles/avatar.glb', titre: 'Avatar', description: 'Bienvenue sur Pandora.',
    pos: { x: -0.05, y: 1.69, z: -0.09 }, scale: 1, rot: { x: 2.6584, y: 0.0284, z: 1.6184 }
  },
  {
    fichier: '/modeles/harry_potter.glb', titre: 'Harry Potter', description: 'Un jeune sorcier qui découvre le monde magique...',
    pos: { x: 0.27, y: 2.05, z: 0 }, scale: 0.5, rot: { x: 0, y: -0.29159, z: 0 }
  },
  {
    fichier: '/modeles/pan.glb', titre: 'Le labyrinthe de Pan', description: 'Un conte de fées sombre et fascinant...',
    pos: { x: -0.17, y: 2.68, z: 0 }, scale: 1, rot: { x: 0.1884, y: -0.45159, z: 0 }
  },
  {
    fichier: '/modeles/gremlins.glb', titre: 'Gremlins', description: 'Des créatures maléfiques qui vivent dans les ombres...',
    pos: { x: 0.71, y: 2.05, z: 0 }, scale: 0.55, rot: { x: 0, y: -0.85159, z: 0 }
  }
];

listeObjets.forEach((data) => {
  gltfLoader.load(
    data.fichier,
    (gltf) => {
      const modele = gltf.scene;
      modele.name = "referenceFilm"; 
      modele.userData = { titreAttendu: data.titre, description: data.description };
      modele.position.set(data.pos.x, data.pos.y, data.pos.z);
      modele.scale.set(data.scale, data.scale, data.scale);
      modele.rotation.set(data.rot.x, data.rot.y, data.rot.z); 
      cabinetGroup.add(modele);
    },
    undefined,
    (erreur) => console.error(`Erreur sur l'objet ${data.titre} :`, erreur)
  );
});

// ==============================================================================
// 8. FONCTIONS OUTILS (Raycaster & Couleurs)
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
// 9. SYSTÈME DE JEU (Logique, UI, Clics)
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
      controls.enabled = false; 
      cameraEnMouvement = true; 
      objetEnCoursDExamen = armoireTrouvee.object;

      gsap.to(controls.target, { x: 0, y: -0.5, z: -4.5, duration: 1, ease: "power2.out" });
      gsap.to(camera.position, { x: 0, y: 0, z: 1, duration: 1.5, ease: "power2.inOut",
        onComplete: () => {
          inputReponse.value = ''; 
          msgErreur.style.display = 'none'; 
          fenetreQuestion.style.display = 'block'; 
        }
      });
    }
  }
}); 

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
// 10. BOUCLE D'ANIMATION ET HOVER
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
      const distanceCamera = camera.position.distanceTo(cabinetGroup.position);
      if (distanceCamera > 6) {
        validHoverTarget = trouverObjetJeu(intersects[0].object, "armoireFinale");
      }
    }

    if (validHoverTarget) {
      const nouvelObjet = validHoverTarget.object;
      if (objetActuellementSurvole !== nouvelObjet) {
        appliquerCouleur(objetActuellementSurvole, null); 
        objetActuellementSurvole = nouvelObjet;
        appliquerCouleur(objetActuellementSurvole, couleurHover); 
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