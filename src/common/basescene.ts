import * as BABYLON from "@babylonjs/core"
import { Disposer } from "./disposer"
import { Game } from "./game"

// Базовая сцена
export abstract class BaseScene extends BABYLON.Scene {
    // Конструктор
    constructor() {
        super(Game.instance.engine)
    }

    // Загружает сцену
    abstract load(): Promise<void>
}