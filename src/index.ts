import { Scene,Engine } from "@babylonjs/core"
import { GameScene } from "./scenes/gamescene"

// Входная точка
class Index {
    _engine: Engine   
    _scene : Scene 

    // Запускает
    start() {
        const view = document.getElementById("view") as HTMLCanvasElement
        this._engine = new Engine(view, true)

        let gameScene = new GameScene(this._engine, view)
        this._scene = gameScene
        gameScene.enter().then(_ => {
            this._engine.runRenderLoop(() => {
                this._scene.render()
            })
        })        
    }
}

const index = new Index()
index.start()