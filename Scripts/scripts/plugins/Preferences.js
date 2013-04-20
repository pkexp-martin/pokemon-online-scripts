var Keys = require("./scripts/includes/keys")
var Preferences = (function () {
    function Preferences() { }
    Preferences.prototype.beforeChallengeIssued = function (src, dest, clauses, rated, mode, team, destTier) {
        if(SESSION.users(dest).sametier === true && (destTier != sys.tier(src, team))) {
            sys.sendMessage(src, "That guy only wants to fight his/her own tier.");
            return "STOP";
        }
    };
    Preferences.prototype.afterChangeTeam = function (src) {
        SESSION.users(src).sametier = Keys.get("forceSameTier", src) == "1";
        if(Keys.get("autoIdle", src) == "1") {
            sys.changeAway(src, true);
        }
    };
    Preferences.prototype.handleCommandSameTier = function (channel, src, commandData, tar) {
        if(commandData == "on") {
            sys.sendMessage(src, "You enforce same tier in your battles.");
            SESSION.users(src).sametier = true;
        } else {
            if(commandData == "off") {
                sys.sendMessage(src, "You allow different tiers in your battles.");
                SESSION.users(src).sametier = false;
            } else {
                sys.sendMessage(src, "Currently: " + (SESSION.users(src).sametier ? "enforcing same tier" : "allow different tiers") + ". Use /sametier on/off to change it!");
            }
        }
        Keys.save("forceSameTier", src, SESSION.users(src).sametier ? 1 : 0);
        return;
    };
    Preferences.prototype.handleCommandIdle = function (channel, src, commandData, tar) {
        if(commandData == "on") {
            sys.sendMessage(src, "You are now idling.");
            Keys.save("autoIdle", src, 1);
            sys.changeAway(src, true);
        } else {
            if(commandData == "off") {
                sys.sendMessage(src, "You are back and ready for battles!");
                Keys.save("autoIdle", src, 0);
                sys.changeAway(src, false);
            } else {
                sys.sendMessage(src, "You are currently " + (sys.away(src) ? "idling" : "here and ready to battle") + ". Use /idle on/off to change it.");
            }
        }
        return;
    };
    return Preferences;
})();
exports.Preferences = Preferences;
exports.instance = new Preferences();
