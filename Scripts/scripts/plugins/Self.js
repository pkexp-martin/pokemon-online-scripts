
var Self = (function () {
    function Self() { }
    Self.prototype.handleCommandMyAlts = function (channel, src, commandData, tar) {
        var ip = sys.ip(src);
        var alts = sys.aliases(ip);
        sys.sendMessage(src, "Your alts are: " + alts);
        return "OK";
    };
    Self.prototype.handleCommandRanking = function (channel, src, commandData, tar) {
        var announceTier = function (tier) {
            var rank = sys.ranking(sys.name(src), tier);
            if(rank === undefined) {
                sys.sendMessage(src, "You are not ranked in " + tier + " yet!");
            } else {
                sys.sendMessage(src, "Your rank in " + tier + " is " + rank + "/" + sys.totalPlayersByTier(tier) + " [" + sys.ladderRating(src, tier) + " points / " + sys.ratedBattles(sys.name(src), tier) + " battles]!");
            }
        };
        if(commandData !== "") {
            if(sys.totalPlayersByTier(commandData) === 0) {
                sys.sendMessage(src, commandData + " is not even a tier.");
            } else {
                announceTier(commandData);
            }
        } else {
            [
                0, 
                1, 
                2, 
                3, 
                4, 
                5
            ].slice(0, sys.teamCount(src)).map(function (i) {
                return sys.tier(src, i);
            }).filter(function (tier) {
                return tier !== undefined;
            }).sort().filter(function (tier, index, array) {
                return tier !== array[index - 1];
            }).forEach(announceTier);
        }
        return;
    };
    Self.prototype.handleCommandSelfKick = function (channel, src, commandData, tar) {
        var found = false;
        var src_ip = sys.ip(src);
        var players = sys.playerIds();
        var players_length = players.length;
        for(var i = 0; i < players_length; ++i) {
            var current_player = players[i];
            if((src != current_player) && (src_ip == sys.ip(current_player))) {
                sys.kick(current_player);
                sys.sendMessage(src, "Your ghost was kicked...");
                found = true;
            }
        }
        if(!found) {
            sys.sendMessage(src, "There are no ghosts...");
        }
        return;
    };
    Self.prototype.handleCommandResetPass = function (channel, src, commandData, tar) {
        if(!sys.dbRegistered(sys.name(src))) {
            sys.sendMessage(src, "You are not registered!");
            return;
        }
        sys.clearPass(sys.name(src));
        sys.sendMessage(src, "Your password was cleared!");
        sys.sendNetworkCommand(src, 14);
        return;
    };
    return Self;
})();
exports.Self = Self;
exports.instance = new Self();
