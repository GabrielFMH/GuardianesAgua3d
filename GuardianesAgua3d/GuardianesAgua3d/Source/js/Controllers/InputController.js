// js/Controllers/InputController.js
import * as THREE from 'three';

export default class InputController {
    constructor(camera, renderer, scene, objectsToIntersect) {
        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;
        this.objectsToIntersect = objectsToIntersect; // ej: [floor]

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.movements = []; // Almacena el punto de destino
        this.clickTimer = null;

        // Bindeamos los eventos para mantener el contexto de 'this'
        document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        document.addEventListener('touchstart', this.onTouchStart.bind(this), false);
    }

    onMouseDown(event, bypass = false) {
        event.preventDefault();
        if (event.which !== 3 && bypass === false) return;

        this.stopMovement();

        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.objectsToIntersect);

        if (intersects.length > 0) {
            this.movements.push(intersects[0].point);
        }
    }

    onTouchStart(event) {
        event.preventDefault();
        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        const bypass = this.detectDoubleTouch();
        this.onMouseDown(event, bypass);
    }

    detectDoubleTouch() {
        if (!this.clickTimer) {
            this.clickTimer = setTimeout(() => { this.clickTimer = null; }, 300);
            return false;
        } else {
            clearTimeout(this.clickTimer);
            this.clickTimer = null;
            return true;
        }
    }

    stopMovement() {
        this.movements = [];
        // La lógica para quitar el indicador de la escena podría ir aquí
        // o ser manejada por otra clase.
    }
}