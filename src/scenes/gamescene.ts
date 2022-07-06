import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";

import * as GUI from "@babylonjs/gui"
import * as BABYLON from "@babylonjs/core"
import { PlayerEntity } from "../entities/player";
import { Bullet } from "../entities/bullet";
import { Enemy } from "../entities/enemy";
import { BaseScene } from "../common/basescene";
import { MeshSpawner } from "../common/meshspawner";
import { Localizator } from "../common/localizator";

// Возвращает случайное число между min и max
function _getRandomArbitrary(min, max): number {
    return Math.random() * (max - min) + min;
}

// Основная игровая сцена
export class GameScene extends BaseScene {
    // Звук взрыва
    _explosionSound: BABYLON.Sound

    // Звук нажатия
    _clickSound: BABYLON.Sound

    // Игрок
    _player: PlayerEntity

    // Враги
    _enemies = new Array<Enemy>()

    // Снаряды
    _bullets = new Array<Bullet>()

    // Признак что игрок нажал на стрельбу
    _isFire: boolean

    // Признак что игра завершена
    _isGameOver: boolean = false

    // Уведомляет о попадании
    _onEnemyHitObservable = new BABYLON.Observable<boolean>()

    // Уведомляет о том что игрок выбрал продолжить игру
    onRestartGameObservable = new BABYLON.Observable<boolean>()

    // Отображает Game Over
    _showGameOver() {
        this._isGameOver = true

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

        let label = new GUI.TextBlock("text", Localizator.getString("gameover"))
        label.color = "#FFFFFF"
        label.fontSize = "40pt"
        label.width = "100%"
        label.height = "80px"

        let button = GUI.Button.CreateSimpleButton("button", Localizator.getString("restart"))
        button.paddingTop = "40px"
        button.width = "200px"
        button.height = "100px"
        button.color = "#FFFFFF"

        panel.addControl(label)
        panel.addControl(button)

        rect.addControl(panel)
        uiTexture.addControl(rect)

        button.onPointerClickObservable.add(x => {
            this._clickSound.play()
            setTimeout(() => {
                this.onRestartGameObservable.notifyObservers(true)
            }, 500)
            button.onPointerClickObservable.clear()
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

        this._explosionSound.play()

        setTimeout(() => {
            particleSystem.dispose()
        }, 2000)
    }


    // Создаёт окружение
    async _createEnvironment() {
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 500 }, this)
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this)
        skyboxMaterial.backFaceCulling = false

        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/skybox", this)
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
        skybox.material = skyboxMaterial

        const myPoints = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 5),
        ]

        let line = BABYLON.MeshBuilder.CreateLines("lines", { points: myPoints })
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

        let uiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
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

        this._onEnemyHitObservable.add((_) => {
            score += 1
            label.text = formatNumber(score)
        })
    }

    // Создаёт корабль
    async _createPlayer() {
        this._player = new PlayerEntity(this)
        await this._player.init()

        let bullets = this._bullets
        let enemies = this._enemies
        let scene = this

        let bulletSpawner = new MeshSpawner(scene)
        await bulletSpawner.load("particle.glb", (m) => {
            m.rotate(BABYLON.Axis.Y, BABYLON.Angle.FromDegrees(90).radians())
        })

        var sound = new BABYLON.Sound("sound", "sound/sfx_sounds_impact8.wav", this, null, {
            loop: false,
            volume: 0.5
        });

        // Обрабатывает выстрел
        this._player.fireObservable.add(async x => {
            sound.play()
            let bullet = new Bullet(bulletSpawner, this)
            await bullet.init()
            bullet.position = this._player.position.clone()
            bullets.push(bullet)
        })

        // Обрабатывает логику снарядов
        this.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            bullets.forEach((bullet, bi) => {
                bullet.position.z -= 0.05 * x.deltaTime

                enemies.forEach((enemy, ei) => {
                    // Обрабатывает попадание снаряда по врагу
                    if (bullet.intersectsEntity(enemy)) {
                        scene._addExplosion(enemy.position)
                        enemy.dispose()
                        bullet.dispose()
                        bullets.splice(bi, 1)
                        enemies.splice(ei, 1)

                        scene._onEnemyHitObservable.notifyObservers(true)
                    }
                })

                // Обрабатывает выход снаряда за границы игровой области
                if (bullet.position.z < -100) {
                    bullet.dispose()
                    bullets.splice(bi, 1);
                }
            })
        })
    }

    // Создаёт врагов
    async _createEnemySpawner() {
        let enemies = this._enemies

        let wasInstanced = false
        let scene = this

        let enemySpawner = new MeshSpawner(scene)
        await enemySpawner.load("enemy.glb", (m) => {
            m.rotate(BABYLON.Axis.Y, BABYLON.Angle.FromDegrees(180).radians())
        })

        async function addEnemyInstance() {
            let enemy = new Enemy(enemySpawner, scene)
            await enemy.init()
            enemy.position.x = _getRandomArbitrary(-5, 5)
            enemy.position.y = _getRandomArbitrary(-5, 5)
            enemy.position.z = -150 + _getRandomArbitrary(0, 40)
            enemies.push(enemy)
            wasInstanced = true
        }

        for (let i = 0; i < 5; i++) {
            addEnemyInstance()
        }

        let ticker = 0
        let player = this._player

        // Обрабатывает логику вражеских кораблей
        this.onBeforeRenderObservable.add(x => {
            if (x.deltaTime == undefined)
                return;

            // После инстансинга нельзя проверять intersectsMesh, будут неправильно проверятся коллизии
            if (!wasInstanced) {
                enemies.forEach((enemy, ei) => {
                    // Столкновение игрока с врагом
                    if (!scene._isGameOver && (player.intersectsEntity(enemy))) {
                        this._addExplosion(player.position.clone())
                        player.dispose()
                        enemy.dispose()
                        enemies.splice(ei, 1);

                        scene._showGameOver()
                    }

                    // Движение игрока
                    enemy.position.z += 0.01 * x.deltaTime

                    // Выход врага за игровую область
                    if (!scene._isGameOver && (enemy.position.z > 10)) {
                        this._addExplosion(player.position.clone())
                        this._addExplosion(enemy.position.clone())
                        player.dispose()
                        enemy.dispose()
                        enemies.splice(ei, 1);
                        scene._showGameOver()
                    }
                })
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

        let light = new BABYLON.HemisphericLight("point", new BABYLON.Vector3(0.1, 0.4, -1), this);

        this._explosionSound = new BABYLON.Sound("sound", "sound/sfx_exp_short_soft2.wav", this, null, {
            loop: false,
            volume: 0.3
        });

        this._clickSound = new BABYLON.Sound("sound", "sound/sfx_menu_select2.wav", this, null, {
            loop: false
        });

        await this._createEnvironment()
        await this._createPlayer()
        await this._createEnemySpawner()
        this._createUi()

        // this.debugLayer.show({
        //     embedMode: true
        // })
    }
}