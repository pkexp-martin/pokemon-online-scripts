var MemoryHash = (function () {
    function MemoryHash(fname) {
        this.fname = fname;
        this.hash = {
        };
        var contents = sys.getFileContent(this.fname);
        if(contents !== undefined) {
            var lines = contents.split("\n");
            for(var i = 0; i < lines.length; ++i) {
                var line = lines[i];
                var key_value = line.split("*");
                var key = key_value[0];
                var value = key_value[1];
                if(key.length > 0) {
                    if(value === undefined) {
                        value = '';
                    }
                    this.hash[key] = value;
                }
            }
        } else {
            sys.writeToFile(fname, "");
        }
    }
    MemoryHash.prototype.add = function (key, value) {
        this.hash[key] = value;
        sys.appendToFile(this.fname, key + '*' + value + '\n');
    };
    MemoryHash.prototype.get = function (key) {
        return this.hash[key];
    };
    MemoryHash.prototype.remove = function (key) {
        delete this.hash[key];
        this.save();
    };
    MemoryHash.prototype.removeIf = function (test) {
        var i;
        var toDelete = [];
        for(i in this.hash) {
            if(test(this, i)) {
                toDelete.push(i);
            }
        }
        for(i in toDelete) {
            delete this.hash[toDelete[i]];
        }
    };
    MemoryHash.prototype.clear = function () {
        this.hash = {
        };
        this.save();
    };
    MemoryHash.prototype.save = function () {
        var lines = [];
        for(var i in this.hash) {
            lines.push(i + '*' + this.hash[i] + '\n');
        }
        sys.writeToFile(this.fname, lines.join(""));
    };
    MemoryHash.prototype.escapeValue = function (value) {
        return value.replace(/\*\n/g, '');
    };
    return MemoryHash;
})();
exports.MemoryHash = MemoryHash;
