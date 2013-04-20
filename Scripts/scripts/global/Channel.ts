///<reference path="../../interfaces/Channel.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>

import Utilities = module("scripts/includes/utilities");

declare var SESSION: any;
declare var sys: IScriptEngine;

function cmp(a, b) {
    return a.toLowerCase() == b.toLowerCase();
}

export class Channel implements IChannel {
    private topic = "";
    private topicSetter = "";

    private perm = false;
    public official = false;
    private inviteonly = 0;

    public masters = new string[];   // can add admins
    private admins = new string[];    // can ban, add mods, change invite level
    private operators = new string[]; // can mute, silence, kick
    private members = new string[];   // people that can join
    
    private muteall = false;
    private meoff = false;
    private muted = {};
    private banned = {};

    private ignorecaps = false;
    private ignoreflood = false;

    constructor(public id: number) {

    }

    public beforeMessage(src, msg) {
    }

    public toString() {
        return "[object POChannel]";
    }

    public setTopic(src, topicInfo) {
        var canSetTopic = (sys.auth(src) > 0 || this.isChannelOperator(src));
        if (topicInfo === undefined) {
            if (typeof this.topic != 'undefined') {
                sys.sendMessage(src, "Topic for this channel is: " + this.topic);
                if (this.topicSetter) {
                    sys.sendMessage(src, "Topic was set by " + Utilities.nonFlashing(this.topicSetter));
                }
            } else {
                sys.sendMessage(src, "No topic set for this channel.");
            }
            if (canSetTopic) {
                sys.sendMessage(src, "Specify a topic to set one!");
            }
            return;
        }
        if (!canSetTopic) {
            sys.sendMessage(src, "You don't have the rights to set topic");
            return;
        }
        this.changeParameter(src, "topic", topicInfo);
        SESSION.global().channelManager.update(this.id);
        sys.sendAll("" + sys.name(src) + " changed the topic to: " + topicInfo);
    }

    public isChannelOwner(id) {
        if (!sys.dbRegistered(sys.name(id))) {
            return false;
        }
        if (sys.auth(id) >= 3) { // || isSuperAdmin(id)
            return true;
        }
        if (typeof this.masters != "object") {
            this.masters = [];
        }
        if (this.masters.indexOf(sys.name(id).toLowerCase()) > -1) {
            return true;
        }
        return false;
    }

    public isChannelAdmin(id) {
        if (!sys.dbRegistered(sys.name(id))) {
            return false;
        }
        if (sys.auth(id) >= 2 || this.isChannelOwner(id)) {
            return true;
        }
        if (typeof this.admins != "object") {
            this.admins = [];
        }
        if (this.admins.indexOf(sys.name(id).toLowerCase()) > -1) {
            return true;
        }
        return false;
    }

    public isChannelOperator(id) {
        if (!sys.dbRegistered(sys.name(id))) {
            return false;
        }
        if ((sys.auth(id) >= 1 && this.id === 0) || this.isChannelAdmin(id)) {
            return true;
        }
        if (typeof this.operators != "object") {
            this.operators = [];
        }
        if (this.operators.indexOf(sys.name(id).toLowerCase()) > -1) {
            return true;
        }
        return false;
    }

