import {scale} from './scale';
import {Command} from './command';
import dimension from './level-dimension';
import {Events} from './event-manager/events';
import {EventManager} from './event-manager/event-manager';
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;
import Point = Phaser.Geom.Point;

export class InputManager {
    private readonly scene: Phaser.Scene;

    private readonly sprites: Phaser.GameObjects.Sprite[] = [];
    private keyboardInput: { keyCode: Phaser.Input.Keyboard.Key; command: Command }[];
    private updateTimeCounterMs: number = 0;
    private readonly millisecondsPerUpdate: number = 100;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.registerInputEvents();
        this.sprites.push(this.createSprite(new Point(0, dimension.y / 2),
            () => EventManager.emit(Events.INPUT_COMMAND, Command.Left)));
        this.sprites.push(this.createSprite(new Point(dimension.x, dimension.y / 2),
            () => EventManager.emit(Events.INPUT_COMMAND, Command.Right)));

        this.sprites.push(this.createSprite(new Point(dimension.x / 2, -dimension.y / 4),
            () => EventManager.emit(Events.INPUT_COMMAND, Command.Rotate)));
        this.sprites.push(this.createSprite(new Point(dimension.x / 2, 5 * dimension.y / 4),
            () => EventManager.emit(Events.INPUT_COMMAND, Command.Down)));
    }

    public update(delta: number) {
        this.updateTimeCounterMs += delta;
        if (this.updateTimeCounterMs > this.millisecondsPerUpdate) {
            this.updateTimeCounterMs %= this.millisecondsPerUpdate;
            this.keyboardInput
                .filter(key => key.keyCode.isDown)
                .forEach(key => EventManager.emit(Events.INPUT_COMMAND, key.command));
        }
    }

    private registerInputEvents() {
        this.keyboardInput = [
            {command: Command.Rotate, keyCode: this.scene.input.keyboard.addKey(KeyCodes.UP)},
            {command: Command.Left, keyCode: this.scene.input.keyboard.addKey(KeyCodes.LEFT)},
            {command: Command.Down, keyCode: this.scene.input.keyboard.addKey(KeyCodes.DOWN)},
            {command: Command.Right, keyCode: this.scene.input.keyboard.addKey(KeyCodes.RIGHT)}
        ];
    }

    public destroy() {
        this.sprites
            .forEach(sprite => sprite.destroy());
    }

    private createSprite(point: Phaser.Geom.Point, callback: Function): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite(point.x * scale, point.y * scale,
            'hole.bmp');
        sprite.setInteractive();
        sprite.on('pointerdown', callback);
        sprite.setAlpha(0.01);
        sprite.setScale(dimension.x * scale / sprite.width, .75 * dimension.y * scale / sprite.height);
        return sprite;
    }
}
