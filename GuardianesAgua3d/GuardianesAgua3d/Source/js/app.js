/// <reference path="orbitcontrols.js" />
// js/app.js

import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js'; // Importar desde jsm
import Character from './Models/Character.js';
import Tree from './Models/Tree.js';
import InputController from './Controllers/InputController.js';
import { detectCollisions } from './Utils/Collision.js';

class GameApp {
    constructor() {
        this.container = document.getElementById('game-container');
        this.setupScene();
        this.createWorld();
        this.setupControls();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xccddff);
        this.scene.fog = new THREE.Fog(0xccddff, 500, 2000);

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 20000);
        this.camera.position.z = -300;
        this.camera.position.y = 200;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambient);
        const hemisphereLight = new THREE.HemisphereLight(0xdddddd, 0x000000, 0.5);
        this.scene.add(hemisphereLight);

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    createWorld() {
        this.collisions = [];
        this.interactiveObjects = []; // Objetos con los que el raycaster puede intersectar

        // Personaje
        this.character = new Character();
        this.character.addToScene(this.scene);
        this.camera.lookAt(this.character.rotationPoint.position);
        this.character.box.add(this.camera); // Hacemos la cámara hija del cubo del personaje

        // Suelo
        const floorGeo = new THREE.PlaneBufferGeometry(10000, 10000);
        const floorMat = new THREE.MeshToonMaterial({ color: 0x336633 });
        this.floor = new THREE.Mesh(floorGeo, floorMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.scene.add(this.floor);
        this.interactiveObjects.push(this.floor);

        // Árboles
        this.trees = [
            new Tree(300, 300),
            new Tree(800, -300),
            new Tree(-300, 800),
            new Tree(-800, -800)
        ];
        this.trees.forEach(tree => {
            tree.addToScene(this.scene);
            this.collisions.push(...tree.collisionBounds);
        });
    }

    setupControls() {
        // Controlador de cámara
        this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.cameraControls.enablePan = true;
        this.cameraControls.maxDistance = 1000;
        this.cameraControls.minDistance = 60;
        this.cameraControls.target.copy(new THREE.Vector3(0, this.character.characterSize / 2, 0));

        // Controlador de Input
        this.inputController = new InputController(this.camera, this.renderer, this.scene, this.interactiveObjects);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.update();
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        this.cameraControls.update();

        // Lógica de movimiento
        if (this.inputController.movements.length > 0) {
            const destination = this.inputController.movements[0];
            // Tu función `move` iría aquí, adaptada para usar `this.character.rotationPoint`
            // move(this.character.rotationPoint, destination);
        }

        // Lógica de colisión
        const playerBounds = this.character.getBounds();
        detectCollisions(playerBounds, this.collisions, (collidedWith) => {
            console.log("Collision detected!");
            this.inputController.stopMovement();
            // Lógica para empujar al jugador fuera del objeto
        });
    }
}

// Iniciar la aplicación
new GameApp();