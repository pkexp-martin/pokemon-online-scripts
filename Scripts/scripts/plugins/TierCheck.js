var TierCheck = (function () {
    function TierCheck() { }
    TierCheck.bannedGSCSleep = [
        sys.moveNum("Spore"), 
        sys.moveNum("Hypnosis"), 
        sys.moveNum("Lovely Kiss"), 
        sys.moveNum("Sing"), 
        sys.moveNum("Sleep Powder")
    ].sort();
    TierCheck.bannedGSCTrap = [
        sys.moveNum("Mean Look"), 
        sys.moveNum("Spider Web")
    ].sort();
    TierCheck.prototype.beforeChangeTier = function (src, team, oldtier, newtier) {
        if(!this.isLegal(src, team, newtier)) {
            sys.stopEvent();
            sys.sendMessage(src, "±TierCheck: Sorry, you can not change into that tier.");
            this.findLegal(src, team);
        }
    };
    TierCheck.prototype.afterChangeTeam = function (src) {
        for(var team = 0; team < sys.teamCount(src); team++) {
            try  {
                if(sys.gen(src, team) === 2) {
                    pokes:
for(var i = 0; i <= 6; i++) {
                        for(var j = 0; j < TierCheck.bannedGSCSleep.length; ++j) {
                            if(sys.hasTeamPokeMove(src, team, i, TierCheck.bannedGSCSleep[j])) {
                                for(var k = 0; k < TierCheck.bannedGSCTrap.length; ++k) {
                                    if(sys.hasTeamPokeMove(src, team, i, TierCheck.bannedGSCTrap[k])) {
                                        sys.sendMessage(src, "±TierCheck: SleepTrapping is banned in GSC. Pokemon " + sys.pokemon(sys.teamPoke(src, team, i)) + "  removed from your team.");
                                        sys.changePokeNum(src, team, i, 0);
                                        continue pokes;
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e) {
            }
            if(!this.isLegal(src, team, sys.tier(src, team))) {
                this.findLegal(src, team);
                sys.sendMessage(src, "±TierCheck: You were placed into '" + sys.tier(src, team) + "' tier.");
            }
        }
    };
    TierCheck.prototype.handleCommandDwReleased = function (channel, src, commandData, tar) {
        var poke = sys.pokeNum(commandData);
        if(!poke) {
            sys.sendMessage(src, "±TierCheck: No such pokemon!");
            return "WARNING";
        }
        var pokename = sys.pokemon(poke);
        if(sys.pokeAbility(poke, 2, 5) === 0 && sys.pokeAbility(poke, 1, 5) === 0) {
            sys.sendMessage(src, "±TierCheck: " + pokename + " has no DW ability!");
            return "OK";
        }
        if(poke in dwpokemons) {
            if(breedingpokemons.indexOf(poke) == -1) {
                sys.sendMessage(src, "±TierCheck: " + pokename + " released fully!");
            } else {
                sys.sendMessage(src, "±TierCheck: " + pokename + " released as a Male only, can't have egg moves or previous generation moves!");
            }
        } else {
            sys.sendMessage(src, "±TierCheck: " + pokename + " not released, only usable on Dream World tiers!");
        }
        return "OK";
    };
    TierCheck.prototype.addCheck = function (exclusive, tiers, checker) {
        this.checkers.push({
            tiers: tiers,
            checker: checker,
            exclusive: exclusive
        });
    };
    TierCheck.prototype.isLegal = function (src, team, tier, silent) {
        if (typeof silent === "undefined") { silent = false; }
        if(tier == "Challenge Cup" || tier == "Battle Factory" || tier == "CC 1v1" || tier == "Wifi CC 1v1" || tier == "Battle Factory 6v6") {
            return true;
        }
        if(!sys.hasLegalTeamForTier(src, team, tier)) {
            return false;
        }
        var complaints = [];
        for(var i = 0; i < this.checkers.length; ++i) {
            var valid_tier = (this.checkers[i].exclusive === true ? this.checkers[i].tiers.indexOf(tier) == -1 : this.checkers[i].tiers.indexOf(tier) != -1);
            if(valid_tier) {
                var new_comp = this.checkers[i].checker(src, team, tier);
                if(Array.isArray(new_comp)) {
                    complaints = complaints.concat(new_comp);
                }
            }
        }
        if(complaints.length === 0) {
            return true;
        } else {
            if(!silent) {
                for(var j = 0; j < complaints.length; ++j) {
                    sys.sendMessage(src, complaints[j]);
                }
            }
        }
        return false;
    };
    TierCheck.prototype.findLegal = function (src, team) {
        var testPath = [
            "Wifi LC", 
            "DW LC", 
            "Wifi LC Ubers", 
            "Wifi NU", 
            "Wifi LU", 
            "Wifi UU", 
            "Wifi OU", 
            "No Preview OU", 
            "Wifi Ubers", 
            "No Preview Ubers", 
            "Battle Factory", 
            "Challenge Cup"
        ];
        for(var i = 0; i < testPath.length; ++i) {
            var testtier = testPath[i];
            if(sys.hasLegalTeamForTier(src, team, testtier) && this.isLegal(src, team, testtier, true)) {
                sys.changeTier(src, team, testtier);
                return;
            }
        }
    };
    return TierCheck;
})();
exports.TierCheck = TierCheck;
var INCLUDING = false;
var EXCLUDING = true;
var challenge_cups = [
    "Challenge Cup", 
    "CC 1v1", 
    "Battle Factory", 
    "Battle Factory 6v6"
];
var pokeNatures = [];
var list = "Heatran-Eruption/Quiet=Suicune-ExtremeSpeed/Relaxed|Sheer Cold/Relaxed|Aqua Ring/Relaxed|Air Slash/Relaxed=Raikou-ExtremeSpeed/Rash|Weather Ball/Rash|Zap Cannon/Rash|Aura Sphere/Rash=Entei-ExtremeSpeed/Adamant|Flare Blitz/Adamant|Howl/Adamant|Crush Claw/Adamant=Snivy-Aromatherapy/Hardy|Synthesis/Hardy";
var sepPokes = list.split('='), sepMovesPoke, sepMoves, movenat;
for(var x = 0; x < sepPokes.length; x++) {
    sepMovesPoke = sepPokes[x].split('-');
    sepMoves = sepMovesPoke[1].split('|');
    var poke = sys.pokeNum(sepMovesPoke[0]);
    pokeNatures[poke] = [];
    for(var y = 0; y < sepMoves.length; ++y) {
        movenat = sepMoves[y].split('/');
        pokeNatures[poke][sys.moveNum(movenat[0])] = sys.natureNum(movenat[1]);
    }
}
var lclist = [
    "Bulbasaur", 
    "Charmander", 
    "Squirtle", 
    "Croagunk", 
    "Turtwig", 
    "Chimchar", 
    "Piplup", 
    "Treecko", 
    "Torchic", 
    "Mudkip", 
    "Pansage", 
    "Pansear", 
    "Panpour"
];
var lcpokemons = lclist.map(sys.pokeNum);
var lcmoves = {
    "Bronzor": [
        "Iron Defense"
    ],
    "Golett": [
        "Rollout", 
        "Shadow Punch", 
        "Iron Defense", 
        "Mega Punch", 
        "Magnitude", 
        "DynamicPunch", 
        "Night Shade", 
        "Curse", 
        "Hammer Arm", 
        "Focus Punch"
    ],
    "Klink": [
        "Charge", 
        "Thundershock", 
        "Gear Grind", 
        "Bind", 
        "Mirror Shot", 
        "Screech", 
        "Discharge", 
        "Metal Sound", 
        "Shift Gear", 
        "Lock-On", 
        "Zap Cannon"
    ],
    "Petilil": [
        "Entrainment"
    ],
    "Rufflet": [
        "Wing Attack", 
        "Scary Face", 
        "Slash", 
        "Defog", 
        "Air Slash", 
        "Crush Claw", 
        "Whirlwind", 
        "Brave Bird", 
        "Thrash"
    ]
};
var dwlist = [
    "Timburr", 
    "Gurdurr", 
    "Conkeldurr", 
    "Pansage", 
    "Pansear", 
    "Panpour", 
    "Simisear", 
    "Simisage", 
    "Simipour", 
    "Ekans", 
    "Arbok", 
    "Paras", 
    "Parasect", 
    "Happiny", 
    "Chansey", 
    "Blissey", 
    "Munchlax", 
    "Snorlax", 
    "Aipom", 
    "Ambipom", 
    "Pineco", 
    "Forretress", 
    "Wurmple", 
    "Silcoon", 
    "Cascoon", 
    "Beautifly", 
    "Dustox", 
    "Seedot", 
    "Nuzleaf", 
    "Shiftry", 
    "Slakoth", 
    "Vigoroth", 
    "Slaking", 
    "Nincada", 
    "Ninjask", 
    "Plusle", 
    "Minun", 
    "Budew", 
    "Roselia", 
    "Gulpin", 
    "Swalot", 
    "Kecleon", 
    "Kricketot", 
    "Kricketune", 
    "Cherubi", 
    "Cherrim", 
    "Carnivine", 
    "Audino", 
    "Throh", 
    "Sawk", 
    "Scraggy", 
    "Scrafty", 
    "Rattata", 
    "Raticate", 
    "Nidoran-F", 
    "Nidorina", 
    "Nidoqueen", 
    "Nidoran-M", 
    "Nidorino", 
    "Nidoking", 
    "Oddish", 
    "Gloom", 
    "Vileplume", 
    "Bellossom", 
    "Bellsprout", 
    "Weepinbell", 
    "Victreebel", 
    "Ponyta", 
    "Rapidash", 
    "Farfetch'd", 
    "Doduo", 
    "Dodrio", 
    "Exeggcute", 
    "Exeggutor", 
    "Lickitung", 
    "Lickilicky", 
    "Tangela", 
    "Tangrowth", 
    "Kangaskhan", 
    "Sentret", 
    "Furret", 
    "Cleffa", 
    "Clefairy", 
    "Clefable", 
    "Igglybuff", 
    "Jigglypuff", 
    "Wigglytuff", 
    "Mareep", 
    "Flaaffy", 
    "Ampharos", 
    "Hoppip", 
    "Skiploom", 
    "Jumpluff", 
    "Sunkern", 
    "Sunflora", 
    "Stantler", 
    "Poochyena", 
    "Mightyena", 
    "Lotad", 
    "Ludicolo", 
    "Lombre", 
    "Taillow", 
    "Swellow", 
    "Surskit", 
    "Masquerain", 
    "Bidoof", 
    "Bibarel", 
    "Shinx", 
    "Luxio", 
    "Luxray", 
    "Psyduck", 
    "Golduck", 
    "Growlithe", 
    "Arcanine", 
    "Scyther", 
    "Scizor", 
    "Tauros", 
    "Azurill", 
    "Marill", 
    "Azumarill", 
    "Bonsly", 
    "Sudowoodo", 
    "Girafarig", 
    "Miltank", 
    "Zigzagoon", 
    "Linoone", 
    "Electrike", 
    "Manectric", 
    "Castform", 
    "Pachirisu", 
    "Buneary", 
    "Lopunny", 
    "Glameow", 
    "Purugly", 
    "Natu", 
    "Xatu", 
    "Skitty", 
    "Delcatty", 
    "Eevee", 
    "Vaporeon", 
    "Jolteon", 
    "Flareon", 
    "Espeon", 
    "Umbreon", 
    "Leafeon", 
    "Glaceon", 
    "Bulbasaur", 
    "Charmander", 
    "Squirtle", 
    "Ivysaur", 
    "Venusaur", 
    "Charmeleon", 
    "Charizard", 
    "Wartortle", 
    "Blastoise", 
    "Croagunk", 
    "Toxicroak", 
    "Turtwig", 
    "Grotle", 
    "Torterra", 
    "Chimchar", 
    "Infernape", 
    "Monferno", 
    "Piplup", 
    "Prinplup", 
    "Empoleon", 
    "Treecko", 
    "Sceptile", 
    "Grovyle", 
    "Torchic", 
    "Combusken", 
    "Blaziken", 
    "Mudkip", 
    "Marshtomp", 
    "Swampert", 
    "Caterpie", 
    "Metapod", 
    "Butterfree", 
    "Pidgey", 
    "Pidgeotto", 
    "Pidgeot", 
    "Spearow", 
    "Fearow", 
    "Zubat", 
    "Golbat", 
    "Crobat", 
    "Aerodactyl", 
    "Hoothoot", 
    "Noctowl", 
    "Ledyba", 
    "Ledian", 
    "Yanma", 
    "Yanmega", 
    "Murkrow", 
    "Honchkrow", 
    "Delibird", 
    "Wingull", 
    "Pelipper", 
    "Swablu", 
    "Altaria", 
    "Starly", 
    "Staravia", 
    "Staraptor", 
    "Gligar", 
    "Gliscor", 
    "Drifloon", 
    "Drifblim", 
    "Skarmory", 
    "Tropius", 
    "Chatot", 
    "Slowpoke", 
    "Slowbro", 
    "Slowking", 
    "Krabby", 
    "Kingler", 
    "Horsea", 
    "Seadra", 
    "Kingdra", 
    "Goldeen", 
    "Seaking", 
    "Magikarp", 
    "Gyarados", 
    "Omanyte", 
    "Omastar", 
    "Kabuto", 
    "Kabutops", 
    "Wooper", 
    "Quagsire", 
    "Qwilfish", 
    "Corsola", 
    "Remoraid", 
    "Octillery", 
    "Mantine", 
    "Mantyke", 
    "Carvanha", 
    "Sharpedo", 
    "Wailmer", 
    "Wailord", 
    "Barboach", 
    "Whiscash", 
    "Clamperl", 
    "Gorebyss", 
    "Huntail", 
    "Relicanth", 
    "Luvdisc", 
    "Buizel", 
    "Floatzel", 
    "Finneon", 
    "Lumineon", 
    "Tentacool", 
    "Tentacruel", 
    "Corphish", 
    "Crawdaunt", 
    "Lileep", 
    "Cradily", 
    "Anorith", 
    "Armaldo", 
    "Feebas", 
    "Milotic", 
    "Shellos", 
    "Gastrodon", 
    "Lapras", 
    "Dratini", 
    "Dragonair", 
    "Dragonite", 
    "Elekid", 
    "Electabuzz", 
    "Electivire", 
    "Poliwag", 
    "Poliwrath", 
    "Politoed", 
    "Poliwhirl", 
    "Vulpix", 
    "Ninetales", 
    "Musharna", 
    "Munna", 
    "Darmanitan", 
    "Darumaka", 
    "Mamoswine", 
    "Togekiss", 
    "Burmy", 
    "Wormadam", 
    "Mothim", 
    "Pichu", 
    "Pikachu", 
    "Raichu", 
    "Abra", 
    "Kadabra", 
    "Alakazam", 
    "Spiritomb", 
    "Mr. Mime", 
    "Mime Jr.", 
    "Meditite", 
    "Medicham", 
    "Meowth", 
    "Persian", 
    "Shuppet", 
    "Banette", 
    "Spinarak", 
    "Ariados", 
    "Drowzee", 
    "Hypno", 
    "Wobbuffet", 
    "Wynaut", 
    "Snubbull", 
    "Granbull", 
    "Houndour", 
    "Houndoom", 
    "Smoochum", 
    "Jynx", 
    "Ralts", 
    "Gardevoir", 
    "Gallade", 
    "Sableye", 
    "Mawile", 
    "Volbeat", 
    "Illumise", 
    "Spoink", 
    "Grumpig", 
    "Stunky", 
    "Skuntank", 
    "Bronzong", 
    "Bronzor", 
    "Mankey", 
    "Primeape", 
    "Machop", 
    "Machoke", 
    "Machamp", 
    "Magnemite", 
    "Magneton", 
    "Magnezone", 
    "Koffing", 
    "Weezing", 
    "Rhyhorn", 
    "Rhydon", 
    "Rhyperior", 
    "Teddiursa", 
    "Ursaring", 
    "Slugma", 
    "Magcargo", 
    "Phanpy", 
    "Donphan", 
    "Magby", 
    "Magmar", 
    "Magmortar", 
    "Larvitar", 
    "Pupitar", 
    "Tyranitar", 
    "Makuhita", 
    "Hariyama", 
    "Numel", 
    "Camerupt", 
    "Torkoal", 
    "Spinda", 
    "Trapinch", 
    "Vibrava", 
    "Flygon", 
    "Cacnea", 
    "Cacturne", 
    "Absol", 
    "Beldum", 
    "Metang", 
    "Metagross", 
    "Hippopotas", 
    "Hippowdon", 
    "Skorupi", 
    "Drapion", 
    "Tyrogue", 
    "Hitmonlee", 
    "Hitmonchan", 
    "Hitmontop", 
    "Bagon", 
    "Shelgon", 
    "Salamence", 
    "Seel", 
    "Dewgong", 
    "Shellder", 
    "Cloyster", 
    "Chinchou", 
    "Lanturn", 
    "Smeargle", 
    "Porygon", 
    "Porygon2", 
    "Porygon-Z", 
    "Drilbur", 
    "Excadrill", 
    "Basculin", 
    "Basculin-a", 
    "Alomomola", 
    "Stunfisk", 
    "Druddigon", 
    "Foongus", 
    "Amoonguss", 
    "Liepard", 
    "Purrloin", 
    "Minccino", 
    "Cinccino", 
    "Sandshrew", 
    "Sandslash", 
    "Vullaby", 
    "Mandibuzz", 
    "Braviary", 
    "Frillish", 
    "Jellicent", 
    "Weedle", 
    "Kakuna", 
    "Beedrill", 
    "Shroomish", 
    "Breloom", 
    "Zangoose", 
    "Seviper", 
    "Combee", 
    "Vespiquen", 
    "Patrat", 
    "Watchog", 
    "Blitzle", 
    "Zebstrika", 
    "Woobat", 
    "Swoobat", 
    "Mienfoo", 
    "Mienshao", 
    "Bouffalant", 
    "Staryu", 
    "Starmie", 
    "Togepi", 
    "Shuckle", 
    "Togetic", 
    "Rotom", 
    "Sigilyph", 
    "Riolu", 
    "Lucario", 
    "Lugia", 
    "Ho-Oh", 
    "Dialga", 
    "Palkia", 
    "Giratina", 
    "Grimer", 
    "Muk", 
    "Ditto", 
    "Venonat", 
    "Venomoth", 
    "Herdier", 
    "Lillipup", 
    "Stoutland", 
    "Sewaddle", 
    "Swadloon", 
    "Leavanny", 
    "Cubchoo", 
    "Beartic", 
    "Landorus", 
    "Thundurus", 
    "Tornadus", 
    "Dunsparce", 
    "Sneasel", 
    "Weavile", 
    "Nosepass", 
    "Probopass", 
    "Karrablast", 
    "Escavalier", 
    "Shelmet", 
    "Accelgor", 
    "Snorunt", 
    "Glalie", 
    "Froslass", 
    "Heatran", 
    "Pinsir", 
    "Emolga", 
    "Heracross", 
    "Trubbish", 
    "Garbodor", 
    "Snover", 
    "Abomasnow", 
    "Diglett", 
    "Dugtrio", 
    "Geodude", 
    "Graveler", 
    "Golem", 
    "Onix", 
    "Steelix", 
    "Voltorb", 
    "Electrode", 
    "Cubone", 
    "Marowak", 
    "Whismur", 
    "Loudred", 
    "Exploud", 
    "Aron", 
    "Lairon", 
    "Aggron", 
    "Spheal", 
    "Sealeo", 
    "Walrein", 
    "Cranidos", 
    "Rampardos", 
    "Shieldon", 
    "Bastiodon", 
    "Gible", 
    "Gabite", 
    "Garchomp", 
    "Pidove", 
    "Tranquill", 
    "Unfezant", 
    "Tympole", 
    "Palpitoad", 
    "Seismitoad", 
    "Cottonee", 
    "Whimsicott", 
    "Petilil", 
    "Lilligant", 
    "Ducklett", 
    "Swanna", 
    "Deerling", 
    "Sawsbuck", 
    "Elgyem", 
    "Beheeyem", 
    "Pawniard", 
    "Bisharp", 
    "Heatmor", 
    "Durant", 
    "Venipede", 
    "Whirlipede", 
    "Scolipede", 
    "Tirtouga", 
    "Carracosta", 
    "Joltik", 
    "Galvantula", 
    "Maractus", 
    "Dwebble", 
    "Crustle", 
    "Roggenrola", 
    "Boldore", 
    "Gigalith", 
    "Vanillite", 
    "Vanillish", 
    "Vanilluxe", 
    "Klink", 
    "Klang", 
    "Klinklang", 
    "Swinub", 
    "Piloswine", 
    "Golett", 
    "Golurk", 
    "Gothitelle", 
    "Gothorita", 
    "Solosis", 
    "Duosion", 
    "Reuniclus", 
    "Deerling-Summer", 
    "Deerling-Autumn", 
    "Deerling-Winter", 
    "Sawsbuck-Summer", 
    "Sawsbuck-Autumn", 
    "Sawsbuck-Winter"
];
var dwpokemons = {
};
var announceChan = SESSION.global().staffChannel;
var dwpok;
for(dwpok = 0; dwpok < dwlist.length; dwpok++) {
    var num = sys.pokeNum(dwlist[dwpok]);
    if(num === undefined) {
        sys.sendAll("Script Check: Unknown poke in dwpokemons: '" + dwlist[dwpok] + "'.", announceChan);
    } else {
        if(dwpokemons[num] === true) {
            sys.sendAll("Script Check:  dwpokemons contains '" + dwlist[dwpok] + "' multiple times.", announceChan);
        } else {
            dwpokemons[sys.pokeNum(dwlist[dwpok])] = true;
        }
    }
}
var breedingList = [
    "Bulbasaur", 
    "Ivysaur", 
    "Venusaur", 
    "Charmander", 
    "Charmeleon", 
    "Charizard", 
    "Squirtle", 
    "Wartortle", 
    "Blastoise", 
    "Croagunk", 
    "Toxicroak", 
    "Turtwig", 
    "Grotle", 
    "Torterra", 
    "Chimchar", 
    "Monferno", 
    "Infernape", 
    "Piplup", 
    "Prinplup", 
    "Empoleon", 
    "Treecko", 
    "Grovyle", 
    "Sceptile", 
    "Torchic", 
    "Combusken", 
    "Blaziken", 
    "Mudkip", 
    "Marshtomp", 
    "Swampert", 
    "Hitmonlee", 
    "Hitmonchan", 
    "Hitmontop", 
    "Tyrogue", 
    "Porygon", 
    "Porygon2", 
    "Porygon-Z", 
    "Gothorita", 
    "Gothitelle", 
    "Pansage", 
    "Pansear", 
    "Panpour", 
    "Simisear", 
    "Simisage", 
    "Simipour"
];
var breedingpokemons = breedingList.map(sys.pokeNum);
exports.instance = new TierCheck();
exports.instance.addCheck(EXCLUDING, challenge_cups, function eventMovesCheck(src, team) {
    var ret = [];
    for(var i = 0; i < 6; i++) {
        var poke = sys.teamPoke(src, team, i);
        if(pokeNatures[poke] != undefined) {
            for(var x in pokeNatures[poke]) {
                if(sys.hasTeamPokeMove(src, team, i, x) && sys.teamPokeNature(src, team, i) != pokeNatures[poke][x]) {
                    ret.push("" + sys.pokemon(poke) + " with " + sys.move(x) + " must be a " + sys.nature(pokeNatures[poke][x]) + " nature. Change it in the teambuilder.");
                }
            }
        }
    }
    return ret;
});
exports.instance.addCheck(INCLUDING, [
    "Wifi LC", 
    "Wifi LC Ubers", 
    "Wifi UU LC"
], function littleCupCheck(src, team) {
    var ret = [];
    for(var i = 0; i < 6; i++) {
        var x = sys.teamPoke(src, team, i);
        if(x !== 0 && sys.hasDreamWorldAbility(src, team, i) && lcpokemons.indexOf(x) != -1) {
            ret.push("" + sys.pokemon(x) + " is not allowed with a Dream World ability in this tier. Change it in the teambuilder.");
        }
        if(x !== 0 && lcmoves.hasOwnProperty(sys.pokemon(x))) {
            for(var j = 0; j < 4; j++) {
                if(lcmoves[sys.pokemon(x)].indexOf(sys.move(sys.teamPokeMove(src, team, i, j))) !== -1) {
                    ret.push("" + sys.pokemon(x) + " is not allowed in this in tier with the move " + sys.move(sys.teamPokeMove(src, team, i, j)) + ". Change it in the teambuilder.");
                }
            }
        }
    }
    return ret;
});
exports.instance.addCheck(INCLUDING, [
    "Wifi NU"
], function evioliteCheck(src, team, tier) {
    var evioliteLimit = 6;
    var eviolites = 0;
    for(var i = 0; i < 6; i++) {
        var x = sys.teamPoke(src, team, i);
        var item = sys.teamPokeItem(src, team, i);
        item = item !== undefined ? sys.item(item) : "(no item)";
        if(item == "Eviolite" && ++eviolites > evioliteLimit) {
            return [
                "Only 1 pokemon is allowed with eviolite in " + tier + " tier. Please remove extra evioites in teambuilder."
            ];
        }
    }
});
exports.instance.addCheck(EXCLUDING, [
    "No Preview OU", 
    "No Preview Ubers"
], function dwAbilityCheck(src, team, tier) {
    if(sys.gen(src, team) < 5) {
        return;
    }
    var ret = [];
    for(var i = 0; i < 6; i++) {
        var x = sys.teamPoke(src, team, i);
        if(x !== 0 && sys.hasDreamWorldAbility(src, team, i) && (!(x in dwpokemons) || (breedingpokemons.indexOf(x) != -1 && sys.compatibleAsDreamWorldEvent(src, team, i) !== true))) {
            if(!(x in dwpokemons)) {
                ret.push("" + sys.pokemon(x) + " is not allowed with a Dream World ability in " + tier + " tier. Change it in the teambuilder.");
            } else {
                ret.push("" + sys.pokemon(x) + " has to be Male and have no egg moves with its Dream World ability in  " + tier + " tier. Change it in the teambuilder.");
            }
        }
    }
    return ret;
});
exports.instance.addCheck(INCLUDING, [
    "No Preview OU", 
    "Wifi OU", 
    "Wifi UU", 
    "Wifi LU", 
    "Wifi LC", 
    "DW LC", 
    "Wifi Ubers", 
    "No Preview Ubers", 
    "Clear Skies", 
    "Clear Skies DW", 
    "Monotype", 
    "Monocolour", 
    "Monogen", 
    "Smogon OU", 
    "Smogon UU", 
    "Smogon RU", 
    "Wifi NU", 
    "Metronome"
], function inconsistentCheck(src, team, tier) {
    var moody = sys.abilityNum("Moody");
    var ret = [];
    for(var i = 0; i < 6; i++) {
        var x = sys.teamPoke(src, team, i);
        if(x !== 0 && sys.teamPokeAbility(src, team, i) == moody) {
            ret = [
                "" + sys.pokemon(x) + " is not allowed with Moody in " + tier + ". Change it in the teambuilder."
            ];
        }
    }
    return ret;
});
exports.instance.addCheck(INCLUDING, [
    "Clear Skies"
], function weatherlesstiercheck(src, team, tier) {
    var ret = [];
    for(var i = 0; i < 6; i++) {
        var ability = sys.ability(sys.teamPokeAbility(src, team, i));
        if(ability.toLowerCase() == "drizzle" || ability.toLowerCase() == "drought" || ability.toLowerCase() == "snow warning" || ability.toLowerCase() == "sand stream") {
            ret.push("Your team has a pokemon with the ability: " + ability + ", please remove before entering " + tier + " tier.");
        }
    }
    return ret;
});
exports.instance.addCheck(INCLUDING, [
    "Monotype"
], function monotypeCheck(src, team) {
    var type1, type2, typea = 0, typeb = 0, teamLength = 0;
    for(var i = 0; i < 6; i++) {
        var poke = sys.teamPoke(src, team, i);
        if(poke === 0) {
            continue;
        }
        type1 = sys.pokeType1(poke, 5);
        type2 = sys.pokeType2(poke, 5);
        teamLength++;
    }
    for(var i = 0; i < 6; i++) {
        var poke = sys.teamPoke(src, team, i);
        if(poke === 0) {
            continue;
        }
        if((type1 === sys.pokeType1(poke, 5) || type1 === sys.pokeType2(poke, 5)) && type1 !== 17) {
            typea++;
        }
        if((type2 === sys.pokeType1(poke, 5) || type2 === sys.pokeType2(poke, 5)) && type2 !== 17) {
            typeb++;
        }
    }
    if(typea < teamLength && typeb < teamLength) {
        return [
            "Team is not monotype as not every team member is " + (typea >= typeb ? sys.type(type1) : sys.type(type2))
        ];
    }
});
exports.instance.addCheck(INCLUDING, [
    "Monogen"
], function monoGenCheck(src, team) {
    var GEN_MAX = [
        0, 
        151, 
        252, 
        386, 
        493, 
        649
    ];
    var gen = 0;
    for(var i = 0; i < 6; ++i) {
        var pokenum = sys.teamPoke(src, team, i);
        var species = pokenum % 65536;
        if(species === 0) {
            continue;
        }
        if(gen === 0) {
            while(species > GEN_MAX[gen]) {
                ++gen;
            }
        } else {
            if(!(GEN_MAX[gen - 1] < species && species <= GEN_MAX[gen])) {
                return [
                    sys.pokemon(pokenum) + " is not from gen " + gen
                ];
            }
        }
    }
});
exports.instance.addCheck(INCLUDING, [
    "Monocolour"
], function monoColourCheck(src, team) {
    var colours = {
        'Red': [
            'Charmander', 
            'Charmeleon', 
            'Charizard', 
            'Vileplume', 
            'Paras', 
            'Parasect', 
            'Krabby', 
            'Kingler', 
            'Voltorb', 
            'Electrode', 
            'Goldeen', 
            'Seaking', 
            'Jynx', 
            'Magikarp', 
            'Magmar', 
            'Flareon', 
            'Ledyba', 
            'Ledian', 
            'Ariados', 
            'Yanma', 
            'Scizor', 
            'Slugma', 
            'Magcargo', 
            'Octillery', 
            'Delibird', 
            'Porygon2', 
            'Magby', 
            'Ho-Oh', 
            'Torchic', 
            'Combusken', 
            'Blaziken', 
            'Wurmple', 
            'Medicham', 
            'Carvanha', 
            'Camerupt', 
            'Solrock', 
            'Corphish', 
            'Crawdaunt', 
            'Latias', 
            'Groudon', 
            'Deoxys', 
            'Deoxys-A', 
            'Deoxys-D', 
            'Deoxys-S', 
            'Kricketot', 
            'Kricketune', 
            'Magmortar', 
            'Porygon-Z', 
            'Rotom', 
            'Rotom-H', 
            'Rotom-F', 
            'Rotom-W', 
            'Rotom-C', 
            'Rotom-S', 
            'Tepig', 
            'Pignite', 
            'Emboar', 
            'Pansear', 
            'Simisear', 
            'Throh', 
            'Venipede', 
            'Scolipede', 
            'Krookodile', 
            'Darumaka', 
            'Darmanitan', 
            'Dwebble', 
            'Crustle', 
            'Scrafty', 
            'Shelmet', 
            'Accelgor', 
            'Druddigon', 
            'Pawniard', 
            'Bisharp', 
            'Braviary', 
            'Heatmor'
        ],
        'Blue': [
            'Squirtle', 
            'Wartortle', 
            'Blastoise', 
            'Nidoran?', 
            'Nidorina', 
            'Nidoqueen', 
            'Oddish', 
            'Gloom', 
            'Golduck', 
            'Poliwag', 
            'Poliwhirl', 
            'Poliwrath', 
            'Tentacool', 
            'Tentacruel', 
            'Tangela', 
            'Horsea', 
            'Seadra', 
            'Gyarados', 
            'Lapras', 
            'Vaporeon', 
            'Omanyte', 
            'Omastar', 
            'Articuno', 
            'Dratini', 
            'Dragonair', 
            'Totodile', 
            'Croconaw', 
            'Feraligatr', 
            'Chinchou', 
            'Lanturn', 
            'Marill', 
            'Azumarill', 
            'Jumpluff', 
            'Wooper', 
            'Quagsire', 
            'Wobbuffet', 
            'Heracross', 
            'Kingdra', 
            'Phanpy', 
            'Suicune', 
            'Mudkip', 
            'Marshtomp', 
            'Swampert', 
            'Taillow', 
            'Swellow', 
            'Surskit', 
            'Masquerain', 
            'Loudred', 
            'Exploud', 
            'Azurill', 
            'Meditite', 
            'Sharpedo', 
            'Wailmer', 
            'Wailord', 
            'Swablu', 
            'Altaria', 
            'Whiscash', 
            'Chimecho', 
            'Wynaut', 
            'Spheal', 
            'Sealeo', 
            'Walrein', 
            'Clamperl', 
            'Huntail', 
            'Bagon', 
            'Salamence', 
            'Beldum', 
            'Metang', 
            'Metagross', 
            'Regice', 
            'Latios', 
            'Kyogre', 
            'Piplup', 
            'Prinplup', 
            'Empoleon', 
            'Shinx', 
            'Luxio', 
            'Luxray', 
            'Cranidos', 
            'Rampardos', 
            'Gible', 
            'Gabite', 
            'Garchomp', 
            'Riolu', 
            'Lucario', 
            'Croagunk', 
            'Toxicroak', 
            'Finneon', 
            'Lumineon', 
            'Mantyke', 
            'Tangrowth', 
            'Glaceon', 
            'Azelf', 
            'Phione', 
            'Manaphy', 
            'Oshawott', 
            'Dewott', 
            'Samurott', 
            'Panpour', 
            'Simipour', 
            'Roggenrola', 
            'Boldore', 
            'Gigalith', 
            'Woobat', 
            'Swoobat', 
            'Tympole', 
            'Palpitoad', 
            'Seismitoad', 
            'Sawk', 
            'Tirtouga', 
            'Carracosta', 
            'Ducklett', 
            'Karrablast', 
            'Eelektrik', 
            'Eelektross', 
            'Elgyem', 
            'Cryogonal', 
            'Deino', 
            'Zweilous', 
            'Hydreigon', 
            'Cobalion', 
            'Thundurus', 
            'Thunderus-T'
        ],
        'Green': [
            'Bulbasaur', 
            'Ivysaur', 
            'Venusaur', 
            'Caterpie', 
            'Metapod', 
            'Bellsprout', 
            'Weepinbell', 
            'Victreebel', 
            'Scyther', 
            'Chikorita', 
            'Bayleef', 
            'Meganium', 
            'Spinarak', 
            'Natu', 
            'Xatu', 
            'Bellossom', 
            'Politoed', 
            'Skiploom', 
            'Larvitar', 
            'Tyranitar', 
            'Celebi', 
            'Treecko', 
            'Grovyle', 
            'Sceptile', 
            'Dustox', 
            'Lotad', 
            'Lombre', 
            'Ludicolo', 
            'Breloom', 
            'Electrike', 
            'Roselia', 
            'Gulpin', 
            'Vibrava', 
            'Flygon', 
            'Cacnea', 
            'Cacturne', 
            'Cradily', 
            'Kecleon', 
            'Tropius', 
            'Rayquaza', 
            'Turtwig', 
            'Grotle', 
            'Torterra', 
            'Budew', 
            'Roserade', 
            'Bronzor', 
            'Bronzong', 
            'Carnivine', 
            'Yanmega', 
            'Leafeon', 
            'Shaymin', 
            'Shaymin-S', 
            'Snivy', 
            'Servine', 
            'Serperior', 
            'Pansage', 
            'Simisage', 
            'Swadloon', 
            'Cottonee', 
            'Whimsicott', 
            'Petilil', 
            'Lilligant', 
            'Basculin', 
            'Maractus', 
            'Trubbish', 
            'Garbodor', 
            'Solosis', 
            'Duosion', 
            'Reuniclus', 
            'Axew', 
            'Fraxure', 
            'Golett', 
            'Golurk', 
            'Virizion', 
            'Tornadus', 
            'Tornadus-T'
        ],
        'Yellow': [
            'Kakuna', 
            'Beedrill', 
            'Pikachu', 
            'Raichu', 
            'Sandshrew', 
            'Sandslash', 
            'Ninetales', 
            'Meowth', 
            'Persian', 
            'Psyduck', 
            'Ponyta', 
            'Rapidash', 
            'Drowzee', 
            'Hypno', 
            'Exeggutor', 
            'Electabuzz', 
            'Jolteon', 
            'Zapdos', 
            'Moltres', 
            'Cyndaquil', 
            'Quilava', 
            'Typhlosion', 
            'Pichu', 
            'Ampharos', 
            'Sunkern', 
            'Sunflora', 
            'Girafarig', 
            'Dunsparce', 
            'Shuckle', 
            'Elekid', 
            'Raikou', 
            'Beautifly', 
            'Pelipper', 
            'Ninjask', 
            'Makuhita', 
            'Manectric', 
            'Plusle', 
            'Minun', 
            'Numel', 
            'Lunatone', 
            'Jirachi', 
            'Mothim', 
            'Combee', 
            'Vespiquen', 
            'Chingling', 
            'Electivire', 
            'Uxie', 
            'Cresselia', 
            'Victini', 
            'Sewaddle', 
            'Leavanny', 
            'Scraggy', 
            'Cofagrigus', 
            'Archen', 
            'Archeops', 
            'Deerling', 
            'Joltik', 
            'Galvantula', 
            'Haxorus', 
            'Mienfoo', 
            'Keldeo', 
            'Keldeo-R'
        ],
        'Purple': [
            'Rattata', 
            'Ekans', 
            'Arbok', 
            'Nidoran?', 
            'Nidorino', 
            'Nidoking', 
            'Zubat', 
            'Golbat', 
            'Venonat', 
            'Venomoth', 
            'Grimer', 
            'Muk', 
            'Shellder', 
            'Cloyster', 
            'Gastly', 
            'Haunter', 
            'Gengar', 
            'Koffing', 
            'Weezing', 
            'Starmie', 
            'Ditto', 
            'Aerodactyl', 
            'Mewtwo', 
            'Crobat', 
            'Aipom', 
            'Espeon', 
            'Misdreavus', 
            'Forretress', 
            'Gligar', 
            'Granbull', 
            'Mantine', 
            'Tyrogue', 
            'Cascoon', 
            'Delcatty', 
            'Sableye', 
            'Illumise', 
            'Swalot', 
            'Grumpig', 
            'Lileep', 
            'Shellos', 
            'Gastrodon', 
            'Ambipom', 
            'Drifloon', 
            'Drifblim', 
            'Mismagius', 
            'Stunky', 
            'Skuntank', 
            'Spiritomb', 
            'Skorupi', 
            'Drapion', 
            'Gliscor', 
            'Palkia', 
            'Purrloin', 
            'Liepard', 
            'Gothita', 
            'Gothorita', 
            'Gothitelle', 
            'Mienshao', 
            'Genesect'
        ],
        'Pink': [
            'Clefairy', 
            'Clefable', 
            'Jigglypuff', 
            'Wigglytuff', 
            'Slowpoke', 
            'Slowbro', 
            'Exeggcute', 
            'Lickitung', 
            'Chansey', 
            'Mr. Mime', 
            'Porygon', 
            'Mew', 
            'Cleffa', 
            'Igglybuff', 
            'Flaaffy', 
            'Hoppip', 
            'Slowking', 
            'Snubbull', 
            'Corsola', 
            'Smoochum', 
            'Miltank', 
            'Blissey', 
            'Whismur', 
            'Skitty', 
            'Milotic', 
            'Gorebyss', 
            'Luvdisc', 
            'Cherubi', 
            'Cherrim', 
            'Mime Jr.', 
            'Happiny', 
            'Lickilicky', 
            'Mesprit', 
            'Munna', 
            'Musharna', 
            'Audino', 
            'Alomomola'
        ],
        'Brown': [
            'Weedle', 
            'Pidgey', 
            'Pidgeotto', 
            'Pidgeot', 
            'Raticate', 
            'Spearow', 
            'Fearow', 
            'Vulpix', 
            'Diglett', 
            'Dugtrio', 
            'Mankey', 
            'Primeape', 
            'Growlithe', 
            'Arcanine', 
            'Abra', 
            'Kadabra', 
            'Alakazam', 
            'Geodude', 
            'Graveler', 
            'Golem', 
            'Farfetch\'d', 
            'Doduo', 
            'Dodrio', 
            'Cubone', 
            'Marowak', 
            'Hitmonlee', 
            'Hitmonchan', 
            'Kangaskhan', 
            'Staryu', 
            'Pinsir', 
            'Tauros', 
            'Eevee', 
            'Kabuto', 
            'Kabutops', 
            'Dragonite', 
            'Sentret', 
            'Furret', 
            'Hoothoot', 
            'Noctowl', 
            'Sudowoodo', 
            'Teddiursa', 
            'Ursaring', 
            'Swinub', 
            'Piloswine', 
            'Stantler', 
            'Hitmontop', 
            'Entei', 
            'Zigzagoon', 
            'Seedot', 
            'Nuzleaf', 
            'Shiftry', 
            'Shroomish', 
            'Slakoth', 
            'Slaking', 
            'Shedinja', 
            'Hariyama', 
            'Torkoal', 
            'Spinda', 
            'Trapinch', 
            'Baltoy', 
            'Feebas', 
            'Regirock', 
            'Chimchar', 
            'Monferno', 
            'Infernape', 
            'Starly', 
            'Staravia', 
            'Staraptor', 
            'Bidoof', 
            'Bibarel', 
            'Buizel', 
            'Floatzel', 
            'Buneary', 
            'Lopunny', 
            'Bonsly', 
            'Hippopotas', 
            'Hippowdon', 
            'Mamoswine', 
            'Heatran', 
            'Patrat', 
            'Watchog', 
            'Lillipup', 
            'Conkeldurr', 
            'Sandile', 
            'Krokorok', 
            'Sawsbuck', 
            'Beheeyem', 
            'Stunfisk', 
            'Bouffalant', 
            'Vullaby', 
            'Mandibuzz', 
            'Landorus', 
            'Landorus-T'
        ],
        'Black': [
            'Snorlax', 
            'Umbreon', 
            'Murkrow', 
            'Unown', 
            'Sneasel', 
            'Houndour', 
            'Houndoom', 
            'Mawile', 
            'Spoink', 
            'Seviper', 
            'Claydol', 
            'Shuppet', 
            'Banette', 
            'Duskull', 
            'Dusclops', 
            'Honchkrow', 
            'Chatot', 
            'Munchlax', 
            'Weavile', 
            'Dusknoir', 
            'Giratina', 
            'Darkrai', 
            'Blitzle', 
            'Zebstrika', 
            'Sigilyph', 
            'Yamask', 
            'Chandelure', 
            'Zekrom'
        ],
        'Gray': [
            'Machop', 
            'Machoke', 
            'Machamp', 
            'Magnemite', 
            'Magneton', 
            'Onix', 
            'Rhyhorn', 
            'Rhydon', 
            'Pineco', 
            'Steelix', 
            'Qwilfish', 
            'Remoraid', 
            'Skarmory', 
            'Donphan', 
            'Pupitar', 
            'Poochyena', 
            'Mightyena', 
            'Nincada', 
            'Nosepass', 
            'Aron', 
            'Lairon', 
            'Aggron', 
            'Volbeat', 
            'Barboach', 
            'Anorith', 
            'Armaldo', 
            'Snorunt', 
            'Glalie', 
            'Relicanth', 
            'Registeel', 
            'Shieldon', 
            'Bastiodon', 
            'Burmy', 
            'Wormadam', 
            'Wormadam-G', 
            'Wormadam-S', 
            'Glameow', 
            'Purugly', 
            'Magnezone', 
            'Rhyperior', 
            'Probopass', 
            'Arceus', 
            'Herdier', 
            'Stoutland', 
            'Pidove', 
            'Tranquill', 
            'Unfezant', 
            'Drilbur', 
            'Excadrill', 
            'Timburr', 
            'Gurdurr', 
            'Whirlipede', 
            'Zorua', 
            'Zoroark', 
            'Minccino', 
            'Cinccino', 
            'Escavalier', 
            'Ferroseed', 
            'Ferrothorn', 
            'Klink', 
            'Klang', 
            'Klinklang', 
            'Durant', 
            'Terrakion', 
            'Kyurem', 
            'Kyurem-B', 
            'Kyurem-W'
        ],
        'White': [
            'Butterfree', 
            'Seel', 
            'Dewgong', 
            'Togepi', 
            'Togetic', 
            'Mareep', 
            'Smeargle', 
            'Lugia', 
            'Linoone', 
            'Silcoon', 
            'Wingull', 
            'Ralts', 
            'Kirlia', 
            'Gardevoir', 
            'Vigoroth', 
            'Zangoose', 
            'Castform', 
            'Absol', 
            'Shelgon', 
            'Pachirisu', 
            'Snover', 
            'Abomasnow', 
            'Togekiss', 
            'Gallade', 
            'Froslass', 
            'Dialga', 
            'Regigigas', 
            'Swanna', 
            'Vanillite', 
            'Vanillish', 
            'Vanilluxe', 
            'Emolga', 
            'Foongus', 
            'Amoonguss', 
            'Frillish', 
            'Jellicent', 
            'Tynamo', 
            'Litwick', 
            'Lampent', 
            'Cubchoo', 
            'Beartic', 
            'Rufflet', 
            'Larvesta', 
            'Volcarona', 
            'Reshiram', 
            'Meloetta', 
            'Meloetta-S'
        ]
    };
    var poke = sys.pokemon(sys.teamPoke(src, team, 0));
    var thecolour = '';
    for(var colour in colours) {
        if(colours[colour].indexOf(poke) > -1) {
            thecolour = colour;
        }
    }
    if(thecolour === '') {
        return [
            "Bug! " + poke + " has not a colour in checkMonocolour :("
        ];
    }
    for(var i = 1; i < 6; ++i) {
        poke = sys.pokemon(sys.teamPoke(src, team, i));
        if(colours[thecolour].indexOf(poke) == -1 && poke != "Missingno") {
            return [
                "" + poke + " has not the colour: " + thecolour
            ];
        }
    }
});
exports.instance.addCheck(INCLUDING, [
    "Smogon OU", 
    "Wifi OU", 
    "No Preview OU"
], function swiftSwimCheck(src, team) {
    for(var i = 0; i < 6; ++i) {
        if(sys.ability(sys.teamPokeAbility(src, team, i)) == "Drizzle") {
            for(var j = 0; j < 6; ++j) {
                if(sys.ability(sys.teamPokeAbility(src, team, j)) == "Swift Swim") {
                    return [
                        "You cannot have the combination of Swift Swim and Drizzle in OU"
                    ];
                }
            }
        }
    }
});
exports.instance.addCheck(INCLUDING, [
    "Smogon UU"
], function droughtCheck(src, team) {
    for(var i = 0; i < 6; ++i) {
        if(sys.ability(sys.teamPokeAbility(src, team, i)) == "Drought") {
            return [
                "Drought is not allowed in Smogon UU"
            ];
        }
    }
});
exports.instance.addCheck(INCLUDING, [
    "Wifi UU", 
    "Wifi LU", 
    "Wifi NU", 
    "Wifi LC"
], function sandStreamCheck(src, team, tier) {
    for(var i = 0; i < 6; ++i) {
        if(sys.ability(sys.teamPokeAbility(src, team, i)) == "Sand Stream") {
            return [
                "Sand Stream is not allowed in " + tier + "."
            ];
        }
    }
});
exports.instance.addCheck(INCLUDING, [
    "Wifi UU", 
    "Wifi LU", 
    "Wifi NU"
], function snowWarningCheck(src, team, tier) {
    for(var i = 0; i < 6; ++i) {
        if(sys.ability(sys.teamPokeAbility(src, team, i)) == "Snow Warning") {
            return [
                "Snow Warning is not allowed in " + tier + "."
            ];
        }
    }
});
exports.instance.addCheck(INCLUDING, [
    "Shanai Cup"
], function shanaiAbilityCheck(src, team) {
    var bannedAbilities = {
        'treecko': [
            'overgrow'
        ],
        'chimchar': [
            'blaze'
        ],
        'totodile': [
            'torrent'
        ],
        'spearow': [
            'sniper'
        ],
        'skorupi': [
            'battle armor', 
            'sniper'
        ],
        'spoink': [
            'thick fat'
        ],
        'golett': [
            'iron fist'
        ],
        'magnemite': [
            'magnet pull', 
            'analytic'
        ],
        'electrike': [
            'static', 
            'lightningrod'
        ],
        'nosepass': [
            'sturdy', 
            'magnet pull'
        ],
        'axew': [
            'rivalry'
        ],
        'croagunk': [
            'poison touch', 
            'dry skin'
        ],
        'cubchoo': [
            'rattled'
        ],
        'joltik': [
            'swarm'
        ],
        'shroomish': [
            'effect spore', 
            'quick feet'
        ],
        'pidgeotto': [
            'big pecks'
        ],
        'karrablast': [
            'swarm'
        ]
    };
    var ret = [];
    for(var i = 0; i < 6; ++i) {
        var ability = sys.ability(sys.teamPokeAbility(src, team, i));
        var lability = ability.toLowerCase();
        var poke = sys.pokemon(sys.teamPoke(src, team, i));
        var lpoke = poke.toLowerCase();
        if(lpoke in bannedAbilities && bannedAbilities[lpoke].indexOf(lability) != -1) {
            ret.push("" + poke + " is not allowed to have ability " + ability + " in this tier. Please change it in Teambuilder (You are now in Challenge Cup).");
        }
    }
    return ret;
});
exports.instance.addCheck(EXCLUDING, [], function eventShinies(player, team) {
    var beasts = {
    };
    beasts[sys.pokeNum('Raikou')] = [
        'Extremespeed', 
        'Aura Sphere', 
        'Weather Ball', 
        'Zap Cannon'
    ].map(sys.moveNum);
    beasts[sys.pokeNum('Suicune')] = [
        'Extremespeed', 
        'Aqua Ring', 
        'Sheer Cold', 
        'Air Slash'
    ].map(sys.moveNum);
    beasts[sys.pokeNum('Entei')] = [
        'Extremespeed', 
        'Howl', 
        'Crush Claw', 
        'Flare Blitz'
    ].map(sys.moveNum);
    for(var beast in beasts) {
        for(var slot = 0; slot < 6; slot++) {
            if(sys.teamPoke(player, team, slot) == beast) {
                for(var i = 0; i < 4; i++) {
                    if(-1 != beasts[beast].indexOf(sys.teamPokeMove(player, team, slot, i))) {
                        sys.changePokeShine(player, team, slot, true);
                    }
                }
            }
        }
    }
});
exports.instance.addCheck(EXCLUDING, challenge_cups, function hasOneUsablePokemon(player, team) {
    for(var slot = 0; slot < 6; slot++) {
        if(sys.teamPoke(player, team, slot) !== 0) {
            for(var move = 0; move < 4; move++) {
                if(sys.teamPokeMove(player, team, slot, move) !== 0) {
                    return;
                }
            }
        }
    }
    return [
        "You do not have any valid pokemon."
    ];
});
