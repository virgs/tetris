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
        const logo = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'splash');
        let scaleRatio = Math.min(window.innerWidth / logo.getBounds().width, window.innerHeight / logo.getBounds().height);
        logo.setScale(scaleRatio, scaleRatio);

        this.loadImages();
        this.loadFonts();
        this.load.start();
        this.load.on('complete', () => this.loadCompleted = true);

        this.time.addEvent({
            delay: SplashScene.MIN_TIME, callback: () => {
                if (this.loadCompleted) {
                    this.scene.start('ScoreScene');
                } else {
                    this.load.on('complete', () => this.scene.start('ScoreScene'));
                }
            }
        });

    }

    private loadImages() {
        const imagesToLoad = [
            'empty-background.bmp',
            'gui.png',
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
