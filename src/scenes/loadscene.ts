import * as GUI from "@babylonjs/gui"
import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "../common/basescene";

// Сцена загрузки
export class LoadScene extends BaseScene {
    // Загружает сцену
    async load(): Promise<void> {
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 2.5), this);

        var uiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
            "UI", true, this
        )

        let label = new GUI.TextBlock("text", "Загружается...")
        //label.width = "200px"
        //label.height = "48px"
        //label.paddingRight = "0px"
        label.fontSize = "40pt"
        label.color = "#FFFFFF"

        uiTexture.addControl(label)
    }
}