var File = require("./scripts/includes/file")
var Utilities = require("./scripts/includes/utilities")
var Channels = (function () {
    function Channels() { }
    Channels.prototype.serverStartUp = function () {
        var channels = File.readLines("scripts/conf/channels_autocreate.txt");
        channels.forEach(function (channel) {
            if(channel.trim() != '') {
                var c = channel.split("\t");
                sys.sendAll("Automatically create permanent channel " + c[0]);
                SESSION.global().channelManager.createPermanentChannel(c[0], c[1]);
            }
        });
        return "OK";
    };
    Channels.prototype.afterChannelCreated = function (channel, name, src) {
        SESSION.global().channelManager.restoreSettings(channel);
        return "OK";
    };
    Channels.prototype.beforeChannelJoin = function (src, channel) {
        var poUser = SESSION.users(src);
        var poChannel = SESSION.channels(channel);
        if(channel === 0) {
            return "OK";
        }
        if(sys.auth(src) < 3 && poChannel.canJoin(src) == "banned") {
            sys.sendMessage(src, "±ChannelBot: You are banned from this channel! You can't join unless channel operators and masters unban you.");
            sys.stopEvent();
            return "STOP";
        }
        if(poChannel.canJoin(src) == "allowed") {
            return "OK";
        }
        if(poChannel.inviteonly > sys.auth(src)) {
            sys.sendMessage(src, "±ChannelBot: Sorry, but this channel is for higher authority!");
            sys.stopEvent();
            return "STOP";
        }
        return "OK";
    };
    Channels.prototype.afterChannelJoin = function (player, chan) {
        if(typeof SESSION.channels(chan).topic != 'undefined') {
            sys.sendMessage(player, "Welcome Message: " + SESSION.channels(chan).topic, chan);
        }
        if(SESSION.channels(chan).isChannelOperator(player)) {
            sys.sendMessage(player, "±ChannelBot: use /topic <topic> to change the welcome message of this channel", chan);
        }
        if(SESSION.channels(chan).masters.length <= 0 && !SESSION.channels(chan).official) {
            sys.sendMessage(player, "±ChannelBot: This channel is unregistered. If you're looking to own this channel, type /register in order to prevent your channel from being stolen.", chan);
        }
        return "OK";
    };
    Channels.prototype.beforeChannelDestroyed = function (channel) {
        if(SESSION.channels(channel).perm) {
            sys.stopEvent();
            return "STOP";
        } else {
            return "OK";
        }
    };
    Channels.prototype.handleCommandRegister = function (channel, src, commandData, tar) {
        if(!sys.dbRegistered(sys.name(src))) {
            sys.sendMessage(src, "±Channel: BotYou need to register on the server before registering a channel to yourself for security reasons!", channel);
            return "WARNING";
        }
        if(sys.auth(src) < 1 && SESSION.channels(channel).official) {
            sys.sendMessage(src, "±Channel: BotYou don't have sufficient authority to register this channel!", channel);
            return "WARNING";
        }
        if(SESSION.channels(channel).register(sys.name(src))) {
            sys.sendMessage(src, "±ChannelBot: You registered this channel successfully. Take a look of /commands channel", channel);
        } else {
            sys.sendMessage(src, "±ChannelBot: This channel is already registered!", channel);
        }
        return "OK";
    };
    Channels.prototype.handleCommandTopic = function (channel, src, commandData, tar) {
        SESSION.channels(channel).setTopic(src, commandData);
        return "OK";
    };
    Channels.prototype.handleCommandTopicAdd = function (channel, src, commandData, tar) {
        if(SESSION.channels(channel).topic.length > 0) {
            SESSION.channels(channel).setTopic(src, SESSION.channels(channel).topic + " | " + commandData);
        } else {
            SESSION.channels(channel).setTopic(src, commandData);
        }
        return "OK";
    };
    Channels.prototype.handleCommandCJoin = function (channel, src, commandData, tar) {
        var chan;
        if(sys.existChannel(commandData)) {
            chan = sys.channelId(commandData);
        } else {
            chan = sys.createChannel(commandData);
        }
        sys.putInChannel(src, chan);
        return "OK";
    };
    Channels.prototype.handleCommandCAuth = function (channel, src, commandData, tar) {
        if(typeof SESSION.channels(channel).operators != 'object') {
            SESSION.channels(channel).operators = [];
        }
        if(typeof SESSION.channels(channel).admins != 'object') {
            SESSION.channels(channel).admins = [];
        }
        if(typeof SESSION.channels(channel).masters != 'object') {
            SESSION.channels(channel).masters = [];
        }
        if(typeof SESSION.channels(channel).members != 'object') {
            SESSION.channels(channel).members = [];
        }
        sys.sendMessage(src, "The channel members of " + sys.channel(channel) + " are:");
        sys.sendMessage(src, "Owners: " + SESSION.channels(channel).masters.join(", "));
        sys.sendMessage(src, "Admins: " + SESSION.channels(channel).admins.join(", "));
        sys.sendMessage(src, "Mods: " + SESSION.channels(channel).operators.join(", "));
        if(SESSION.channels(channel).inviteonly >= 1 || SESSION.channels(channel).members.length >= 1) {
            sys.sendMessage(src, "Members: " + SESSION.channels(channel).members.join(", "));
        }
        return "OK";
    };
    Channels.prototype.handleCommandCK = function (channel, src, commandData, tar) {
        return this.handleCommandChanKick(channel, src, commandData, tar);
    };
    Channels.prototype.handleCommandChanKick = function (channel, src, commandData, tar) {
        if(tar === undefined || !sys.isInChannel(tar, channel)) {
            sys.sendMessage(src, "±ChannelBot: Choose a valid target to kick", channel);
            return "WARNING";
        }
        sys.sendAll(sys.name(src) + " kicked " + commandData + " from the channel!", channel);
        sys.kick(tar, channel);
        return "OK";
    };
    Channels.prototype.handleCommandInvite = function (channel, src, commandData, tar) {
        if(tar === undefined) {
            sys.sendMessage(src, "±ChannelBot: Choose a valid target for invite!", channel);
            return "WARNING";
        }
        if(!sys.isInChannel(tar, channel)) {
            sys.sendMessage(tar, "" + sys.name(src) + " would like you to join #" + sys.channel(channel) + "!");
        }
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "member");
        return "OK";
    };
    Channels.prototype.handleCommandMember = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "member");
        return "OK";
    };
    Channels.prototype.handleCommandDeMember = function (channel, src, commandData, tar) {
        return this.handleCommandDeInvite(channel, src, commandData, tar, false);
    };
    Channels.prototype.handleCommandDeInvite = function (channel, src, commandData, tar, kickTarget) {
        if (typeof kickTarget === "undefined") { kickTarget = true; }
        var poChannel = SESSION.channels(channel);
        poChannel.takeAuth(src, commandData, "member");
        if(tar !== undefined) {
            if(sys.isInChannel(tar, channel) && kickTarget) {
                sys.kick(tar, channel);
                sys.sendAll("And " + commandData + " was gone!", channel);
            }
        }
        return "OK";
    };
    Channels.prototype.handleCommandCMeOn = function (channel, src, commandData, tar) {
        var cid = sys.channelId(commandData);
        if(cid !== undefined) {
            SESSION.channels(cid).meoff = false;
            sys.sendAll("" + sys.name(src) + " turned on /me in " + commandData + ".", cid);
        } else {
            sys.sendMessage(src, "±ChannelBot: Sorry, that channel is unknown to me.", channel);
        }
        return "OK";
    };
    Channels.prototype.handleCommandCMeOff = function (channel, src, commandData, tar) {
        var cid = sys.channelId(commandData);
        if(cid !== undefined) {
            if(channel === 0) {
                sys.sendMessage(src, "/me can't be turned off here.");
                return "WARNING";
            }
            SESSION.channels(cid).meoff = true;
            sys.sendAll("" + sys.name(src) + " turned off /me in " + commandData + ".", cid);
        } else {
            sys.sendMessage(src, "±ChannelBot: Sorry, that channel is unknown to me.", channel);
        }
        return "OK";
    };
    Channels.prototype.handleCommandCSilence = function (channel, src, commandData, tar) {
        if(commandData == "") {
            sys.sendMessage(src, "±ChannelBot: Missing argument minutes");
            return "WARNING";
        }
        var minutes = parseInt(commandData);
        var chanName = sys.channel(channel);
        var delay = minutes * 60;
        if(isNaN(delay) || delay <= 0) {
            sys.sendMessage(src, "±ChannelBot: Sorry, I couldn't read your minutes.", channel);
        }
        if(!chanName) {
            sys.sendMessage(src, "±ChannelBot: Sorry, global silence is disabled. Use /silence 5 Channel Name", channel);
        } else {
            var cid = sys.channelId(chanName);
            if(cid !== undefined) {
                sys.sendAll("" + sys.name(src) + " called for " + minutes + " Minutes Of Silence in " + chanName + "!", cid);
                SESSION.channels(cid).muteall = true;
                sys.delayedCall(function () {
                    if(!SESSION.channels(cid).muteall) {
                        return;
                    }
                    SESSION.channels(cid).muteall = false;
                    sys.sendAll("Silence is over in " + chanName + ".", cid);
                }, delay);
            } else {
                sys.sendMessage(src, "±ChannelBot: Sorry, I couldn't find a channel with that name.");
            }
        }
        return "OK";
    };
    Channels.prototype.handleCommandCSilenceOff = function (channel, src, commandData, tar) {
        var chanName = sys.channel(channel);
        if(chanName !== undefined) {
            var cid = sys.channelId(chanName);
            if(!SESSION.channels(cid).muteall) {
                sys.sendMessage(src, "±ChannelBot: The channel is not muted.");
                return;
            }
            sys.sendAll("" + sys.name(src) + " cancelled the Minutes of Silence in " + chanName + "!", cid);
            SESSION.channels(cid).muteall = false;
        } else {
            sys.sendMessage(src, "±ChannelBot: Use /silenceoff Channel Name");
        }
        return "OK";
    };
    Channels.prototype.handleCommandCMute = function (channel, src, commandData, tar) {
        var tmp = commandData.split(":", 3);
        var tarname = tmp[0];
        var time = 0;
        var reason = "";
        if(tmp.length >= 2) {
            reason = tmp[1];
            if(tmp.length >= 3) {
                time = Utilities.getSeconds(tmp[2]);
                if(isNaN(time)) {
                    time = 0;
                }
            }
        }
        if(sys.dbIp(tarname) === undefined) {
            sys.sendMessage(src, "±ChannelBot: This user doesn't exist.");
            return "WARNING";
        }
        var poChannel = SESSION.channels(channel);
        poChannel.mute(src, tarname, {
            'time': time,
            'reason': reason
        });
        return "OK";
    };
    Channels.prototype.handleCommandCUnMute = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.unmute(src, commandData);
        return "OK";
    };
    Channels.prototype.handleCommandCMutes = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        var cmutelist = poChannel.getReadableList("mutelist");
        if(cmutelist !== "") {
            sys.sendHtmlMessage(src, cmutelist, channel);
        } else {
            sys.sendMessage(src, "±ChannelBot: No one is muted on this channel.");
        }
        return "OK";
    };
    Channels.prototype.handleCommandCBans = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        var cbanlist = poChannel.getReadableList("banlist");
        if(cbanlist !== "") {
            sys.sendHtmlMessage(src, cbanlist, channel);
        } else {
            sys.sendMessage(src, "±ChannelBot: No one is banned on this channel.");
        }
        return "OK";
    };
    Channels.prototype.handleCommandOp = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "mod");
        return "OK";
    };
    Channels.prototype.handleCommandDeOp = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.takeAuth(src, commandData, "mod");
        return "OK";
    };
    Channels.prototype.handleCommandInviteOnly = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        if(commandData === undefined) {
            sys.sendMessage(src, "±ChannelBot: " + (poChannel.inviteonly === 0 ? "This channel is public!" : "This channel is invite only for users below auth level " + poChannel.inviteonly));
            return "WARNING";
        }
        var value = -1;
        if(commandData == "off") {
            value = 0;
        } else {
            if(commandData == "on") {
                value = 3;
            } else {
                value = parseInt(commandData, 10);
            }
        }
        var message = poChannel.changeParameter(src, "invitelevel", value);
        sys.sendAll(message);
        return "OK";
    };
    Channels.prototype.handleCommandCToggleFlood = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.ignoreflood = !poChannel.ignoreflood;
        sys.sendMessage(src, "±ChannelBot: Now " + (poChannel.ignoreflood ? "" : "dis") + "allowing excessive flooding.");
        return "OK";
    };
    Channels.prototype.handleCommandCToggleCaps = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.ignorecaps = !poChannel.ignorecaps;
        sys.sendMessage(src, "±ChannelBot: Now " + (poChannel.ignorecaps ? "" : "dis") + "allowing excessive CAPS-usage.");
        return "OK";
    };
    Channels.prototype.handleCommandCBan = function (channel, src, commandData, tar) {
        var tmp = commandData.split(":", 3);
        var tarname = tmp[0];
        var time = 0;
        var reason = "";
        if(tmp.length >= 2) {
            reason = tmp[1];
            if(tmp.length >= 3) {
                time = Utilities.getSeconds(tmp[2]);
                if(isNaN(time)) {
                    time = 0;
                }
            }
        }
        if(sys.dbIp(tarname) === undefined) {
            sys.sendMessage(src, "±ChannelBot: This user doesn't exist.");
            return;
        }
        var poChannel = SESSION.channels(channel);
        poChannel.ban(src, tarname, {
            'time': time,
            'reason': reason
        });
        return "OK";
    };
    Channels.prototype.handleCommandCUnBan = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.unban(src, commandData);
        return "OK";
    };
    Channels.prototype.handleCommandDeRegister = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        if(commandData == "") {
            poChannel.takeAuth(src, sys.name(src), "owner");
        } else {
            poChannel.takeAuth(src, commandData, "owner");
        }
        return "OK";
    };
    Channels.prototype.handleCommandAdmin = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "admin");
        return "OK";
    };
    Channels.prototype.handleCommandDeAdmin = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.takeAuth(src, commandData, "admin");
        return "OK";
    };
    Channels.prototype.handleCommandOwner = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "owner");
        return "OK";
    };
    Channels.prototype.handleCommandDeOwner = function (channel, src, commandData, tar) {
        var poChannel = SESSION.channels(channel);
        poChannel.takeAuth(src, commandData, "owner");
        return "OK";
    };
    Channels.prototype.handleCommandPerm = function (channel, src, commandData, tar) {
        if(channel == SESSION.global().staffChannel || channel === 0) {
            sys.sendMessage(src, "±ChannelBot: You can't do that here.");
            return "WARNING";
        }
        SESSION.channels(channel).perm = (commandData.toLowerCase() == 'on');
        SESSION.global().channelManager.update(channel);
        sys.sendAll("" + sys.name(src) + (SESSION.channels(channel).perm ? " made the channel permanent." : " made the channel a temporary channel again."));
        return "OK";
    };
    Channels.prototype.handleCommandDestroyChan = function (channel, src, commandData, tar) {
        var ch = commandData;
        var chid = sys.channelId(ch);
        if(sys.existChannel(ch) !== true) {
            sys.sendMessage(src, "±ChannelBot: No channel exists by this name!");
            return "WARNING";
        }
        if(chid === 0 || chid == SESSION.global().staffChannel || SESSION.channels(chid).perm) {
            sys.sendMessage(src, "±ChannelBot: This channel cannot be destroyed!");
            return "WARNING";
        }
        var channelDataFile = SESSION.global().channelManager.dataFileFor(chid);
        sys.writeToFile(channelDataFile, "");
        sys.playersOfChannel(chid).forEach(function (player) {
            sys.kick(player, chid);
            if(sys.isInChannel(player, 0) !== true) {
                sys.putInChannel(player, 0);
            }
        });
        return "OK";
    };
    return Channels;
})();
exports.Channels = Channels;
exports.instance = new Channels();
