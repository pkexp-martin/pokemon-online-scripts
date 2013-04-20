// Interface for sys

interface IScriptEngine {
    // Public slots

    changeScript(script: string, triggerStartUp: bool): void;

    // Every Q_INVOKABLE declared in Server/scriptengine.h

    ability(num: number): any;
    abilityNum(nature: string): any;
    addPlugin(path: string): void;
    aliases(ip: string): any;
    appendToFile(fileName: string, content: string): void;
    auth(id: number): any;
    avatar(playerId: number): any;
    away(id: number): any;
    ban(Qname: string): void;
    banList(): any;
    battling(id: number): any;
    battlingIds(): any;
    changeAnnouncement(html: string): void;
    changeAuth(id: number, auth: number): void;
    changeAvatar(playerId: number, avatarId: number): void;
    changeAway(id: number, away: bool): void;
    changeDbAuth(name: string, auth: number): void;
    changeDescription(html: string): void;
    changeInfo(playerId: number, QnewInfo: string): void;
    changeName(playerId: number, QnewName: string): void;
    changePokeAbility(id: number, team: number, slot: number, ability: number): void;
    changePokeGender(id: number, team: number, pokeslot: number, gender: number): void;
    changePokeHappiness(id: number, team: number, slot: number, value: number): void;
    changePokeHp(id: number, team: number, slot: number, hp: number): void;
    changePokeItem(id: number, team: number, slot: number, item: number): void;
    changePokeLevel(id: number, team: number, slot: number, level: number): void;
    changePokeMove(id: number, team: number, pokeslot: number, moveslot: number, move: number): void;
    changePokeName(id: number, team: number, pokeslot: number, name: string): void;
    changePokeNature(id: number, team: number, pokeslot: number, nature: number): void;
    changePokeNum(id: number, team: number, slot: number, num: number): void;
    changePokePP(id: number, team: number, slot: number, moveslot: number, PP: number): void;
    changePokeShine(id: number, team: number, slot: number, value: bool): void;
    changePokeStatus(id: number, team: number, slot: number, status: number): void;
    changeRating(name: string, tier: string, newRating: number): void;
    changeTeamPokeDV(id: number, team: number, slot: number, stat: number, newValue: number): void;
    changeTeamPokeEV(id: number, team: number, slot: number, stat: number, newValue: number): void;
    changeTier(id: number, team: number, tier: string): void;
    channel(id: number): any;
    channelId(name: string): number;
    channelIds(): number[];
    channelsOfPlayer(playerid: number): any;
    clearChat(): void;
    clearPass(name: string): void;
    compatibleAsDreamWorldEvent(id: number, team: number, slot: number): bool;
    createChannel(channame: string): any;
    dbAll(): any;
    dbAuth(name: string): any;
    dbAuths(): any;
    dbDelete(name: string): any;
    dbExpiration(): number;
    dbExpire(name: string): any;
    dbIp(name: string): any;
    dbLastOn(name: string): any;
    dbRegistered(name: string): bool;
    dbTempBanTime(name: string): any;
    deleteFile(fileName: string): void;
    dirsForDirectory(dir: string): any;
    disconnect(id: number): void; //Disconnects a player. (He can reconnect with all his data)
    disconnectedPlayers(): number;
    eval(script: string): any;
    existChannel(channame: string): bool;
    exists(id: number): bool;
    exportMemberDatabase(): void;
    exportTierDatabase(): void;
    extractZip(zipName: string): any;
    extractZip(zipName: string, targetDir: string): any;
    filesForDirectory(dir: string): any;
    forceBattle(player1: number, player2: number, team1: number, team2: number, clauses: number, mode: number, is_rated: bool): void;
    gen(id: number, team: number): any;
    gender(genderNum: number): string;
    genderNum(QgenderName: string): any;
    generation(genNum: number, subNum: number): any;
    getAnnouncement(): any;
    getClauses(tier: string): number;
    getColor(id: number): any;
    getCurrentDir(): any;
    getDescription(): string;
    getFileContent(path: string): any;
    getScript(): any;
    getServerPlugins(): any;
    getTierList(): any;
    getVal(file: string, key: string): any;
    getVal(key: string): any;
    getValKeys(): any;
    getValKeys(file: string): any;
    get_output(command: string, callback: any, errback: any): any;
    hasDreamWorldAbility(id: number, team: number, slot: number): bool;
    hasLegalTeamForTier(id: number, team: number, tier: string): bool;
    hasTeamItem(id: number, team: number, itemNum: number): bool;
    hasTeamMove(id: number, team: number, movenum: number): bool;
    hasTeamPoke(id: number, team: number, pokemonnum: number): bool;
    hasTeamPokeMove(id: number, team: number, pokeindex: number, movenum: any): bool;
    hasTier(id: number, tier: string): bool;
    hexColor(colorname: string): string;
    hiddenPowerType(gen: number, hpdv: number, attdv: number, defdv: number, spddv: number, sattdv: number, sdefdv: number): number;
    hostName(ip: string, func: any): void;
    id(name: string): any;
    import (fileName: string): any;
    indexOfTeamPoke(id: number, team: number, pokenum: number): any;
    indexOfTeamPokeMove(id: number, team: number, pokeindex: number, movenum: number): any;
    inflictStatus(battleId: number, toFirstPlayer: bool, slot: number, status: number): void;
    info(playerId: number): any;
    ip(id: number): string;
    isInChannel(playerid: number, channelid: number): bool;
    isInSameChannel(player1: number, player2: number): bool;
    isServerPrivate(): bool;
    item(num: number): any;
    itemNum(item: string): any;
    kick(id: number): void;
    kick(playerid: number, chanid: number): void;
    kill_processes(): any;
    ladderEnabled(id: number): any;
    ladderRating(id: number, tier: string): any;
    listPlugins(): string[];
    list_processes(): any;
    loadServerPlugin(path: string): bool;
    loggedIn(id: number): bool;
    makeDir(dir: string): void;
    makeServerPublic(isPublic: bool): void;
    maxAuth(ip: string): number;
    md4(text: string): string;
    md5(text: string): string;
    memoryDump(): any;
    move(num: any): any;
    moveNum(name: string): any;
    moveType(moveNum: number, gen: number): number;
    name(id: number): any;
    nature(num: number): any;
    natureNum(nature: string): any;
    numPlayers(): number;
    playerIds(): any;
    playersInMemory(): number;
    playersOfChannel(channelid: number): any;
    pokeAbility(poke: number, slot: number, gen: number): any;
    pokeBaseStats(id: number): any;
    pokeGenders(poke: number): any;
    pokemon(num: number): any;
    pokeNum(name: string): any;
    pokeType1(id: number, gen: number): number;
    pokeType2(id: number, gen: number): number;
    prepareItems(battleId: number, playerSlot: number, items: any): void;
    prepareWeather(battleId: number, weatherId: number): void;
    prnumber(context: any, engine: any): void;
    proxyIp(id: number): any;
    putInChannel(playerid: number, chanid: number): void;
    rand(min: number, max: number): number;
    ranking(id: number, team: number): any;
    ranking(name: string, tier: string): any;
    ratedBattles(id: number, team: number): any;
    ratedBattles(name: string, tier: string): any;
    reloadTiers(): void;
    removeDir(dir: string): void;
    removePlugin(index: number): void;
    removeVal(file: string, key: string): void;
    removeVal(key: string): void;
    resetLadder(tier: string): void;
    saveVal(file: string, key: string, val: any): void;
    saveVal(key: string, val: any): void;
    sendAll(mess: string): void;
    sendAll(mess: string, channel: number): void;
    sendHtmlAll(mess: string): void;
    sendHtmlAll(mess: string, channel: number): void;
    sendHtmlMessage(id: number, mess: string): void;
    sendHtmlMessage(id: number, mess: string, channel: number): void;
    sendMessage(id: number, mess: string): void;
    sendMessage(id: number, mess: string, channel: number): void;
    sendNetworkCommand(id: number, command: number): void;
    serverVersion(): string;
    setAnnouncement(html: string): void;
    setAnnouncement(html: string, id: number): void;
    setTeamToBattleTeam(pid: number, teamSlot: number, battleId: number): void;
    setTimer(v: any, delay: number, repeats: bool): number;
    sha1(text: string): string;
    shutDown(): void;
    stopEvent(): void;
    subgen(id: number, team: number): any;
    swapPokemons(pid: number, teamSlot: number, slot1: number, slot2: number): void;
    synchronizeTierWithSQL(tier: string): void;
    synchronousWebCall(urlstring: string): any;
    synchronousWebCall(urlstring: string, params_array: any): any;
    system(command: string): number;
    teamCount(id: number): any;
    teamPoke(id: number, team: number, index: number): any;
    teamPokeAbility(id: number, team: number, slot: number): number;
    teamPokeDV(id: number, team: number, slot: number, stat: number): any;
    teamPokeEV(id: number, team: number, slot: number, stat: number): any;
    teamPokeGender(id: number, team: number, slot: number): any;
    teamPokeHappiness(id: number, team: number, slot: number): any;
    teamPokeHp(id: number, team: number, slot: number): any; //Stat would return total hp
    teamPokeItem(id: number, team: number, pokeindex: number): any;
    teamPokeLevel(id: number, team: number, slot: number): any;
    teamPokeMove(id: number, team: number, pokeindex: number, moveindex: number): any;
    teamPokeName(id: number, team: number, pokemonnum: number): any;
    teamPokeNature(id: number, team: number, slot: number): any;
    teamPokeNick(id: number, team: number, pokeslot: number): any;
    teamPokePP(id: number, team: number, slot: number, moveslot: number): any;
    teamPokeShine(id: number, team: number, slot: number): any;
    teamPokeStat(id: number, team: number, slot: number, stat: number): any;
    teamPokeStatus(id: number, team: number, slot: number): any;
    tempBan(Qname: string, time: number): void;
    tier(id: number, team: number): any;
    time(): any;
    totalPlayersByTier(tier: string): any;
    type(id: number): any;
    typeNum(typeName: string): any;
    unban(Qname: string): void;
    unloadServerPlugin(plugin: string): bool;
    unsetAllTimers(): number;
    unsetTimer(timerId: number): bool;
    updateDatabase(): void;
    updatePlayer(playerid: number): void;
    updateRatings(): void;
    validColor(color: string): bool;
    weather(weatherId: number): any;
    weatherNum(weatherName: string): any;
    webCall(urlstring: string, callback: any): void;
    webCall(urlstring: string, callback: any, params_array: any): void;
    writeToFile(fileName: string, content: any): void;
    zip(path: string, directory: string): any;

    // DEPRECATED

    callLater(s: any, delay: number): number;
    callQuickly(s: string, delay: number): number;
    delayedCall(func: any, delay: number): number;
    numberervalCall(func: any, delay: number): number;
    numberervalTimer(expr: string, delay: number): number;
    quickCall(func: any, delay: number): number;
    stopTimer(timerId: number): bool;
}