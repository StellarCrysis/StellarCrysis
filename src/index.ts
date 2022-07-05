import { Game } from "./common/game"
import { Localizator } from "./common/localizator"
import { MainMenuState } from "./states/mainmenustate"

// Входная точка
class Index {
    // Запускает
    async start() {
        Localizator.setLocale("en")
        Localizator.setLocaleData(
            new Map<string, Map<string, string>>([
                ["ru", new Map<string, string>([
                    ["startgame", "Начать игру"],
                    ["loading", "Загружается..."],
                    ["gameover", "Игра окончена"],
                    ["restart", "Начать заного"],
                ])],
                ["en", new Map<string, string>([
                    ["startgame", "Start Game"],
                    ["loading", "Loading..."],
                    ["gameover", "Game Over"],
                    ["restart", "Restart"],
                ])]
            ])
        )

        let mainMenuState = new MainMenuState()
        Game.instance.setState(mainMenuState)
    }
}

const index = new Index()
index.start()