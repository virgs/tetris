import {scale} from './scale';
import {Command} from './command';
import dimension from './level-dimension';
import {Events} from './event-manager/events';
import {EventManager} from './event-manager/event-manager';
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
        this.sprites.push(this.createSprite(new Point(0, dimension.y / 2),
            () => EventManager.emit(Events.INPUT_COMMAND, Command.Left)));
        this.sprites.push(this.createSprite(new Point(dimension.x, dimension.y / 2),
            () => EventManager.emit(Events.INPUT_COMMAND, Command.Right)));

        this.sprites.push(this.createSprite(new Point(dimension.x / 2, -dimension.y / 4),
            () => EventManager.emit(Events.INPUT_COMMAND, Command.Rotate)));
        this.sprites.push(this.createSprite(new Point(dimension.x / 2, 5 * dimension.y / 4),
            () => EventManager.emit(Events.INPUT_COMMAND, Command.Down)));

        EventManager.on(Events.UPDATE, delta => this.update(delta));
        EventManager.on(Events.GAME_OVER, () => this.destroy());
    }

    private update(delta: number) {
        this.keyboardInput.forEach(input => {
            input.millisecondsSinceLastActivation += delta;
            if (input.millisecondsSinceLastActivation > input.commandResponse) {
                if (input.keyCode.isDown) {
                    input.millisecondsSinceLastActivation = 0;
                    EventManager.emit(Events.INPUT_COMMAND, input.command);
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
        sprite.setScale(dimension.x * scale / sprite.width, .75 * dimension.y * scale / sprite.height);
        return sprite;
    }
}
