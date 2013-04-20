var StaffChannel = (function () {
    function StaffChannel() { }
    StaffChannel.channelEnabled = true;
    StaffChannel.channelName = "Staff";
    StaffChannel.channelDescription = "Welcome to the Staff Channel! Discuss of all what users shouldn't hear here! Or more serious stuff...";
    StaffChannel.prototype.serverStartUp = function () {
        SESSION.global().staffChannel = StaffChannel.getStaffChannelID();
        return "OK";
    };
    StaffChannel.prototype.afterLogIn = function (src) {
        if(sys.auth(src) <= 3 && this.canJoinStaffChannel(src)) {
            sys.putInChannel(src, SESSION.global().staffChannel);
        }
        return "OK";
    };
    StaffChannel.prototype.afterChannelCreated = function (channel, name, src) {
        if(name == StaffChannel.channelName) {
            SESSION.global().staffChannel = channel;
        }
        return "OK";
    };
    StaffChannel.prototype.beforeChannelJoin = function (src, channel) {
        if(channel == SESSION.global().staffChannel && !this.canJoinStaffChannel(src) && SESSION.channels(channel).canJoin(src) != "allowed") {
            sys.sendMessage(src, "+Guard: Sorry, the access to that place is restricted!");
            sys.stopEvent();
            return "STOP";
        }
        return "OK";
    };
    StaffChannel.prototype.beforeChannelDestroyed = function (channel) {
        if(channel == SESSION.global().staffChannel && StaffChannel.channelEnabled) {
            sys.stopEvent();
            return "STOP";
        }
    };
    StaffChannel.prototype.handleCommandStaffInvite = function (channel, src, commandData, tar) {
        if(channel != SESSION.global().staffChannel) {
            sys.sendMessage(src, "Can't use on this channel.");
            return "WARNING";
        }
        if(tar === undefined) {
            sys.sendMessage(src, "Your target is not online.");
            return "WARNING";
        }
        if(SESSION.users(tar).megauser || SESSION.users(tar).contributions != '' || sys.auth(tar) > 0) {
            sys.sendMessage(src, "They have already access.");
            return "WARNING";
        }
        SESSION.channels(channel).issueAuth(src, commandData, "member");
        sys.sendAll("" + sys.name(src) + " summoned " + sys.name(tar) + " to this channel!", channel);
        sys.putInChannel(tar, channel);
        sys.sendMessage(tar, "" + sys.name(src) + " made you join this channel!");
        return "OK";
    };
    StaffChannel.prototype.handleCommandStaffDeInvite = function (channel, src, commandData, tar) {
        var count = 0;
        var players = sys.playerIds();
        var players_length = players.length;
        for(var i = 0; i < players_length; ++i) {
            var current_player = players[i];
            if(sys.isInChannel(current_player, SESSION.global().staffChannel) && !this.canJoinStaffChannel(current_player)) {
                sys.kick(current_player, SESSION.global().staffChannel);
                SESSION.channels(channel).takeAuth(src, sys.name(current_player), "member");
                count = 1;
            }
        }
        sys.sendAll("" + count + " unwanted visitors were kicked...", SESSION.global().staffChannel);
        return "OK";
    };
    StaffChannel.prototype.handleCommandStaffChannel = function (channel, src, commandData, tar) {
        if(commandData == "on") {
            var staffchannel = StaffChannel.getStaffChannelID();
            SESSION.global().staffChannel = staffchannel;
            SESSION.channels(staffchannel).topic = StaffChannel.channelDescription;
            SESSION.channels(staffchannel).perm = true;
            SESSION.channels(staffchannel).official = true;
            sys.sendMessage(src, "Staff channel was remade!", channel);
            return "OK";
        } else {
            if(commandData == "off") {
                StaffChannel.channelEnabled = false;
                SESSION.channels(staffchannel).perm = false;
                var players = sys.playersOfChannel(staffchannel);
                for(var x = 0; x < players.length; x++) {
                    sys.kick(players[x], staffchannel);
                    if(sys.isInChannel(players[x], 0) !== true) {
                        sys.putInChannel(players[x], 0);
                    }
                }
                sys.sendMessage(src, "Staff channel was destroyed!", channel);
                return "OK";
            } else {
                sys.sendMessage(src, "Missing argument on/off!", channel);
                return "WARNING";
            }
        }
    };
    StaffChannel.getStaffChannelID = function getStaffChannelID() {
        if(sys.existChannel(StaffChannel.channelName)) {
            return sys.channelId(StaffChannel.channelName);
        } else {
            return sys.createChannel(StaffChannel.channelName);
        }
    }
    StaffChannel.prototype.canJoinStaffChannel = function (src) {
        if(sys.auth(src) > 0) {
            return true;
        }
        if(SESSION.users(src).megauser) {
            return true;
        }
        if(SESSION.users(src).contributions != "") {
            return true;
        } else {
            return false;
        }
    };
    return StaffChannel;
})();
exports.StaffChannel = StaffChannel;
exports.instance = new StaffChannel();
