///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

export class Maintenance implements IPlugin {

    public sourcePath: string;

    private battlesStopped = false;

    public beforeChallengeIssued(src, dest, clauses, rated, mode, team, destTier): string {
        if (this.battlesStopped) {
            sys.sendMessage(src, "+BattleBot: Battles are now stopped as the server will restart soon.", undefined);
            sys.stopEvent();
            return "STOP";
        }
    }

    public handleCommandStopBattles(channel, src, command, commandData, tar) {
        this.battlesStopped = !this.battlesStopped;
        if (this.battlesStopped)  {
            sys.sendAll("");
            sys.sendAll("*** **********************************************************************");
            sys.sendAll("*** The battles are now stopped. The server will restart soon.");
            sys.sendAll("*** **********************************************************************");
            sys.sendAll("");
        } else {
            sys.sendAll("*** False alarm, battles may continue.");
        }
        return "OK";
    }
}

export var instance: IPlugin = new Maintenance();