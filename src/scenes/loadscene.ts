import * as GUI from "@babylonjs/gui"
import * as BABYLON from "@babylonjs/core"
import { BaseScene } from "../common/basescene";

// Сцена загрузки
export class LoadScene extends BaseScene {
    // Загружает сцену
    async load(): Promise<void> {
        this.clearColor = new BABYLON.Color4(0, 0, 0, 1)

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, -1.5, 0), this);
        camera.position = new BABYLON.Vector3(0, 0, -15)
        //camera.attachControl(Game.instance.view)

        const light1 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 1), this);
        const light2 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), this);
        light1.intensity = 0.75;
        light2.intensity = 0.5;

        let cube = BABYLON.MeshBuilder.CreateBox("box", {
            size: 1
        }, this)

        const frameRate = 1

        const xrotate = new BABYLON.Animation("xrotate", "rotation.x", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const yrotate = new BABYLON.Animation("xrotate", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const keyFrames = [];

        keyFrames.push({
            frame: 0,
            value: 2
        });

        keyFrames.push({
            frame: frameRate,
            value: -2
        });

        keyFrames.push({
            frame: 2 * frameRate,
            value: 2
        });

        xrotate.setKeys(keyFrames);
        yrotate.setKeys(keyFrames)

        cube.animations.push(xrotate);
        cube.animations.push(yrotate);

        this.beginAnimation(cube, 0, 2 * frameRate, true);

        var uiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
            "UI", true, this
        )

        let label = new GUI.TextBlock("text", "Загружается...")
        label.paddingTop = "30px"
        label.fontSize = "30pt"
        label.color = "#FFFFFF"

        uiTexture.addControl(label)
    }
}