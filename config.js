let fs = require("fs")

let requiredNodes = 
    [
        "oss.access_key",
        "oss.access_secret",
        "oss.region",
        "oss.bucket",
        "sync_path"
    ]

function loadConfig(configPath) {
    console.log("Load config file...")

    // Read data from file
    var data;
    try {
        data = fs.readFileSync(configPath)
    }catch(error){
        console.log("Can't open file '"+configPath+"'");
        return;
    }
    
    // Parse data to json
    var json;
    try {
        json = JSON.parse(data);
    }catch(error){
        console.log("Json have format error");
    }

    // Validate config
    for (let node of requiredNodes){
        let params = node.split(".")
        let currentNode = json;
        for (let param of params){
            if (!currentNode[param]){
                console.log("field '" + node + "' is required");
                return;
            }
            currentNode = currentNode[param];
        }
    }

    return json;
}

module.exports = {
    loadConfig
}