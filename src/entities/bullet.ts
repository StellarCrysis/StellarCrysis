import * as BABYLON from "@babylonjs/core"
import { Entity } from "./entity";

// Снаряд
export class Bullet extends Entity {
    // Мэх из которого создаются другие мехи
    static _instanceCreator: BABYLON.InstancedMesh

    // Мех снаряда
    _mesh: BABYLON.AbstractMesh

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
        // Создаёт создателя снарядов
        if (Bullet._instanceCreator == null) {
            // Загружает снаряд
            let result = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "./models/",
                "particle.glb",
                this._scene
            )

            // Снаряд
            Bullet._instanceCreator = result.meshes[0].getChildren()[0] as BABYLON.InstancedMesh
            Bullet._instanceCreator.rotate(BABYLON.Axis.Y, BABYLON.Angle.FromDegrees(90).radians())
            Bullet._instanceCreator.position.z = -1000
            Bullet._instanceCreator.setEnabled(false)
        }

        this._mesh = Bullet._instanceCreator.createInstance("bullet")
    }

    // Освобождает ресурсы
    override dispose(): void {
        this._mesh.dispose()
    }
}