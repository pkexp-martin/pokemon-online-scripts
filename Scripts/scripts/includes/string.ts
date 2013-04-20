///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

interface String {
    endsWith(suffix: string): bool;
    format(...args: any[]): any;
    replaceAll(search: string, replace: string): string;
    toCorrectCase(): void;
}

String.prototype.endsWith = function () {
    var suffix: string = arguments[0];
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.format = function () {
    var formatted: string = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

String.prototype.replaceAll = function () {
    var search = new RegExp(arguments[0], "g");
    return this.replace(search, arguments[1]);
};

String.prototype.toCorrectCase = function () {
    if (isNaN(this) && sys.id(this) !== undefined) {
        return sys.name(sys.id(this));
    }
    else {
        return this;
    }
};