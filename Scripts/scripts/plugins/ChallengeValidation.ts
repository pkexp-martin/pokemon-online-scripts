///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

declare var sys: IScriptEngine;

export class ChallengeValidation implements IPlugin {

    public sourcePath: string;

    public beforeChallengeIssued(src: number, dest: number, clauses: number, rated: bool, 
                                 mode: number = 0, team: number = 0, destTier: any = ""): string {

        var isChallengeCup = sys.getClauses(destTier) % 32 >= 16;
        var hasChallengeCupClause = (clauses % 32) >= 16;

        if (isChallengeCup && !hasChallengeCupClause) {
            sys.sendMessage(src, "+BattleBot: Challenge Cup must be enabled in the challenge window for a CC battle", undefined);
            return "STOP";
        }

        if (sys.tier(src, team).indexOf("Doubles") != -1 && destTier.indexOf("Doubles") != -1 && mode != 1) {
            sys.sendMessage(src, "+BattleBot: To fight in doubles, enable doubles in the challenge window!", undefined);
            return "STOP";
        }
        
        if (sys.tier(src, team).indexOf("Triples") != -1 && destTier.indexOf("Triples") != -1 && mode != 2) {
            sys.sendMessage(src, "+BattleBot: To fight in triples, enable triples in the challenge window!", undefined);
            return "STOP";
        }

        return "OK";
    }
}

export var instance: IPlugin = new ChallengeValidation();