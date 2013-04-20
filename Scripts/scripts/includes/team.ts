///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

export function text(player: number, team: number, compactible = false) {
    var nature_effects = { "Adamant": "(+Atk, -SAtk)", "Bold": "(+Def, -Atk)" };
    var genders = { 0: '', 1: ' (M)', 2: ' (F)' };
    var stat = { 0: 'HP', 1: 'Atk', 2: 'Def', 3: 'SAtk', 4: 'SDef', 5: 'Spd' };
    var hpnum = sys.moveNum("Hidden Power");
    var ret = [];
    for (var i = 0; i < 6; ++i) {
        var poke = sys.teamPoke(player, team, i);
        if (poke === undefined)
            continue;
        // exclude missingno
        if (poke === 0)
            continue;

        var item = sys.teamPokeItem(player, team, i);
        item = item !== undefined ? sys.item(item) : "(no item)";
        ret.push(sys.pokemon(poke) + genders[sys.teamPokeGender(player, team, i)] + " @ " + item);
        ret.push('Trait: ' + sys.ability(sys.teamPokeAbility(player, team, i)));
        var level = sys.teamPokeLevel(player, team, i);
        if (!compactible && level != 100) ret.push('Lvl: ' + level);

        var ivs = [];
        var evs = [];
        var hpinfo = [sys.gen(player, team)];
        for (var j = 0; j < 6; ++j) {
            var iv = sys.teamPokeDV(player, team, i, j);
            if (iv != 31) ivs.push(iv + " " + stat[j]);
            var ev = sys.teamPokeEV(player, team, i, j);
            if (ev !== 0) evs.push(ev + " " + stat[j]);
            hpinfo.push(iv);
        }
        if (!compactible && ivs.length > 0)
            ret.push('IVs: ' + ivs.join(" / "));
        if (evs.length > 0)
            ret.push('EVs: ' + evs.join(" / "));

        ret.push(sys.nature(sys.teamPokeNature(player, team, i)) + " Nature"); // + (+Spd, -Atk)

        for (j = 0; j < 4; ++j) {
            var move = sys.teamPokeMove(player, team, i, j);
            if (move !== undefined) {
                ret.push('- ' + sys.move(move) + (move == hpnum ? ' [' + sys.type(sys.hiddenPowerType.apply(sys, hpinfo)) + ']' : ''));
            }
        }
        ret.push("");
    }
    return ret;
}