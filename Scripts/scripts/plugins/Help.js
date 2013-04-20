var Help = (function () {
    function Help() { }
    Help.prototype.serverStartUp = function () {
        var text = sys.getFileContent("scripts/messages/commands.txt");
        this.htmlCommands = "<hr/><b>COMMANDS</b><br/>" + text.replaceAll("\n", "<br/>") + "<hr/>";
        var text = sys.getFileContent("scripts/messages/rules.txt");
        this.htmlRules = "<hr/><b>RULES</b><br/>" + text.replaceAll("\n", "<br/>") + "<hr/>";
        return "OK";
    };
    Help.prototype.afterLogIn = function (src) {
        sys.sendMessage(src, "*** Use /commands to see the commands");
        sys.sendMessage(src, "*** Use /rules to see the rules");
        return "OK";
    };
    Help.prototype.handleCommandAuth = function (channel, src, commandData, tar) {
        var hideIfOffline = [];
        var filterByAuth = function (level) {
            return function (name) {
                if(sys.dbAuth(name) == level) {
                    return name;
                }
            }
        };
        var printOnlineOffline = function (name) {
            if(name == undefined) {
                return;
            }
            if(sys.id(name) === undefined) {
                if(hideIfOffline.indexOf(name) == -1) {
                    sys.sendHtmlMessage(src, "- " + name + " (Offline)", channel);
                }
            } else {
                sys.sendHtmlMessage(src, '- <font color = "green">' + name.toCorrectCase() + ' (Online)</font>', channel);
            }
        };
        var authlist = sys.dbAuths().sort();
        sys.sendHtmlMessage(src, "<hr/><b>AUTHS</b><br/>");
        switch(commandData) {
            case "owners": {
                sys.sendHtmlMessage(src, "Owners", channel);
                authlist.map(filterByAuth(3)).forEach(printOnlineOffline);
                break;

            }
            case "admins":
            case "administrators": {
                sys.sendHtmlMessage(src, "Administrators", channel);
                authlist.map(filterByAuth(2)).forEach(printOnlineOffline);
                break;

            }
            case "mods":
            case "moderators": {
                sys.sendHtmlMessage(src, "Moderators", channel);
                authlist.map(filterByAuth(1)).forEach(printOnlineOffline);
                break;

            }
            default: {
                sys.sendHtmlMessage(src, "Owners", channel);
                authlist.map(filterByAuth(3)).forEach(printOnlineOffline);
                sys.sendHtmlMessage(src, '', channel);
                sys.sendHtmlMessage(src, "Administrators", channel);
                authlist.map(filterByAuth(2)).forEach(printOnlineOffline);
                sys.sendHtmlMessage(src, '', channel);
                sys.sendHtmlMessage(src, "Moderators", channel);
                authlist.map(filterByAuth(1)).forEach(printOnlineOffline);

            }
        }
        sys.sendHtmlMessage(src, '<hr/>', channel);
        return;
    };
    Help.prototype.handleCommandCommands = function (channel, src, commandData, tar) {
        sys.sendHtmlMessage(src, this.htmlCommands);
        return "STOP";
    };
    Help.prototype.handleCommandRules = function (channel, src, data, tar) {
        sys.sendHtmlMessage(src, this.htmlRules);
        return "STOP";
    };
    return Help;
})();
exports.Help = Help;
exports.instance = new Help();
