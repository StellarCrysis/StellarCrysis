import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "./basescene"
import { Disposer } from "./disposer"
import { Game } from "./game"

// Базовое состояние игры
export abstract class BaseState {
    // Освобождает ресурсы
    protected disposer = new Disposer()

    // Сцены
    _scenes = new Array<BaseScene>()

    // Функция рендеринга
    _renderLoop: () => void

    // Конструктор
    constructor() {
        this._renderLoop = () => {
            this._scenes.forEach(x => {
                x.render()
            })
        }

        Game.instance.engine.runRenderLoop(this._renderLoop)
    }

    // Загружает сцену и добавляет её
    loadScene(scene: BaseScene): Promise<void> {
        return scene.load().then(_ => {
            this.addScene(scene)
        })
    }

    // Добавляет сцену
    addScene(scene: BaseScene) {
        this._scenes.push(scene)
    }

    // Удаляет сцену
    removeScene(scene: BaseScene) {
        let index = this._scenes.indexOf(scene)
        if (index > -1) {
            scene.dispose()
            this._scenes.splice(index, 1)
        }
    }

    // Инициализирует состояние
    abstract init(): Promise<void>

    // Освобождает ресурсы
    dispose() {
        this.disposer.disposeAll()

        this._scenes.forEach(x => {
            x.dispose()
        })

        Game.instance.engine.stopRenderLoop(this._renderLoop)
        this._scenes = null
    }
}