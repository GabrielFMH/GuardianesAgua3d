// js/Models/Character.js

import * as THREE from 'three';

export default class Character {
    constructor() {
        this.characterSize = 50;
        const outlineSize = this.characterSize * 0.05;

        // El punto de rotación es el verdadero 'jugador' en la escena
        this.rotationPoint = new THREE.Object3D();
        this.rotationPoint.position.set(0, 0, 0);

        // Geometría del personaje
        const geometry = new THREE.BoxBufferGeometry(this.characterSize, this.characterSize, this.characterSize);
        const material = new THREE.MeshPhongMaterial({ color: 0x22dd88 });
        this.box = new THREE.Mesh(geometry, material);
        this.box.position.y = this.characterSize / 2;

        // Contorno
        const outline_geo = new THREE.BoxGeometry(this.characterSize + outlineSize, this.characterSize + outlineSize, this.characterSize + outlineSize);
        const outline_mat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
        const outline = new THREE.Mesh(outline_geo, outline_mat);

        this.box.add(outline);
        this.rotationPoint.add(this.box);
    }

    // Método para añadir a la escena
    addToScene(scene) {
        scene.add(this.rotationPoint);
    }

    // Método para obtener el bounding box para colisiones
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
}