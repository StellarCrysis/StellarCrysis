import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "./basescene"
import { Disposer } from "./disposer"

// Абстрактная сущность
export abstract class Entity {
    // Освобождает ресурсы
    protected disposer = new Disposer()

    // Сцена
    protected _scene: BaseScene

    // Мех который определяет границы сущности
    abstract get boundingMesh(): BABYLON.AbstractMesh

    // Инициализирует
    abstract init(): Promise<void>

    // Конструктор
    constructor(scene: BaseScene) {
        this._scene = scene
    }

    // Проверяет столкновение с другой сущностью
    intersectsEntity(entity: Entity): boolean {
        return this.boundingMesh.intersectsMesh(entity.boundingMesh)
    }

    // Освобождает ресурсы
    dispose() {
        this.disposer.disposeAll()
    }
}