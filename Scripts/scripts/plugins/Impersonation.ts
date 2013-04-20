///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Impersonation implements IPlugin {

    public sourcePath: string;

    public beforeChatMessage(src: number, message: string, channel: number): string {
        if (SESSION.users(src).impersonation != '') {
            sys.sendAll(SESSION.users(src).impersonation + ": " + message, channel);
            return "STOP";
        }
    }

    public handleCommandImp(channel: number, src: number, commandData: string, tar: number): string {
        SESSION.users(src).impersonation = commandData;
        sys.sendMessage(src, "Now you are " + SESSION.users(src).impersonation + "!", channel);
        return "OK";

    }

    public handleCommandImpOff(channel: number, src: number, commandData: string, tar: number): string {
        SESSION.users(src).impersonation = "";
        sys.sendMessage(src, "Now you are yourself!", channel);
        return "OK";
    }
}

export var instance: IPlugin = new Impersonation();