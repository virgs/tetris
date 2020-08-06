export class ScoreScene extends Phaser.Scene {
    private static readonly MIN_WAITING_TIME_MS = 1000;
    private score: number | string;

    constructor() {
        super({
            key: 'ScoreScene'
        });
    }

    public create(value: { score: number }) {
        this.score = '-';
        if (value && value.score) {
            this.score = value.score;
        }
        this.addBackground();
        this.addScoreBoard();
    }

    private addScoreBoard() {
        const scoreTitle = this.add.bitmapText(this.game.renderer.width * 0.1, this.game.renderer.height * 0.35,
            'scoreFont', `SCORE`, 40, 0);
        scoreTitle.setTintFill(0xb6b600);
        const titleScaleRatio = window.innerWidth * 0.35 / scoreTitle.getTextBounds().global.width;
        scoreTitle.setScale(titleScaleRatio, titleScaleRatio);

        console.log(this.score);
        const scoreText = this.add.bitmapText(this.game.renderer.width * 0.15, this.game.renderer.height * 0.65,
            'scoreFont', `${this.score}`, 40, 0);
        scoreText.setTintFill(0xb6b600);
        scoreText.setScale(titleScaleRatio, titleScaleRatio);
    }

    private addBackground() {
        const background = this.add.sprite(this.game.renderer.width / 2, this.game.renderer.height / 2, 'background-castle')
            .setInteractive();
        background.setAlpha(0.2);
        background.setBlendMode(Phaser.BlendModes.ADD);
        background.setTint(0xFFFFFF);

        this.time.addEvent({
            delay: ScoreScene.MIN_WAITING_TIME_MS,
            callback: () => background.on('pointerdown', () => this.scene.start('MainScene'))
        });
        const backgroundScaleRatio = Math.max(window.innerWidth / background.getBounds().width,
            window.innerHeight / background.getBounds().height);
        background.setScale(backgroundScaleRatio, backgroundScaleRatio);
    }
}
