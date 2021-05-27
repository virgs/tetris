import {scale} from './scale';
import {Command} from './command';
import {MessageManager} from './message-manager/message-manager';
import {Messages} from './message-manager/messages';
import {gameScreenHeight, gameScreenWidth} from './game';
import KeyCodes = Phaser.Input.Keyboard.KeyCodes;
import Point = Phaser.Geom.Point;

enum CommandResponse {
    FAST = 100,
    SLOW = 200
}

type Input = {
    keyCode: Phaser.Input.Keyboard.Key;
    command: Command,
    millisecondsSinceLastActivation: number,
    commandResponse: CommandResponse
};

export class InputManager {
    private readonly scene: Phaser.Scene;

    private readonly sprites: Phaser.GameObjects.Sprite[] = [];
    private readonly keyboardInput: Input[];

    constructor(options: { scene: Phaser.Scene }) {
        this.scene = options.scene;
        this.keyboardInput = this.registerInputEvents();
        this.sprites.push(this.createSprite(new Point(0, gameScreenHeight / 2),
            () => MessageManager.emit(Messages.INPUT_DETECTED, Command.Left)));
        this.sprites.push(this.createSprite(new Point(gameScreenWidth, gameScreenHeight / 2),
            () => MessageManager.emit(Messages.INPUT_DETECTED, Command.Right)));

        this.sprites.push(this.createSprite(new Point(gameScreenWidth / 2, -gameScreenHeight / 4),
            () => MessageManager.emit(Messages.INPUT_DETECTED, Command.Rotate)));
        this.sprites.push(this.createSprite(new Point(gameScreenWidth / 2, 5 * gameScreenHeight / 4),
            () => MessageManager.emit(Messages.INPUT_DETECTED, Command.Down)));

        MessageManager.on(Messages.UPDATE_TIME_ELAPSED, delta => this.update(delta));
        MessageManager.on(Messages.GAME_OVER, () => this.destroy());
    }

    private update(delta: number) {
        this.keyboardInput.forEach(input => {
            input.millisecondsSinceLastActivation += delta;
            if (input.millisecondsSinceLastActivation > input.commandResponse) {
                if (input.keyCode.isDown) {
                    input.millisecondsSinceLastActivation = 0;
                    MessageManager.emit(Messages.INPUT_DETECTED, input.command);
                }
            }
        });
    }

    private registerInputEvents(): Input[] {
        return [
            {
                command: Command.Rotate, keyCode: this.scene.input.keyboard.addKey(KeyCodes.UP),
                millisecondsSinceLastActivation: 0, commandResponse: CommandResponse.SLOW
            },
            {
                command: Command.Left, keyCode: this.scene.input.keyboard.addKey(KeyCodes.LEFT),
                millisecondsSinceLastActivation: 0, commandResponse: CommandResponse.FAST
            },
            {
                command: Command.Down, keyCode: this.scene.input.keyboard.addKey(KeyCodes.DOWN),
                millisecondsSinceLastActivation: 0, commandResponse: CommandResponse.FAST
            },
            {
                command: Command.Right, keyCode: this.scene.input.keyboard.addKey(KeyCodes.RIGHT),
                millisecondsSinceLastActivation: 0, commandResponse: CommandResponse.FAST
            }
        ];
    }

    private destroy() {
        this.sprites
            .forEach(sprite => sprite.destroy());
    }

    private createSprite(point: Phaser.Geom.Point, callback: Function): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite(point.x * scale, point.y * scale,
            'hole.bmp');
        sprite.setInteractive();
        sprite.on('pointerdown', callback);
        sprite.setAlpha(0.01);
        sprite.setScale(gameScreenWidth / sprite.width, .75 * gameScreenHeight / sprite.height);
        return sprite;
    }
}
