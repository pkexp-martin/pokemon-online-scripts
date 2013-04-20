///<reference path="../../interfaces/Bot.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

export class Bot implements IBot {
    constructor(public name: string) {
    }

    private formatMessage(message) {
        return "±" + this.name + ": " + message;
    }

    public sendAll(message, channel = undefined) {
        if (channel === undefined) {
            sys.sendAll(this.formatMessage(message), -1);
        }
        else {
            sys.sendAll(this.formatMessage(message), channel);
        }
    }

    public sendMessage(tar, message, channel = undefined) {
        if (channel === undefined) {
            sys.sendMessage(tar, this.formatMessage(message));
        }
        else {
            sys.sendMessage(tar, this.formatMessage(message), channel);
        }
    }
}