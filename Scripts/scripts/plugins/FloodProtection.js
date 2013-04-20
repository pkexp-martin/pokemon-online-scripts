
var FloodProtection = (function () {
    function FloodProtection() { }
    FloodProtection.prototype.beforeNewPM = function (src) {
        var user = SESSION.users(src);
        if(user.smute.active) {
            sys.stopEvent();
            return "STOP";
        }
        if(user.lastpm == 0) {
            user.lastpm = sys.time();
        }
        if(user.lastpm > sys.time() - 20) {
            user.pmcount += 1;
        }
        if(user.lastpm < sys.time() - 300) {
            user.pmcount = 0;
            user.pmwarned = false;
        }
        var pmlimit = 20;
        if(user.pmcount > pmlimit) {
            sys.stopEvent();
            if(user.pmwarned === false) {
                sys.sendAll('User ' + sys.name(src) + ' is potentially spamming through PM', SESSION.global().staffChannel);
                user.pmwarned = true;
            }
            return "STOP";
        }
        user.lastpm = sys.time();
        return "OK";
    };
    FloodProtection.prototype.afterChatMessage = function (src, message, channel) {
        var user = SESSION.users(src);
        var poChannel = SESSION.channels(channel);
        var staffchannel = SESSION.global().staffChannel;
        var ignoreChans = [];
        var ignoreUsers = [];
        var userMayGetPunished = sys.auth(src) < 2 && ignoreChans.indexOf(channel) == -1 && ignoreUsers.indexOf(sys.name(src)) == -1 && !poChannel.isChannelOperator(src);
        var officialChan = poChannel.official;
        if(!poChannel.ignorecaps && this.isCapsed(message) && userMayGetPunished) {
            user.caps += 3;
            var maxCaps = 9;
            if(user.caps >= maxCaps && !user.mute.active) {
                var time = 300 * Math.pow(2, user.capsmutes);
                if(officialChan) {
                    var info = sys.name(src) + " was muted for caps for " + (time / 60) + " minutes";
                    ++user.capsmutes;
                    if(user.smute.active) {
                        sys.sendMessage(src, message);
                        sys.sendAll(info + " while smuted.", staffchannel);
                    } else {
                        sys.sendAll(message);
                        if(channel != staffchannel) {
                            sys.sendAll(info + "[Channel: " + sys.channel(channel) + "]", staffchannel);
                        }
                    }
                }
                var endtime = user.mute.active ? user.mute.expires + time : parseInt(sys.time(), 10) + time;
                if(officialChan) {
                    user.activate("mute", "CapsBot", endtime, "Overusing CAPS", true);
                    callPlugins("onMute", src);
                    return "OK";
                } else {
                    poChannel.mute("CapsBot", sys.name(src), {
                        'time': time,
                        'reason': "Overusing CAPS"
                    });
                }
            }
        } else {
            if(user.caps > 0) {
                user.caps -= 1;
            }
        }
        var linecount = sys.auth(src) === 0 ? 9 : 21;
        if(!poChannel.ignoreflood && userMayGetPunished) {
            user.floodcount += 1;
            var time = parseInt(sys.time(), 10);
            if(time > user.timecount + 7) {
                var dec = Math.floor((time - user.timecount) / 7);
                user.floodcount = user.floodcount - dec;
                if(user.floodcount <= 0) {
                    user.floodcount = 1;
                }
                user.timecount += dec * 7;
            }
            sys.sendAll("Floodcount now " + user.floodcount);
            if(user.floodcount > linecount) {
                var info = sys.name(src) + " was kicked " + (sys.auth(src) === 0 && officialChan ? "and muted " : "") + "for flood";
                if(officialChan) {
                    if(user.smute.active) {
                        sys.sendMessage(src, message);
                        sys.sendAll(info + " while smuted.", staffchannel);
                    } else {
                        sys.sendAll(message);
                        if(channel != staffchannel) {
                            sys.sendAll(info + " [Channel: " + sys.channel(channel) + "]", staffchannel);
                        }
                    }
                    if(sys.auth(src) === 0) {
                        var endtime = user.mute.active ? user.mute.expires + 3600 : parseInt(sys.time(), 10) + 3600;
                        user.activate("mute", "KickBot", endtime, "Flooding", true);
                    }
                    callPlugins("onKick", src);
                    sys.kick(src);
                    return "OK";
                } else {
                    poChannel.mute("KickBot", sys.name(src), {
                        'time': 3600,
                        'reason': "Flooding"
                    });
                    sys.kick(src, channel);
                }
            }
        }
        return "OK";
    };
    FloodProtection.prototype.isCapsed = function (message) {
        var count = 0;
        for(var i = 0; i < message.length; i++) {
            var char = message[i];
            if(char >= 'A' && char <= 'Z') {
                count += 1;
                if(count == 5) {
                    return true;
                }
            } else {
                count -= 2;
                if(count < 0) {
                    count = 0;
                }
            }
        }
        return false;
    };
    return FloodProtection;
})();
exports.FloodProtection = FloodProtection;
exports.instance = new FloodProtection();
