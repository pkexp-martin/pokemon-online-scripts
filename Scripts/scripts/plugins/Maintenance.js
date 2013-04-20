var Maintenance = (function () {
    function Maintenance() {
        this.battlesStopped = false;
    }
    Maintenance.prototype.beforeChallengeIssued = function (src, dest, clauses, rated, mode, team, destTier) {
        if(this.battlesStopped) {
            sys.sendMessage(src, "+BattleBot: Battles are now stopped as the server will restart soon.", undefined);
            sys.stopEvent();
            return "STOP";
        }
    };
    Maintenance.prototype.handleCommandStopBattles = function (channel, src, command, commandData, tar) {
        this.battlesStopped = !this.battlesStopped;
        if(this.battlesStopped) {
            sys.sendAll("");
            sys.sendAll("*** **********************************************************************");
            sys.sendAll("*** The battles are now stopped. The server will restart soon.");
            sys.sendAll("*** **********************************************************************");
            sys.sendAll("");
        } else {
            sys.sendAll("*** False alarm, battles may continue.");
        }
        return "OK";
    };
    return Maintenance;
})();
exports.Maintenance = Maintenance;
exports.instance = new Maintenance();
