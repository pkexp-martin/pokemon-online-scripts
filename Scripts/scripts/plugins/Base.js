var Base = (function () {
    function Base() { }
    Base.prototype.serverStartUp = function () {
        return "";
    };
    Base.prototype.serverShutDown = function () {
        return "";
    };
    Base.prototype.stepEvent = function () {
        return "";
    };
    Base.prototype.beforeIPConnected = function (ip) {
        return "";
    };
    Base.prototype.beforeLogIn = function (src, defaultChannel) {
        return "";
    };
    Base.prototype.afterLogIn = function (src, defaultChannel) {
        return "";
    };
    Base.prototype.beforeLogOut = function (src) {
        return "";
    };
    Base.prototype.afterLogOut = function (src) {
        return "";
    };
    Base.prototype.beforeChatMessage = function (src, message, channel) {
        return "";
    };
    Base.prototype.afterChatMessage = function (src, message, channel) {
        return "";
    };
    Base.prototype.beforeNewMessage = function (message) {
        return "";
    };
    Base.prototype.afterNewMessage = function (message) {
        return "";
    };
    Base.prototype.beforeNewPM = function (src) {
        return "";
    };
    Base.prototype.battleSetup = function (src, dest, battleId) {
        return "";
    };
    Base.prototype.beforeFindBattle = function (src) {
        return "";
    };
    Base.prototype.afterFindBattle = function (src) {
        return "";
    };
    Base.prototype.beforeChallengeIssued = function (src, dest, desc) {
        return "";
    };
    Base.prototype.afterChallengeIssued = function (src, dest, desc) {
        return "";
    };
    Base.prototype.beforeBattleMatchup = function (src, dest, desc) {
        return "";
    };
    Base.prototype.afterBattleMatchup = function (src, dest, desc) {
        return "";
    };
    Base.prototype.beforeBattleStarted = function (src, dest, desc, battleid, team1, team2) {
        return "";
    };
    Base.prototype.afterBattleStarted = function (winner, loser, desc, battleid, team1, team2) {
        return "";
    };
    Base.prototype.beforeBattleEnded = function (winner, loser, desc, battleid) {
        return "";
    };
    Base.prototype.afterBattleEnded = function (winner, loser, desc, battleid) {
        return "";
    };
    Base.prototype.attemptToSpectateBattle = function (src, p1, p2) {
        return "";
    };
    Base.prototype.beforeSpectateBattle = function (src, p1, p2) {
        return "";
    };
    Base.prototype.afterSpectateBattle = function (src, p1, p2) {
        return "";
    };
    Base.prototype.beforePlayerAway = function (src, away) {
        return "";
    };
    Base.prototype.afterPlayerAway = function (src, away) {
        return "";
    };
    Base.prototype.beforePlayerKick = function (src, dest) {
        return "";
    };
    Base.prototype.afterPlayerKick = function (src, dest) {
        return "";
    };
    Base.prototype.beforePlayerBan = function (src, dest, time) {
        return "";
    };
    Base.prototype.afterPlayerBan = function (src, dest, time) {
        return "";
    };
    Base.prototype.beforeChangeTeam = function (src) {
        return "";
    };
    Base.prototype.afterChangeTeam = function (src) {
        return "";
    };
    Base.prototype.beforeChangeTier = function (src, teamSlot, oldTier, newTier) {
        return "";
    };
    Base.prototype.afterChangeTier = function (src, teamSlot, oldTier, newTier) {
        return "";
    };
    Base.prototype.beforeChannelCreated = function (channelid, channelname, playerid) {
        return "";
    };
    Base.prototype.afterChannelCreated = function (channelid, channelname, playerid) {
        return "";
    };
    Base.prototype.beforeChannelDestroyed = function (channelid) {
        return "";
    };
    Base.prototype.afterChannelDestroyed = function (channelid) {
        return "";
    };
    Base.prototype.beforeChannelJoin = function (src, channelid) {
        return "";
    };
    Base.prototype.afterChannelJoin = function (src, channelid) {
        return "";
    };
    Base.prototype.beforeChannelLeave = function (src, channelid) {
        return "";
    };
    Base.prototype.afterChannelLeave = function (src, channelid) {
        return "";
    };
    Base.prototype.handleCommand = function (source, command, data, target) {
        return "OK";
    };
    return Base;
})();
exports.instance = new Base();
