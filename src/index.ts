import { Game } from "./common/game"
import { GameState } from "./states/gamestate"
//import { Game } from "./scenes/gamescene"

// Входная точка
class Index {
    // Запускает
    start() {
        let gameState = new GameState()
        Game.instance.setState(gameState)
    }
}

const index = new Index()
index.start()