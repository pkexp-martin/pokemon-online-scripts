var Registration = (function () {
    function Registration() { }
    Registration.prototype.beforeBattleMatchup = function (src, dest, clauses, rated) {
        sys.sendAll("Matchup");
        var players = [
            src, 
            dest
        ];
        for(var p = 0; p < players.length; p++) {
            var id = players[p];
            sys.sendAll("== Player " + id);
            if(sys.dbRegistered(sys.name(id))) {
                sys.sendAll("== Registered " + id);
                continue;
            }
            sys.sendAll("== TeamCount" + sys.teamCount(id));
            for(var x = 0; x < sys.teamCount(id); x++) {
                var tier = sys.tier(id, x);
                sys.sendAll("== Tier " + tier);
                sys.sendAll("== Rating " + sys.ladderRating(id, tier));
                if(sys.ladderRating(id, tier) >= 1200 || sys.ranking(id, tier) / sys.totalPlayersByTier(tier) <= 0.05) {
                    sys.sendHtmlMessage(id, "<font color=red size=" + (sys.ladderRating(id, tier) >= 1300 ? "7" : "5") + "><b>You currently have a high rating in " + tier + ", but your account is not registered! Please register to protect your account from being stolen (click the register button below and follow the instructions)!</b></font><ping/>");
                }
            }
        }
    };
    Registration.prototype.handleCommandClearPass = function (channel, src, commandData, tar) {
        if(sys.dbAuth(commandData) > 2) {
            sys.sendMessage(src, "Not allowed on owners");
            return "WARNING";
        }
        sys.clearPass(commandData);
        sys.sendMessage(src, "" + commandData + "'s password was cleared!");
        if(tar !== undefined) {
            var mod = sys.name(src);
            sys.sendMessage(tar, "Your password was cleared by " + mod + "!");
            sys.sendNetworkCommand(tar, 14);
        }
        return "OK";
    };
    return Registration;
})();
exports.Registration = Registration;
exports.instance = new Registration();
