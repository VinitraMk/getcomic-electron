const fs = require('fs');

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

module.exports = {
    createFile,
    removeFile
}