    public addRole(src, tar, group, data) {
        var name = tar.toLowerCase();
        var auth = typeof src == "string" ? src : sys.name(src);
        if (sys.dbIp(tar) === undefined) {
            return ["self", "The user '" + tar.toCorrectCase() + "' doesn't exist!"];
        }
        if (!sys.dbRegistered(tar) && ["owner", "admin", "mod"].indexOf(group) != -1) {
            return ["self", "The user '" + tar.toCorrectCase() + "' is not registered so you can't give them channel authority!"];
        }
        if (typeof this.operators != 'object')
            this.operators = [];
        if (typeof this.admins != 'object')
            this.admins = [];
        if (typeof this.masters != 'object')
            this.masters = [];
        if (typeof this.members != 'object')
            this.members = [];
        if (group == "owner") {
            if (this.masters.indexOf(name) > -1) {
                return ["self", tar.toCorrectCase() + " is already a channel owner!"];
            }
            if (this.masters.length > 10) {
                return ["self", "There is a limit of 10 owners!"];
            }
            this.masters.push(name);
            return ["all", sys.name(src) + " made " + tar.toCorrectCase() + " a channel owner!"];
        }
        if (group == "admin") {
            if (this.admins.indexOf(name) > -1) {
                return ["self", tar.toCorrectCase() + " is already a channel admin!"];
            }
            if (this.admins.length > 50) {
                return ["self", "There is a limit of 50 admins!"];
            }
            this.admins.push(name);
            return ["all", sys.name(src) + " made " + tar.toCorrectCase() + " a channel admin!"];
        }
        if (group == "mod") {
            if (this.operators.indexOf(name) > -1) {
                return ["self", tar.toCorrectCase() + " is already a channel mod!"];
            }
            if (this.operators.length > 100) {
                return ["self", "There is a limit of 100 mods!"];
            }
            this.operators.push(name);
            return ["all", sys.name(src) + " made " + tar.toCorrectCase() + " a channel mod!"];
        }
        if (group == "member") {
            if (this.members.indexOf(name) > -1) {
                return ["self", tar.toCorrectCase() + " is already a member!"];
            }
            if (this.members.length > 250) {
                return ["self", "There is a limit of 250 members!"];
            }
            this.members.push(name);
            return ["all", sys.name(src) + " made " + tar.toCorrectCase() + " a member!"];
        }
        if (group == "muted") {
            if (this.isPunished(name) !== "none") {
                return ["self", tar.toCorrectCase() + " is already " + this.isPunished(name) + " from this channel!"];
            }
            if (!this.hasPermission(src, tar)) {
                return ["self", tar.toCorrectCase() + " has equal or higher auth than you, so you can't channel mute them!"];
            }
            if (this.official && !this.isChannelOwner(src)) {
                var maxtime = this.isChannelAdmin(src) ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
                if (data.time > maxtime || data.time === 0) {
                    data.time = maxtime;
                }
                if (data.reason === "") {
                    return ["self", "You need to provide a reason for the channel mute!"];
                }
            }
            this.muted[name] = { "expiry": data.time === 0 ? "never" : parseInt(sys.time(), 10) + data.time, "issuetime": parseInt(sys.time(), 10), "auth": auth, "reason": data.reason !== "" ? data.reason : "N/A" };
            var timestring = data.time > 0 ? " for " + Utilities.getTimeString(data.time) : " permanently";
            return ["all", auth + " muted " + tar.toCorrectCase() + timestring + " in this channel!" + (data.reason !== "" ? " [Reason: " + data.reason + "]" : "")];
        }
        if (group == "banned") {
            if (this.isPunished(name) === "banned") {
                return ["self", tar.toCorrectCase() + " is already banned from this channel!"];
            }
            if (!this.hasPermission(src, tar)) {
                return ["self", tar.toCorrectCase() + " has equal or higher auth than you, so you can't channel ban them!"];
            }
            if (this.official && !this.isChannelOwner(src)) {
                if (data.time > 7 * 24 * 60 * 60 || data.time === 0) {
                    data.time = 7 * 24 * 60 * 60;
                }
                if (data.reason === "") {
                    return ["self", "You need to provide a reason for the channel ban!"];
                }
            }
            this.banned[name] = { "expiry": data.time === 0 ? "never" : parseInt(sys.time(), 10) + data.time, "issuetime": parseInt(sys.time(), 10), "auth": auth, "reason": data.reason !== "" ? data.reason : "N/A" };
            var timestring = data.time > 0 ? " for " + Utilities.getTimeString(data.time) : " permanently";
            return ["all", auth + " banned " + tar.toCorrectCase() + timestring + " from this channel!" + (data.reason !== "" ? " [Reason: " + data.reason + "]" : "")];
        }
        return ["self", ""];
    }

