import Point = Phaser.Geom.Point;
import {EventManager} from '../event-manager/event-manager';
import {Events} from '../event-manager/events';
import {StuckCell} from './board';
import {scale} from '../scale';
import dimension from '../level-dimension';

export class BlockFactory {
    private static readonly blockVariety = [
        BlockFactory.squareBlock(),
        BlockFactory.giantI(),
        BlockFactory.sShaped(),
        BlockFactory.zShaped(),
        BlockFactory.lShaped(),
        BlockFactory.lInvertedShaped(),
        BlockFactory.tShaped()
    ];

    private readonly scene: Phaser.Scene;
    private nextPiece: { blocks: Phaser.Geom.Point[]; color: string };
    private position: Point = new Point(dimension.x * 1.2, dimension.y * 0.5);
    private sprites: Phaser.GameObjects.Sprite[] = [];

    public constructor(options: { scene: Phaser.Scene }) {
        this.scene = options.scene;
        this.nextPiece = BlockFactory.randomlyCreateNextBlock();
        this.showNextPiece();
        EventManager.on(Events.RANDOMLY_GENERATE_NEXT_BLOCK, (options: { stuckCells: StuckCell[] }) => {
            const next = this.nextPiece;
            this.nextPiece = BlockFactory.randomlyCreateNextBlock();
            this.showNextPiece();

            EventManager.emit(Events.CREATE_BLOCK, {
                cells: next.blocks,
                color: next.color,
                stuckCells: options.stuckCells
            });
        });

    }

    private static randomlyCreateNextBlock(): { blocks: Phaser.Geom.Point[]; color: string } {
        const possibles = BlockFactory.blockVariety;
        const randomIndex = Math.floor(Math.random() * possibles.length);
        return possibles[randomIndex];
    }

    private static squareBlock(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(0, 0), new Point(0, 1), new Point(1, 0), new Point(1, 1)],
            color: '0x465362'
        };
    }

    private static giantI(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(0, -1), new Point(0, 0), new Point(0, 1), new Point(0, 2)],
            color: '0x358600'
        };
    }

    private static sShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(-1, 1), new Point(0, 1), new Point(0, 0), new Point(1, 0)],
            color: '0x9DBEBB'
        };
    }

    private static zShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(-1, 0), new Point(0, 0), new Point(0, 1), new Point(1, 1)],
            color: '0xBF6900'
        };
    }

    private static tShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(-1, 0), new Point(0, 0), new Point(0, 1), new Point(1, 0)],
            color: '0xCC3363'
        };
    }

    private static lShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(0, -1), new Point(0, 0), new Point(0, 1), new Point(1, 1)],
            color: '0xFF0035'
        };
    }

    private static lInvertedShaped(): { blocks: Point[], color: string } {
        return {
            blocks: [new Point(0, -1), new Point(0, 0), new Point(0, 1), new Point(-1, 1)],
            color: '0xDDD92A'
        };
    }

    private showNextPiece() {
        this.sprites
            .forEach(sprite => sprite.destroy());
        this.sprites = [];
        this.nextPiece.blocks
            .forEach(cell => {
                const sprite = this.scene.add.sprite((this.position.x + cell.x) * scale + (scale / 2),
                    (this.position.y + cell.y) * scale + (scale / 2), 'wall.bmp');
                sprite.setScale(scale / sprite.width);
                sprite.setTint(this.nextPiece.color as any);
                this.sprites.push(sprite);
            });
    }
}
