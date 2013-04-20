var Hash = require("./scripts/includes/hash")
var Utilities = require("./scripts/includes/utilities")
var Punishment = (function () {
    function Punishment() {
        this.proxyIps = {
        };
    }
    Punishment.prototype.serverStartUp = function () {
        this.mutes = new Hash.MemoryHash("scripts/data/measures_mutes.txt");
        this.smutes = new Hash.MemoryHash("scripts/data/measures_smutes.txt");
        this.autosmute = sys.getFileContent("script/data/measures_autosmute.txt").split(':::');
        this.rangeBans = new Hash.MemoryHash("scripts/data/measures_rangebans.txt");
        this.ipBans = new Hash.MemoryHash("scripts/data/measures_ipbans.txt");
        var content = sys.getFileContent("scripts/data/proxies.txt");
        if(content) {
            var lines = content.split(/\n/);
            for(var k = 0; k < lines.length; ++k) {
                var ip = lines[k].split(":")[0];
                if(ip !== 0) {
                    this.proxyIps[ip] = true;
                }
            }
        }
        this.nameBans = [];
        try  {
            var serialized = JSON.parse(sys.getFileContent("scripts/data/measures_namebans.json"));
            for(var i = 0; i < serialized.nameBans.length; ++i) {
                this.nameBans.push(new RegExp(serialized.nameBans[i], "i"));
            }
        } catch (e) {
        }
        this.nameWarns = [];
        try  {
            var serialized = JSON.parse(sys.getFileContent("scripts/data/measures_namewarns.json"));
            for(var i = 0; i < serialized.nameWarns.length; ++i) {
                this.nameWarns.push(new RegExp(serialized.nameWarns[i], "i"));
            }
        } catch (e) {
        }
    };
    Punishment.prototype.beforeIPConnected = function (ip) {
        if(this.isIpBanned(ip)) {
            sys.stopEvent();
        }
    };
    Punishment.prototype.beforeLogIn = function (src) {
        var ip = sys.ip(src);
        if(sys.auth(src) > 0) {
            return;
        }
        var allowedNames = [];
        var allowedIps = [];
        if(this.isRangeBanned(ip) && allowedIps.indexOf(ip) == -1) {
            sys.sendMessage(src, 'You are banned!');
            sys.stopEvent();
            return;
        }
        if(this.proxyIps.hasOwnProperty(ip)) {
            sys.sendMessage(src, 'You are banned for using proxy!');
            sys.stopEvent();
            return;
        }
        if(this.nameIsInappropriate(src)) {
            sys.stopEvent();
        }
    };
    Punishment.prototype.afterChangeTeam = function (src) {
        if(sys.auth(src) === 0 && this.nameIsInappropriate(src)) {
            sys.kick(src);
            return;
        }
        this.nameWarnTest(src);
        var POuser = SESSION.users(src);
        var new_name = sys.name(src);
        if(POuser.name != new_name) {
            var now = parseInt(sys.time(), 10);
            POuser.namehistory.push([
                new_name, 
                now
            ]);
            POuser.name = new_name;
            var spamcheck = POuser.namehistory[POuser.namehistory.length - 3];
            if(spamcheck && spamcheck[1] + 10 > now) {
                sys.kick(src);
                return;
            }
        }
    };
    Punishment.prototype.beforeChatMessage = function (src, message, channel) {
        if(SESSION.users(src).expired("mute")) {
            SESSION.users(src).un("mute");
            sys.sendMessage(src, "your mute has expired.");
        }
        if(sys.auth(src) < 3 && SESSION.users(src).mute.active && message != "!join" && message != "/rules" && message != "/join" && message != "!rules") {
            var muteinfo = SESSION.users(src).mute;
            sys.sendMessage(src, "You are muted" + (muteinfo.by ? " by " + muteinfo.by : '') + ". " + (muteinfo.expires > 0 ? "Mute expires in " + Utilities.getTimeString(muteinfo.expires - parseInt(sys.time(), 10)) + ". " : '') + (muteinfo.reason ? "[Reason: " + muteinfo.reason + "]" : ''));
            sys.stopEvent();
            return;
        }
        var poChannel = SESSION.channels(channel);
        if(sys.auth(src) < 1 && !poChannel.canTalk(src)) {
            sys.sendMessage(src, "You are muted on this channel! You can't speak unless channel operators and masters unmute you.");
            sys.stopEvent();
            return;
        }
        if(SESSION.channels(channel).muteall && !SESSION.channels(channel).isChannelOperator(src) && sys.auth(src) === 0) {
            sys.sendMessage(src, "Respect the minutes of silence!");
            sys.stopEvent();
            return;
        }
        if(sys.auth(src) === 0 && SESSION.users(src).smute.active) {
            if(SESSION.users(src).expired("smute")) {
                SESSION.users(src).un("smute");
            } else {
                sys.playerIds().forEach(function (id) {
                    if(sys.loggedIn(id) && SESSION.users(id).smute.active) {
                        sys.sendMessage(id, sys.name(src) + ": " + message, channel);
                    }
                });
                sys.stopEvent();
            }
            return;
        }
    };
    Punishment.prototype.handleCommandUserInfo = function (channel, src, commandData, tar, whois) {
        if (typeof whois === "undefined") { whois = false; }
        if(commandData === undefined) {
            sys.sendMessage(src, "Please provide a username.");
            return "WARNING";
        }
        var name = commandData;
        var isbot = false;
        if(commandData[0] == "~") {
            name = commandData.substring(1);
            tar = sys.id(name);
            isbot = true;
        }
        var lastLogin = sys.dbLastOn(name);
        if(lastLogin === undefined) {
            sys.sendMessage(src, "No such user.");
            return "WARNING";
        }
        var registered = sys.dbRegistered(name);
        var contribution = SESSION.users(tar).contributions;
        if(contribution == "") {
            contribution = "no";
        }
        var authLevel;
        var ip;
        var online;
        var channels = [];
        if(tar !== undefined) {
            name = sys.name(tar);
            authLevel = sys.auth(tar);
            ip = sys.ip(tar);
            online = true;
            var chans = sys.channelsOfPlayer(tar);
            for(var i = 0; i < chans.length; ++i) {
                channels.push("#" + sys.channel(chans[i]));
            }
        } else {
            authLevel = sys.dbAuth(name);
            ip = sys.dbIp(name);
            online = false;
        }
        var isBanned = sys.banList().filter(function (name) {
            return ip == sys.dbIp(name);
        }).length > 0;
        var nameBanned = this.nameIsInappropriate(name);
        var rangeBanned = this.isRangeBanned(ip);
        var tempBanned = this.isTempBanned(ip);
        var ipBanned = this.isIpBanned(ip);
        var bans = [];
        if(isBanned) {
            bans.push("normal ban");
        }
        if(nameBanned) {
            bans.push("nameban");
        }
        if(rangeBanned) {
            bans.push("rangeban");
        }
        if(tempBanned) {
            bans.push("tempban");
        }
        if(ipBanned) {
            bans.push("ip ban");
        }
        if(isbot) {
            var userJson = {
                'type': 'UserInfo',
                'id': tar ? tar : -1,
                'username': name,
                'auth': authLevel,
                'contributor': contribution,
                'ip': ip,
                'online': online,
                'registered': registered,
                'lastlogin': lastLogin
            };
            sys.sendMessage(src, ":" + JSON.stringify(userJson), channel);
        } else {
            if(whois) {
                var whoisCallback = function (resp) {
                    online = sys.loggedIn(tar);
                    var authName = (function () {
                        switch(authLevel) {
                            case 3: {
                                return "owner";

                            }
                            case 2: {
                                return "admin";

                            }
                            case 1: {
                                return "moderator";

                            }
                            default: {
                                return "user";

                            }
                        }
                    })();
                    resp = JSON.parse(resp);
                    var countryName = resp.countryName;
                    var countryTag = resp.countryCode;
                    var regionName = resp.regionName;
                    var cityName = resp.cityName;
                    var ipInfo = "";
                    if(countryName !== "" && countryName !== "-") {
                        ipInfo += "Country: " + countryName + " (" + countryTag + "), ";
                    }
                    if(regionName !== "" && regionName !== "-") {
                        ipInfo += "Region: " + regionName + ", ";
                    }
                    if(cityName !== "" && cityName !== "-") {
                        ipInfo += "City: " + cityName;
                    }
                    var logintime = 0;
                    if(online) {
                        logintime = SESSION.users(tar).logintime;
                    }
                    var data = [
                        "User: " + name + " @ " + ip, 
                        "Auth: " + authName, 
                        "Online: " + (online ? "yes" : "no"), 
                        "Registered name: " + (registered ? "yes" : "no"), 
                        "Last Login: " + (online && logintime ? new Date(logintime * 1000).toUTCString() : lastLogin), 
                        bans.length > 0 ? "Bans: " + bans.join(", ") : "Bans: none", 
                        "IP Details: " + (ipInfo !== "" ? ipInfo : "None Available")
                    ];
                    if(online) {
                        data.push("Idle for: " + Utilities.getTimeString(parseInt(sys.time(), 10) - SESSION.users(tar).lastline.time));
                        data.push("Channels: " + channels.join(", "));
                        data.push("Names during current session: " + (online && SESSION.users(tar).namehistory ? SESSION.users(tar).namehistory.map(function (e) {
                            return e[0];
                        }).join(", ") : name));
                    }
                    if(sys.isInChannel(src, channel)) {
                        for(var j = 0; j < data.length; ++j) {
                            sys.sendMessage(src, data[j], channel);
                        }
                    }
                };
                var ipApi = sys.getFileContent("srcipts/conf/api_ip.txt");
                sys.webCall('http://api.ipinfodb.com/v3/ip-city/?key=' + ipApi + '&ip=' + ip + '&format=JSON', whoisCallback);
            } else {
                sys.sendMessage(src, "Username: " + name + " ~ auth: " + authLevel + " ~ contributor: " + contribution + " ~ ip: " + ip + " ~ online: " + (online ? "yes" : "no") + " ~ registered: " + (registered ? "yes" : "no") + " ~ last login: " + lastLogin + " ~ banned: " + (isBanned ? "yes" : "no"));
            }
        }
        return "OK";
    };
    Punishment.prototype.handleCommandWhois = function (channel, src, commandData, tar) {
        this.handleCommandUserInfo(channel, src, commandData, tar, true);
        return "OK";
    };
    Punishment.prototype.handleCommandTempBan = function (channel, src, commandData, tar) {
        var tmp = commandData.split(":");
        if(tmp.length === 0) {
            sys.sendMessage(src, "Usage /tempban name:minutes.");
            return;
        }
        var target_name = tmp[0];
        if(tmp[1] === undefined || isNaN(tmp[1][0])) {
            var minutes = 86400;
        } else {
            var minutes = Utilities.getSeconds(tmp[1]);
        }
        tar = sys.id(target_name);
        if(sys.auth(src) < 2 && minutes > 86400) {
            sys.sendMessage(src, "Cannot ban for longer than a day!");
            return;
        }
        var ip = sys.dbIp(target_name);
        if(ip === undefined) {
            sys.sendMessage(src, "No such user!");
            return;
        }
        if(sys.maxAuth(ip) >= sys.auth(src)) {
            sys.sendMessage(src, "Can't do that to higher auth!");
            return;
        }
        var banlist = sys.banList();
        for(var a in banlist) {
            if(ip == sys.dbIp(banlist[a])) {
                sys.sendMessage(src, "He/she's already banned!");
                return;
            }
        }
        sys.sendAll("Target: " + target_name + ", IP: " + ip, SESSION.global().staffChannel);
        sys.sendHtmlAll('<b><font color=red>' + target_name + ' was banned by ' + Utilities.nonFlashing(sys.name(src)) + ' for ' + Utilities.getTimeString(minutes) + '!</font></b>');
        sys.tempBan(target_name, parseInt((minutes / 60).toString(), 10));
        this.kickAll(ip);
        var authname = sys.name(src);
        return "OK";
    };
    Punishment.prototype.handleCommandTempUnBan = function (channel, src, commandData, tar) {
        var ip = sys.dbIp(commandData);
        if(ip === undefined) {
            sys.sendMessage(src, "No such user!");
            return;
        }
        if(sys.dbTempBanTime(commandData) > 86400 && sys.auth(src) < 2) {
            sys.sendMessage(src, "You cannot unban people who are banned for longer than a day!");
            return;
        }
        sys.sendAll(sys.name(src) + " unbanned " + commandData, SESSION.global().staffChannel);
        sys.unban(commandData);
        return "OK";
    };
    Punishment.prototype.handleCommandCheckBanTime = function (channel, src, commandData, tar) {
        var ip = sys.dbIp(commandData);
        if(ip === undefined) {
            sys.sendMessage(src, "No such user!");
            return;
        }
        if(sys.dbTempBanTime(commandData) > 2000000000) {
            sys.sendMessage(src, "User is not tempbanned");
            return;
        }
        sys.sendMessage(src, commandData + " is banned for another " + Utilities.getTimeString(sys.dbTempBanTime(commandData)));
        return "OK";
    };
    Punishment.prototype.handleCommandSilence = function (channel, src, commandData, tar) {
        if(typeof (commandData) == "undefined") {
            return "OK";
        }
        var minutes;
        var chanName;
        var space = commandData.indexOf(' ');
        if(space != -1) {
            minutes = commandData.substring(0, space);
            chanName = commandData.substring(space + 1);
        } else {
            minutes = commandData;
            chanName = sys.channel(channel);
        }
        var delay = minutes * 60;
        if(isNaN(delay) || delay <= 0) {
            sys.sendMessage(src, "Sorry, I couldn't read your minutes.");
        }
        if(!chanName) {
            sys.sendMessage(src, "Sorry, global silence is disabled. Use /silence 5 Channel Name");
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
                sys.sendMessage(src, "Sorry, I couldn't find a channel with that name.");
            }
        }
        return "OK";
    };
    Punishment.prototype.handleCommandSilenceOff = function (channel, src, commandData, tar) {
        var chanName = sys.channel(channel);
        if(chanName !== undefined) {
            var cid = sys.channelId(chanName);
            if(!SESSION.channels(cid).muteall) {
                sys.sendMessage(src, "The channel is not muted.");
                return;
            }
            sys.sendAll("" + sys.name(src) + " cancelled the Minutes of Silence in " + chanName + "!", cid);
            SESSION.channels(cid).muteall = false;
        } else {
            sys.sendMessage(src, "Use /silenceoff Channel Name");
        }
        return "OK";
    };
    Punishment.prototype.handleCommandK = function (channel, src, commandData, tar) {
        if(tar === undefined) {
            sys.sendMessage(src, "No such user", channel);
            return "OK";
        }
        sys.sendAll("" + commandData + " was mysteriously kicked by " + Utilities.nonFlashing(sys.name(src)) + "!", undefined);
        sys.kick(tar);
        var authname = sys.name(src).toLowerCase();
        return "OK";
    };
    Punishment.prototype.handleCommandMute = function (channel, src, commandData, tar) {
        this.issueBan("mute", src, tar, commandData, undefined, channel);
        return "OK";
    };
    Punishment.prototype.handleCommandBanList = function (channel, src, commandData, tar) {
        var list = sys.banList();
        list.sort();
        var nbr_banned = 5;
        var max_message_length = 30000;
        var table_header = '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan=' + nbr_banned + '><center><strong>Banned list</strong></center></td></tr><tr>';
        var table_footer = '</tr></table>';
        var table = table_header;
        var j = 0;
        var line = '';
        for(var i = 0; i < list.length; ++i) {
            if(typeof commandData == 'undefined' || list[i].toLowerCase().indexOf(commandData.toLowerCase()) != -1) {
                ++j;
                line += '<td>' + list[i] + '</td>';
                if(j == nbr_banned && i + 1 != list.length) {
                    if(table.length + line.length + table_footer.length > max_message_length) {
                        if(table.length + table_footer.length <= max_message_length) {
                            sys.sendHtmlMessage(src, table + table_footer, channel);
                        }
                        table = table_header;
                    }
                    table += line + '</tr><tr>';
                    line = '';
                    j = 0;
                }
            }
        }
        table += table_footer;
        sys.sendHtmlMessage(src, table.replace('</tr><tr></tr></table>', '</tr></table>'), channel);
        return "OK";
    };
    Punishment.prototype.handleCommandMuteList = function (channel, src, commandData, tar) {
        return this.showMuteList(channel, src, "mutelist", commandData);
    };
    Punishment.prototype.handleCommandSMuteList = function (channel, src, commandData, tar) {
        return this.showMuteList(channel, src, "smutelist", commandData);
    };
    Punishment.prototype.showMuteList = function (channel, src, list, commandData) {
        if(list == "mutelist" || list == "smutelist") {
            var mh;
            var name;
            if(list == "mutelist") {
                mh = this.mutes;
                name = "Muted list";
            } else {
                if(list == "smutelist") {
                    mh = this.smutes;
                    name = "Secretly muted list";
                }
            }
            var width = 5;
            var max_message_length = 30000;
            var tmp = [];
            var t = parseInt(sys.time(), 10);
            var toDelete = [];
            for(var ip in mh.hash) {
                if(mh.hash.hasOwnProperty(ip)) {
                    var values = mh.hash[ip].split(":");
                    var banTime = 0;
                    var by = "";
                    var expires = 0;
                    var banned_name;
                    var reason = "";
                    if(values.length >= 5) {
                        banTime = parseInt(values[0], 10);
                        by = values[1];
                        expires = parseInt(values[2], 10);
                        banned_name = values[3];
                        reason = values.slice(4);
                        if(expires !== 0 && expires < t) {
                            toDelete.push(ip);
                            continue;
                        }
                    } else {
                        if(list == "smutelist") {
                            var aliases = sys.aliases(ip);
                            if(aliases[0] !== undefined) {
                                banned_name = aliases[0];
                            } else {
                                banned_name = "~Unknown~";
                            }
                        } else {
                            banTime = parseInt(values[0], 10);
                        }
                    }
                    if(typeof commandData != 'undefined' && (!banned_name || banned_name.toLowerCase().indexOf(commandData.toLowerCase()) == -1)) {
                        continue;
                    }
                    tmp.push([
                        ip, 
                        banned_name, 
                        by, 
                        (banTime === 0 ? "unknown" : Utilities.getTimeString(t - banTime)), 
                        (expires === 0 ? "never" : Utilities.getTimeString(expires - t)), 
                        Utilities.escapeHtml(reason)
                    ]);
                }
            }
            for(var k = 0; k < toDelete.length; ++k) {
                delete mh.hash[toDelete[k]];
            }
            if(toDelete.length > 0) {
                mh.save();
            }
            tmp.sort(function (a, b) {
                return a[3] - b[3];
            });
            var table_header = '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="' + width + '"><center><strong>' + Utilities.escapeHtml(name) + '</strong></center></td></tr><tr><th>IP</th><th>Name</th><th>By</th><th>Issued ago</th><th>Expires in</th><th>Reason</th>';
            var table_footer = '</table>';
            var table = table_header;
            var line;
            var send_rows = 0;
            while(tmp.length > 0) {
                line = '<tr><td>' + tmp[0].join('</td><td>') + '</td></tr>';
                tmp.splice(0, 1);
                if(table.length + line.length + table_footer.length > max_message_length) {
                    if(send_rows === 0) {
                        continue;
                    }
                    table += table_footer;
                    sys.sendHtmlMessage(src, table, channel);
                    table = table_header;
                    send_rows = 0;
                }
                table += line;
                ++send_rows;
            }
            table += table_footer;
            if(send_rows > 0) {
                sys.sendHtmlMessage(src, table, channel);
            }
            return "OK";
        }
    };
    Punishment.prototype.handleCommandRageBans = function (channel, src, commandData, tar) {
        var TABLE_HEADER, TABLE_LINE, TABLE_END;
        if(!commandData || commandData.indexOf('-text') == -1) {
            TABLE_HEADER = '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="2"><center><strong>Range banned</strong></center></td></tr><tr><th>IP subaddress</th><th>Comment on rangeban</th></tr>';
            TABLE_LINE = '<tr><td>{0}</td><td>{1}</td></tr>';
            TABLE_END = '</table>';
        } else {
            TABLE_HEADER = 'Range banned: IP subaddress, Command on rangeban';
            TABLE_LINE = ' || {0} / {1}';
            TABLE_END = '';
        }
        try  {
            var table = TABLE_HEADER;
            var tmp = [];
            for(var key in this.rangeBans.hash) {
                if(this.rangeBans.hash.hasOwnProperty(key)) {
                    tmp.push([
                        key, 
                        this.rangeBans.get(key)
                    ]);
                }
            }
            tmp.sort(function (a, b) {
                return a[0] < b[0] ? -1 : 1;
            });
            for(var row = 0; row < tmp.length; ++row) {
                table += TABLE_LINE.format(tmp[row][0], tmp[row][1]);
            }
            table += TABLE_END;
            sys.sendHtmlMessage(src, table, channel);
        } catch (e) {
            sys.sendMessage(src, e, channel);
        }
        return "OK";
    };
    Punishment.prototype.handleCommandIpBans = function (channel, src, commandData, tar) {
        var TABLE_HEADER, TABLE_LINE, TABLE_END;
        if(!commandData || commandData.indexOf('-text') == -1) {
            TABLE_HEADER = '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="2"><center><strong>Ip Banned</strong></center></td></tr><tr><th>IP subaddress</th><th>Comment on ipban</th></tr>';
            TABLE_LINE = '<tr><td>{0}</td><td>{1}</td></tr>';
            TABLE_END = '</table>';
        } else {
            TABLE_HEADER = 'Ip Banned: IP subaddress, Command on ipban';
            TABLE_LINE = ' || {0} / {1}';
            TABLE_END = '';
        }
        try  {
            var table = TABLE_HEADER;
            var tmp = [];
            for(var key in this.ipBans.hash) {
                if(this.ipBans.hash.hasOwnProperty(key)) {
                    tmp.push([
                        key, 
                        this.ipBans.get(key)
                    ]);
                }
            }
            tmp.sort(function (a, b) {
                return a[0] < b[0] ? -1 : 1;
            });
            for(var row = 0; row < tmp.length; ++row) {
                table += TABLE_LINE.format(tmp[row][0], tmp[row][1]);
            }
            table += TABLE_END;
            sys.sendHtmlMessage(src, table, channel);
        } catch (e) {
            sys.sendMessage(src, e, channel);
        }
        return "OK";
    };
    Punishment.prototype.handleCommandAutoSMuteList = function (channel, src, commandData, tar) {
        sys.sendMessage(src, "*** AUTOSMUTE LIST ***", channel);
        for(var x = 0; x < this.autosmute.length; x++) {
            sys.sendMessage(src, this.autosmute[x], channel);
        }
        return "OK";
    };
    Punishment.prototype.handleCommandNameBans = function (channel, src, commandData, tar) {
        var table = '';
        table += '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="2"><center><strong>Name banned</strong></center></td></tr>';
        for(var i = 0; i < this.nameBans.length; i += 5) {
            table += '<tr>';
            for(var j = 0; j < 5 && i + j < this.nameBans.length; ++j) {
                table += '<td>' + this.nameBans[i + j].toString() + '</td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        sys.sendHtmlMessage(src, table, channel);
        return "OK";
    };
    Punishment.prototype.handleCommandNameWarns = function (channel, src, commandData, tar) {
        var table = '';
        table += '<table border="1" cellpadding="5" cellspacing="0"><tr><td colspan="2"><center><strong>Namewarnings</strong></center></td></tr>';
        for(var i = 0; i < this.nameWarns.length; i += 5) {
            table += '<tr>';
            for(var j = 0; j < 5 && i + j < this.nameWarns.length; ++j) {
                table += '<td>' + this.nameWarns[i + j].toString() + '</td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        sys.sendHtmlMessage(src, table, channel);
        return "OK";
    };
    Punishment.prototype.handleCommandUnMute = function (channel, src, commandData, tar) {
        if(tar === undefined) {
            if(this.mutes.get(commandData)) {
                sys.sendAll("IP address " + commandData + " was unmuted by " + Utilities.nonFlashing(sys.name(src)) + "!", SESSION.global().staffChannel);
                this.mutes.remove(commandData);
                return "OK";
            }
            var ip = sys.dbIp(commandData);
            if(ip !== undefined && this.mutes.get(ip)) {
                sys.sendAll("" + commandData + " was unmuted by " + Utilities.nonFlashing(sys.name(src)) + "!", undefined);
                this.mutes.remove(ip);
                return "OK";
            }
            sys.sendMessage(src, "He/she's not muted.");
            return "OK";
        }
        if(!SESSION.users(sys.id(commandData)).mute.active) {
            sys.sendMessage(src, "He/she's not muted.");
            return "OK";
        }
        if(SESSION.users(src).mute.active && tar == src) {
            sys.sendMessage(src, "You may not unmute yourself!");
            return "OK";
        }
        SESSION.users(tar).un("mute");
        sys.sendAll("" + commandData + " was unmuted by " + Utilities.nonFlashing(sys.name(src)) + "!", undefined);
        return "OK";
    };
    Punishment.prototype.handleCommandBan = function (channel, src, commandData, tar) {
        if(sys.dbIp(commandData) === undefined) {
            sys.sendMessage(src, "No player exists by this name!");
            return;
        }
        if(sys.maxAuth(sys.ip(tar)) >= sys.auth(src)) {
            sys.sendMessage(src, "Can't do that to higher auth!");
            return;
        }
        var ip = sys.dbIp(commandData);
        if(sys.maxAuth(ip) >= sys.auth(src)) {
            sys.sendMessage(src, "Can't do that to higher auth!");
            return;
        }
        var banlist = sys.banList();
        for(var a in banlist) {
            if(ip == sys.dbIp(banlist[a]) && !this.isTempBanned(ip)) {
                sys.sendMessage(src, "He/she's already banned!");
                return;
            }
        }
        sys.sendAll("Target: " + commandData + ", IP: " + ip, SESSION.global().staffChannel);
        sys.sendHtmlAll('<b><font color=red>' + commandData + ' was banned by ' + Utilities.nonFlashing(sys.name(src)) + '!</font></b>', -1);
        sys.ban(commandData);
        this.kickAll(ip);
        sys.appendToFile('bans.txt', sys.name(src) + ' banned ' + commandData + "\n");
        var authname = sys.name(src).toLowerCase();
        return "OK";
    };
    Punishment.prototype.handleCommandUnBan = function (channel, src, commandData, tar) {
        if(sys.dbIp(commandData) === undefined) {
            sys.sendMessage(src, "No player exists by this name!");
            return;
        }
        var banlist = sys.banList();
        for(var a in banlist) {
            if(sys.dbIp(commandData) == sys.dbIp(banlist[a])) {
                sys.unban(commandData);
                sys.sendMessage(src, "You unbanned " + commandData + "!");
                sys.appendToFile('bans.txt', sys.name(src) + ' unbanned ' + commandData + "\n");
                return;
            }
        }
        sys.sendMessage(src, "He/she's not banned!");
        return "OK";
    };
    Punishment.prototype.handleCommandSMute = function (channel, src, commandData, tar) {
        this.issueBan("smute", src, tar, commandData, undefined, channel);
        return "OK";
    };
    Punishment.prototype.handleCommandSUnMute = function (channel, src, commandData, tar) {
        if(tar === undefined) {
            if(sys.dbIp(commandData) !== undefined) {
                if(this.smutes.get(commandData)) {
                    sys.sendAll("IP address " + commandData + " was secretly unmuted by " + Utilities.nonFlashing(sys.name(src)) + "!", SESSION.global().staffChannel);
                    this.smutes.remove(commandData);
                    return;
                }
                var ip = sys.dbIp(commandData);
                if(this.smutes.get(ip)) {
                    sys.sendAll("" + commandData + " was secretly unmuted by " + Utilities.nonFlashing(sys.name(src)) + "!", SESSION.global().staffChannel);
                    this.smutes.remove(ip);
                    return;
                }
                sys.sendMessage(src, "He/she's not secretly muted.");
                return;
            }
            return;
        }
        if(!SESSION.users(sys.id(commandData)).smute.active) {
            sys.sendMessage(src, "He/she's not secretly muted.");
            return;
        }
        sys.sendAll("" + commandData + " was secretly unmuted by " + Utilities.nonFlashing(sys.name(src)) + "!", SESSION.global().staffChannel);
        SESSION.users(sys.id(commandData)).un("smute");
        return "OK";
    };
    Punishment.prototype.handleCommandNameBan = function (channel, src, commandData, tar) {
        if(commandData === undefined) {
            sys.sendMessage(src, "Sorry, can't name ban empty names.");
            return;
        }
        var regex;
        try  {
            regex = new RegExp(commandData.toLowerCase());
        } catch (e) {
            sys.sendMessage(src, "Sorry, your regular expression '" + commandData + "' fails. (" + e + ")");
        }
        this.nameBans.push(regex);
        var serialized = {
            nameBans: []
        };
        for(var i = 0; i < this.nameBans.length; ++i) {
            serialized.nameBans.push(this.nameBans[i].source);
        }
        sys.writeToFile("nameBans.json", JSON.stringify(serialized));
        sys.sendMessage(src, "You banned: " + regex.toString());
        return "OK";
    };
    Punishment.prototype.handleCommandNameUnBan = function (channel, src, commandData, tar) {
        var unban = false;
        this.nameBans = this.nameBans.filter(function (name) {
            if(name.toString() == commandData) {
                var toDelete = this.nameBans.indexOf(name.toString());
                sys.sendMessage(src, "You unbanned: " + name.toString());
                unban = true;
                return false;
            }
            return true;
        });
        if(!unban) {
            sys.sendMessage(src, "No match.");
        } else {
            sys.writeToFile("nameBans.json", JSON.stringify(this.nameBans));
        }
        return "OK";
    };
    Punishment.prototype.handleCommandNameWarn = function (channel, src, commandData, tar) {
        if(commandData === undefined) {
            sys.sendMessage(src, "Sorry, can't set warning for empty names.");
            return;
        }
        var regex;
        try  {
            regex = new RegExp(commandData.toLowerCase());
        } catch (e) {
            sys.sendMessage(src, "Sorry, your regular expression '" + commandData + "' fails. (" + e + ")");
        }
        this.nameWarns.push(regex);
        var serialized = {
            nameWarns: []
        };
        for(var i = 0; i < this.nameWarns.length; ++i) {
            serialized.nameWarns.push(this.nameWarns[i].source);
        }
        sys.writeToFile("nameWarns.json", JSON.stringify(serialized));
        sys.sendMessage(src, "You set a warning for: " + regex.toString());
        return "OK";
    };
    Punishment.prototype.handleCommandNameUnWarn = function (channel, src, commandData, tar) {
        var unwarn = false;
        this.nameWarns = this.nameWarns.filter(function (name) {
            if(name.toString() == commandData) {
                var toDelete = this.nameWarns.indexOf(name.toString());
                sys.sendMessage(src, "You removed a warning for: " + name.toString());
                unwarn = true;
                return false;
            }
            return true;
        });
        if(!unwarn) {
            sys.sendMessage(src, "No match.");
        } else {
            sys.writeToFile("nameWarns.json", JSON.stringify(this.nameWarns));
        }
        return "OK";
    };
    Punishment.prototype.handleCommandAutoSMute = function (channel, src, commandData, tar) {
        if(sys.dbIp(commandData) === undefined) {
            sys.sendMessage(src, "No player exists by this name!");
            return;
        }
        if(sys.maxAuth(sys.dbIp(commandData)) >= sys.auth(src)) {
            sys.sendMessage(src, "Can't do that to higher auth!");
            return;
        }
        var name = commandData.toLowerCase();
        if(this.autosmute.indexOf(name) !== -1) {
            sys.sendMessage(src, "This person is already on the autosmute list");
            return;
        }
        this.autosmute.push(name);
        if(sys.id(name) !== undefined) {
            SESSION.users(sys.id(name)).activate("smute", "Script", 0, "Evader", true);
        }
        sys.writeToFile('secretsmute.txt', this.autosmute.join(":::"));
        sys.sendAll(commandData + " was added to the autosmute list", SESSION.global().staffChannel);
        return "OK";
    };
    Punishment.prototype.handleCommandRemoveAutoSMute = function (channel, src, commandData, tar) {
        var name = commandData.toLowerCase();
        this.autosmute = this.autosmute.filter(function (list_name) {
            if(list_name == name) {
                sys.sendAll(commandData + " was removed from the autosmute list", SESSION.global().staffChannel);
                return true;
            }
        });
        sys.writeToFile('secretsmute.txt', this.autosmute.join(":::"));
        return "OK";
    };
    Punishment.prototype.handleCommandRangeBan = function (channel, src, commandData, tar) {
        var subip;
        var comment;
        var space = commandData.indexOf(' ');
        if(space != -1) {
            subip = commandData.substring(0, space);
            comment = commandData.substring(space + 1);
        } else {
            subip = commandData;
            comment = '';
        }
        var i = 0;
        var nums = 0;
        var dots = 0;
        var correct = (subip.length > 0);
        while(i < subip.length) {
            var c = subip[i];
            if(c == '.' && nums > 0 && dots < 3) {
                nums = 0;
                ++dots;
                ++i;
            } else {
                if(c == '.' && nums === 0) {
                    correct = false;
                    break;
                } else {
                    if(/^[0-9]$/.test(c) && nums < 3) {
                        ++nums;
                        ++i;
                    } else {
                        correct = false;
                        break;
                    }
                }
            }
        }
        if(!correct) {
            sys.sendMessage(src, "The IP address looks strange, you might want to correct it: " + subip);
            return;
        }
        this.rangeBans.add(subip, this.rangeBans.escapeValue(comment));
        sys.sendMessage(src, "Rangeban added successfully for IP subrange: " + subip);
        var players = sys.playerIds();
        var players_length = players.length;
        var names = [];
        for(var i = 0; i < players_length; ++i) {
            var current_player = players[i];
            var ip = sys.ip(current_player);
            if(sys.auth(current_player) > 0) {
                continue;
            }
            if(ip.substr(0, subip.length) == subip) {
                names.push(sys.name(current_player));
                sys.kick(current_player);
                continue;
            }
        }
        if(names.length > 0) {
            sys.sendAll("Â±Bot: " + names.join(", ") + " got range banned by " + sys.name(src));
        }
        return "OK";
    };
    Punishment.prototype.handleCommandRangeUnBan = function (channel, src, commandData, tar) {
        var subip = commandData;
        if(this.rangeBans.get(subip) !== undefined) {
            this.rangeBans.remove(subip);
            sys.sendMessage(src, "Rangeban removed successfully for IP subrange: " + subip);
        } else {
            sys.sendMessage(src, "No such rangeban.");
        }
        return "OK";
    };
    Punishment.prototype.handleCommandPurgeMutes = function (channel, src, commandData, tar) {
        var time = parseInt(commandData, 10);
        if(isNaN(time)) {
            time = 60 * 60 * 24 * 7 * 4;
        }
        var limit = parseInt(sys.time(), 10) - time;
        var removed = [];
        this.mutes.removeIf(function (memoryhash, item) {
            var data = memoryhash.get(item).split(":");
            if(parseInt(data[0], 10) < limit || (data.length > 3 && parseInt(data[2], 10) < limit)) {
                removed.push(item);
                return true;
            }
            return false;
        });
        if(removed.length > 0) {
            sys.sendMessage(src, "" + removed.length + " mutes purged successfully.");
        } else {
            sys.sendMessage(src, "No mutes were purged.");
        }
        return "OK";
    };
    Punishment.prototype.handleCommandIpBan = function (channel, src, commandData, tar) {
        var subip;
        var comment;
        var space = commandData.indexOf(' ');
        if(space != -1) {
            subip = commandData.substring(0, space);
            comment = commandData.substring(space + 1);
        } else {
            subip = commandData;
            comment = '';
        }
        var i = 0;
        var nums = 0;
        var dots = 0;
        var correct = (subip.length > 0);
        while(i < subip.length) {
            var c = subip[i];
            if(c == '.' && nums > 0 && dots < 3) {
                nums = 0;
                ++dots;
                ++i;
            } else {
                if(c == '.' && nums === 0) {
                    correct = false;
                    break;
                } else {
                    if(/^[0-9]$/.test(c) && nums < 3) {
                        ++nums;
                        ++i;
                    } else {
                        correct = false;
                        break;
                    }
                }
            }
        }
        if(!correct) {
            sys.sendMessage(src, "The IP address looks strange, you might want to correct it: " + subip);
            return;
        }
        this.ipBans.add(subip, "Name: " + sys.name(src) + " Comment: " + this.rangeBans.escapeValue(comment));
        sys.sendAll("IP ban added successfully for IP subrange: " + subip + " by " + sys.name(src), SESSION.global().staffChannel);
        return "OK";
    };
    Punishment.prototype.kickAll = function (ip) {
        var players = sys.playerIds();
        var players_length = players.length;
        for(var i = 0; i < players_length; ++i) {
            var current_player = players[i];
            if(ip == sys.ip(current_player)) {
                sys.kick(current_player);
            }
        }
        return;
    };
    Punishment.prototype.issueBan = function (type, src, tar, commandData, maxTime, channel) {
        var memoryhash = {
            "mute": this.mutes,
            "smute": this.smutes
        }[type];
        var verb = {
            "mute": "muted",
            "smute": "secretly muted"
        }[type];
        var nomi = {
            "mute": "mute",
            "smute": "secret mute"
        }[type];
        var sendAll = {
            "smute": function (line) {
                sys.sendAll(line, SESSION.global().staffChannel);
                line = line.replace(" by " + sys.name(src), "");
                sys.dbAuths().map(sys.id).filter(function (uid) {
                    return uid !== undefined;
                }).forEach(function (uid) {
                    sys.channelsOfPlayer(uid).filter(function (cid) {
                        return cid !== SESSION.global().staffChannel;
                    }).forEach(function (cid) {
                        sys.sendMessage(uid, line, cid);
                    });
                });
            },
            "mute": function (line) {
                sys.sendAll(line, undefined);
            }
        }[type];
        var expires = 0;
        var defaultTime = {
            "mute": "24h",
            "smute": "0"
        }[type];
        var reason = "";
        var timeString = "";
        var tindex = 10;
        var data = [];
        var ip;
        if(tar === undefined) {
            data = commandData.split(":");
            if(data.length > 1) {
                commandData = data[0];
                tar = sys.id(commandData);
                if(data.length > 2 && /http$/.test(data[1])) {
                    reason = data[1] + ":" + data[2];
                    tindex = 3;
                } else {
                    reason = data[1];
                    tindex = 2;
                }
                if(tindex == data.length && reason.length > 0 && reason.charCodeAt(0) >= 48 && reason.charCodeAt(0) <= 57) {
                    tindex -= 1;
                    reason = "";
                }
            }
        }
        var secs = Utilities.getSeconds(data.length > tindex ? data[tindex] : defaultTime);
        if(typeof maxTime == "number") {
            secs = secs > maxTime ? maxTime : secs;
        }
        if(secs > 0) {
            timeString = " for " + Utilities.getTimeString(secs);
            expires = secs + parseInt(sys.time(), 10);
        }
        if(reason === "" && sys.auth(src) < 3) {
            sys.sendMessage(src, "You need to give a reason to the " + nomi + "!");
            return;
        }
        if(tar === undefined) {
            ip = sys.dbIp(commandData);
            var maxAuth = sys.maxAuth(ip);
            if(maxAuth >= sys.auth(src) && maxAuth > 0) {
                sys.sendMessage(src, "Can't do that to higher auth!");
                return;
            }
            if(ip !== undefined) {
                if(memoryhash.get(ip)) {
                    sys.sendMessage(src, "He/she's already " + verb + ".");
                    return;
                }
                sendAll("" + commandData + " was " + verb + " by " + Utilities.nonFlashing(sys.name(src)) + timeString + "! [Reason: " + reason + "] [Channel: " + sys.channel(channel) + "]");
                memoryhash.add(ip, sys.time() + ":" + sys.name(src) + ":" + expires + ":" + commandData + ":" + reason);
                var authname = sys.name(src).toLowerCase();
                return;
            }
            sys.sendMessage(src, "Couldn't find " + commandData);
            return;
        }
        if(SESSION.users(tar)[type].active) {
            sys.sendMessage(src, "He/she's already " + verb + ".");
            return;
        }
        if(sys.auth(tar) >= sys.auth(src) && sys.auth(tar) > 0) {
            sys.sendMessage(src, "You don't have sufficient auth to " + nomi + " " + commandData + ".");
            return;
        }
        var tarip = tar !== undefined ? sys.ip(tar) : sys.dbIp(commandData);
        sys.playerIds().forEach(function (id) {
            if(sys.loggedIn(id) && sys.ip(id) === tarip) {
                SESSION.users(id).activate(type, sys.name(src), expires, reason, true);
            }
        });
        if(reason.length > 0) {
            sendAll("" + commandData + " was " + verb + " by " + Utilities.nonFlashing(sys.name(src)) + timeString + "! [Reason: " + reason + "] [Channel: " + sys.channel(channel) + "]");
        } else {
            sendAll("" + commandData + " was " + verb + " by " + Utilities.nonFlashing(sys.name(src)) + timeString + "! [Channel: " + sys.channel(channel) + "]");
        }
        var authority = sys.name(src).toLowerCase();
    };
    Punishment.prototype.nameWarnTest = function (src) {
        if(sys.auth(src) > 0) {
            return;
        }
        var lname = sys.name(src).toLowerCase();
        for(var i = 0; i < this.nameWarns.length; ++i) {
            var regexp = this.nameWarns[i];
            if(regexp.test(lname)) {
                sys.sendAll('Namewarning: Name `' + sys.name(src) + 'Â´ matches the following regexp: `' + regexp + 'Â´ on the IP `' + sys.ip(src) + "Â´.", SESSION.global().staffChannel);
            }
        }
    };
    Punishment.prototype.isRangeBanned = function (ip) {
        for(var subip in this.rangeBans.hash) {
            if(subip.length > 0 && ip.substr(0, subip.length) == subip) {
                return true;
            }
        }
        return false;
    };
    Punishment.prototype.isIpBanned = function (ip) {
        for(var subip in this.ipBans.hash) {
            if(subip.length > 0 && ip.substr(0, subip.length) == subip) {
                return true;
            }
        }
        return false;
    };
    Punishment.prototype.isTempBanned = function (ip) {
        var aliases = sys.aliases(ip);
        for(var x = 0; x < aliases.length; x++) {
            if(sys.dbTempBanTime(aliases[x]) < 2000000000) {
                return true;
            }
        }
        return false;
    };
    Punishment.prototype.nameIsInappropriate = function (src) {
        var name = (typeof src == "number") ? sys.name(src) : src;
        function reply(m) {
            if(typeof src == "number") {
                sys.sendMessage(src, m, undefined);
            }
        }
        var lname = name.toLowerCase();
        for(var i = 0; i < this.nameBans.length; ++i) {
            var regexp = this.nameBans[i];
            if(regexp.test(lname)) {
                reply('This kind of name is banned from the server. (Matching regexp: ' + regexp + ')');
                return true;
            }
        }
        var cyrillic = /\u0430|\u0410|\u0412|\u0435|\u0415|\u041c|\u041d|\u043e|\u041e|\u0440|\u0420|\u0441|\u0421|\u0422|\u0443|\u0445|\u0425|\u0456|\u0406/;
        if(cyrillic.test(name)) {
            reply('You are using cyrillic letters similar to latin letters in your name.');
            return true;
        }
        var greek = /[\u0370-\u03ff]/;
        if(greek.test(name)) {
            reply('You are using Greek letters similar to Latin letters in your name.');
            return true;
        }
        var space = /[\u0009-\u000D]|\u0085|\u00A0|\u1680|\u180E|\u2000-\u200A|\u2028|\u2029|\u2029|\u202F|\u205F|\u3000|\u3164|\uFEFF|\uFFA0/;
        if(space.test(name)) {
            reply('You are using whitespace letters in your name.');
            return true;
        }
        var dash = /\u058A|\u05BE|\u1400|\u1806|\u2010-\u2015|\u2053|\u207B|\u208B|\u2212|\u2E17|\u2E1A|\u301C|\u3030|\u30A0|[\uFE31-\uFE32]|\uFE58|\uFE63|\uFF0D/;
        if(dash.test(name)) {
            reply('You are using dash letters in your name.');
            return true;
        }
        if(/[\ufff0-\uffff]/.test(name)) {
            reply('You are using SPECIAL characters in your name.');
            return true;
        }
        if(/\u0305/.test(name)) {
            reply('You are using COMBINING OVERLINE character in your name.');
            return true;
        }
        if(/\u0CBF/gi.test(name)) {
            return true;
        }
        return false;
    };
    return Punishment;
})();
exports.Punishment = Punishment;
exports.instance = new Punishment();
