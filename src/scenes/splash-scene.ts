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

    //        const background = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'background-castle')
    //             .setInteractive();
    //         background.setAlpha(0.2);
    //         background.setBlendMode(Phaser.BlendModes.ADD);
    //         background.setTint(0xFFFFFF);
    //
    //         this.time.addEvent({
    //             delay: ScoreScene.MIN_WAITING_TIME_MS,
    //             callback: () => background.on('pointerdown', () => this.scene.start('MainScene'))
    //         });
    //         const backgroundScaleRatio = Math.max(window.innerWidth / background.getBounds().width,
    //             window.innerHeight / background.getBounds().height);
    //         background.setScale(backgroundScaleRatio, backgroundScaleRatio);

    public create(): void {
        const logo = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'splash');
        let scaleRatio = Math.min(window.innerWidth / logo.getBounds().width, window.innerHeight / logo.getBounds().height);
        logo.setInteractive();
        logo.setScale(scaleRatio, scaleRatio);

        this.loadImages();
        this.loadFonts();
        this.load.start();
        this.load.on('complete', () => this.loadCompleted = true);

        this.time.addEvent({
            delay: SplashScene.MIN_TIME,
            callback: () => logo.on('pointerdown', () => {
                if (this.loadCompleted) {
                    this.scene.start('MainScene');
                } else {
                    this.load.on('complete', () => this.scene.start('MainScene'));
                }
            })
        });
    }

    private loadImages() {
        const imagesToLoad = [
            'empty-background.png',
            'wall.bmp'
        ];

        imagesToLoad.forEach(image => this.load.image(image, `./assets/images/${image}`));
    }

    private loadFonts() {
        this.load.bitmapFont('scoreFont',
            `./assets/fonts/PressStart2P-Regular.png`,
            `./assets/fonts/PressStart2P-Regular.fnt`);
    }
}
