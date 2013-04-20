///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>

import Team = module("scripts/includes/team");

declare var sys: IScriptEngine;

export class Importable implements IPlugin {

    public sourcePath: string;

    public handleCommandImportable(channel, src, commandData, tar) {
        
        var teams = [0, 1, 2, 3, 4, 5]
                    .slice(0, sys.teamCount(src))
                    .map(function (index) { return Team.text(src, index); }, this)
                    .filter(function (data) { return data.length > 0; })
                    .map(function (team) { return "<pre>" + team.join("<br/>") + "</pre>"; })
                    .join("<hr/>");
        
        if (teams) {
            sys.sendHtmlMessage(src, "<hr/>" + teams + "<hr/>", channel);
        }
        else {
            sys.sendMessage(src, "+Bot: You have no teams with valid pokemon.");
        }
        return "OK";
    }
}

export var instance: IPlugin = new Importable();