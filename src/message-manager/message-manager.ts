import {Messages} from './messages';

export class MessageManager {
    private static singleton: MessageManager = null;

    private eventEmitter = new Phaser.Events.EventEmitter();

    private static getEmitter() {
        if (!MessageManager.singleton) {
            MessageManager.singleton = new MessageManager();
        }
        return MessageManager.singleton.eventEmitter;
    }

    public static emit(event: Messages, ...args: any[]): boolean {
        const emitter = this.getEmitter();
        return emitter.emit(Messages[event], ...args);
    }

    public static on(event: Messages, fn: Function, context?: any): Phaser.Events.EventEmitter {
        const emitter = this.getEmitter();
        return emitter.on(Messages[event], fn, context);
    }

    static destroy() {
        MessageManager.singleton = null;
    }
}
