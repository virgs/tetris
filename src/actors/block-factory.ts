import Point = Phaser.Geom.Point;

export class BlockFactory {

    public randomlyCreateBlock(): { blocks: Phaser.Geom.Point[]; color: string } {
        const possibles = [
            BlockFactory.squareBlock(),
            BlockFactory.giantI(),
            BlockFactory.sShaped(),
            BlockFactory.zShaped(),
            BlockFactory.lShaped(),
            BlockFactory.lInvertedShaped(),
            BlockFactory.tShaped()
        ];
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
}
