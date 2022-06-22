import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";

import * as GUI from "@babylonjs/gui"
import * as BABYLON from "@babylonjs/core"
import { PlayerEntity } from "../entities/player";
import { Bullet } from "../entities/bullet";
import { Enemy } from "../entities/enemy";
import { BaseScene } from "../common/basescene";

// Возвращает случайное число между min и max
function _getRandomArbitrary(min, max): number {
    return Math.random() * (max - min) + min;
}

// Основная игровая сцена
export class GameScene extends BaseScene {    
    // Игрок
    _player: PlayerEntity

    // Враги
    _enemies = new Array<Enemy>()

    // Признак что игрок нажал на стрельбу
    _isFire: boolean

    // Уведомляет о попадании
    _onEnemyHit = new BABYLON.Observable<boolean>()

    // Отображает Game Over
    _showGameOver() {        
        let uiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
            "UI", true, this
        );

        let rect = new GUI.Rectangle("rect")
        rect.width = "400px"
        rect.height = "300px"
        rect.background = "#000000"

        let panel = new GUI.StackPanel("panel")
        panel.paddingTop = "40px"
        panel.width = "100%"
        panel.height = "100%"
        panel.isVertical = true

        let label = new GUI.TextBlock("text", "Игра окончена")
        label.color = "#FFFFFF"
        label.fontSize = "40pt"
        label.width = "100%"
        label.height = "80px"

        let button = GUI.Button.CreateSimpleButton("button", "Начать заного")
        button.paddingTop = "40px"
        button.width = "200px"
        button.height = "100px"
        button.color = "#FFFFFF"

        panel.addControl(label)
        panel.addControl(button)

        rect.addControl(panel)
        uiTexture.addControl(rect)

        button.onPointerClickObservable.add(x => {
            uiTexture.dispose()
        })
    }

    // Добавляет взрыв в определённое место
    _addExplosion(place: BABYLON.Vector3) {
        let particleSystem = new BABYLON.ParticleSystem("particles", 200, this)
        particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png")
        particleSystem.createSphereEmitter(0.1, 0)
        particleSystem.manualEmitCount = 2000
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 10;
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 0.9;
        particleSystem.updateSpeed = 0.03
        particleSystem.color1 = BABYLON.Color4.FromHexString("#FFAF02")
        particleSystem.emitter = place.clone()
        particleSystem.start();

        setTimeout(() => {
            particleSystem.dispose()
        }, 2000)
    }


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

        let line = BABYLON.MeshBuilder.CreateLines("lines", { points: myPoints });
        line.position.z = -200

        let time = 0
        let instances = []

        this.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            if (time > 100) {
                let nline = line.createInstance("nline")
                nline.position.x = _getRandomArbitrary(-15, 15)
                nline.position.y = _getRandomArbitrary(-15, 15)
                instances.push(nline)

                time = 0
            }

            instances.forEach((element, i) => {
                element.position.z += 0.2 * x.deltaTime
                if (element.position.z > 10) {
                    element.dispose()
                    instances.splice(i, 1);
                }
            });

            time += x.deltaTime
        })
    }

    // Создаёт графический интерфейс
    _createUi() {
        function formatNumber(val: number): string {
            let res = ["0", "0", "0", "0", "0", "0", "0",]
            for (let i = res.length - 1; i > 0; i--) {
                let frac = val % 10
                res[i] = frac.toString()
                val = Math.floor(val / 10)
            }

            return res.join("")
        }

        var uiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
            "UI", true, this
        );

        let panel = new GUI.StackPanel("panel")
        panel.isVertical = false
        panel.width = "160px"
        panel.height = "80px"
        panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

        let img = new GUI.Image("aim", "textures/aim.png")
        img.width = "28px"
        img.height = "28px"

        let score = 0

        let label = new GUI.TextBlock("text", formatNumber(score))
        label.width = "100px"
        label.height = "28px"
        label.paddingRight = "0px"
        label.color = "#FFFFFF"

        panel.addControl(img)
        panel.addControl(label)
        uiTexture.addControl(panel)

        this._onEnemyHit.add((_) => {
            score += 1
            label.text = formatNumber(score)
        })
    }

    // Создаёт корабль
    async _createPlayer() {
        this._player = new PlayerEntity(this)
        await this._player.init()

        let bullets = new Array<Bullet>()
        let enemies = this._enemies
        let scene = this

        // Обрабатывает выстрел
        this._player.fireObservable.add(async x => {
            let bullet = new Bullet(this)
            await bullet.init()
            bullet.position = this._player.position.clone()
            bullets.push(bullet)
        })

        this.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            for (let i = 0; i < bullets.length; i++) {
                let bullet = bullets[i]
                bullet.position.z -= 0.05 * x.deltaTime

                for (let y = 0; y < enemies.length; y++) {
                    let enemy = enemies[y]
                    // Обрабатывает попадание снаряда по врагу
                    if (bullet.intersectsEntity(enemy)) {
                        scene._addExplosion(enemy.position)
                        enemy.dispose()
                        bullet.dispose()
                        bullets.splice(i, 1)
                        enemies.splice(y, 1)
                        i--
                        y--

                        scene._onEnemyHit.notifyObservers(true)
                    }
                }

                if (bullet.position.z < -100) {
                    bullet.dispose()
                    bullets.splice(i, 1);
                    i--
                }
            }
        })
    }

    // Создаёт врагов
    async _createEnemySpawner() {
        let enemies = this._enemies

        let wasInstanced = false

        let scene = this

        async function addEnemyInstance() {
            let enemy = new Enemy(scene)
            await enemy.init()
            enemy.position.x = _getRandomArbitrary(-5, 5)
            enemy.position.y = _getRandomArbitrary(-5, 5)
            enemy.position.z = -150 + _getRandomArbitrary(0, 40)
            enemies.push(enemy)
            wasInstanced = true
        }

        for (var i = 0; i < 5; i++) {
            addEnemyInstance()
        }

        let ticker = 0
        let player = this._player

        this.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            // После инстансинга нельзя проверять intersectsMesh, будут неправильно проверятся коллизии
            if (!wasInstanced) {
                for (let i = 0; i < enemies.length; i++) {
                    let enemy = enemies[i]
                    if (player.intersectsEntity(enemy)) {
                        this._addExplosion(player.position.clone())
                        player.dispose()
                        enemy.dispose()
                        enemies.splice(i, 1);

                        scene._showGameOver()
                    }

                    enemy.position.z += 0.01 * x.deltaTime
                    if (enemy.position.z > 10) {
                        this._addExplosion(player.position.clone())
                        this._addExplosion(enemy.position.clone())
                        player.dispose()
                        enemy.dispose()
                        enemies.splice(i, 1);
                        scene._showGameOver()
                        i--
                    }
                }
            } else {
                wasInstanced = false
            }

            if (ticker > 2500) {
                addEnemyInstance()
                ticker = 0
            }

            ticker += x.deltaTime
        })
    }

    // Конструктор
    constructor() {
        super()
    }

    // Загружает сцену
    async load(): Promise<void> {
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 2.5), this);
        camera.position = new BABYLON.Vector3(0, 3, 20)

        var light = new BABYLON.HemisphericLight("point", new BABYLON.Vector3(0.1, 0.4, -1), this);

        this._createEnvironment()
        await this._createPlayer()
        await this._createEnemySpawner()
        this._createUi()

        //this._showGameOver()

        // this.debugLayer.show({
        //     embedMode: true
        // })
    }
}