import * as GUI from "@babylonjs/gui"
import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "../common/basescene";

// Основная игровая сцена
export class MainMenuScene extends BaseScene {
    // Обозреватель нажатия
    onNewGameClick: BABYLON.Observable<GUI.Vector2WithInfo>

    uiTexture: GUI.AdvancedDynamicTexture

    // Загружает сцену
    async load(): Promise<void> {
        this.clearColor = new BABYLON.Color4(0, 0, 0)

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 2.5), this);

        this.uiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
            "UI", true, this
        )

        let image = new GUI.Image("background", "textures/main_menu_back.png")
        image.width = "800px"
        image.height = "600px"

        let button = GUI.Button.CreateSimpleButton("button", "Начать игру")
        button.paddingTop = "40px"
        button.width = "200px"
        button.height = "100px"
        button.color = "#FFFFFF"

        this.onNewGameClick = button.onPointerClickObservable

        this.uiTexture.addControl(image)
        this.uiTexture.addControl(button)
    }
}