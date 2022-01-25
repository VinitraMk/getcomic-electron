const fs = require('fs');
const path = require("path");

function createFile(filePath) {
    if(!fs.existsSync(filePath)) {
        let file = fs.createWriteStream(filePath);
        file.end();
    }
}

function removeFile(filePath) {
    if(fs.existsSync(filePath)) {
        try {
            fs.unlink(filePath,(err)=>{
                if(err) throw err;
            });
            //console.log('removed file');
        }
        catch(err) {
            if(err) {
                console.log(err);
                return;
            }
        }
    }
}

function searchForFiles(files,destination) {
    files.map((file)=>{
        if(fs.existsSync(path.join(destination,`${file.issueTitle}.pdf`))) {
            file.isDownloaded = true;
        }
        return file;
    });
    return files;
}

module.exports = {
    createFile,
    removeFile,
    searchForFiles
}