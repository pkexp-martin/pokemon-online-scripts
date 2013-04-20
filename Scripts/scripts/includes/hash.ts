///<reference path="../../interfaces/MemoryHash.ts"/>
///<reference path="../../interfaces/ScriptEngine.ts"/>

declare var sys: IScriptEngine;

export class MemoryHash implements IMemoryHash {
    public hash = {};

    constructor(public fname: string) {
        var contents = sys.getFileContent(this.fname);
        if (contents !== undefined) {
            var lines = contents.split("\n");
            for (var i = 0; i < lines.length; ++i) {
                var line = lines[i];
                var key_value = line.split("*");
                var key = key_value[0];
                var value = key_value[1];
                if (key.length > 0) {
                    if (value === undefined)
                        value = '';
                    this.hash[key] = value;
                }
            }
        }
        else {
            sys.writeToFile(fname, "");
        }
    }

    public add(key: string, value: string): void {
        this.hash[key] = value;
        // it doesn't matter if we add a duplicate,
        // when we remove something eventually,
        // duplicates will be deleted
        sys.appendToFile(this.fname, key + '*' + value + '\n');
    }

    public get (key: string): string {
        return this.hash[key];
    }

    public remove(key: string): void {
        delete this.hash[key];
        this.save();
    }

    public removeIf(test: any): void {
        var i;
        var toDelete = []
        for (i in this.hash) {
            if (test(this, i)) {
                toDelete.push(i);
            }
        }
        for (i in toDelete) {
            delete this.hash[toDelete[i]];
        }
    }

    public clear(): void {
        this.hash = {};
        this.save();
    }

    public save(): void {
        var lines = [];
        for (var i in this.hash) {
            lines.push(i + '*' + this.hash[i] + '\n');
        }
        sys.writeToFile(this.fname, lines.join(""))
    }

    public escapeValue(value: string): string {
        return value.replace(/\*\n/g, '');
    }
}