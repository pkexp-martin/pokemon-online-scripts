///<reference path="../../interfaces/plugin.ts"/>

class Base implements IPlugin {

    public sourcePath: string;

    // ------------------------------------------------------------------------
    // EVENTS
    // ------------------------------------------------------------------------

    // Server events

    public serverStartUp(): string {
        return "";
    }

    serverShutDown(): string {
        return "";
    }

    stepEvent(): string {
        return "";
    }

    // Login / Logout Events

    beforeIPConnected(ip): string {
        return "";
    }

    beforeLogIn(src, defaultChannel): string {
        return "";
    }

    afterLogIn(src, defaultChannel): string {
        return "";
    }

    beforeLogOut(src): string {
        return "";
    }

    afterLogOut(src): string {
        return "";
    }

    // Message events

    beforeChatMessage(src, message, channel): string {
        return "";
    }

    afterChatMessage(src, message, channel): string {
        return "";
    }

    beforeNewMessage(message): string {
        return "";
    }

    afterNewMessage(message): string {
        return "";
    }

    beforeNewPM(src): string {
        return "";
    }

    // Battle events

    battleSetup(src, dest, battleId): string {
        return "";
    }

    beforeFindBattle(src): string {
        return "";
    }

    afterFindBattle(src): string {
        return "";
    }

    beforeChallengeIssued(src, dest, desc): string {
        return "";
    }

    afterChallengeIssued(src, dest, desc): string {
        return "";
    }

    beforeBattleMatchup(src, dest, desc): string {
        return "";
    }

    afterBattleMatchup(src, dest, desc): string {
        return "";
    }

    beforeBattleStarted(src, dest, desc, battleid, team1, team2): string {
        return "";
    }

    afterBattleStarted(winner, loser, desc, battleid, team1, team2): string {
        return "";
    }

    beforeBattleEnded(winner, loser, desc, battleid): string {
        return "";
    }

    afterBattleEnded(winner, loser, desc, battleid): string {
        return "";
    }

    // Spectator events

    attemptToSpectateBattle(src, p1, p2): string {
        return "";
    }

    beforeSpectateBattle(src, p1, p2): string {
        return "";
    }

    afterSpectateBattle(src, p1, p2): string {
        return "";
    }

    // Player events

    beforePlayerAway(src, away): string {
        return "";
    }

    afterPlayerAway(src, away): string {
        return "";
    }

    beforePlayerKick(src, dest): string {
        return "";
    }

    afterPlayerKick(src, dest): string {
        return "";
    }

    beforePlayerBan(src, dest, time): string {
        return "";
    }

    afterPlayerBan(src, dest, time): string {
        return "";
    }

    beforeChangeTeam(src): string {
        return "";
    }

    afterChangeTeam(src): string {
        return "";
    }

    beforeChangeTier(src, teamSlot, oldTier, newTier): string {
        return "";
    }

    afterChangeTier(src, teamSlot, oldTier, newTier): string {
        return "";
    }

    // Channel events

    beforeChannelCreated(channelid, channelname, playerid): string {
        return "";
    }

    afterChannelCreated(channelid, channelname, playerid): string {
        return "";
    }

    beforeChannelDestroyed(channelid): string {
        return "";
    }

    afterChannelDestroyed(channelid): string {
        return "";
    }

    beforeChannelJoin(src, channelid): string {
        return "";
    }

    afterChannelJoin(src, channelid): string {
        return "";
    }

    beforeChannelLeave(src, channelid): string {
        return "";
    }

    afterChannelLeave(src, channelid): string {
        return "";
    }

    // ------------------------------------------------------------------------
    // COMMAND HANDLERS
    // ------------------------------------------------------------------------

    public handleCommand(source, command, data, target): string {
        return "OK";
    }
}

export var instance: IPlugin = new Base();