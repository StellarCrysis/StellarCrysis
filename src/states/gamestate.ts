import { BaseState } from "../common/basestate";
import { GameScene } from "../scenes/gamescene";
import { LoadScene } from "../scenes/loadscene";

// Состояние игры
export class GameState extends BaseState {
    // Сцена загрузки
    _loadScreen: LoadScene

    // Показывает сцену загрузки
    async _showLoadScene(): Promise<void> {
        this._loadScreen = new LoadScene()
        await this.loadScene(this._loadScreen)
    }

    // Скрывает сцену загрузки
    _hideLoadScene() {
        this.removeScene(this._loadScreen)
    }

    // Инициализирует
    async init(): Promise<void> {
        await this._showLoadScene()

        let gameScene = new GameScene()
        await this.loadScene(gameScene)

        this._hideLoadScene()
    }

}