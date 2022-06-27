import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "./basescene";
import { BaseState } from "./basestate";

// Класс игры
export class Game {
    // Инстанс игры
    static instance = new Game()

    // Текущее состояние
    private _state: BaseState

    // Вид загрузки
    private _loaderView: HTMLElement

    // HTML канвас игры
    view: HTMLCanvasElement

    // Игровой движок
    engine: BABYLON.Engine

    // Конструктор
    private constructor() {
        this.view = document.getElementById("view") as HTMLCanvasElement
        this.engine = new BABYLON.Engine(this.view, true)

        this._loaderView = document.getElementById("loader")
        //this._loaderEngine = new BABYLON.Engine(this.view, true)
    }

    // Отображает загрузчик
    showLoader() {
        this._loaderView.style.display = "block"
    }

    // Скрывает загрузчик
    hideLoader() {
        this._loaderView.style.display = "none"
    }

    // Устанавливает состояние
    setState(state: BaseState): Promise<void> {
        // Освобождает предыдущее состояние
        if (this._state != null) {
            this._state.dispose()
        }

        this._state = state
        return state.init()
    }
}