import { Game } from "./common/game"
import { Localizator } from "./common/localizator"
import { MainMenuState } from "./states/mainmenustate"

// Входная точка
class Index {
    // Запускает
    async start() {
        Localizator.setLocale("ru")
        Localizator.setLocaleData(
            new Map<string, Map<string, string>>([
                ["ru", new Map<string, string>([
                    ["start_game", "Начать игру"]
                ])]
            ])
        )


        let mainMenuState = new MainMenuState()
        Game.instance.setState(mainMenuState)
    }
}

const index = new Index()
index.start()