function key(name, user) {
    return name + "*" + sys.ip(user);
}
exports.key = key;
; ;
function save(name, user, value) {
    sys.saveVal(key(name, user), value);
}
exports.save = save;
; ;
function get(name, user) {
    return sys.getVal(key(name, user));
}
exports.get = get;
