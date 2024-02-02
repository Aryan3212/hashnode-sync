#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const matter = require('gray-matter');
const { hashnodeSyncFileExists, getHashnodeRc } = require('./config');
const { getMyUser, publishPost, setToken, updatePost, removePost } = require('./api');

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
        setToken(hashnodeRc.token)
        const user = await getMyUser()
        if (!hashnodeRc.initialized && !hashnodeRc.publication) {
            console.log('Please setup a default publication in settings and you can also specify the publication in your file\'s frontmatter');
            console.log('PS: The `publication` is the URL of your blog. 1 person can have numerous blogs.');
            console.log('~~~~~~~~')
            console.log('Here are your publications and their IDs:')
            user.me.publications.edges.forEach((edge, idx)=> {
                console.log(`${idx + 1}. id: ${edge.node.id}, url: ${edge.node.url}`)
            })
            console.log('Here are your publications and their IDs:')
            const input = await answer(`Input your default publication's id (default: ${user.me.publications.edges[0].node.url}): `);
            if (input) {
                hashnodeRc.default_publication = input;
            } else {
                hashnodeRc.default_publication = user.me.publications.edges[0].node.id
            }
            hashnodeRc.initialized = true;
        }

        const markdownFiles = getMarkdownFiles(process.cwd());
        const syncs = markdownFiles.map(async file => {
            const parsedFile = matter.read(path.join(process.cwd(), file))
            if (!Object.keys(parsedFile.data).length) {
                console.log(file, ' has been skipped since it doesn\'t have the required metadata')
            }
            const fileHash = getFileContentHash(parsedFile.content + JSON.stringify(parsedFile.data))
            if (hashnodeRc.blogs[file] && fileHash !== hashnodeRc.blogs[file].hash) {
                const post = {
                    id: hashnodeRc.blogs[file].id,
                    title: parsedFile.data.title,
                    subtitle: parsedFile.data.subtitle,
                    publicationId: parsedFile.data.publicationId || hashnodeRc.default_publication,
                    contentMarkdown: parsedFile.content,
                    tags: []
                }
                console.log('Syncing post for ', file)
                let res;
                if (parsedFile.data.status === 'DELETE') {
                    res = await removePost(hashnodeRc.blogs[file].id)
                    console.log(`Blog associated with ${file}, url: ${hashnodeRc.blogs[file].url} was deleted`)
                    return
                } else {
                    res = await updatePost(post)
                }
                hashnodeRc.blogs = {
                    ...hashnodeRc.blogs,
                    [file]: {
                        "status": parsedFile.status || "",
                        "url": hashnodeRc.blogs[file].url,
                        "id": hashnodeRc.blogs[file].id,
                        "hash": fileHash
                    }
                }
            } else if (!hashnodeRc.blogs[file]) {
                const post = {
                    title: parsedFile.data.title,
                    subtitle: parsedFile.data.subtitle,
                    publicationId: parsedFile.data.publicationId || hashnodeRc.default_publication,
                    contentMarkdown: parsedFile.content,
                    tags: []
                }
                let res;
                if (parsedFile.data.status === 'PUBLISH') {
                    res = await publishPost(post)
                } else {
                    return
                }
                console.log('Created blog post for ', file)
                hashnodeRc.blogs = {
                    ...hashnodeRc.blogs,
                    [file]: {
                        "status": parsedFile.status,
                        "url": res.publishPost.post.url,
                        "id": res.publishPost.post.id,
                        "hash": fileHash
                    }
                }
            } else {
                console.log(file +' has already been created and no change was detected!')
            }
        })
        const debug = await Promise.allSettled(syncs)
        debug.forEach(d => {
            if (d.status === 'rejected') {
                console.log(d.reason)
            }
        })
        return;
    } catch (err) {
        console.error(err)
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
