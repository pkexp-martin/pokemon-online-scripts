var Team = require("./scripts/includes/team")
var Debug = (function () {
    function Debug() { }
    Debug.prototype.handleCommandMemoryDump = function (channel, src, commandData, tar) {
        sys.sendMessage(src, sys.memoryDump(), channel);
        return;
    };
    Debug.prototype.handleCommandShowTeam = function (channel, src, commandData, tar) {
        if(tar == undefined) {
            sys.sendMessage(src, "+DebugBot: Missing argument player", channel);
        }
        var teams = [
            0, 
            1, 
            2, 
            3, 
            4, 
            5
        ].slice(0, sys.teamCount(src)).map(function (index) {
            return Team.text(tar, index);
        }, this).filter(function (data) {
            return data.length > 0;
        }).map(function (team) {
            return "<pre>" + team.join("<br/>") + "</pre>";
        }).join("<hr/>");
        if(teams) {
            sys.sendHtmlMessage(src, "<hr/>" + teams + "<hr/>", channel);
        } else {
            sys.sendMessage(src, "+DebugBot: That player has no teams with valid pokemon.", channel);
        }
        return;
    };
    return Debug;
})();
exports.Debug = Debug;
exports.instance = new Debug();
