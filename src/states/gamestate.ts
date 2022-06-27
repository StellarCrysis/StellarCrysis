import { BaseState } from "../common/basestate";
import { Game } from "../common/game";
import { GameScene } from "../scenes/gamescene";

// Состояние игры
export class GameState extends BaseState {        
    // Инициализирует
    async init(): Promise<void> {
        Game.instance.showLoader()

        let gameScene = new GameScene()
        this.disposer.addObserverToDispose(gameScene.onRestartGameObservable.add(async _ => {
            this.removeScene(gameScene)

            await this.init();
        }))
        
        await this.loadScene(gameScene)        

        Game.instance.hideLoader()
    }
}