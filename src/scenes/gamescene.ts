import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";

import * as GUI from "@babylonjs/gui"
import * as BABYLON from "@babylonjs/core"

// Основная игровая сцена
export class GameScene extends BABYLON.Scene {
    _view: HTMLCanvasElement

    _ship: BABYLON.AbstractMesh

    _inputVector: BABYLON.Vector3

    // Создаёт космос
    _createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 100 }, this);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/skybox", this);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    // Создаёт корабль
    async _createShip() {
        let result = await BABYLON.SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "ship.glb",
            this
        )

        const particleSystem = new BABYLON.ParticleSystem("particles", 2000, this)
        particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png")
        particleSystem.emitter = new BABYLON.Vector3(0, 0, 2)
        particleSystem.start();

        particleSystem.minSize = 0.5
        particleSystem.maxSize = 1

        particleSystem.direction1 = new BABYLON.Vector3(0, 1, 10)
        particleSystem.direction2 = new BABYLON.Vector3(0, -1, 10)

        particleSystem.minLifeTime = 0.01
        particleSystem.maxLifeTime = 0.3

        particleSystem.emitRate = 500;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, 0)
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0)

        this.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            let pos = this._ship.position.clone()
            pos.z = 2
            particleSystem.emitter = pos;
        })

        this._ship = result.meshes[0]
    }

    constructor(engine, view) {
        super(engine)

        this._view = view
        this._inputVector = new BABYLON.Vector3(0, 0, 0)
    }

    async enter(): Promise<void> {
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 2.5), this);
        camera.position = new BABYLON.Vector3(0, 3, 20)
        var light = new BABYLON.HemisphericLight("point", new BABYLON.Vector3(0.1, 0.4, -1), this);

        this._createSkybox()

        await this._createShip()

        let angleZ = 0
        let angleX = 0
        this.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            this._ship.position.x += this._inputVector.x * x.deltaTime * 0.005;
            this._ship.position.y += this._inputVector.y * x.deltaTime * 0.005;

            angleZ = BABYLON.Scalar.Lerp(angleZ, 10 * (this._inputVector.x) * 0.0174533, 0.1)
            angleX = BABYLON.Scalar.Lerp(angleX, 10 * (this._inputVector.y) * 0.0174533, 0.1)
            this._ship.rotation = this._ship.rotation.set(angleX, 180 * 0.0174533, angleZ)
        })

        this.onKeyboardObservable.add(x => {

            switch (x.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    switch (x.event.code) {
                        case "KeyW":
                            this._inputVector.y = 1
                            break;
                        case "KeyS":
                            this._inputVector.y = -1
                            break;
                        case "KeyA":
                            this._inputVector.x = 1
                            break;
                        case "KeyD":
                            this._inputVector.x = -1
                            break;
                    }

                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    switch (x.event.code) {
                        case "KeyW":
                        case "KeyS":
                            this._inputVector.y = 0
                            break;
                        case "KeyA":
                        case "KeyD":
                            this._inputVector.x = 0
                            break;
                    }

                    break;
            }
        });

        // this.debugLayer.show({
        //     embedMode: true
        // });
    }
}