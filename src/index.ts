import { Game } from "./common/game"
import { MainMenuState } from "./states/mainmenustate"

// Входная точка
class Index {
    // Запускает
    start() {
        let mainMenuState = new MainMenuState()
        Game.instance.setState(mainMenuState)
    }
}

const index = new Index()
index.start()