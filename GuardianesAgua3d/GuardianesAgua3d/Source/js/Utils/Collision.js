// js/Utils/Collision.js

import * as THREE from 'three'; // Importa Three.js si es necesario

/**
 * Calcula los puntos de colisión para una malla.
 */
export function calculateCollisionPoints(mesh) {
    const bbox = new THREE.Box3().setFromObject(mesh);
    return {
        type: 'collision',
        xMin: bbox.min.x,
        xMax: bbox.max.x,
        yMin: bbox.min.y,
        yMax: bbox.max.y,
        zMin: bbox.min.z,
        zMax: bbox.max.z,
    };
}

/**
 * Detecta colisiones entre el jugador y una lista de objetos.
 */
export function detectCollisions(playerBounds, collisionObjects, onCollision) {
    for (const object of collisionObjects) {
        if (object.type !== 'collision') continue;

        const collides = (playerBounds.xMin <= object.xMax && playerBounds.xMax >= object.xMin) &&
            (playerBounds.yMin <= object.yMax && playerBounds.yMax >= object.yMin) &&
            (playerBounds.zMin <= object.zMax && playerBounds.zMax >= object.zMin);

        if (collides) {
            onCollision(object);
            // Podríamos retornar aquí si solo nos interesa la primera colisión
        }
    }
}