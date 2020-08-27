export function isUrlValid(url) {
    var results = {
        comicName:"",
        isValid:true,
        isSeries:false
    }
    var pattern = /\bhttps\:\/\/readcomiconline.to/;
    if(pattern.test(url)) {
        let seriesName = getSeriesName(url);
        if(seriesName==="") {
            results.isValid = false;
        }
        else {
            results.comicName = seriesName;
            if(isSeriesUrl(url)) {
                results.isSeries = true;
            }
        }
    }
    else {
        results.isValid = false;
    }
    //console.log(results.isValid);
    return results;
}



function getSeriesName(url) {
    let comicNamePattern = /Comic/;
    let startIndex = url.match(comicNamePattern).index + 6;
    let endIndex = url.lastIndexOf("/");
    let seriesName = "";
    if(startIndex!==undefined) {
        if(startIndex===endIndex+1) {
            seriesName = url.substring(startIndex);
        }
        else {
            seriesName = url.substring(startIndex,endIndex);
        }
    }
    return seriesName;
}

function isSeriesUrl(url) {
    let seriesPattern = /Comic/;
    let res = seriesPattern.test(url) && isIssueUrl(url);

    return !(res);
}

function isIssueUrl(url) {
    let seriesPattern = /Comic/;
    let startIndex = url.match(seriesPattern).index + 5;
    let endIndex = url.lastIndexOf("/");

    return !(startIndex === endIndex);
}