    public removeRole(src, tar, group) {
        var name = tar.toLowerCase();
        if (typeof this.operators != 'object')
            this.operators = [];
        if (typeof this.admins != 'object')
            this.admins = [];
        if (typeof this.masters != 'object')
            this.masters = [];
        if (typeof this.members != 'object')
            this.members = [];
        if (group == "owner") {
            if (this.masters.indexOf(name) == -1) {
                return ["self", tar.toCorrectCase() + " is not a channel owner!"];
            }
            var index = this.masters.indexOf(name);
            this.masters.splice(index, 1);
            return ["all", sys.name(src) + " removed " + tar.toCorrectCase() + " from the channel owner list!"];
        }
        if (group == "admin") {
            if (this.admins.indexOf(name) == -1) {
                return ["self", tar.toCorrectCase() + " is not a channel admin!"];
            }
            var index = this.admins.indexOf(name);
            this.admins.splice(index, 1);
            return ["all", sys.name(src) + " removed " + tar.toCorrectCase() + " from the channel admin list!"];
        }
        if (group == "mod") {
            if (this.operators.indexOf(name) == -1) {
                return ["self", tar.toCorrectCase() + " is not a channel mod!"];
            }
            var index = this.operators.indexOf(name);
            this.operators.splice(index, 1);
            return ["all", sys.name(src) + " removed " + tar.toCorrectCase() + " from the channel mod list!"];
        }
        if (group == "member") {
            if (this.members.indexOf(name) == -1) {
                return ["self", tar.toCorrectCase() + " is not a member!"];
            }
            var index = this.members.indexOf(name);
            this.members.splice(index, 1);
            return ["all", sys.name(src) + " removed " + tar.toCorrectCase() + " from the channel member list!"];
        }
        if (group == "muted") {
            if (!this.muted.hasOwnProperty(name)) {
                return ["self", tar.toCorrectCase() + " is not muted in this channel!"];
            }
            delete this.muted[name];
            return ["all", sys.name(src) + " unmuted " + tar.toCorrectCase() + " in this channel!"];
        }
        if (group == "banned") {
            if (!this.banned.hasOwnProperty(name)) {
                return ["self", tar.toCorrectCase() + " is not banned from this channel!"];
            }
            delete this.banned[name];
            return ["all", sys.name(src) + " unbanned " + tar.toCorrectCase() + " from this channel!"];
        }
        return ["self", ""];
    }

    public issueAuth(src, name, group) {
        var ret = this.addRole(src, name, group, {});
        if (ret[0] == "self") {
            sys.sendMessage(src, ret[1]);
        }
        else {
            sys.sendAll(ret[1]);
            SESSION.global().channelManager.update(this.id);
        }
    }

    public takeAuth(src, name, group) {
        var ret = this.removeRole(src, name, group);
        if (ret[0] == "self") {
            sys.sendMessage(src, ret[1]);
        }
        else {
            sys.sendAll(ret[1]);
            SESSION.global().channelManager.update(this.id);
        }
    }

    public register(name) {
        if (this.masters.length === 0) {
            this.masters.push(name.toLowerCase());
            SESSION.global().channelManager.update(this.id);
            return true;
        }
        return false;
    };

    public canJoin(id) {
        if (this.isBanned(id)) {
            return "banned";
        }
        if (this.isChannelOperator(id)) {
            return "allowed";
        }
        if (typeof this.members != "object") {
            this.members = [];
        }
        if (this.members.indexOf(sys.name(id).toLowerCase()) > -1) {
            return "allowed";
        }
        return "nil";
    }

    public canTalk(id) {
        return !this.isMuted(id);
    }

    public ban(src, tar, data) {
        var ret = this.addRole(src, tar, "banned", data);
        if (ret[0] == "self") {
            if (typeof src == "number")
                sys.sendMessage(src, ret[1]);
        }
        else {
            sys.sendAll(ret[1]);
            SESSION.global().channelManager.update(this.id);
            // eject the offending user from the channel
            if (sys.id(tar) !== undefined) {
                if (sys.isInChannel(sys.id(tar), this.id)) {
                    if (sys.channelsOfPlayer(sys.id(tar)).length <= 1 && !sys.isInChannel(sys.id(tar), 0)) {
                        sys.putInChannel(sys.id(tar), 0);
                    }
                    sys.kick(sys.id(tar), this.id);
                    sys.sendAll("And " + tar + " was gone!");
                }
            }
        }
    }

