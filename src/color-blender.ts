import {EventManager} from './event-manager/event-manager';

export class ColorBlender {

    public constructor() {
        EventManager.on
    }

    public generateColor(): string {
        const r = ColorBlender.generateHexaNumber();
        const g = ColorBlender.generateHexaNumber();
        const b = ColorBlender.generateHexaNumber();
        if (r == '00' && g == '00' && b == '00') {
            return this.generateColor();
        }
        return '0x' + r + g + b;
    }

    private static generateHexaNumber(): string {
        const possibles = ['00', '88', 'FF'];
        return possibles[Math.floor(Math.random() * possibles.length)];
    }

}
