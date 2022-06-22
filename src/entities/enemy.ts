import * as BABYLON from "@babylonjs/core"
import { Entity } from "../common/entity";

// Сущность врага
export class Enemy extends Entity {
    // Мэх из которого создаются другие мехи
    static _instanceCreator: BABYLON.InstancedMesh

    // Мех снаряда
    _mesh: BABYLON.AbstractMesh

    // Позиция сущности
    get position(): BABYLON.Vector3 {
        return this._mesh.position
    }

    set position(v: BABYLON.Vector3) {
        this._mesh.position = v
    }

    // Возвращает мех который определяет границы сущности
    get boundingMesh(): BABYLON.AbstractMesh {
        return this._mesh
    }

    // Инициализирует
    override async init(): Promise<void> {
        if (Enemy._instanceCreator != null && Enemy._instanceCreator._scene != this._scene) {
            Enemy._instanceCreator.dispose()
            Enemy._instanceCreator = null
        }

        // Создаёт создателя снарядов
        if (Enemy._instanceCreator == null) {
            let result = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "./models/",
                "enemy.glb",
                this._scene,
            )

            let enemy = result.meshes[0].getChildMeshes()[0] as BABYLON.InstancedMesh
            enemy.setParent(null)
            enemy.rotate(BABYLON.Axis.Y, BABYLON.Angle.FromDegrees(180).radians())
            enemy.position.z = -1000
            enemy.setEnabled(false)
            Enemy._instanceCreator = enemy
        }

        this._mesh = Enemy._instanceCreator.createInstance("enemy")
        this.disposer.addDisposableToDispose(this._mesh)        
    }
}