import * as BABYLON from "@babylonjs/core"
import { SpawnedEntity } from "../common/spawnedentity";

// Снаряд
export class Bullet extends SpawnedEntity {
    // Мех снаряда
    _mesh: BABYLON.InstancedMesh

    // Возвращает мех который определяет границы сущности
    get boundingMesh(): BABYLON.AbstractMesh {
        return this._mesh
    }

    // Позиция сущности
    get position(): BABYLON.Vector3 {
        return this._mesh.position
    }

    set position(v: BABYLON.Vector3) {
        this._mesh.position = v
    }

    // Инициализирует
    override async init(): Promise<void> {
        this._mesh = this._spawner.recycle()
    }

    // Освобождает
    override dispose(): void {
        this._spawner.release(this._mesh)
    }
}