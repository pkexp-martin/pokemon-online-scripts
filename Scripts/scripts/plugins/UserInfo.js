var UserInfo = (function () {
    function UserInfo() { }
    UserInfo.prototype.handleCommandSeen = function (channel, src, commandData, tar) {
        if(commandData === undefined) {
            sys.sendMessage(src, "Please provide a username.");
            return "OK";
        }
        var lastLogin = sys.dbLastOn(commandData);
        if(lastLogin === undefined) {
            sys.sendMessage(src, "No such user.");
            return "OK";
        }
        if(sys.id(commandData) !== undefined) {
            sys.sendMessage(src, commandData + " is currently online!");
            return "OK";
        }
        var parts = lastLogin.split("-");
        var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        sys.sendMessage(src, commandData + " was last seen: " + d.toDateString());
        return "OK";
    };
    UserInfo.prototype.handleCommandAliases = function (channel, src, commandData, tar) {
        var max_message_length = 30000;
        var uid = sys.id(commandData);
        var ip = commandData;
        if(uid !== undefined) {
            ip = sys.ip(uid);
        } else {
            if(sys.dbIp(commandData) !== undefined) {
                ip = sys.dbIp(commandData);
            }
        }
        if(!ip) {
            sys.sendMessage(src, "Unknown user or IP.");
            return "OK";
        }
        var myAuth = sys.auth(src);
        var allowedToAlias = function (target) {
            return !(myAuth < 3 && sys.dbAuth(target) > myAuth);
        };
        if(!allowedToAlias(commandData)) {
            sys.sendMessage(src, "Not allowed to alias higher auth: " + commandData);
            return "OK";
        }
        var smessage = "The aliases for the IP " + ip + " are: ";
        var prefix = "";
        sys.aliases(ip).map(function (name) {
            return [
                sys.dbLastOn(name), 
                name
            ];
        }).sort().forEach(function (alias_tuple) {
            var last_login = alias_tuple[0], alias = alias_tuple[1];
            if(!allowedToAlias(alias)) {
                return "OK";
            }
            var status = (sys.id(alias) !== undefined) ? "online" : "Last Login: " + last_login;
            smessage = smessage + alias + " (" + status + "), ";
            if(smessage.length > max_message_length) {
                sys.sendMessage(src, prefix + smessage + " ...");
                prefix = "... ";
                smessage = "";
            }
        });
        sys.sendMessage(src, prefix + smessage);
        return "OK";
    };
    UserInfo.prototype.handleCommandTier = function (channel, src, commandData, tar) {
        if(tar === undefined) {
            sys.sendMessage(src, "No such user online.");
            return "WARNING";
        }
        var count = sys.teamCount(tar), tiers = [];
        for(var i = 0; i < count; ++i) {
            var ctier = sys.tier(tar, i);
            if(tiers.indexOf(ctier) == -1) {
                tiers.push(ctier);
            }
        }
        sys.sendMessage(src, sys.name(tar) + " is in tier" + (tiers.length <= 1 ? "" : "s") + ": " + tiers.join(", "));
        return "OK";
    };
    UserInfo.prototype.handleCommandTopChannels = function (channel, src, commandData, tar) {
        var cids = sys.channelIds();
        var l = [];
        for(var i = 0; i < cids.length; ++i) {
            l.push([
                cids[i], 
                sys.playersOfChannel(cids[i]).length
            ]);
        }
        l.sort(function (a, b) {
            return b[1] - a[1];
        });
        var topchans = l.slice(0, 10);
        sys.sendMessage(src, "Most used channels:");
        for(var i = 0; i < topchans.length; ++i) {
            sys.sendMessage(src, "" + sys.channel(topchans[i][0]) + " with " + topchans[i][1] + " players.", channel);
        }
        return;
    };
    UserInfo.prototype.handleCommandChannelUsers = function (channel, src, commandData, tar) {
        if(commandData === undefined) {
            sys.sendMessage(src, "Please give me a channelname!");
            return;
        }
        var chanid;
        var isbot;
        if(commandData[0] == "~") {
            chanid = sys.channelId(commandData.substring(1));
            isbot = true;
        } else {
            chanid = sys.channelId(commandData);
            isbot = false;
        }
        if(chanid === undefined) {
            sys.sendMessage(src, "Such a channel doesn't exist!");
            return;
        }
        var chanName = sys.channel(chanid);
        var players = sys.playersOfChannel(chanid);
        var objectList = [];
        var names = [];
        for(var i = 0; i < players.length; ++i) {
            var name = sys.name(players[i]);
            if(isbot) {
                objectList.push({
                    'id': players[i],
                    'name': name
                });
            } else {
                names.push(name);
            }
        }
        if(isbot) {
            var channelData = {
                'type': 'ChannelUsers',
                'channel-id': chanid,
                'channel-name': chanName,
                'players': objectList
            };
            sys.sendMessage(src, ":" + JSON.stringify(channelData), channel);
        } else {
            sys.sendMessage(src, "Users of channel #" + chanName + " are: " + names.join(", "), channel);
        }
        return;
    };
    return UserInfo;
})();
exports.UserInfo = UserInfo;
exports.instance = new UserInfo();
