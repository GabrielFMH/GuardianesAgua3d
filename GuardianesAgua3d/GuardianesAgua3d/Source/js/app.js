console.log("✅ app.js cargado correctamente");

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Character from './Models/Character.js';
import Tree from './Models/Tree.js';
import InputController from './Controllers/InputController.js';
import { detectCollisions, calculateCollisionPoints } from './Utils/Collision.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Obstacles from './Models/Obstacles.js';
import Assets from './Models/Assets.js';
import Platforms from './Models/Platforms.js';

function cargarObstacles(scene, collisions) {
    Obstacles.forEach(obstacle => {
        cargarGLBAsset(obstacle, scene, collisions);
    });
}

function cargarAssets(scene, collisions) {
    Obstacles.forEach(assets => {
        cargarGLBAsset(assets, scene, collisions);
    });
}

function cargarPlatforms(scene, collisions) {
    Obstacles.forEach(platforms => {
        cargarGLBAsset(platforms, scene, collisions);
    });
}

function cargarGLBAsset(asset, scene, collisions, onLoaded) {
    const loader = new GLTFLoader();
    loader.load(asset.file, (gltf) => {
        const model = gltf.scene;
        if (asset.position) model.position.set(...asset.position);
        if (asset.scale) model.scale.set(...asset.scale);
        scene.add(model);
        const collisionBox = calculateCollisionPoints(model);
        collisions.push(collisionBox);
        if (onLoaded) onLoaded(model);
    }, undefined, (error) => {
        console.error('Error cargando el modelo GLB:', error);
    });
}

class GameApp {
    constructor() {
        this.playerSpeed = 25;
        this.container = document.getElementById('game-container');
        this.setupScene();
        this.createWorld();
        this.setupControls();
        this.setupKeyboard(); // 👈 Agregado para detectar salto
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
        this.interactiveObjects = [];

        this.character = new Character();
        this.character.addToScene(this.scene);
        this.camera.lookAt(this.character.rotationPoint.position);
        this.character.rotationPoint.add(this.camera);

        const floorGeo = new THREE.PlaneGeometry(10000, 10000);
        const floorMat = new THREE.MeshToonMaterial({ color: 0x336633 });
        this.floor = new THREE.Mesh(floorGeo, floorMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.scene.add(this.floor);
        this.interactiveObjects.push(this.floor);

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

        cargarObstacles(this.scene, this.collisions);
        cargarAssets(this.scene, this.collisions);
        cargarPlatforms(this.scene, this.collisions);
    }

    setupControls() {
        this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.cameraControls.enablePan = true;
        this.cameraControls.maxDistance = 1000;
        this.cameraControls.minDistance = 60;
        this.cameraControls.target.copy(new THREE.Vector3(0, this.character.characterSize / 2, 0));

        this.inputController = new InputController(
            this.camera,
            this.renderer,
            this.scene,
            this.interactiveObjects,
            this.character.rotationPoint
        );
    }

    // 👇 Agregado para detectar salto con espacio
    setupKeyboard() {
        window.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                this.character.jump();
            }
        });
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
        if (this.character.modelLoaded) {
            this.cameraControls.target.copy(this.character.rotationPoint.position);
            this.character.update(); // asegura que salte solo si cargó
        }
        this.cameraControls.update();
        this.inputController.update();
        this.character.update(); // 👈 Agregado para aplicar la física del salto

        if (this.inputController.movements.length > 0) {
            const destination = this.inputController.movements[0];
            const playerPosition = this.character.rotationPoint.position;
            const distanceToDestination = playerPosition.distanceTo(destination);

            if (distanceToDestination < this.playerSpeed) {
                playerPosition.copy(destination);
                this.inputController.stopMovement();
            } else {
                const direction = destination.clone().sub(playerPosition).normalize();
                playerPosition.add(direction.multiplyScalar(this.playerSpeed));
            }
        }

        const playerBounds = this.character.getBounds();

        detectCollisions(playerBounds, this.collisions, (collidedWith) => {
            this.inputController.stopMovement();

            const playerPosition = this.character.rotationPoint.position;
            const playerCenterX = (playerBounds.xMax + playerBounds.xMin) / 2;
            const playerCenterZ = (playerBounds.zMax + playerBounds.zMin) / 2;
            const objectCenterX = (collidedWith.xMax + collidedWith.xMin) / 2;
            const objectCenterZ = (collidedWith.zMax + collidedWith.zMin) / 2;
            const diffX = playerCenterX - objectCenterX;
            const diffZ = playerCenterZ - objectCenterZ;

            const pushbackStrength = 1.5;
            if (Math.abs(diffX) > Math.abs(diffZ)) {
                playerPosition.x += Math.sign(diffX) * pushbackStrength;
            } else {
                playerPosition.z += Math.sign(diffZ) * pushbackStrength;
            }
        });
    }
}

new GameApp();