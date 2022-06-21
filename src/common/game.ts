import * as BABYLON from "@babylonjs/core"
import { BaseState } from "./basestate";

// Класс игры
export class Game {
    // Инстанс игры
    static instance = new Game()

    // Текущее состояние
    private _state: BaseState

    // HTML канвас игры
    view: HTMLCanvasElement

    // Игровой движок
    engine: BABYLON.Engine    

    // Конструктор
    private constructor() {
        this.view = document.getElementById("view") as HTMLCanvasElement
        this.engine = new BABYLON.Engine(this.view, true)
    }

    // Устанавливает состояние
    setState(state: BaseState): Promise<void> {
        // Освобождает предыдущее состояние
        if (this._state != null)
            this._state.dispose()

        return state.init()
    }
}