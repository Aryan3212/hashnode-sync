const fs = require('fs');

function saveJsonFile(path, obj) {
    const data = JSON.stringify(obj, null, 2);
    fs.writeFileSync(path, data);
}


function getSyncedJson(path) {
    const data = fs.readFileSync(path);
    const obj = JSON.parse(data);
    return new Proxy(obj, {
        set(target, property, value) {
            const result = Reflect.set(target, property, value);
            saveJsonFile(path, target);
            return result;
        }
    });
}

module.exports = {
    getSyncedJson
}