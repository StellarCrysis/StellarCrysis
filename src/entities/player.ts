import * as BABYLON from "@babylonjs/core"
import { Entity } from "../common/entity"

// Игрок
export class PlayerEntity extends Entity {
    // Мех корабля
    _mesh: BABYLON.AbstractMesh

    // Выхлоп от двигателя
    _particleSystem: BABYLON.ParticleSystem

    // Менеджер спрайтов
    _spriteManager: BABYLON.SpriteManager

    // Вектор для перемещения игрока
    _inputVector = new BABYLON.Vector3(0, 0, 0)

    // Признак что нажата кнопка стрельбы
    _isFire: boolean

    // Обозреватель стрельбы
    fireObservable = new BABYLON.Observable<boolean>()

    // Возвращает мех который определяет границы сущности
    get boundingMesh(): BABYLON.AbstractMesh {
        return this._mesh
    }

    // Позиция сущности
    get position(): BABYLON.Vector3 {
        return this._mesh.position
    }

    set position(v: BABYLON.Vector3) {
        this._mesh.position = v
    }

    // Инициализирует
    override async init(): Promise<void> {
        let scene = this._scene

        let result = await BABYLON.SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "ship.glb",
            scene
        )

        // Создаёт выхлоп из движка корабля
        let particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene)
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

        this._particleSystem = particleSystem
        this.disposer.addDisposableToDispose(this._particleSystem)

        // Движение выхлопа
        this.disposer.addObserverToDispose(scene.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            let pos = this._mesh.position.clone()
            pos.z = 2
            particleSystem.emitter = pos;
        }))

        this._mesh = result.meshes[0].getChildMeshes()[0] as BABYLON.InstancedMesh
        this._mesh.setParent(null)
        this.disposer.addDisposableToDispose(this._mesh)


        // Добавляет прицел
        this._spriteManager = new BABYLON.SpriteManager("aimManager", "textures/aim.png", 10, { width: 154, height: 150 }, this._scene)
        this.disposer.addDisposableToDispose(this._spriteManager)
        let aimSprite = new BABYLON.Sprite("tree", this._spriteManager)
        aimSprite.width = 1
        aimSprite.height = 1
        aimSprite.position = new BABYLON.Vector3(0, 0, -10)

        scene.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            let pos = this._mesh.position.clone()
            pos.z = -15
            aimSprite.position = pos;
        })


        // Обрабатывает движение корабля и стрельбу
        let angleZ = 0
        let angleX = 0
        let fireTime = 0

        let player = this

        this.disposer.addObserverToDispose(scene.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            player._mesh.position.x += player._inputVector.x * x.deltaTime * 0.005;
            player._mesh.position.y += player._inputVector.y * x.deltaTime * 0.005;

            angleZ = BABYLON.Scalar.Lerp(angleZ, -10 * (player._inputVector.x) * 0.0174533, 0.1)
            angleX = BABYLON.Scalar.Lerp(angleX, -10 * (player._inputVector.y) * 0.0174533, 0.1)
            player._mesh.rotation = player._mesh.rotation.set(angleX, 0, 180 * 0.0174533 + angleZ)

            if (this._isFire && fireTime <= 0) {
                fireTime = 600
                this.fireObservable.notifyObservers(true)
            }

            fireTime -= x.deltaTime
        }))

        // Обрабатывает ввод от игрока
        this.disposer.addObserverToDispose(scene.onKeyboardObservable.add(x => {
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
                            break;
                    }

                    break;
            }
        }))
    }
}