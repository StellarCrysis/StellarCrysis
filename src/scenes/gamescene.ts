import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";

import * as GUI from "@babylonjs/gui"
import * as BABYLON from "@babylonjs/core"

// Возвращает случайное число между min и max
function _getRandomArbitrary(min, max): number {
    return Math.random() * (max - min) + min;
}

// Основная игровая сцена
export class GameScene extends BABYLON.Scene {
    _view: HTMLCanvasElement

    // Меш игрока
    _ship: BABYLON.AbstractMesh

    // Вектор для перемещения игрока
    _inputVector: BABYLON.Vector3

    _enemies = new Array<BABYLON.AbstractMesh>()

    _isFire: boolean

    // Создаёт окружение
    _createEnvironment() {
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 500 }, this);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/skybox", this);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        const myPoints = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 5),
        ]

        // let line = BABYLON.MeshBuilder.CreateLines("lines", { points: myPoints });
        // line.position.z = -200

        // let time = 0
        // let instances = []

        // this.onBeforeRenderObservable.add(x => {
        //     if (x.deltaTime == undefined)
        //         return;

        //     if (time > 100) {
        //         let nline = line.createInstance("nline")
        //         nline.position.x = _getRandomArbitrary(-15, 15)
        //         nline.position.y = _getRandomArbitrary(-15, 15)
        //         instances.push(nline)

        //         time = 0
        //     }

        //     instances.forEach((element, i) => {
        //         element.position.z += 0.2 * x.deltaTime
        //         if (element.position.z > 10) {
        //             element.dispose()
        //             instances.splice(i, 1);
        //         }
        //     });

        //     time += x.deltaTime
        // })
    }

    // Создаёт корабль
    async _createShip() {
        let result = await BABYLON.SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "ship.glb",
            this
        )

        // Создаёт выхлоп из движка корабля
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
                
        this._ship = result.meshes[0].getChildren()[0] as BABYLON.InstancedMesh
        this._ship.setParent(null)
        this._ship.checkCollisions = true

        //shipMesh.dispose()

        // Загружает выстрел
        result = await BABYLON.SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "particle.glb",
            this
        )

        let particle = result.meshes[0].getChildren()[0] as BABYLON.InstancedMesh
        particle.rotate(BABYLON.Axis.Y, BABYLON.Angle.FromDegrees(90).radians())
        particle.position.z = 0
        particle.setEnabled(false)

        // Обрабатывает движение корабля и стрельбу
        let angleZ = 0
        let angleX = 0
        let fireTime = 0

        let particles = new Array<BABYLON.AbstractMesh>()
        let enemies = this._enemies

        this.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            this._ship.position.x += this._inputVector.x * x.deltaTime * 0.005;
            this._ship.position.y += this._inputVector.y * x.deltaTime * 0.005;

            angleZ = BABYLON.Scalar.Lerp(angleZ, -10 * (this._inputVector.x) * 0.0174533, 0.1)
            angleX = BABYLON.Scalar.Lerp(angleX, -10 * (this._inputVector.y) * 0.0174533, 0.1)
            this._ship.rotation = this._ship.rotation.set(angleX, 0, 180 * 0.0174533 + angleZ)

            if (this._isFire && fireTime <= 0) {
                fireTime = 600
                particle.setEnabled(true)
                let instance = particle.createInstance("part")
                instance.checkCollisions = true
                instance.position = this._ship.position.clone()
                particles.push(instance)
                particle.setEnabled(false)
            }

            particles.forEach((element, i) => {
                element.position.z -= 0.05 * x.deltaTime

                enemies.forEach((en, ei) => {
                    if (element.intersectsMesh(en)) {
                        en.dispose()
                        element.dispose()
                        particles.splice(i, 1)
                        enemies.splice(ei, 1)
                    }
                })

                if (element.position.z < -100) {
                    element.dispose()
                    particles.splice(i, 1);
                }
            });

            fireTime -= x.deltaTime
        })

        // Обрабатывает ввод от игрока
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
                        case "Space":
                            this._isFire = true
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
                        case "Space":
                            this._isFire = false
                            break;
                        default:
                            //console.log(x.event.code)
                            break;
                    }

                    break;
            }
        });
    }

    // Создаёт врагов
    async _createEnemySpawner() {
        let result = await BABYLON.SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "enemy.glb",
            this,
        )

        let enemy = result.meshes[0].getChildren()[0] as BABYLON.InstancedMesh
        enemy.setParent(null)
        enemy.rotate(BABYLON.Axis.Y, BABYLON.Angle.FromDegrees(180).radians())
        enemy.position.z = -100        
        enemy.checkCollisions = true
        enemy.setEnabled(false)

        let enemies = this._enemies

        function addEnemyInstance() {
            enemy.setEnabled(true)
            let instance = enemy.createInstance("inst")
            instance.position.x = _getRandomArbitrary(-5, 5)
            instance.position.y = _getRandomArbitrary(-5, 5)
            instance.position.z += instance.position.z + _getRandomArbitrary(0, 40)
            enemies.push(instance)
            enemy.setEnabled(false)
        }

        for (var i = 0; i < 5; i++) {
            addEnemyInstance()
        }

        let ticker = 0
        let ship = this._ship

        this.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            if (ticker > 2500) {
                addEnemyInstance()
                ticker = 0
            }


            enemies.forEach((element, i) => {
                element.position.z += 0.01 * x.deltaTime
                if (element.position.z > 10) {
                    element.dispose()
                    enemies.splice(i, 1);
                }

                // if (ship.intersectsMesh(element)) {
                //     ship.dispose()
                //     element.dispose()
                //     enemies.splice(i, 1);
                // }
            });

            ticker += x.deltaTime
        })
    }

    constructor(engine, view) {
        super(engine)

        this._view = view
        this._inputVector = new BABYLON.Vector3(0, 0, 0)
    }

    async enter(): Promise<void> {
        this.collisionsEnabled = true

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 2.5), this);
        camera.position = new BABYLON.Vector3(0, 3, 20)

        var light = new BABYLON.HemisphericLight("point", new BABYLON.Vector3(0.1, 0.4, -1), this);

        this._createEnvironment()
        await this._createShip()
        await this._createEnemySpawner()

        this.debugLayer.show({
            embedMode: true
        });
    }
}