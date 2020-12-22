const scraper = require("./scraper");
const downloader = require("./downloader");
const external = require("./external");
const utils = require("./utils");

exports.onSubmit = (url,seriesName) => { 
    return scraper.onSubmit(url,seriesName).then(res=>{
        console.log('receiving results...');
        if(res!==undefined) {
            return res;
        }
    });
};
 
exports.onDownload = (downloadType,targetDirectory,comicName,comicIssueLinks,callback) => {
    downloader.onDownloadSubmit(downloadType,targetDirectory,comicName,comicIssueLinks,(res)=>{
        //console.log('calling react callback',res);
        callback(res);
    })
}

exports.openInBrowser = (url) => {
    external.openInBrowser(url);
}

exports.searchFilesExist = (files,destination) => {
    return utils.searchForFiles(files,destination);
}