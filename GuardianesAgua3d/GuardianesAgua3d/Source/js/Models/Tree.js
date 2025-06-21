// js/Models/Tree.js
import * as THREE from 'three';
import { calculateCollisionPoints } from '../Utils/Collision.js';

export default class Tree {
    constructor(posX, posZ) {
        this.objects = []; // Para las mallas del arbol (tronco, copa)
        this.collisionBounds = [];

        const characterSize = 50; // Podrías pasar esto como parámetro
        const outlineSize = characterSize * 0.05;
        const randomScale = (Math.random() * 3) + 0.8;
        const randomRotateY = Math.PI / (Math.floor((Math.random() * 32) + 1));

        // Tronco
        const trunkGeo = new THREE.CylinderGeometry(characterSize / 3.5, characterSize / 2.5, characterSize * 1.3, 8);
        const trunkMat = new THREE.MeshToonMaterial({ color: 0x664422 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(posX, ((characterSize * 1.3 * randomScale) / 2), posZ);
        trunk.scale.multiplyScalar(randomScale);

        // Copa
        const topGeo = new THREE.DodecahedronGeometry(characterSize);
        const topMat = new THREE.MeshToonMaterial({ color: 0x44aa44 });
        const treeTop = new THREE.Mesh(topGeo, topMat);
        treeTop.position.set(posX, trunk.position.y + characterSize * randomScale, posZ);
        treeTop.scale.multiplyScalar(randomScale);
        treeTop.rotation.y = randomRotateY;

        this.objects.push(trunk, treeTop);
        this.collisionBounds.push(calculateCollisionPoints(trunk));
        // Nota: podrías combinar la colisión del árbol en una sola caja si lo prefieres
    }

    addToScene(scene) {
        this.objects.forEach(obj => scene.add(obj));
    }
}