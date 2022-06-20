import { BaseState } from "../common/basestate";
import { GameScene } from "../scenes/gamescene";

// Состояние игры
export class GameState extends BaseState {
    // Инициализирует
    async init(): Promise<void> {
        let gameScene = new GameScene(this._engine, this._view)
        this.addScene(gameScene)
    }

}