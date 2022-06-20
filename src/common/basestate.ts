import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "./basescene"

// Базовое состояние игры
export abstract class BaseState {
    // Контекст движка
    _engine: BABYLON.Engine

    // Основной вид
    _view: HTMLCanvasElement

    // Сцены
    _scenes = new Array<BaseScene>()

    // Функция рендеринга
    _renderLoop: () => void

    // Конструктор
    constructor(engine: BABYLON.Engine, view: HTMLCanvasElement) {
        this._engine = engine
        this._view = view

        this._renderLoop = () => {
            this._scenes.forEach(x => {
                x.render()
            })
        }

        this._engine.runRenderLoop(this._renderLoop)
    }

    // Добавляет сцену
    addScene(scene: BaseScene) {
        scene.enter().then(_ => {
            this._scenes.push(scene)
        })
    }

    // Удаляет сцену
    removeScene(scene: BaseScene) {
        let index = this._scenes.indexOf(scene)
        if (index > -1) {
            this._scenes.splice(index, 1)
            scene.dispose()
        }
    }

    // Инициализирует состояние
    abstract init(): Promise<void>

    // Освобождает ресурсы
    dispose() {
        this._scenes.forEach(x => {
            x.dispose()
        })

        this._engine.stopRenderLoop(this._renderLoop)
        this._scenes = null
    }
}