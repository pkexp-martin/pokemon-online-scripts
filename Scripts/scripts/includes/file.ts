///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

export function readLines(filePath: string): string[] {
    try {
        var lines = sys.getFileContent(filePath).split("\n");
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].trim();
        }
        return lines;
    }
    catch (e) {
        return new string[];
    }
}

export function readObject(filePath: string): any {
    try {
        return JSON.parse(sys.getFileContent(filePath));
    }
    catch (e) {
        return {};
    }
}

export function writeObject(filePath: string, object: any): bool {
    try {
        sys.writeToFile(filePath, JSON.stringify(object));
        return true;
    }
    catch (e) {
        return false;
    }
}

export function readObjectOrCreateDefault(filePath: string, def: any): any {
    var ret = def;
    try {
        ret = JSON.parse(sys.getFileContent(filePath));
    }
    catch (e) {
        writeObject(filePath, def);
    }
    return ret;
}