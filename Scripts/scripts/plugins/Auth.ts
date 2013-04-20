///<reference path="../../interfaces/Bot.ts"/>
///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

declare var SESSION: ISession;
declare var sys: IScriptEngine;

import Bot = module("../global/Bot");
var bot = new Bot.Bot("AuthBot");

export class Auth implements IPlugin {

    public sourcePath: string;

    // TODO Assert OWNER
    public handleCommandChangeAuth(channel: number, src: number, commandData: string, tar: number, doSilent = false): string {
        var pos = commandData.indexOf(' ');
        if (pos == -1) {
            bot.sendMessage(src, "Missing parameter username");
            return "STOP";
        }

        var newAuthLevel = commandData.substring(0, pos), name = commandData.substr(pos + 1), tar = sys.id(name), silent = doSilent;
        if (parseInt(newAuthLevel) > 0 && !sys.dbRegistered(name)) {
            bot.sendMessage(src, "This person is not registered");
            bot.sendMessage(tar, "Please register, before getting auth");
            return "STOP";
        }

        if (tar !== undefined) {
            sys.changeAuth(tar, parseInt(newAuthLevel));
        }
        else {
            sys.changeDbAuth(name, parseInt(newAuthLevel));
        }

        var message = sys.name(src) + " changed auth of " + name + " to " + newAuthLevel;
        if (!silent) {
            bot.sendAll(message);
        }
        else {
            bot.sendAll(message, SESSION.global().staffChannel);
        }

        return "OK";
    }

    // TODO Assert OWNER
    public handleCommandChangeAuths(channel: number, src: number, commandData: string, tar: number): string {
        return this.handleCommandChangeAuth(channel, src, commandData, tar, true);
    }

    // TODO Assert OWNER
    public handleCommandHiddenAuth(channel: number, src: number, commandData: string, tar: number): string {
        sys.sendHtmlMessage(src, "<hr/><b>HIDDEN AUTHS</b><br/>");
        sys.dbAuths().sort()
            .filter((name) => { return sys.dbAuth(name) > 3; })
            .forEach((name) => {
                sys.sendMessage(src, name + " " + sys.dbAuth(name));
            }
        );
        sys.sendHtmlMessage(src, "<hr/>", channel);
        return "OK";
    }
}

export var instance: IPlugin = new Auth();