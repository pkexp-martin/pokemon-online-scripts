function readLines(filePath) {
    try  {
        var lines = sys.getFileContent(filePath).split("\n");
        for(var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].trim();
        }
        return lines;
    } catch (e) {
        return new Array();
    }
}
exports.readLines = readLines;
function readObject(filePath) {
    try  {
        return JSON.parse(sys.getFileContent(filePath));
    } catch (e) {
        return {
        };
    }
}
exports.readObject = readObject;
function writeObject(filePath, object) {
    try  {
        sys.writeToFile(filePath, JSON.stringify(object));
        return true;
    } catch (e) {
        return false;
    }
}
exports.writeObject = writeObject;
function readObjectOrCreateDefault(filePath, def) {
    var ret = def;
    try  {
        ret = JSON.parse(sys.getFileContent(filePath));
    } catch (e) {
        writeObject(filePath, def);
    }
    return ret;
}
exports.readObjectOrCreateDefault = readObjectOrCreateDefault;
