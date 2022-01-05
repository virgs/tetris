export class SplashScene extends Phaser.Scene {

    private static readonly MIN_TIME: 250;
    private loadCompleted: boolean;

    constructor() {
        super({
            key: 'SplashScene'
        });
        this.loadCompleted = false;
    }

    public preload(): void {
        this.load.image('splash', './assets/images/gui.png');
    }

    public create(): void {
        // @ts-ignore
        document.querySelector('body div.hud').style.display = 'unset';
        const logo = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'splash');
        let scaleRatio = Math.min(window.innerWidth / logo.getBounds().width, window.innerHeight / logo.getBounds().height);
        logo.setInteractive();
        logo.setAlpha(0.15);
        logo.setScale(scaleRatio, scaleRatio);

        this.loadImages();
        this.loadSounds();
        this.load.start();
        this.load.on('complete', () => this.loadCompleted = true);

        this.time.addEvent({
            delay: SplashScene.MIN_TIME,
            callback: () => logo.once('pointerdown', () => {
                if (this.loadCompleted) {
                    this.startMainScene();
                } else {
                    this.load.on('complete', () => this.startMainScene());
                }
            })
        });
    }

    private startMainScene() {
        // @ts-ignore
        document.querySelector('body div.hud').style.display = 'none';
        return this.scene.start('MainScene');
    }

    private loadImages() {
        this.load.image('empty-background.png', `./assets/images/empty-background.png`);
        //https://cpetry.github.io/NormalMap-Online/
        // https://www.smart-page.net/smartnormal/
        this.load.image('wall', [`./assets/images/wall.bmp`, './assets/images/wall_n.png']);
        this.load.image('hole', `./assets/images/hole.bmp`);
    }

    private loadSounds() {
        this.load.audio('game-opener', `./assets/sounds/game-opener.wav`, {volume: 0.25});
        this.load.audio('game-over', `./assets/sounds/game-over.wav`, {volume: 0.25});
        this.load.audio('stuck', `./assets/sounds/stuck.mp3`, {volume: 0.5});
        this.load.audio('points', `./assets/sounds/points.wav`, {volume: 0.5});
    }
}
