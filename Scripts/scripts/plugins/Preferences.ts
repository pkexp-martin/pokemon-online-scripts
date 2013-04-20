///<reference path="../../interfaces/Plugin.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>
///<reference path="../../interfaces/Session.ts"/>

import Keys = module("scripts/includes/keys");

declare var SESSION: ISession;
declare var sys: IScriptEngine;

export class Preferences implements IPlugin {

    public sourcePath: string;

    public beforeChallengeIssued(src, dest, clauses, rated, mode, team, destTier) {
        if (SESSION.users(dest).sametier === true && (destTier != sys.tier(src, team))) {
            sys.sendMessage(src, "That guy only wants to fight his/her own tier.");
            return "STOP";
        }
    }

    public afterChangeTeam(src) {
        SESSION.users(src).sametier = Keys.get("forceSameTier", src) == "1";

        if (Keys.get("autoIdle", src) == "1") {
            sys.changeAway(src, true);
        }
    }

    public handleCommandSameTier(channel, src, commandData, tar) {
        if (commandData == "on") {
            sys.sendMessage(src, "You enforce same tier in your battles.");
            SESSION.users(src).sametier = true;
        } else if (commandData == "off") {
            sys.sendMessage(src, "You allow different tiers in your battles.");
            SESSION.users(src).sametier = false;
        } else {
            sys.sendMessage(src, "Currently: " + (SESSION.users(src).sametier ? "enforcing same tier" : "allow different tiers") + ". Use /sametier on/off to change it!");
        }
        Keys.save("forceSameTier", src, SESSION.users(src).sametier ? 1 : 0);
        return;
    }

    public handleCommandIdle(channel, src, commandData, tar) {
        if (commandData == "on") {
            sys.sendMessage(src, "You are now idling.");
            Keys.save("autoIdle", src, 1);
            sys.changeAway(src, true);
        }
        else if (commandData == "off") {
            sys.sendMessage(src, "You are back and ready for battles!");
            Keys.save("autoIdle", src, 0);
            sys.changeAway(src, false);
        }
        else {
            sys.sendMessage(src, "You are currently " + (sys.away(src) ? "idling" : "here and ready to battle") + ". Use /idle on/off to change it.");
        }
        return;
    }
}

export var instance: IPlugin = new Preferences();