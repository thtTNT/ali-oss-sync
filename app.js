let commander = require('commander')
let OSS = require('ali-oss')
let Config = require('./config')
let FileChecker = require('./file_checker')
let OSSManager = require('./oss_manager')
const fs = require('fs')

commander
    .name("ali-oss-sync")
    .description("Tool to sync ali-oss and local dictory")
    .option("-c, --config <config_path>", "load the config from file", "config.json")
    .parse(process.argv)

let options = commander.opts()
let config = Config.loadConfig(options.config);

let ossManager = new OSSManager({
    syncPath: config.sync_path,
    access_key: config.oss.access_key,
    access_secret: config.oss.access_secret,
    bucket: config.oss.bucket,
    region: config.oss.region
})

console.log("Syncing file...")
let fileChecker = new FileChecker(config.sync_path)
let changes = fileChecker.getDiff();
ossManager.sync(changes)

console.log("Watching file...")
fs.watch(config.sync_path, { recursive: true }, (eventType, filename) => {
    switch (eventType) {
        case 'change':
            ossManager.sync([{
                type: 'update',
                path: filename
            }])
            console.log("UPDATE - " + filename)
            break;
        case 'rename':
            if (fs.existsSync(filename)) {
                ossManager.sync([{
                    type: 'create',
                    path: filename
                }])
                console.log("CREATE - " + filename)
            } else {
                ossManager.sync([{
                    type: 'delete',
                    path: filename
                }])
                console.log("DELETE - " + filename)
            }
            break;
    }
})