import * as GUI from "@babylonjs/gui"
import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "../common/basescene";

// Основная игровая сцена
export class MainMenuScene extends BaseScene {
    // Обозреватель нажатия
    onNewGameClick : BABYLON.Observable<GUI.Vector2WithInfo>

    // Загружает сцену
    async load(): Promise<void> {
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 2.5), this);

        var uiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
            "UI", true, this
        )

        let button = GUI.Button.CreateSimpleButton("button", "Начать игру")
        button.paddingTop = "40px"
        button.width = "200px"
        button.height = "100px"
        button.color = "#FFFFFF"

        this.onNewGameClick = button.onPointerClickObservable

        uiTexture.addControl(button)
    }
}