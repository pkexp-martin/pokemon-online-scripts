///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

export function key(name, user) {
    return name + "*" + sys.ip(user);
};

export function save(name, user, value) {
    sys.saveVal(key(name, user), value);
};

export function get(name, user) {
    return sys.getVal(key(name, user));
}