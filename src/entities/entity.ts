import * as BABYLON from "@babylonjs/core"

// Абстрактная сущность
export abstract class Entity {
    // Сцена
    _scene: BABYLON.Scene

    // Мех который определяет границы сущности
    abstract get boundingMesh(): BABYLON.AbstractMesh

    // Инициализирует
    abstract init(): Promise<void>

    // Конструктор
    constructor(scene: BABYLON.Scene) {
        this._scene = scene
    }

    // Проверяет столкновение с другой сущностью
    intersectsEntity(entity: Entity): boolean {
        return this.boundingMesh.intersectsMesh(entity.boundingMesh)
    }

    // Освобождает ресурсы
    dispose() { }
}