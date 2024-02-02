const { getSyncedJson } = require('./sync-json');

const hashnodeSyncPath = path.join(process.cwd(), '/hashnode-syncrc.json');
const hashnodeSyncFileExists = fs.existsSync(hashnodeSyncPath);
let hashnodeRc = {};

function getHashnodeRc() {
    if (Object.keys(hashnodeRc).length) {
        return hashnodeRc
    }
    hashnodeRc = getSyncedJson(hashnodeSyncPath)
    return hashnodeRc
}

module.exports = {
    hashnodeSyncFileExists,
    getHashnodeRc
}