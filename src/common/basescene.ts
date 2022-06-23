import * as BABYLON from "@babylonjs/core"
import { Disposer } from "./disposer"
import { Game } from "./game"

// Базовая сцена
export abstract class BaseScene extends BABYLON.Scene {    
    // Освобождает ресурсы
    protected disposer = new Disposer()

    // Конструктор
    constructor() {
        super(Game.instance.engine)
    }

    // Загружает сцену
    abstract load(): Promise<void>    

    // Освобождает ресурсы
    override dispose(): void {        
        this.disposer.disposeAll()        
        super.dispose()
    }
}