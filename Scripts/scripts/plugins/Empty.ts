///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Empty implements IPlugin {

    public sourcePath: string;

    public handleCommand(channel: number, src: number, command: string, commandData: string, tar: number): string {
        // Use handleCommandSample() in favor!
        return "UNKNOWN"; // Good values: OK, AUTH, PERMISSION, UNKNWON, WARNING
    }

    public handleCommandSample(channel: number, src: number, commandData: string, tar: number): string {
        return "OK";
    }
}

export var instance: IPlugin = new Empty();

export var createInstance = function(): IPlugin {
    return new Empty();
}