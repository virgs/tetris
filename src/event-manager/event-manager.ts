import {Events} from './events';

export class EventManager {
    private static singleton: EventManager = null;

    private eventEmitter = new Phaser.Events.EventEmitter();

    private static getEmitter() {
        if (!EventManager.singleton) {
            EventManager.singleton = new EventManager();
        }
        return EventManager.singleton.eventEmitter;
    }

    public static emit(event: Events, ...args: any[]): boolean {
        const emitter = this.getEmitter();
        return emitter.emit(Events[event], ...args);
    }

    public static on(event: Events, fn: Function, context?: any): Phaser.Events.EventEmitter {
        const emitter = this.getEmitter();
        return emitter.on(Events[event], fn, context);
    }

    static destroy() {
        EventManager.singleton = null;
    }
}
