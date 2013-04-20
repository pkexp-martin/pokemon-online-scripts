var RuntimeStatistics = (function () {
    function RuntimeStatistics() {
        this.startUpTime = 0;
        this.maxPlayersOnline = 0;
    }
    RuntimeStatistics.prototype.serverStartUp = function () {
        var _this = this;
        this.startUpTime = sys.time();
        sys.writeToFile("scripts/data/stats_started.txt", sys.time());
        sys.delayedCall(function () {
            _this.saveStatistics();
        }, 5);
        return "OK";
    };
    RuntimeStatistics.prototype.afterLogIn = function (src) {
        if(sys.numPlayers() > this.maxPlayersOnline) {
            this.maxPlayersOnline = sys.numPlayers();
        }
        if(this.maxPlayersOnline > sys.getVal("MaxPlayersOnline")) {
            sys.saveVal("MaxPlayersOnline", this.maxPlayersOnline);
        }
        sys.sendMessage(src, "Server uptime is " + this.getStartUpTimeString());
        sys.sendMessage(src, "Max number of players online was " + sys.getVal("MaxPlayersOnline") + ".");
    };
    RuntimeStatistics.prototype.handleCommandPlayers = function (channel, src, data, tar) {
        sys.sendMessage(src, "There are " + sys.numPlayers() + " players online.");
        return "OK";
    };
    RuntimeStatistics.prototype.handleCommandUptime = function (channel, src, data, tar) {
        sys.sendMessage(src, "Server uptime is " + this.getStartUpTimeString());
        return "OK";
    };
    RuntimeStatistics.prototype.getStartUpTimeString = function () {
        var diff = sys.time() - this.startUpTime;
        var days = diff / (60 * 60 * 24);
        var hours = (diff % (60 * 60 * 24)) / (60 * 60);
        var minutes = (diff % (60 * 60)) / 60;
        var seconds = (diff % 60);
        return Math.round(days) + "d " + Math.round(hours) + "h " + Math.round(minutes) + "m " + Math.round(seconds) + "s";
    };
    RuntimeStatistics.prototype.getUserString = function () {
        var players = sys.playerIds();
        for(var i = 0; i < players.length; ++i) {
            players[i] = sys.name(players[i]);
        }
        return players.join(", ");
    };
    RuntimeStatistics.prototype.saveStatistics = function () {
        var _this = this;
        sys.delayedCall(function () {
            _this.saveStatistics();
        }, 30);
        sys.writeToFile("scripts/data/stats_keepalive.txt", sys.time());
        sys.writeToFile("scripts/data/stats_usercount.txt", sys.numPlayers());
        sys.writeToFile("scripts/data/stats_whoisonline.txt", this.getUserString());
    };
    return RuntimeStatistics;
})();
exports.RuntimeStatistics = RuntimeStatistics;
exports.instance = new RuntimeStatistics();