    public unban(src, tar) {
        var ret = this.removeRole(src, tar, "banned");
        if (ret[0] == "self") {
            sys.sendMessage(src, ret[1]);
        }
        else {
            sys.sendAll(ret[1]);
            SESSION.global().channelManager.update(this.id);
        }
    }

    public mute(src, tar, data) {
        var ret = this.addRole(src, tar, "muted", data);
        if (ret[0] == "self") {
            if (typeof src == "number")
                sys.sendMessage(src, ret[1]);
        }
        else {
            sys.sendAll(ret[1]);
            SESSION.global().channelManager.update(this.id);
        }
    }

    public unmute(src, tar) {
        var ret = this.removeRole(src, tar, "muted");
        if (ret[0] == "self") {
            sys.sendMessage(src, ret[1]);
        }
        else {
            sys.sendAll(ret[1]);
            SESSION.global().channelManager.update(this.id);
        }
    }

    public isBanned(id) {
        // can't ban chan admins+
        if (this.isChannelAdmin(id)) {
            return false;
        }
        var banlist = this.banned;
        var ip = sys.ip(id);
        var name = sys.name(id);
        for (var x in banlist) {
            if (banlist.hasOwnProperty(x)) {
                if (!banlist[x].hasOwnProperty("expiry")) {
                    delete this.banned[x];
                    continue;
                }
                if (banlist[x].expiry <= parseInt(sys.time(), 10)) {
                    delete this.banned[x];
                    continue;
                }
                if (cmp(x, name)) {
                    return true;
                }
                if (sys.dbIp(x) == ip) {
                    return true;
                }
                return false;
            }
        }
    }

    public isMuted(id) {
        if (this.isChannelOperator(id)) {
            return false;
        }
        var mutelist = this.muted;
        var ip = sys.ip(id);
        var name = sys.name(id);
        for (var x in mutelist) {
            if (mutelist.hasOwnProperty(x)) {
                if (!mutelist[x].hasOwnProperty("expiry")) {
                    delete this.muted[x];
                    continue;
                }
                if (mutelist[x].expiry <= parseInt(sys.time(), 10)) {
                    delete this.muted[x];
                    sys.sendAll(x + "'s channel mute expired.");
                    continue;
                }
                if (cmp(x, name)) {
                    return true;
                }
                if (sys.dbIp(x) == ip) {
                    return true;
                }
                return false;
            }
        }
    }

    public isPunished(name) {
        var banlist = this.banned;
        for (var b in banlist) {
            if (banlist.hasOwnProperty(b)) {
                if (cmp(b, name)) {
                    return "banned";
                }
                if (sys.dbIp(b) == sys.dbIp(name)) {
                    return "banned";
                }
            }
        }
        var mutelist = this.muted;
        for (var m in mutelist) {
            if (mutelist.hasOwnProperty(m)) {
                if (cmp(m, name)) {
                    return "muted";
                }
                if (sys.dbIp(m) == sys.dbIp(name)) {
                    return "muted";
                }
            }
        }
        return "none";
    }

    public hasPermission(src, tar) {
        var srcauth = 0;
        if (typeof src == "string") {
            srcauth = 1;
        }
        else {
            if (this.isChannelOwner(src)) {
                srcauth = 3;
            }
            else if (this.isChannelAdmin(src)) {
                srcauth = 2;
            }
            else if (this.isChannelOperator(src)) {
                srcauth = 1;
            }
        }
        var tarauth = this.chanAuth(tar);
        return srcauth > tarauth;
    };

