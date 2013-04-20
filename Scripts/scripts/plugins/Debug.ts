///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

import Team = module("scripts/includes/team");

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Debug implements IPlugin {

    public sourcePath: string;

    public handleCommandMemoryDump(channel: number, src: number, commandData: number, tar: number) {
        sys.sendMessage(src, sys.memoryDump(), channel);
        return;
    }

    public handleCommandShowTeam(channel: number, src: number, commandData: number, tar: number) {
        if (tar == undefined) {
            sys.sendMessage(src, "+DebugBot: Missing argument player", channel);
        }

        // sys.teamCount(id)
        var teams = [0, 1, 2, 3, 4, 5]
                    .slice(0, sys.teamCount(src))
                    .map(function (index) { return Team.text(tar, index); }, this)
                    .filter(function (data) { return data.length > 0; })
                    .map(function (team) { return "<pre>" + team.join("<br/>") + "</pre>"; })
                    .join("<hr/>");

        if (teams) {
            sys.sendHtmlMessage(src, "<hr/>" + teams + "<hr/>", channel);
        }
        else {
            sys.sendMessage(src, "+DebugBot: That player has no teams with valid pokemon.", channel);
        }
        return;
    }
}

export var instance: IPlugin = new Debug();