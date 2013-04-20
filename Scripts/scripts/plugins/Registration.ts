///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Registration implements IPlugin {

    public sourcePath: string;

    public beforeBattleMatchup(src, dest, clauses, rated) {
        sys.sendAll("Matchup");
        // warn players if their account is unregistered and ladder rating is >1200 or in top 5%
        var players = [src, dest];
        for (var p = 0; p < players.length; p++) {
            var id = players[p];
            sys.sendAll("== Player " + id);
            if (sys.dbRegistered(sys.name(id))) {
                sys.sendAll("== Registered " + id);
                continue;
            }
            sys.sendAll("== TeamCount" + sys.teamCount(id));
            
            for (var x = 0; x < sys.teamCount(id); x++) {
                var tier = sys.tier(id, x);
                sys.sendAll("== Tier " + tier);
                sys.sendAll("== Rating " + sys.ladderRating(id, tier));
                if (sys.ladderRating(id, tier) >= 1200 || sys.ranking(id, tier) / sys.totalPlayersByTier(tier) <= 0.05) {
                    sys.sendHtmlMessage(id, "<font color=red size=" + (sys.ladderRating(id, tier) >= 1300 ? "7" : "5") + "><b>You currently have a high rating in " + tier + ", but your account is not registered! Please register to protect your account from being stolen (click the register button below and follow the instructions)!</b></font><ping/>");
                }
            }
        }
    }

    public handleCommandClearPass(channel: number, src: number, commandData: string, tar: number): string {
        if (sys.dbAuth(commandData) > 2) {
            sys.sendMessage(src, "Not allowed on owners");
            return "WARNING";
        }

        sys.clearPass(commandData);
        sys.sendMessage(src, "" + commandData + "'s password was cleared!");
        if (tar !== undefined) {
            var mod = sys.name(src);
            sys.sendMessage(tar, "Your password was cleared by " + mod + "!");
            sys.sendNetworkCommand(tar, 14); // make the register button active again
        }

        return "OK";
    }
}

export var instance: IPlugin = new Registration();