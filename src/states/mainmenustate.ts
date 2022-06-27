import { BaseState } from "../common/basestate";
import { Game } from "../common/game";
import { MainMenuScene } from "../scenes/mainmenuscene";
import { GameState } from "./gamestate";

// Состояние главного меню
export class MainMenuState extends BaseState {        
    // Инициализирует
    async init(): Promise<void> {
        Game.instance.showLoader()
        
         let mainMenuScene = new MainMenuScene();
         await this.loadScene(mainMenuScene)

        Game.instance.hideLoader()

        this.disposer.addObserverToDispose(mainMenuScene.onNewGameClick.add(async _ => {
            let gameState = new GameState()
            await Game.instance.setState(gameState)            
        }))                
    }
}