    public chanAuth(name) {
        var maxauth = 0;
        if (sys.dbAuth(name) >= 2 || this.id === 0) {
            maxauth = sys.dbAuth(name);
        }
        var lname = name.toLowerCase();
        if (typeof this.operators != 'object')
            this.operators = [];
        if (typeof this.admins != 'object')
            this.admins = [];
        if (typeof this.masters != 'object')
            this.masters = [];
        if (this.masters.indexOf(lname) > -1) {
            maxauth = 3;
        }
        else if (this.admins.indexOf(lname) > -1 && maxauth < 2) {
            maxauth = 2;
        }
        else if (this.operators.indexOf(lname) > -1 && maxauth < 1) {
            maxauth = 1;
        }
        return maxauth;
    }

    public changeParameter(src, parameter, value) {
        if (parameter == "topic") {
            this.topic = value;
            this.topicSetter = sys.name(src);
            return;
        }
        if (parameter == "allowcaps") {
            if (value === true) {
                this.ignorecaps = true;
            }
            else {
                this.ignorecaps = false;
            }
            SESSION.global().channelManager.update(this.id);
            return;
        }
        if (parameter == "allowflood") {
            if (value === true) {
                this.ignoreflood = true;
            }
            else {
                this.ignoreflood = false;
            }
            SESSION.global().channelManager.update(this.id);
            return;
        }
        if (parameter == "invitelevel") {
            var level = parseInt(value, 10);
            var maxvalue = sys.auth(src) >= 3 ? 3 : sys.auth(src) + 1;
            if (level <= 0 || isNaN(level)) {
                level = 0;
            }
            else if (level > maxvalue) {
                level = maxvalue;
            }
            this.inviteonly = level;
            SESSION.global().channelManager.update(this.id);
            if (level === 0) {
                return sys.name(src) + " made this channel public.";
            }
            else {
                return sys.name(src) + " made this channel invite only for users below auth level " + level + ".";
            }
        }
    }

    public getReadableList(type) {
        try {
            var name = "";
            var mh = {};
            if (type == "mutelist") {
                mh = this.muted;
                name = "Channel Muted";
            }
            else if (type == "banlist") {
                mh = this.banned;
                name = "Channel Banned";
            }
            else {
                return "";
            }
            var width = 4;
            var max_message_length = 30000;
            var tmp = [];
            var t = parseInt(sys.time(), 10);
            var toDelete = [];
            for (var x in mh) {
                if (mh.hasOwnProperty(x)) {
                    if (!mh[x].hasOwnProperty("expiry")) {
                        continue;
                    }
                    var playername = Utilities.escapeHtml(x);
                    var expirytime = isNaN(mh[x].expiry) ? "never" : (mh[x].expiry - parseInt(sys.time(), 10)).toString();
                    if (parseInt(expirytime) <= 0) {
                        continue;
                    }
                    var issuetime = Utilities.getTimeString(parseInt(sys.time(), 10) - mh[x].issuetime);
                    var auth = Utilities.escapeHtml(mh[x].auth);
                    var reason = Utilities.escapeHtml(mh[x].reason);
                    tmp.push([playername, auth, issuetime, isNaN(mh[x].expiry) ? expirytime : Utilities.getTimeString(parseInt(expirytime)), reason]);
                }
            }
            tmp.sort(function (a, b) { return a[2] - b[2]; });

        // generate HTML
            var table_header = '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="' + width + '"><center><strong>' + Utilities.escapeHtml(name) + '</strong></center></td></tr><tr><th>Name</th><th>By</th><th>Issued ago</th><th>Expires in</th><th>Reason</th>';
            var table_footer = '</table>';
            var table = table_header;
            var line;
            var send_rows = 0;
            while (tmp.length > 0) {
                line = '<tr><td>' + tmp[0].join('</td><td>') + '</td></tr>';
                tmp.splice(0, 1);
                if (table.length + line.length + table_footer.length > max_message_length) {
                    if (send_rows === 0) continue; // Can't send this line!
                    table += table_footer;
                    // Really need to return multiple tables from this function... return a list??
                    // Or give a callback
                    // sendChanHtmlMessage(src, table, channel);
                    table = table_header;
                    send_rows = 0;
                }
                table += line;
                ++send_rows;
            }
            table += table_footer;
            if (send_rows > 0) {
                return table;
            }
            else {
                return "";
            }
        }
        catch (e) {
            return "";
        }
    }
}