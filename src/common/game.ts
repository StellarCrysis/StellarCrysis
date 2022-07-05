import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "./basescene";
import { BaseState } from "./basestate";
import { Localizator } from "./localizator";

// Класс игры
export class Game {
    // Инстанс игры
    static instance = new Game()

    // Текущее состояние
    private _state: BaseState

    // Вид загрузки
    private _loaderView: HTMLElement

    // Текст загрузки
    private _loaderCaption: HTMLElement

    // HTML канвас игры
    view: HTMLCanvasElement

    // Игровой движок
    engine: BABYLON.Engine

    // Конструктор
    private constructor() {
        this.view = document.getElementById("view") as HTMLCanvasElement
        this.engine = new BABYLON.Engine(this.view, true)

        this._loaderView = document.getElementById("loader")
        this._loaderCaption = document.getElementById("loader-caption")
    }

    // Отображает загрузчик
    showLoader() {
        this._loaderView.style.display = "block"
        this._loaderCaption.innerText = Localizator.getString("loading")
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