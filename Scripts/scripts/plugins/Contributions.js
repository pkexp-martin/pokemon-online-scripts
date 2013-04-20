
var Hash = require("./scripts/includes/hash")
var Contributions = (function () {
    function Contributions() { }
    Contributions.prototype.serverStartUp = function () {
        this.contributors = new Hash.MemoryHash("scripts/data/contributors.txt");
        return "OK";
    };
    Contributions.prototype.handleCommandContributor = function (channel, src, commandData, tar) {
        var s = commandData.split(":");
        var name = s[0], reason = s[1];
        if(sys.dbIp(name) === undefined) {
            sys.sendMessage(src, name + " couldn't be found.");
            return "WARNING";
        }
        sys.sendMessage(src, name + " is now a contributor!");
        this.contributors.add(name, reason);
        return "OK";
    };
    Contributions.prototype.handleCommandContributorOff = function (channel, src, commandData, tar) {
        var contrib = "";
        for(var x in this.contributors.hash) {
            if(x.toLowerCase() == commandData.toLowerCase()) {
                contrib = x;
            }
        }
        if(contrib === "") {
            sys.sendMessage(src, commandData + " isn't a contributor.", channel);
            return "WARNING";
        }
        this.contributors.remove(contrib);
        sys.sendMessage(src, commandData + " is no longer a contributor!");
        return "OK";
    };
    Contributions.prototype.handleCommandContributors = function (channel, src, commandData, tar) {
        sys.sendHtmlMessage(src, "<hr/><b>CONTRIBUTORS</b><br/>", channel);
        for(var x in this.contributors.hash) {
            if(this.contributors.hash.hasOwnProperty(x)) {
                sys.sendHtmlMessage(src, x + "'s contributions: " + this.contributors.get(x), channel);
            }
        }
        sys.sendHtmlMessage(src, "<hr/>", channel);
        return "OK";
    };
    return Contributions;
})();
exports.Contributions = Contributions;
exports.instance = new Contributions();
