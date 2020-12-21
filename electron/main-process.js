import {onSubmit} from "./scraper";
import {onDownloadSubmit} from "./downloader";

exports.onSubmit = (url,seriesName) => { 
    return onSubmit(url,seriesName).then(res=>{
        console.log('receiving results',res);
        if(res!==undefined) {
            return res;
        }
    });
};
 
exports.onDownload = (downloadType,targetDirectory,comicName,comicIssueLinks) => {
    return onDownloadSubmit(downloadType,targetDirectory,comicName,comicIssueLinks).then(res=>{
        console.log(res);
    });
}