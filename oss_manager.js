const path = require("path");
const OSS = require('ali-oss');

class OSSManager {

    constructor(options) {
        console.log("Connecting to aliyun oss..")
        this.syncPath = options.syncPath;
        this.client = new OSS({
            region: options.region,
            accessKeyId: options.access_key,
            accessKeySecret: options.access_secret,
            bucket: options.bucket
        })
    }

    async sync(diffs) {
        for (let diff of diffs){
            switch(diff.type){
                case "create":
                case "update":
                    await this.client.put(diff.path,path.join(this.syncPath,diff.path))
                    break
                case "delete":
                    await this.client.delete(diff.path)
            }
        }
    }
}

module.exports = OSSManager