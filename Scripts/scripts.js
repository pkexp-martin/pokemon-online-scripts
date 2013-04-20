var mutes, smutes;
eval(sys.getFileContent("scripts/includes/string.js"));
eval(sys.getFileContent("scripts/module.js"));
var require = Module.require;
var Utilities = require("./scripts/includes/utilities")
var Server = Module.require("scripts/global/Server.js").Server;
var User = Module.require("scripts/global/User.js").User;
var Channel = Module.require("scripts/global/Channel.js").Channel;
SESSION.identifyScriptAs("PO TypeScripts v0.1");
SESSION.registerGlobalFactory(Server);
SESSION.registerUserFactory(User);
SESSION.registerChannelFactory(Channel);
function callPlugins() {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        args[_i] = arguments[_i + 0];
    }
    var ret = SESSION.global().callPlugins.apply(SESSION.global(), arguments);
    if(ret == "STOP") {
        sys.stopEvent();
    }
    return ret;
}
({
    serverStartUp: function () {
        SESSION.global().init();
        callPlugins("serverStartUp");
    },
    serverShutDown: function () {
        callPlugins("serverShutDown");
    },
    stepEvent: function () {
        callPlugins("stepEvent");
    },
    beforeIPConnected: function (ip) {
        callPlugins("beforeIPConnected", ip);
    },
    beforeLogIn: function (src, defaultChannel) {
        callPlugins("beforeLogIn", src, defaultChannel);
    },
    afterLogIn: function (src, defaultChannel) {
        callPlugins("afterLogIn", src, defaultChannel);
    },
    beforeLogOut: function (src) {
        callPlugins("beforeLogOut", src);
    },
    afterLogOut: function (src) {
        callPlugins("afterLogOut", src);
    },
    beforeChatMessage: function (src, message, channel) {
        if((channel === 0 && message.length > 250 && sys.auth(src) < 1) || (message.length > 5000 && sys.auth(src) < 2)) {
            sys.sendMessage(src, "+Bot: Your message is too long, please make it shorter!");
            sys.stopEvent();
            return;
        }
        if(message == ".") {
            sys.sendMessage(src, sys.name(src) + ": .", channel);
            sys.stopEvent();
            this.afterChatMessage(src, message, channel);
            return;
        }
        if(message[0] == "#" && undefined !== sys.channelId(message.slice(1)) && !sys.isInChannel(src, sys.channelId(message.slice(1)))) {
            sys.putInChannel(src, sys.channelId(message.slice(1)));
            sys.stopEvent();
            return;
        }
        var poUser = SESSION.users(src);
        if(channel === 0 && sys.auth(src) === 0) {
            var msPerChar = 5;
            var now = new Date().getTime();
            if(poUser.talk + message.length * msPerChar < now) {
                poUser.talk = now;
            } else {
                sys.sendMessage(src, "+FloodBot: Wait a moment before talking again.", channel);
                sys.stopEvent();
                return;
            }
        }
        if(/[\u0458\u0489\u202a-\u202e\u0300-\u036F\u1dc8\u1dc9\ufffc\u1dc4-\u1dc7\u20d0\u20d1\u0415\u0421]/.test(message)) {
            sys.stopEvent();
            return;
        }
        if((message[0] == '/' || message[0] == '!') && message.length > 1) {
            var command = "";
            var commandData = "";
            var pos = message.indexOf(' ');
            if(pos != -1) {
                command = message.substring(1, pos);
                commandData = message.substr(pos + 1);
            } else {
                command = message.substr(1);
            }
            var tar = sys.id(commandData);
            var result1, result2;
            var commandHandler = "handleCommand" + command[0].toUpperCase() + command.substring(1);
            result1 = callPlugins(commandHandler, channel, src, commandData, tar);
            result2 = callPlugins("handleCommand", channel, src, command, commandData, tar);
            if(result1 == "UNKNOWN" && result2 == "UNKNOWN") {
                sys.sendMessage(src, "+CommandBot: The command " + command + " doesn't exist");
            }
            sys.stopEvent();
            return;
        }
        if(callPlugins("beforeChatMessage", src, message, channel) == "STOP") {
            sys.stopEvent();
            return;
        }
        var repeatingOneself = Utilities.Lazy(function () {
            var user = SESSION.users(src);
            var ret = false;
            if(!user.lastline) {
                user.lastline = {
                    message: null,
                    time: 0
                };
            }
            var time = parseInt(sys.time(), 10);
            if(!SESSION.channels(channel).official) {
                user.lastline.time = time;
                user.lastline.message = message;
                return ret;
            }
            if(!SESSION.channels(channel).isChannelOperator(src) && SESSION.users(src).contributions === undefined && sys.auth(src) < 1 && user.lastline.message == message && user.lastline.time + 15 > time) {
                sys.sendMessage(src, "Please do not repeat yourself!");
                ret = true;
            }
            user.lastline.time = time;
            user.lastline.message = message;
            return ret;
        });
        if(repeatingOneself()) {
            this.afterChatMessage(src, SESSION.users(src).lastline.message, channel);
            sys.stopEvent();
            return;
        }
    },
    afterChatMessage: function (src, message, channel) {
        callPlugins("afterChatMessage", src, message, channel);
    },
    beforeNewMessage: function (message) {
    },
    afterNewMessage: function (message) {
    },
    beforeNewPM: function (src) {
        callPlugins("beforeNewPM", src);
    },
    battleSetup: function (src, dest, battleId) {
        callPlugins("battleSetup", src, dest, battleId);
    },
    beforeFindBattle: function (src) {
        callPlugins("beforeFindBattle", src);
    },
    afterFindBattle: function (src) {
        callPlugins("afterFindBattle", src);
    },
    beforeChallengeIssued: function (src, dest, desc) {
        callPlugins("beforeChallengeIssued", src, dest, desc);
    },
    afterChallengeIssued: function (src, dest, desc) {
        callPlugins("afterChallengeIssued", src, desc);
    },
    beforeBattleMatchup: function (src, dest, desc) {
        callPlugins("beforeBattleMatchup", src, dest, desc);
    },
    afterBattleMatchup: function (src, dest, desc) {
        callPlugins("afterBattleMatchup", src, dest, desc);
    },
    beforeBattleStarted: function (src, dest, desc, battleid, team1, team2) {
        callPlugins("beforeBattleStarted", src, dest, desc, battleid, team1, team2);
    },
    afterBattleStarted: function (winner, loser, desc, battleid, team1, team2) {
        callPlugins("afterBattleStarted", winner, loser, desc, battleid, team1, team2);
    },
    beforeBattleEnded: function (winner, loser, desc, battleid) {
        callPlugins("afterBattleEnded", winner, loser, desc, battleid);
    },
    afterBattleEnded: function (winner, loser, desc, battleid) {
        callPlugins("afterBattleEnded", winner, loser, desc, battleid);
    },
    attemptToSpectateBattle: function (src, p1, p2) {
        callPlugins("attemptToSpectateBattle", src, p1, p2);
    },
    beforeSpectateBattle: function (src, p1, p2) {
        callPlugins("beforeSpectateBattle", src, p1, p2);
    },
    afterSpectateBattle: function (src, p1, p2) {
        callPlugins("afterSpectateBattle", src, p1, p2);
    },
    beforePlayerAway: function (src, away) {
        callPlugins("beforePlayerAway", src, away);
    },
    afterPlayerAway: function (src, away) {
        callPlugins("afterPlayerAway", src, away);
    },
    beforePlayerKick: function (src, dest) {
        callPlugins("beforePlayerKick", src, dest);
    },
    afterPlayerKick: function (src, dest) {
        callPlugins("afterPlayerKick", src, dest);
    },
    beforePlayerBan: function (src, dest, time) {
        callPlugins("beforePlayerBan", src, dest, time);
    },
    afterPlayerBan: function (src, dest, time) {
        callPlugins("afterPlayerBan", src, dest, time);
    },
    beforeChangeTeam: function (src) {
        callPlugins("beforeChangeTeam", src);
    },
    afterChangeTeam: function (src) {
        callPlugins("afterChangeTeam", src);
    },
    beforeChangeTier: function (src, teamSlot, oldTier, newTier) {
        callPlugins("beforeChangeTier", src, teamSlot, oldTier, newTier);
    },
    afterChangeTier: function (src, teamSlot, oldTier, newTier) {
        callPlugins("afterChangeTier", src, teamSlot, oldTier, newTier);
    },
    beforeChannelCreated: function (channelid, channelname, playerid) {
        callPlugins("beforeChannelCreated", channelid, channelname, playerid);
    },
    afterChannelCreated: function (channelid, channelname, playerid) {
        callPlugins("afterChannelCreated", channelid, channelname, playerid);
    },
    beforeChannelDestroyed: function (channelid) {
        callPlugins("beforeChannelDestroyed", channelid);
    },
    afterChannelDestroyed: function (channelid) {
        callPlugins("afterChannelDestroyed", channelid);
    },
    beforeChannelJoin: function (src, channelid) {
        callPlugins("beforeChannelJoin", src, channelid);
    },
    afterChannelJoin: function (src, channelid) {
        callPlugins("afterChannelJoin", src, channelid);
    },
    beforeChannelLeave: function (src, channelid) {
        callPlugins("beforeChannelLeave", src, channelid);
    },
    afterChannelLeave: function (src, channelid) {
        callPlugins("afterChannelLeave", src, channelid);
    }
});
