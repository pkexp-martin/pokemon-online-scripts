///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

export class RuntimeStatistics implements IPlugin {

    public sourcePath: string;

    private startUpTime = 0;
    private maxPlayersOnline = 0;

    public serverStartUp(): string {
        this.startUpTime = sys.time();
        sys.writeToFile("scripts/data/stats_started.txt", sys.time());
        sys.delayedCall(() => { this.saveStatistics(); }, 5);
        return "OK";
    }

    public afterLogIn(src: number): void {
        if (sys.numPlayers() > this.maxPlayersOnline) {
            this.maxPlayersOnline = sys.numPlayers();
        }
        if (this.maxPlayersOnline > sys.getVal("MaxPlayersOnline")) {
            sys.saveVal("MaxPlayersOnline", this.maxPlayersOnline);
        }

        sys.sendMessage(src, "Server uptime is " + this.getStartUpTimeString());
        sys.sendMessage(src, "Max number of players online was " +
                             sys.getVal("MaxPlayersOnline") + ".");
    }

    public handleCommandPlayers(channel, src, data, tar): string {
        sys.sendMessage(src, "There are " + sys.numPlayers() + " players online.");
        return "OK";
    }

    public handleCommandUptime(channel, src, data, tar): string {
        sys.sendMessage(src, "Server uptime is " + this.getStartUpTimeString());
        return "OK";
    }

    private getStartUpTimeString() {
        var diff = sys.time() - this.startUpTime;
        var days = diff / (60 * 60 * 24);
        var hours = (diff % (60 * 60 * 24)) / (60 * 60);
        var minutes = (diff % (60 * 60)) / 60;
        var seconds = (diff % 60);
        return Math.round(days) + "d " + Math.round(hours) + "h " + 
               Math.round(minutes) + "m " + Math.round(seconds) + "s";
    }

    private getUserString(): string {
        var players = sys.playerIds();
        for (var i = 0; i < players.length; ++i) {
            players[i] = sys.name(players[i]);
        }
        return players.join(", ");
    }

    private saveStatistics(): void {
        sys.delayedCall(() => { this.saveStatistics(); }, 30);
        sys.writeToFile("scripts/data/stats_keepalive.txt", sys.time());
        sys.writeToFile("scripts/data/stats_usercount.txt", sys.numPlayers());
        sys.writeToFile("scripts/data/stats_whoisonline.txt", this.getUserString());
    }
}

export var instance: IPlugin = new RuntimeStatistics();