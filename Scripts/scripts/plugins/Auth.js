var Bot = require("../global/Bot")
var bot = new Bot.Bot("AuthBot");
var Auth = (function () {
    function Auth() { }
    Auth.prototype.handleCommandChangeAuth = function (channel, src, commandData, tar, doSilent) {
        if (typeof doSilent === "undefined") { doSilent = false; }
        var pos = commandData.indexOf(' ');
        if(pos == -1) {
            bot.sendMessage(src, "Missing parameter username");
            return "STOP";
        }
        var newAuthLevel = commandData.substring(0, pos), name = commandData.substr(pos + 1), tar = sys.id(name), silent = doSilent;
        if(parseInt(newAuthLevel) > 0 && !sys.dbRegistered(name)) {
            bot.sendMessage(src, "This person is not registered");
            bot.sendMessage(tar, "Please register, before getting auth");
            return "STOP";
        }
        if(tar !== undefined) {
            sys.changeAuth(tar, parseInt(newAuthLevel));
        } else {
            sys.changeDbAuth(name, parseInt(newAuthLevel));
        }
        var message = sys.name(src) + " changed auth of " + name + " to " + newAuthLevel;
        if(!silent) {
            bot.sendAll(message);
        } else {
            bot.sendAll(message, SESSION.global().staffChannel);
        }
        return "OK";
    };
    Auth.prototype.handleCommandChangeAuths = function (channel, src, commandData, tar) {
        return this.handleCommandChangeAuth(channel, src, commandData, tar, true);
    };
    Auth.prototype.handleCommandHiddenAuth = function (channel, src, commandData, tar) {
        sys.sendHtmlMessage(src, "<hr/><b>HIDDEN AUTHS</b><br/>");
        sys.dbAuths().sort().filter(function (name) {
            return sys.dbAuth(name) > 3;
        }).forEach(function (name) {
            sys.sendMessage(src, name + " " + sys.dbAuth(name));
        });
        sys.sendHtmlMessage(src, "<hr/>", channel);
        return "OK";
    };
    return Auth;
})();
exports.Auth = Auth;
exports.instance = new Auth();
