///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

export class Help implements IPlugin {

    public sourcePath: string;

    private htmlCommands: string;
    private htmlRules: string;

    public serverStartUp(): string {
        var text: string = sys.getFileContent("scripts/messages/commands.txt");
        // TODO: Write a generic decorator
        this.htmlCommands = "<hr/><b>COMMANDS</b><br/>" + text.replaceAll("\n", "<br/>") + "<hr/>";

        var text: string = sys.getFileContent("scripts/messages/rules.txt");
        // TODO: Write a generic decorator
        this.htmlRules = "<hr/><b>RULES</b><br/>" + text.replaceAll("\n", "<br/>") + "<hr/>";

        return "OK";
    }

    public afterLogIn(src) {
        sys.sendMessage(src, "*** Use /commands to see the commands");
        sys.sendMessage(src, "*** Use /rules to see the rules");
        return "OK";
    }

    public handleCommandAuth(channel, src, commandData, tar) {
        var hideIfOffline = [];
        var filterByAuth = function (level) {
            return function (name) {
                if (sys.dbAuth(name) == level) {
                    return name;
                }
            }
        };
        var printOnlineOffline = function (name) {
            if (name == undefined) return;
            if (sys.id(name) === undefined) {
                if (hideIfOffline.indexOf(name) == -1) {
                    sys.sendHtmlMessage(src, "- " + name + " (Offline)", channel);
                }
            } else {
                sys.sendHtmlMessage(src, '- <font color = "green">' + name.toCorrectCase() + ' (Online)</font>', channel);
            }
        };
        var authlist = sys.dbAuths().sort();
        sys.sendHtmlMessage(src, "<hr/><b>AUTHS</b><br/>");
        switch (commandData) {
            case "owners":
                sys.sendHtmlMessage(src, "Owners", channel);
                authlist.map(filterByAuth(3)).forEach(printOnlineOffline);
                break;
            case "admins":
            case "administrators":
                sys.sendHtmlMessage(src, "Administrators", channel);
                authlist.map(filterByAuth(2)).forEach(printOnlineOffline);
                break;
            case "mods":
            case "moderators":
                sys.sendHtmlMessage(src, "Moderators", channel);
                authlist.map(filterByAuth(1)).forEach(printOnlineOffline);
                break;
            default:
                sys.sendHtmlMessage(src, "Owners", channel);
                authlist.map(filterByAuth(3)).forEach(printOnlineOffline);
                sys.sendHtmlMessage(src, '', channel);
                sys.sendHtmlMessage(src, "Administrators", channel);
                authlist.map(filterByAuth(2)).forEach(printOnlineOffline);
                sys.sendHtmlMessage(src, '', channel);
                sys.sendHtmlMessage(src, "Moderators", channel);
                authlist.map(filterByAuth(1)).forEach(printOnlineOffline);
        }
        sys.sendHtmlMessage(src, '<hr/>', channel);
        return;
    }

    public handleCommandCommands(channel, src, commandData, tar) {
        /*
        sendChanMessage(src, "*** Commands ***");
            for (x = 0; x < commands.user.length; ++x) {
                sendChanMessage(src, commands.user[x]);
            }
            sendChanMessage(src, "*** Other Commands ***");
            sendChanMessage(src, "/commands channel: To know of channel commands");
            if (sys.auth(src) > 0) {
                sendChanMessage(src, "/commands mod: To know of moderator commands");
            }
            if (sys.auth(src) > 1) {
                sendChanMessage(src, "/commands admin: To know of admin commands");
            }
            if (sys.auth(src) > 2 || isSuperAdmin(src)) {
                sendChanMessage(src, "/commands owner: To know of owner commands");
            }
            var pluginhelps = getplugins("help-string");
            for (var module in pluginhelps) {
                if (pluginhelps.hasOwnProperty(module)) {
                    var help = typeof pluginhelps[module] == "string" ? [pluginhelps[module]] : pluginhelps[module];
                    for (i = 0; i < help.length; ++i)
                        sendChanMessage(src, "/commands " + help[i]);
                }
            }
            return;
        }

        commandData = commandData.toLowerCase();
        if ( (commandData == "mod" && sys.auth(src) > 0)
            || (commandData == "admin" && sys.auth(src) > 1)
            || (commandData == "owner" && (sys.auth(src) > 2  || isSuperAdmin(src)))
            || (commandData == "megauser" && (sys.auth(src) > 0 || SESSION.users(src).megauser || SESSION.channels(tourchannel).isChannelOperator(src)))
            || (commandData == "channel") ) {
            sendChanMessage(src, "*** " + commandData.toUpperCase() + " Commands ***");
            commands[commandData].forEach(function(help) {
                sendChanMessage(src, help);
            });
        }
        */

        sys.sendHtmlMessage(src, this.htmlCommands);
        return "STOP";
    }

    public handleCommandRules(channel: number, src: number, data: any, tar: number): string {
        sys.sendHtmlMessage(src, this.htmlRules);
        return "STOP";
    }
}

export var instance: IPlugin = new Help();