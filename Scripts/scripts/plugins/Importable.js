var Team = require("./scripts/includes/team")
var Importable = (function () {
    function Importable() { }
    Importable.prototype.handleCommandImportable = function (channel, src, commandData, tar) {
        var teams = [
            0, 
            1, 
            2, 
            3, 
            4, 
            5
        ].slice(0, sys.teamCount(src)).map(function (index) {
            return Team.text(src, index);
        }, this).filter(function (data) {
            return data.length > 0;
        }).map(function (team) {
            return "<pre>" + team.join("<br/>") + "</pre>";
        }).join("<hr/>");
        if(teams) {
            sys.sendHtmlMessage(src, "<hr/>" + teams + "<hr/>", channel);
        } else {
            sys.sendMessage(src, "+Bot: You have no teams with valid pokemon.");
        }
        return "OK";
    };
    return Importable;
})();
exports.Importable = Importable;
exports.instance = new Importable();
