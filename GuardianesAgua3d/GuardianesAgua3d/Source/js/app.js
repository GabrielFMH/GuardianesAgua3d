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

        this.createWaterPlatform();
        this.createWaterLilies();
        this.createWaterDrops();
        this.createEducationalSigns();

        this.createWaterPlatform();
        this.createSun();
        this.createClouds();
        this.createFence();

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

        this.createWildFlowers();
        this.createRocks();
        this.createFountain();
        this.createPaths();
        this.createTrash();

        cargarObstacles(this.scene, this.collisions);
        cargarAssets(this.scene, this.collisions);
        cargarPlatforms(this.scene, this.collisions);
    }

    createWaterPlatform() {
        const waterRadius = 200;
        const waterGeometry = new THREE.CylinderGeometry(waterRadius, waterRadius, 8, 64);
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x33bfff,
            transparent: true,
            opacity: 0.7,
            shininess: 120,
            reflectivity: 1,
            emissive: 0x2277bb
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.set(0, 4, 0);
        water.receiveShadow = true;
        this.scene.add(water);

        const outlineGeometry = new THREE.CylinderGeometry(waterRadius + 3, waterRadius + 3, 10, 64);
        const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x005577, side: THREE.BackSide, opacity: 0.5, transparent: true });
        const waterOutline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        waterOutline.position.copy(water.position);
        this.scene.add(waterOutline);

        this.collisions.push({
            xMin: -waterRadius,
            xMax: waterRadius,
            yMin: 0,
            yMax: 8,
            zMin: -waterRadius,
            zMax: waterRadius
        });
    }

    createWaterLilies() {
        const lilyCount = 7;
        const waterRadius = 180;
        this.lilies = [];
        for (let i = 0; i < lilyCount; i++) {
            const angle = (i / lilyCount) * Math.PI * 2;
            const radius = waterRadius * 0.7 * (0.7 + Math.random() * 0.3);
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const geometry = new THREE.CircleGeometry(18 + Math.random() * 8, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0x7ed957,
                shininess: 60,
                side: THREE.DoubleSide
            });
            const lily = new THREE.Mesh(geometry, material);
            lily.position.set(x, 8.5, z);
            lily.rotation.x = -Math.PI / 2;
            this.scene.add(lily);
            this.lilies.push({ mesh: lily, baseY: lily.position.y, floatPhase: Math.random() * Math.PI * 2 });
        }
    }

    createWaterDrops() {
        this.waterDrops = [];
        const dropCount = 5;
        const waterRadius = 170;
        for (let i = 0; i < dropCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = waterRadius * 0.7 * (0.5 + Math.random() * 0.5);
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const geometry = new THREE.SphereGeometry(8, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00cfff,
                shininess: 100,
                transparent: true,
                opacity: 0.85
            });
            const drop = new THREE.Mesh(geometry, material);
            drop.position.set(x, 16, z);
            drop.userData.isWaterDrop = true;
            this.scene.add(drop);
            this.waterDrops.push(drop);
        }
    }

    createEducationalSigns() {
        const signs = [
            { text: "¡Cuida el agua, es vida!", position: [250, 30, 0], rotationY: Math.PI / 4 },
            { text: "No la desperdicies", position: [-250, 30, 200], rotationY: -Math.PI / 6 },
            { text: "El agua es un recurso limitado", position: [0, 30, -250], rotationY: 0 }
        ];

        this.signMeshes = [];

        signs.forEach(sign => {
            const panelGeometry = new THREE.BoxGeometry(120, 40, 4);
            const panelMaterial = new THREE.MeshPhongMaterial({ color: 0xf5f5dc });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);

            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f5f5dc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = 'bold 36px Arial';
            ctx.fillStyle = '#2266aa';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sign.text, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            const textMaterial = new THREE.MeshBasicMaterial({ map: texture });
            const textMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(110, 30),
                textMaterial
            );
            textMesh.position.z = 2.5;

            const group = new THREE.Group();
            group.add(panel);
            group.add(textMesh);

            group.position.set(...sign.position);
            group.rotation.y = sign.rotationY;
            this.scene.add(group);
            this.signMeshes.push(group);
        });
    }

    createWildFlowers() {
        const flowerCount = 15;
        for (let i = 0; i < flowerCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 350 + Math.random() * 400;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const stemGeometry = new THREE.CylinderGeometry(1.5, 1, 18, 8);
            const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.set(x, 9, z);

            const petalGeometry = new THREE.SphereGeometry(4, 12, 12);
            const petalMaterial = new THREE.MeshPhongMaterial({ color: 0xffc0cb });
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            petal.position.set(x, 18, z);

            this.scene.add(stem);
            this.scene.add(petal);
        }
    }

    createRocks() {
        const rockCount = 10;
        for (let i = 0; i < rockCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 320 + Math.random() * 400;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const scale = 10 + Math.random() * 18;
            const geometry = new THREE.DodecahedronGeometry(scale, 0);
            const material = new THREE.MeshPhongMaterial({
                color: 0x888888,
                flatShading: true
            });
            const rock = new THREE.Mesh(geometry, material);

            rock.position.set(x, scale / 2, z);
            rock.rotation.y = Math.random() * Math.PI;
            rock.rotation.x = Math.random() * 0.3;

            this.scene.add(rock);
        }
    }

    createFountain() {
        const baseGeometry = new THREE.CylinderGeometry(30, 30, 8, 32);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(-350, 4, 350);
        this.scene.add(base);

        const waterGeometry = new THREE.CylinderGeometry(20, 20, 4, 32);
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x33bfff,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.set(-350, 10, 350);
        this.scene.add(water);

        const jetGeometry = new THREE.CylinderGeometry(2, 2, 30, 16);
        const jetMaterial = new THREE.MeshPhongMaterial({
            color: 0x33bfff,
            transparent: true,
            opacity: 0.6
        });
        this.fountainJet = new THREE.Mesh(jetGeometry, jetMaterial);
        this.fountainJet.position.set(-350, 25, 350);
        this.scene.add(this.fountainJet);
    }

    createPaths() {
        const pathGeometry = new THREE.PlaneGeometry(80, 400);
        const pathMaterial = new THREE.MeshToonMaterial({ color: 0xc2b280 });
        const path = new THREE.Mesh(pathGeometry, pathMaterial);
        path.rotation.x = -Math.PI / 2;
        path.position.set(0, 0.1, 250);
        this.scene.add(path);

        const path2Geometry = new THREE.PlaneGeometry(60, 300);
        const path2 = new THREE.Mesh(path2Geometry, pathMaterial);
        path2.rotation.x = -Math.PI / 2;
        path2.position.set(-250, 0.1, 0);
        path2.rotation.z = Math.PI / 12;
        this.scene.add(path2);
    }

    createTrash() {
        this.trashItems = [];
        const trashTypes = [
            { color: 0xaaaaaa, scale: [6, 12, 6] },
            { color: 0x888888, scale: [8, 4, 8] },
            { color: 0x2266cc, scale: [10, 2, 10] }
        ];
        const trashCount = 6;
        const waterRadius = 200;
        for (let i = 0; i < trashCount; i++) {
            const type = trashTypes[i % trashTypes.length];
            const angle = Math.random() * Math.PI * 2;
            const radius = waterRadius + 40 + Math.random() * 60;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const geometry = new THREE.BoxGeometry(...type.scale);
            const material = new THREE.MeshPhongMaterial({ color: type.color });
            const trash = new THREE.Mesh(geometry, material);
            trash.position.set(x, type.scale[1] / 2, z);
            trash.userData.isTrash = true;
            this.scene.add(trash);
            this.trashItems.push(trash);
        }
    }

    createClouds() {
        this.clouds = [];
        const cloudCount = 14;
        for (let i = 0; i < cloudCount; i++) {
            const group = new THREE.Group();
            const baseX = -600 + Math.random() * 1200;
            const baseZ = -600 + Math.random() * 1200;
            const baseY = 420 + Math.random() * 120;

            for (let j = 0; j < 3 + Math.floor(Math.random() * 3); j++) {
                const geo = new THREE.SphereGeometry(30 + Math.random() * 18, 16, 16);
                const mat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(
                    (j - 1) * 28 + Math.random() * 10,
                    Math.random() * 10,
                    Math.random() * 10
                );
                group.add(mesh);
            }
            group.position.set(baseX, baseY, baseZ);
            this.scene.add(group);
            this.clouds.push({ group, baseX, baseZ, floatPhase: Math.random() * Math.PI * 2 });
        }
    }

    createSun() {
        const sunGeometry = new THREE.SphereGeometry(60, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfff700 });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(500, 700, -800);
        this.scene.add(this.sun);

        const rayCount = 18;
        const rayLength = 110;
        const rayWidth = 12;
        const rayMaterial = new THREE.MeshBasicMaterial({ color: 0xfff700 });
        this.sunRays = [];
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            const geometry = new THREE.CylinderGeometry(2, 6, rayLength, 8);
            const ray = new THREE.Mesh(geometry, rayMaterial);
            ray.position.set(
                this.sun.position.x + Math.cos(angle) * 90,
                this.sun.position.y + Math.sin(angle) * 90,
                this.sun.position.z
            );
            ray.rotation.z = angle;
            this.scene.add(ray);
            this.sunRays.push(ray);
        }

        const sunlight = new THREE.DirectionalLight(0xfff700, 1.2);
        sunlight.position.copy(this.sun.position);
        sunlight.target.position.set(0, 0, 0);
        this.scene.add(sunlight);
    }

    createFence() {
        const fenceLength = 1800;
        const fenceWidth = 1800;
        const postHeight = 60;
        const postRadius = 5;
        const railHeight = 32
        const railRadius = 3;
        const postMaterial = new THREE.MeshPhongMaterial({ color: 0x8b5a2b });
        const railMaterial = new THREE.MeshPhongMaterial({ color: 0xc2b280 });

        const corners = [
            [-fenceLength / 2, 0, -fenceWidth / 2],
            [fenceLength / 2, 0, -fenceWidth / 2],
            [fenceLength / 2, 0, fenceWidth / 2],
            [-fenceLength / 2, 0, fenceWidth / 2]
        ];

        for (let i = 0; i < 4; i++) {
            const start = corners[i];
            const end = corners[(i + 1) % 4];
            const dx = (end[0] - start[0]);
            const dz = (end[2] - start[2]);
            const length = Math.sqrt(dx * dx + dz * dz);
            const segments = Math.floor(length / 50);

            for (let j = 0; j <= segments; j++) {
                const x = start[0] + (dx * j) / segments;
                const z = start[2] + (dz * j) / segments;
                const post = new THREE.Mesh(
                    new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 10),
                    postMaterial
                );
                post.position.set(x, postHeight / 2, z);
                this.scene.add(post);
            }

            for (let h = 0; h < 2; h++) {
                const rail = new THREE.Mesh(
                    new THREE.CylinderGeometry(railRadius, railRadius, length, 10),
                    railMaterial
                );
                rail.position.set(
                    (start[0] + end[0]) / 2,
                    18 + h * 18,
                    (start[2] + end[2]) / 2
                );
                rail.rotation.y = Math.atan2(dz, dx);
                rail.rotation.z = Math.PI / 2;
                this.scene.add(rail);
            }
        }
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
        if (this.lilies) {
            const t = performance.now() * 0.001;
            this.lilies.forEach(lily => {
                lily.mesh.position.y = lily.baseY + Math.sin(t + lily.floatPhase) * 0.8;
            });
        }

        if (this.clouds) {
            const t = performance.now() * 0.00015;
            this.clouds.forEach(cloud => {
                cloud.group.position.x = cloud.baseX + Math.sin(t + cloud.floatPhase) * 40;
                cloud.group.position.z = cloud.baseZ + Math.cos(t + cloud.floatPhase) * 40;
            });
        }

        if (this.trashItems) {
            const playerPos = this.character.rotationPoint.position;
            this.trashItems = this.trashItems.filter(trash => {
                const dist = trash.position.distanceTo(playerPos);
                if (dist < 30) { 
                    this.scene.remove(trash);
                    if (!this.collectedTrash) this.collectedTrash = 0;
                    this.collectedTrash++;
                    console.log(`🗑️ Basura recogida. Total: ${this.collectedTrash}`);
                    if (this.collectedTrash === 6) {
                        setTimeout(() => {
                            alert("¡Felicidades! Has limpiado toda la basura del entorno.");
                        }, 300);
                    }
                    return false;
                }
                return true;
            });
        }

        if (typeof document !== "undefined" && document.getElementById("trash-score")) {
            document.getElementById("trash-score").textContent = `🗑️ ${this.collectedTrash || 0}`;
        }

        if (this.fountainJet) {
            this.fountainJet.scale.y = 1 + Math.sin(performance.now() * 0.004) * 0.2;
        }

        if (typeof document !== "undefined" && document.getElementById("score")) {
            document.getElementById("score").textContent = `💧 ${this.collectedDrops || 0}`;
        }

        if (this.waterDrops) {
            const playerPos = this.character.rotationPoint.position;
            this.waterDrops = this.waterDrops.filter(drop => {
                const dist = drop.position.distanceTo(playerPos);
                if (dist < 30) { 
                    this.scene.remove(drop);
                    if (!this.collectedDrops) this.collectedDrops = 0;
                    this.collectedDrops++;
                    console.log(`💧 Gota recogida. Total: ${this.collectedDrops}`);
                    return false;
                }
                return true;
            });
        }

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