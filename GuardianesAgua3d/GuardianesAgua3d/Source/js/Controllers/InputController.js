import * as THREE from 'three';

export default class InputController {
    constructor(camera, renderer, scene, objectsToIntersect, controlledObject) {
        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;
        this.objectsToIntersect = objectsToIntersect; // ej: [floor]
        this.controlledObject = controlledObject; // The object to move

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.movements = [];
        this.clickTimer = null;

        // Movement state
        this.moveState = { forward: false, backward: false, left: false, right: false };
        this.moveSpeed = 0.2; // Adjust as needed

        //document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        //document.addEventListener('touchstart', this.onTouchStart.bind(this), false);

        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    onKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
                this.moveState.forward = true;
                break;
            case 's':
                this.moveState.backward = true;
                break;
            case 'a':
                this.moveState.left = true;
                break;
            case 'd':
                this.moveState.right = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.key.toLowerCase()) {
            case 'w':
                this.moveState.forward = false;
                break;
            case 's':
                this.moveState.backward = false;
                break;
            case 'a':
                this.moveState.left = false;
                break;
            case 'd':
                this.moveState.right = false;
                break;
        }
    }

    update() {
        if (!this.controlledObject) return;

        const direction = new THREE.Vector3();
        if (this.moveState.forward) direction.z -= 1;
        if (this.moveState.backward) direction.z += 1;
        if (this.moveState.left) direction.x -= 1;
        if (this.moveState.right) direction.x += 1;

        if (direction.lengthSq() > 0) {
            direction.normalize();
            this.controlledObject.position.add(direction.multiplyScalar(this.moveSpeed));
        }
    }

    stopMovement() {
        this.movements = [];
        // La lógica para quitar el indicador de la escena podría ir aquí
        // o ser manejada por otra clase.
    }
}