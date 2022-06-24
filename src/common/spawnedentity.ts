import { BaseScene } from "./basescene";
import { Entity } from "./entity";
import { MeshSpawner } from "./meshspawner";

// Абстрактная сущность порождающаяся Spawner-ом
export abstract class SpawnedEntity extends Entity {
    // Порождает меши
    _spawner: MeshSpawner

    // Конструктор
    constructor(spawner: MeshSpawner, scene: BaseScene) {
        super(scene)

        this._spawner = spawner
    }
}