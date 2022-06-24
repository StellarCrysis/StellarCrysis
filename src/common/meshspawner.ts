import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "./basescene";

// Создаёт экземпляры мешей
export class MeshSpawner implements BABYLON.IDisposable {
    // Сцена
    private _scene: BaseScene

    // Загруженные меши
    private _spawnerMesh: BABYLON.InstancedMesh

    // Созданные инстансы
    private _spawned = new Array<BABYLON.InstancedMesh>()

    // Конструктор
    constructor(scene: BaseScene) {
        this._scene = scene
    }

    // Загружает
    async load(name: string, onLoad: ((m: BABYLON.InstancedMesh) => void) = null): Promise<void> {
        let result = await BABYLON.SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            name,
            this._scene,
        )

        this._spawnerMesh = result.meshes[0].getChildMeshes()[0] as BABYLON.InstancedMesh
        this._spawnerMesh.setParent(null)
        this._spawnerMesh.position.z = -1000
        this._spawnerMesh.setEnabled(false)

        if (onLoad != null)
            onLoad(this._spawnerMesh)
    }

    // Возвращает экземляр
    recycle(): BABYLON.InstancedMesh {
        for (let i = 0; i < this._spawned.length; i++) {
            let spawned = this._spawned[i]
            if (!spawned.isEnabled()) {
                spawned.position.z = -1000
                spawned.setEnabled(true)

                return spawned
            }
        }

        this._spawnerMesh.setEnabled(true)
        let newItem = this._spawnerMesh.createInstance("inst")
        this._spawnerMesh.setEnabled(false)

        this._spawned.push(newItem)
        return newItem
    }

    release(mesh: BABYLON.InstancedMesh) {
        let idx = this._spawned.indexOf(mesh)
        if (idx > -1)
            mesh.setEnabled(false)
    }

    // Освобождает ресурсы
    dispose(): void {
        this._spawned.forEach(x => {
            x.dispose()
        })

        this._spawnerMesh.dispose()
        this._spawnerMesh = null
        this._spawned = null
    }

}