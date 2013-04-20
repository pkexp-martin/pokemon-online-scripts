var ChallengeValidation = (function () {
    function ChallengeValidation() { }
    ChallengeValidation.prototype.beforeChallengeIssued = function (src, dest, clauses, rated, mode, team, destTier) {
        if (typeof mode === "undefined") { mode = 0; }
        if (typeof team === "undefined") { team = 0; }
        if (typeof destTier === "undefined") { destTier = ""; }
        var isChallengeCup = sys.getClauses(destTier) % 32 >= 16;
        var hasChallengeCupClause = (clauses % 32) >= 16;
        if(isChallengeCup && !hasChallengeCupClause) {
            sys.sendMessage(src, "+BattleBot: Challenge Cup must be enabled in the challenge window for a CC battle", undefined);
            return "STOP";
        }
        if(sys.tier(src, team).indexOf("Doubles") != -1 && destTier.indexOf("Doubles") != -1 && mode != 1) {
            sys.sendMessage(src, "+BattleBot: To fight in doubles, enable doubles in the challenge window!", undefined);
            return "STOP";
        }
        if(sys.tier(src, team).indexOf("Triples") != -1 && destTier.indexOf("Triples") != -1 && mode != 2) {
            sys.sendMessage(src, "+BattleBot: To fight in triples, enable triples in the challenge window!", undefined);
            return "STOP";
        }
        return "OK";
    };
    return ChallengeValidation;
})();
exports.ChallengeValidation = ChallengeValidation;
exports.instance = new ChallengeValidation();
