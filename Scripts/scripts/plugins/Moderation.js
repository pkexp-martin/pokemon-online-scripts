var Moderation = (function () {
    function Moderation() { }
    Moderation.prototype.handleCommandOnRange = function (channel, src, commandData, tar) {
        var subip = commandData;
        var players = sys.playerIds();
        var players_length = players.length;
        var names = [];
        for(var i = 0; i < players_length; ++i) {
            var current_player = players[i];
            if(!sys.loggedIn(current_player)) {
                continue;
            }
            var ip = sys.ip(current_player);
            if(ip.substr(0, subip.length) == subip) {
                names.push(current_player);
            }
        }
        if(names.length > 0) {
            var msgs = [];
            for(var i = 0; i < names.length; i++) {
                msgs.push(sys.name(names[i]) + " (" + sys.ip(names[i]) + ")");
            }
            sys.sendMessage(src, "Players: on range " + subip + " are: " + msgs.join(", "), channel);
        } else {
            sys.sendMessage(src, "Players: Nothing interesting here!", channel);
        }
        return "OK";
    };
    Moderation.prototype.handleCommandPassAuth = function (channel, src, commandData, tar) {
        return this.passAuth(channel, src, commandData, tar, false);
    };
    Moderation.prototype.handleCommandPassAuths = function (channel, src, commandData, tar) {
        return this.passAuth(channel, src, commandData, tar, true);
    };
    Moderation.prototype.passAuth = function (channel, src, commandData, tar, silent) {
        if(tar === undefined) {
            sys.sendMessage(src, "The target is offline.");
            return "OK";
        }
        if(sys.ip(src) == sys.ip(tar) && sys.auth(tar) === 0) {
        } else {
            if(sys.auth(src) !== 0 || !SESSION.users(src).megauser) {
                sys.sendMessage(src, "You need to be mega-auth to pass auth.");
                return "OK";
            }
            if(!SESSION.users(tar).megauser || sys.auth(tar) > 0) {
                sys.sendMessage(src, "The target must be megauser and not auth, or from your IP.");
                return "OK";
            }
        }
        if(!sys.dbRegistered(sys.name(tar))) {
            sys.sendMessage(src, "The target name must be registered.");
            return "OK";
        }
        var current = sys.auth(src);
        sys.changeAuth(src, 0);
        sys.changeAuth(tar, current);
        if(!silent) {
            sys.sendAll(sys.name(src) + " passed their auth to " + sys.name(tar) + "!", SESSION.global().staffChannel);
        }
        return "OK";
    };
    return Moderation;
})();
exports.Moderation = Moderation;
exports.instance = new Moderation();
