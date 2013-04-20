///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

import Utilities = module("scripts/includes/utilities");

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Me implements IPlugin {

    public sourcePath: string;

    public handleCommandMe(channel, src, commandData, tar): string {
        if (SESSION.channels(channel).meoff === true) {
            sys.sendMessage(src, "+CommandBot: /me was turned off.");
            return;
        }

        if (commandData == "") {
            sys.sendMessage(src, "+CommandBot: /me needs a text");
            return "STOP";
        }

        if (SESSION.users(src).smute.active) {
            sys.playerIds().forEach(function (id) {
                if (sys.loggedIn(id) && SESSION.users(id).smute.active && sys.isInChannel(src, channel)) {
                    var colour = this.getColor(src);
                    sys.sendHtmlMessage(id, "<font color='" + colour + "'><timestamp/> *** <b>" + Utilities.escapeHtml(sys.name(src)) + "</b> " + commandData + "</font>", channel);
                }
            });
            return "STOP";
        }

        var messagetosend = Utilities.escapeHtml(commandData);
        var colour = Utilities.getColor(src);
        sys.sendHtmlAll("<font color='" + colour + "'><timestamp/> *** <b>" + Utilities.escapeHtml(sys.name(src)) + "</b> " + messagetosend + "</font>", channel);
        
        return "OK";
    }
}

export var instance: IPlugin = new Me();