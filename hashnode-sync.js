const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const matter = require('gray-matter');
const { hashnodeSyncFileExists, getHashnodeRc } = require('./config');
// const api = require('./api');

let hashnodeRc;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const answer = async question => await new Promise(resolve => {
    rl.question(question, resolve)
})
async function main() {

    try {
        let userWish;
        if (hashnodeSyncFileExists) {
            hashnodeRc = getHashnodeRc();
        } else {
            const input = await answer(`Do you want to use this folder(${process.cwd()}) to sync with hashnode? `);
            if (['y', 'Y'].includes(input)) {
                userWish = true
            } else {
                console.log('Folder was not initialized')
                return
            }
        }
        if (userWish) {
            fs.copyFileSync(path.join(__dirname, '/hashnode-syncrc.json'), path.join(process.cwd(), '/hashnode-syncrc.json'))
            hashnodeRc = getHashnodeRc();
        }

        if (!hashnodeRc.token) {
            let input;
            while (!hashnodeRc.token) {
                input = await answer(`Your Hashnode token isn't setup, generate at https://hashnode.com/settings/developer and paste here: `);
                hashnodeRc.token = input;
            }
        }

        if (!hashnodeRc.initialized && !hashnodeRc.publication) {
            console.log('Please setup a default publication in settings and you can also specify the publication in your file\'s frontmatter');
            console.log('PS: The `publication` is the URL of your blog. 1 person can have numerous blogs.');
            const input = await answer('Input your default publication: ');
            if (input) {
                hashnodeRc.publication = input;
            }
            hashnodeRc.initialized = true;
        }

        const markdownFiles = getMarkdownFiles(process.cwd());
        markdownFiles.forEach(file => {
            const parsedFile = matter.read(path.join(process.cwd(), file))
            const fileHash = getFileContentHash(parsedFile.content + JSON.stringify(parsedFile.data))
            if (hashnodeRc.blogs[file] && fileHash !== hashnodeRc.blogs[file].hash) {
                const { id, url, publishStatus } = {
                    id: 'created',
                    url: '/blog-1',
                    publishStatus: 'SCHEDULED'
                }
                console.log('Syncing post for ', file)
                hashnodeRc.blogs = {
                    ...hashnodeRc.blogs,
                    [file]: {
                        "status": parsedFile.status || "",
                        "url": file.split('.')[0],
                        "id": "created",
                        "hash": fileHash
                    }
                }
            } else if (!hashnodeRc.blogs[file]) {
                const { id, url, publishStatus } = {
                    id: 'created',
                    url: '/blog-1',
                    publishStatus: 'SCHEDULED'
                }
                console.log('Creating blog post for ', file)
                hashnodeRc.blogs = {
                    ...hashnodeRc.blogs,
                    [file]: {
                        "status": parsedFile.status || "",
                        "url": file.split('.')[0],
                        "id": "created",
                        "hash": fileHash
                    }
                }
            } else {
                console.log(file +' has already been created and no change was detected!')
            }
        })
        return;
    }
    finally {
        rl.close()
    }
}

function getMarkdownFiles(filePath) {
    const files = fs.readdirSync(filePath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    return markdownFiles;
}

function getFileContentHash(fileContent) {
    const fileHash = crypto.createHash('sha256').update(fileContent).digest('base64');
    return fileHash
}


main()
