const scraper = require("./scraper");
const downloader = require("./downloader");

exports.onSubmit = (url,seriesName) => { 
    return scraper.onSubmit(url,seriesName).then(res=>{
        console.log('receiving results...');
        if(res!==undefined) {
            return res;
        }
    });
};
 
exports.onDownload = (downloadType,targetDirectory,comicName,comicIssueLinks) => {
    return downloader.onDownloadSubmit(downloadType,targetDirectory,comicName,comicIssueLinks).then(res=>{
        console.log(res);
    });
}
