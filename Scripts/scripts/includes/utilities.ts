///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

//export function python_split(string, delim, limit) {
//    var arr;
//    if ((delim.__proto__ === RegExp || delim.__proto__ == "/(?:)/") && limit !== undefined) {
//        // lastIndex doesn't update without global match
//        var flags = "g" + (delim.ignoreCase ? "i" : "") + (delim.multiline ? "m" : "");
//        var re = new RegExp(delim.source, flags);
//        arr = [];
//        var lastIndex = 0;
//        while (--limit >= 0) {
//            var match = re.exec(string);
//            if (match !== null) {
//                arr.push(string.substring(lastIndex, match.index));
//                lastIndex = re.lastIndex;
//            } else {
//                arr.push(string.substring(lastIndex));
//                break;
//            }
//        }
//        if (limit < 0) {
//            arr.push(string.substring(lastIndex));
//        }
//        return arr;
//    }
//    arr = string.split(delim);
//    if (delim.length > limit) {
//        var b = arr.slice(delim);
//        arr.push(b.join(delim));
//    }
//    return arr;
//}

//export function isLetter(f) {
//    var x = f.toLowerCase();
//    return x >= 'a' && x <= 'z';
//}

//export function is_command(string) {
//    return (string[0] == '/' || string[0] == '!') && string.length > 1 && isLetter(string[1]);
//}

//export function as_command(string, delim, limit) {
//    var Command = { command: "", parameters: [], parameterString: "" };
//    var pos = string.indexOf(' ');
//    var startIndex = this.is_command(string) ? 1 : 0;
//    if (pos != -1) {
//        Command.command = string.substring(startIndex, pos).toLowerCase();
//        Command.parameterString = string.substr(pos + 1);
//    } else {
//        Command.command = string.substr(startIndex).toLowerCase();
//    }
//    if (delim !== undefined) {
//        Command.parameters = this.python_split(Command.parameterString, delim, limit);
//    }
//    return Command;
//}

//export function find_poke(src, poke_id) {
//    var poke_slot;
//    /* first try if poke_id is slot number between 1-6 */
//    if (/^[1-6]$/.test(poke_id)) {
//        poke_slot = parseInt(poke_id, 10) - 1;
//    } else {
//        /* try to see if poke_id is species */
//        var pokeNum = sys.pokeNum(poke_id);
//        if (pokeNum !== undefined) {
//            poke_slot = sys.indexOfTeamPoke(src, pokeNum);
//        }
//        /* fallback to nickname */
//        if (poke_slot !== undefined) {
//            for (var slot = 0; slot < 6; ++slot) {
//                if (sys.teamPokeNick(src, slot) === poke_id) {
//                    poke_slot = slot;
//                    break;
//                }
//            }
//        }
//    }
//    return poke_slot;
//}

//export function find_move(src, poke_slot, move_id) {
//    var move_slot;
//    if (/^[1-4]$/.test(move_id)) {
//        move_slot = parseInt(move_id, 10) - 1;
//    } else {
//        var moveNum = sys.moveNum(move_id);
//        if (moveNum !== undefined) {
//            move_slot = sys.indexOfTeamPokeMove(src, poke_slot, moveNum);
//        }
//    }
//    return move_slot;
//}

//export function find_tier(tier_name) {
//    tier_name = tier_name.toLowerCase();
//    var tiers = sys.getTierList();
//    for (var i = 0; i < tiers.length; ++i) {
//        if (tiers[i].toLowerCase() == tier_name) {
//            return tiers[i];
//        }
//    }
//    return null;
//}

//export function is_non_negative(n) {
//    return typeof n == 'number' && !isNaN(n) && n >= 0;
//}

export function Lazy(func) {
    var done = false;
    return function () {
        if (done)
            return this._value;
        else {
            done = true;
            return this._value = func.apply(arguments.callee, arguments);
        }
    };
}

export function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
}

export function nonFlashing(name: string): string {
    return name;
    // PO version 1.0.53 has a bug with zwsp due to (we think) qt.
    /* return name[0] + '\u200b' + name.substr(1) */
}

//export function getOrCreateChannel(name) {
//    var cid;
//    if (sys.existChannel(name)) {
//        cid = sys.channelId(name);
//    } else {
//        cid = sys.createChannel(name);
//    }
//    return cid;
//}

export function escapeHtml(text: string): string {
    var m = String(text);
    if (m.length > 0) {
        var amp = "&am" + "p;";
        var lt = "&l" + "t;";
        var gt = "&g" + "t;";
        return m.replace(/&/g, amp).replace(/</g, lt).replace(/>/g, gt);
    } else {
        return "";
    }
}

export function getSeconds(s) {
    var parts = s.split(" ");
    var secs = 0;
    for (var i = 0; i < parts.length; ++i) {
        var c = (parts[i][parts[i].length - 1]).toLowerCase();
        var mul = 60;
        if (c == "s") { mul = 1; }
        else if (c == "m") { mul = 60; }
        else if (c == "h") { mul = 60 * 60; }
        else if (c == "d") { mul = 24 * 60 * 60; }
        else if (c == "w") { mul = 7 * 24 * 60 * 60; }
        secs += mul * parseInt(parts[i], 10);
    }
    return secs;
}

export function getTimeString(sec: number): string {
    var value = new string[];
    var lookup = [
        { seconds: 7 * 24 * 60 * 60, display: "week" },
        { seconds: 24 * 60 * 60, display: "day" },
        { seconds: 60 * 60, display: "hour" },
        { seconds: 60, display: "minute" },
        { seconds: 1, display: "second" }
    ];
    for (var i = 0; i < lookup.length; ++i) {
        var n = Math.round(sec / lookup[i].seconds);
        if (n > 0) {
            value.push((n + " " + lookup[i].display + (n > 1 ? "s" : "")));
            sec -= n * lookup[i].seconds;
            if (value.length >= 2) {
                break;
            }
        }
    }
    return value.join(", ");
}

export function getColor(src) {
    var colour = sys.getColor(src);
    if (colour === "#000000") {
        var clist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];
        colour = clist[src % clist.length];
    }
    return colour;
}