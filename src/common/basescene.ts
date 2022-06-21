import * as BABYLON from "@babylonjs/core"
import { Game } from "./game"

// Базовая сцена
export abstract class BaseScene extends BABYLON.Scene {
    // Конструктор
    constructor() {
        super(Game.instance.engine)
    }

    // Заходит в сцену
    abstract enter(): Promise<void>
}