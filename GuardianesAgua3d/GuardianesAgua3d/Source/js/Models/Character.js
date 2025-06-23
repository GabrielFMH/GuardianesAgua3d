// js/Models/Character.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Character {
    constructor() {
        this.characterSize = 50;
        this.rotationPoint = new THREE.Object3D();
        this.rotationPoint.position.set(0, 0, 0);

        this.modelLoaded = false;
        this.jumpVelocity = 0;
        this.isJumping = false;

        const loader = new GLTFLoader();
        loader.load('/Source/3dmodels/PersonajePrincipal.glb', (gltf) => {
            console.log("✅ Modelo del personaje cargado:", gltf);
            this.box = gltf.scene;

            this.box.scale.set(15, 15, 15);
            this.box.updateMatrixWorld(true);

            const bbox = new THREE.Box3().setFromObject(this.box);
            const height = bbox.max.y - bbox.min.y;
            this.box.position.y = -bbox.min.y;

            this.rotationPoint.add(this.box);
            this.modelLoaded = true;
        }, undefined, (error) => {
            console.error("❌ Error cargando modelo del personaje:", error);
        });
    }

    addToScene(scene) {
        scene.add(this.rotationPoint);
    }

    getBounds() {
        const boxSize = this.characterSize;
        return {
            xMin: this.rotationPoint.position.x - boxSize / 2,
            xMax: this.rotationPoint.position.x + boxSize / 2,
            yMin: this.rotationPoint.position.y,
            yMax: this.rotationPoint.position.y + boxSize,
            zMin: this.rotationPoint.position.z - boxSize / 2,
            zMax: this.rotationPoint.position.z + boxSize / 2,
        };
    }

    // 🚀 Salto más potente
    jump() {
        if (!this.isJumping) {
            this.jumpVelocity = 8.0; // fuerza inicial aumentada
            this.isJumping = true;
        }
    }

    // 📉 Caída más suave
    update() {
        if (this.isJumping && this.box) {
            this.jumpVelocity -= 0.10; // gravedad reducida
            this.rotationPoint.position.y += this.jumpVelocity;

            if (this.rotationPoint.position.y <= 0) {
                this.rotationPoint.position.y = 0;
                this.jumpVelocity = 0;
                this.isJumping = false;
            }
        }
    }
}
