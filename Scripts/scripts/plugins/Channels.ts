///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

import File = module("scripts/includes/file");
import Utilities = module("scripts/includes/utilities");

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Channels implements IPlugin {

    public sourcePath: string;

    public serverStartUp(): string {
        // TODO: replace with if(channel.official) in channelManager
        var channels = File.readLines("scripts/conf/channels_autocreate.txt");
        channels.forEach((channel) => {
            if (channel.trim() != '') {
                var c = channel.split("\t");
                sys.sendAll("Automatically create permanent channel " + c[0]);
                SESSION.global().channelManager.createPermanentChannel(c[0], c[1]);
            }
        });
        return "OK";
    }

    public afterChannelCreated(channel: number, name: string, src: number) {
        SESSION.global().channelManager.restoreSettings(channel);
        return "OK";
    }
    
    public beforeChannelJoin(src, channel) {
        var poUser = SESSION.users(src);
        var poChannel = SESSION.channels(channel);

        // Can't ban from main
        if (channel === 0) {
            return "OK";
        }

        if (sys.auth(src) < 3 && poChannel.canJoin(src) == "banned") {
            sys.sendMessage(src, "켅hannelBot: You are banned from this channel! You can't join unless channel operators and masters unban you.");
            sys.stopEvent();
            return "STOP";
        }
        if (poChannel.canJoin(src) == "allowed") {
            return "OK";
        }
        if (poChannel.inviteonly > sys.auth(src)) {
            sys.sendMessage(src, "켅hannelBot: Sorry, but this channel is for higher authority!");
            sys.stopEvent();
            return "STOP";
        }

        return "OK";
    }

    public afterChannelJoin(player, chan) {
        if (typeof SESSION.channels(chan).topic != 'undefined') {
            sys.sendMessage(player, "Welcome Message: " + SESSION.channels(chan).topic, chan);
        }
        if (SESSION.channels(chan).isChannelOperator(player)) {
            sys.sendMessage(player, "켅hannelBot: use /topic <topic> to change the welcome message of this channel", chan);
        }
        if (SESSION.channels(chan).masters.length <= 0 &&
            !SESSION.channels(chan).official) {
            sys.sendMessage(player, "켅hannelBot: This channel is unregistered. If you're looking to own this channel, type /register in order to prevent your channel from being stolen.", chan);
        }

        return "OK";
    }

    public beforeChannelDestroyed(channel) {
        if (SESSION.channels(channel).perm) {
            sys.stopEvent();
            return "STOP";
        }
        else {
            return "OK";
        }
    }

    public handleCommandRegister(channel: number, src: number, commandData: string, tar: number): string {
        if (!sys.dbRegistered(sys.name(src))) {
            sys.sendMessage(src, "켅hannel: BotYou need to register on the server before registering a channel to yourself for security reasons!", channel);
            return "WARNING";
        }
        if (sys.auth(src) < 1 && SESSION.channels(channel).official) {
            sys.sendMessage(src, "켅hannel: BotYou don't have sufficient authority to register this channel!", channel);
            return "WARNING";
        }
        if (SESSION.channels(channel).register(sys.name(src))) {
            sys.sendMessage(src, "켅hannelBot: You registered this channel successfully. Take a look of /commands channel", channel);
        } else {
            sys.sendMessage(src, "켅hannelBot: This channel is already registered!", channel);
        }
        return "OK";
    }

    public handleCommandTopic(channel: number, src: number, commandData: string, tar: number): string {
        SESSION.channels(channel).setTopic(src, commandData);
        return "OK";
    }

    public handleCommandTopicAdd(channel: number, src: number, commandData: string, tar: number): string {
        if (SESSION.channels(channel).topic.length > 0)
            SESSION.channels(channel).setTopic(src, SESSION.channels(channel).topic + " | " + commandData);
        else
            SESSION.channels(channel).setTopic(src, commandData);
        return "OK";
    }

    public handleCommandCJoin(channel: number, src: number, commandData: string, tar: number): string {
        var chan;
        if (sys.existChannel(commandData)) {
            chan = sys.channelId(commandData);
        } else {
            chan = sys.createChannel(commandData);
        }
        sys.putInChannel(src, chan);
        return "OK";
    }

    public handleCommandCAuth(channel: number, src: number, commandData: string, tar: number): string {
        if (typeof SESSION.channels(channel).operators != 'object')
            SESSION.channels(channel).operators = [];
        if (typeof SESSION.channels(channel).admins != 'object')
            SESSION.channels(channel).admins = [];
        if (typeof SESSION.channels(channel).masters != 'object')
            SESSION.channels(channel).masters = [];
        if (typeof SESSION.channels(channel).members != 'object')
            SESSION.channels(channel).members = [];
        sys.sendMessage(src, "The channel members of " + sys.channel(channel) + " are:");
        sys.sendMessage(src, "Owners: " + SESSION.channels(channel).masters.join(", "));
        sys.sendMessage(src, "Admins: " + SESSION.channels(channel).admins.join(", "));
        sys.sendMessage(src, "Mods: " + SESSION.channels(channel).operators.join(", "));
        if (SESSION.channels(channel).inviteonly >= 1 || SESSION.channels(channel).members.length >= 1) {
            sys.sendMessage(src, "Members: " + SESSION.channels(channel).members.join(", "));
        }
        return "OK";
    }

    public handleCommandCK(channel: number, src: number, commandData: string, tar: number): string {
        return this.handleCommandChanKick(channel, src, commandData, tar);
    }

    public handleCommandChanKick(channel: number, src: number, commandData: string, tar: number): string {
        if (tar === undefined || !sys.isInChannel(tar, channel)) {
            sys.sendMessage(src, "켅hannelBot: Choose a valid target to kick", channel);
            return "WARNING";
        }
        sys.sendAll(sys.name(src) + " kicked " + commandData + " from the channel!", channel);
        sys.kick(tar, channel);
        return "OK";

    }

    public handleCommandInvite(channel: number, src: number, commandData: string, tar: number): string {
        if (tar === undefined) {
            sys.sendMessage(src, "켅hannelBot: Choose a valid target for invite!", channel);
            return "WARNING";
        }
        if (!sys.isInChannel(tar, channel)) {
            sys.sendMessage(tar, "" + sys.name(src) + " would like you to join #" + sys.channel(channel) + "!");
        }
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "member");
        return "OK";

    }

    public handleCommandMember(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "member");
        return "OK";
    }

    public handleCommandDeMember(channel: number, src: number, commandData: string, tar: number): string {
        return this.handleCommandDeInvite(channel, src, commandData, tar, false);
    }

    public handleCommandDeInvite(channel: number, src: number, commandData: string, tar: number, kickTarget = true): string {
        var poChannel = SESSION.channels(channel);
        poChannel.takeAuth(src, commandData, "member");
        if (tar !== undefined) {
            if (sys.isInChannel(tar, channel) && kickTarget) {
                sys.kick(tar, channel);
                sys.sendAll("And " + commandData + " was gone!", channel);
            }
        }
        return "OK";
    }

    public handleCommandCMeOn(channel: number, src: number, commandData: string, tar: number): string {
        var cid = sys.channelId(commandData);
        if (cid !== undefined) {
            SESSION.channels(cid).meoff = false;
            sys.sendAll("" + sys.name(src) + " turned on /me in " + commandData + ".", cid);
        } else {
            sys.sendMessage(src, "켅hannelBot: Sorry, that channel is unknown to me.", channel);
        }
        return "OK";
    }

    public handleCommandCMeOff(channel: number, src: number, commandData: string, tar: number): string {
        var cid = sys.channelId(commandData);
        if (cid !== undefined) {
            if (channel === 0) {
                sys.sendMessage(src, "/me can't be turned off here.");
                return "WARNING";
            }
            SESSION.channels(cid).meoff = true;
            sys.sendAll("" + sys.name(src) + " turned off /me in " + commandData + ".", cid);
        } else {
            sys.sendMessage(src, "켅hannelBot: Sorry, that channel is unknown to me.", channel);
        }
        return "OK";
    }

    public handleCommandCSilence(channel: number, src: number, commandData: string, tar: number): string {
        if (commandData == "") {
            sys.sendMessage(src, "켅hannelBot: Missing argument minutes");
            return "WARNING";
        }

        var minutes = parseInt(commandData);
        var chanName = sys.channel(channel);

        var delay = minutes * 60;
        if (isNaN(delay) || delay <= 0) {
            sys.sendMessage(src, "켅hannelBot: Sorry, I couldn't read your minutes.", channel);
        }
        if (!chanName) {
            sys.sendMessage(src, "켅hannelBot: Sorry, global silence is disabled. Use /silence 5 Channel Name", channel);
        } else {
            var cid = sys.channelId(chanName);
            if (cid !== undefined) {
                sys.sendAll("" + sys.name(src) + " called for " + minutes + " Minutes Of Silence in " + chanName + "!", cid);
                SESSION.channels(cid).muteall = true;
                sys.delayedCall(function () {
                    if (!SESSION.channels(cid).muteall)
                        return;
                    SESSION.channels(cid).muteall = false;
                    sys.sendAll("Silence is over in " + chanName + ".", cid);
                }, delay);
            } else {
                sys.sendMessage(src, "켅hannelBot: Sorry, I couldn't find a channel with that name.");
            }
        }

        return "OK";
    }

    public handleCommandCSilenceOff(channel: number, src: number, commandData: string, tar: number): string {
        var chanName = sys.channel(channel);
        if (chanName !== undefined) {
            var cid = sys.channelId(chanName);
            if (!SESSION.channels(cid).muteall) {
                sys.sendMessage(src, "켅hannelBot: The channel is not muted.");
                return;
            }
            sys.sendAll("" + sys.name(src) + " cancelled the Minutes of Silence in " + chanName + "!", cid);
            SESSION.channels(cid).muteall = false;
        } else {
            sys.sendMessage(src, "켅hannelBot: Use /silenceoff Channel Name");
        }
        return "OK";
    }

    public handleCommandCMute(channel: number, src: number, commandData: string, tar: number): string {
        var tmp = commandData.split(":", 3);
        var tarname = tmp[0];
        var time = 0;
        var reason = "";
        if (tmp.length >= 2) {
            reason = tmp[1];
            if (tmp.length >= 3) {
                time = Utilities.getSeconds(tmp[2]);
                if (isNaN(time)) {
                    time = 0;
                }
            }
        }
        if (sys.dbIp(tarname) === undefined) {
            sys.sendMessage(src, "켅hannelBot: This user doesn't exist.");
            return "WARNING";
        }
        var poChannel = SESSION.channels(channel);
        poChannel.mute(src, tarname, { 'time': time, 'reason': reason });
        return "OK";

    }

    public handleCommandCUnMute(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.unmute(src, commandData);
        return "OK";

    }

    public handleCommandCMutes(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        var cmutelist = poChannel.getReadableList("mutelist");
        if (cmutelist !== "") {
            sys.sendHtmlMessage(src, cmutelist, channel);
        }
        else {
            sys.sendMessage(src, "켅hannelBot: No one is muted on this channel.");
        }
        return "OK";
    }

    public handleCommandCBans(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        var cbanlist = poChannel.getReadableList("banlist");
        if (cbanlist !== "") {
            sys.sendHtmlMessage(src, cbanlist, channel);
        }
        else {
            sys.sendMessage(src, "켅hannelBot: No one is banned on this channel.");
        }
        return "OK";
    }

    // BELOW IS FOR CHANNEL ADMINS ONLY
    /*
    if(!poChannel.isChannelAdmin(src)) {
        return "no command";
    }
    */

    public handleCommandOp(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "mod");
        return "OK";
    }

    public handleCommandDeOp(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.takeAuth(src, commandData, "mod");
        return "OK";
    }

    public handleCommandInviteOnly(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        if (commandData === undefined) {
            sys.sendMessage(src, "켅hannelBot: " + (poChannel.inviteonly === 0 ? "This channel is public!" : "This channel is invite only for users below auth level " + poChannel.inviteonly));
            return "WARNING";
        }
        var value = -1;
        if (commandData == "off") {
            value = 0;
        }
        else if (commandData == "on") {
            value = 3;
        }
        else {
            value = parseInt(commandData, 10);
        }
        var message = poChannel.changeParameter(src, "invitelevel", value);
        sys.sendAll(message);
        return "OK";
    }

    public handleCommandCToggleFlood(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.ignoreflood = !poChannel.ignoreflood;
        sys.sendMessage(src, "켅hannelBot: Now " + (poChannel.ignoreflood ? "" : "dis") + "allowing excessive flooding.");
        return "OK";
    }

    public handleCommandCToggleCaps(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.ignorecaps = !poChannel.ignorecaps;
        sys.sendMessage(src, "켅hannelBot: Now " + (poChannel.ignorecaps ? "" : "dis") + "allowing excessive CAPS-usage.");
        return "OK";
    }

    public handleCommandCBan(channel: number, src: number, commandData: string, tar: number): string {
        var tmp = commandData.split(":", 3);
        var tarname = tmp[0];
        var time = 0;
        var reason = "";
        if (tmp.length >= 2) {
            reason = tmp[1];
            if (tmp.length >= 3) {
                time = Utilities.getSeconds(tmp[2]);
                if (isNaN(time)) {
                    time = 0;
                }
            }
        }
        if (sys.dbIp(tarname) === undefined) {
            sys.sendMessage(src, "켅hannelBot: This user doesn't exist.");
            return;
        }
        var poChannel = SESSION.channels(channel);
        poChannel.ban(src, tarname, { 'time': time, 'reason': reason });
        return "OK";
    }

    public handleCommandCUnBan(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.unban(src, commandData);
        return "OK";
    }

    /*
    // auth 2 can deregister channel for administration purposes
    if(!poChannel.isChannelOwner(src) && sys.auth(src) < 2) {
        return "no command";
    }
    */

    public handleCommandDeRegister(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        if (commandData == "") {
            poChannel.takeAuth(src, sys.name(src), "owner");
        }
        else {
            poChannel.takeAuth(src, commandData, "owner");
        }
        return "OK";
    }

    /*
        if (!poChannel.isChannelOwner(src)) {
            return "no command";
        }
    */
    public handleCommandAdmin(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "admin");
        return "OK";
    }

    public handleCommandDeAdmin(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.takeAuth(src, commandData, "admin");
        return "OK";
    }

    public handleCommandOwner(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.issueAuth(src, commandData, "owner");
        return "OK";
    }

    public handleCommandDeOwner(channel: number, src: number, commandData: string, tar: number): string {
        var poChannel = SESSION.channels(channel);
        poChannel.takeAuth(src, commandData, "owner");
        return "OK";
    }

    // MOD

    public handleCommandPerm(channel: number, src: number, commandData: string, tar: number): string {
        if (channel == SESSION.global().staffChannel || channel === 0) {
            sys.sendMessage(src, "켅hannelBot: You can't do that here.");
            return "WARNING";
        }

        SESSION.channels(channel).perm = (commandData.toLowerCase() == 'on');
        SESSION.global().channelManager.update(channel);
        sys.sendAll("" + sys.name(src) + (SESSION.channels(channel).perm ? " made the channel permanent." : " made the channel a temporary channel again."));
        return "OK";
    }

    // ADMIN

    public handleCommandDestroyChan(channel: number, src: number, commandData: string, tar: number): string {
        var ch = commandData;
        var chid = sys.channelId(ch);
        if (sys.existChannel(ch) !== true) {
            sys.sendMessage(src, "켅hannelBot: No channel exists by this name!");
            return "WARNING";
        }
        if (chid === 0 || chid == SESSION.global().staffChannel || SESSION.channels(chid).perm) {
            sys.sendMessage(src, "켅hannelBot: This channel cannot be destroyed!");
            return "WARNING";
        }
        var channelDataFile = SESSION.global().channelManager.dataFileFor(chid);
        sys.writeToFile(channelDataFile, "");
        sys.playersOfChannel(chid).forEach(function (player) {
            sys.kick(player, chid);
            if (sys.isInChannel(player, 0) !== true) {
                sys.putInChannel(player, 0);
            }
        });
        return "OK";
    }
    // ADMIN END
}

export var instance: IPlugin = new Channels();