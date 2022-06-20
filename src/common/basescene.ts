import * as BABYLON from "@babylonjs/core"

// Базовая сцена
export abstract class BaseScene extends BABYLON.Scene {
    // Заходит в сцену
    abstract enter(): Promise<void>

    // Выходит из сцены
    abstract leave(): Promise<void>
}