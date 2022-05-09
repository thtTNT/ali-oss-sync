let fs = require('fs')
let path = require('path')

class FileChecker {

    constructor(syncPath) {
        this.syncPath = syncPath

        let syncFile = syncPath + "/" + ".sync"
        if (fs.existsSync(syncFile)) {
            let data = fs.readFileSync(syncFile);
            let json = JSON.parse(data)
            this.version = json.version;
            this.fileMap = json.fileMap;
        }else{
            this.version = 1
            this.fileMap = {};
        }
    }

    getDiff(params) {
        // Get updated or added File
        let quene = ["./"];
        let fileList = [];
        while (quene.length !== 0){
            let dir = quene.pop();
            let entries = fs.readdirSync(path.join(this.syncPath,dir));
            for (let entry of entries){
                if (entry === ".sync"){
                    continue;
                }
                let stat = fs.statSync(path.join(this.syncPath,dir,entry));
                if (stat.isFile()){
                    fileList.push(path.join(dir,entry))
                }
                if (stat.isDirectory()){
                    quene.push(path.join(dir,entry));
                }
            }
        }
       
        let changes = []
        for (let file of fileList){
            if (!this.fileMap[file]){
                changes.push({
                    type: "create",
                    path: file
                })
            }else{
                let stat = fs.statSync(path.join(this.syncPath,file))
                if (stat.mtime !== this.fileMap[file].mtime){
                    changes.push({
                        type: "update",
                        path: file
                    })
                }
            }
        }

        for (let file in this.fileMap){
            if (fileList.find(file) === -1){
                changes.push({
                    type: "delete",
                    path: file
                })
            }
        }

        return changes
    }
}

module.exports = FileChecker