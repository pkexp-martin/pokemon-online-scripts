function Lazy(func) {
    var done = false;
    return function () {
        if(done) {
            return this._value;
        } else {
            done = true;
            return this._value = func.apply(arguments.callee, arguments);
        }
    }
}
exports.Lazy = Lazy;
function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
}
exports.capitalize = capitalize;
function nonFlashing(name) {
    return name;
}
exports.nonFlashing = nonFlashing;
function escapeHtml(text) {
    var m = String(text);
    if(m.length > 0) {
        var amp = "&am" + "p;";
        var lt = "&l" + "t;";
        var gt = "&g" + "t;";
        return m.replace(/&/g, amp).replace(/</g, lt).replace(/>/g, gt);
    } else {
        return "";
    }
}
exports.escapeHtml = escapeHtml;
function getSeconds(s) {
    var parts = s.split(" ");
    var secs = 0;
    for(var i = 0; i < parts.length; ++i) {
        var c = (parts[i][parts[i].length - 1]).toLowerCase();
        var mul = 60;
        if(c == "s") {
            mul = 1;
        } else {
            if(c == "m") {
                mul = 60;
            } else {
                if(c == "h") {
                    mul = 60 * 60;
                } else {
                    if(c == "d") {
                        mul = 24 * 60 * 60;
                    } else {
                        if(c == "w") {
                            mul = 7 * 24 * 60 * 60;
                        }
                    }
                }
            }
        }
        secs += mul * parseInt(parts[i], 10);
    }
    return secs;
}
exports.getSeconds = getSeconds;
function getTimeString(sec) {
    var value = new Array();
    var lookup = [
        {
            seconds: 7 * 24 * 60 * 60,
            display: "week"
        }, 
        {
            seconds: 24 * 60 * 60,
            display: "day"
        }, 
        {
            seconds: 60 * 60,
            display: "hour"
        }, 
        {
            seconds: 60,
            display: "minute"
        }, 
        {
            seconds: 1,
            display: "second"
        }
    ];
    for(var i = 0; i < lookup.length; ++i) {
        var n = Math.round(sec / lookup[i].seconds);
        if(n > 0) {
            value.push((n + " " + lookup[i].display + (n > 1 ? "s" : "")));
            sec -= n * lookup[i].seconds;
            if(value.length >= 2) {
                break;
            }
        }
    }
    return value.join(", ");
}
exports.getTimeString = getTimeString;
function getColor(src) {
    var colour = sys.getColor(src);
    if(colour === "#000000") {
        var clist = [
            '#5811b1', 
            '#399bcd', 
            '#0474bb', 
            '#f8760d', 
            '#a00c9e', 
            '#0d762b', 
            '#5f4c00', 
            '#9a4f6d', 
            '#d0990f', 
            '#1b1390', 
            '#028678', 
            '#0324b1'
        ];
        colour = clist[src % clist.length];
    }
    return colour;
}
exports.getColor = getColor;
