import { Game } from "./common/game"
import { LoadScene } from "./scenes/loadscene"
import { MainMenuState } from "./states/mainmenustate"

// Входная точка
class Index {
    // Запускает
    async start() {
        let mainMenuState = new MainMenuState()
        // let loaderScene = new LoadScene()
        // await loaderScene.load()
        // Game.instance.setLoaderScene(loaderScene)
        Game.instance.setState(mainMenuState)
    }
}

const index = new Index()
index.start()