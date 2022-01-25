var queue = [];
var IS_DOWNLOAD_INPROGRESS = false;
var chrome = require("selenium-webdriver/chrome");
var driverPath = require("chromedriver").path;
var fs = require("fs");
var parser = require("cheerio");
//var util = require("util");
var webdriver = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const PDFDocument = require('pdfkit');
const request = require("request-promise");
const utils = require('./utils');
const path = require("path");
var downloadDriver = undefined;
var TD_FULLPATH = "";

const { DOWNLOAD_TYPE, DOWNLOAD_ENDPOINT, DOWNLOAD_ARGS, DOWNLOAD_STATUS, PAGE_SIZE } = require('../src/shared/constants');


function onDownloadQueued(downloadType,targetDirectory,comicName,comicIssueLinks,callback) {
    queue = [
        ...queue,
        ...(comicIssueLinks.map(x=>{
            return {
                ...x,
                status:DOWNLOAD_STATUS.QUEUED,
                targetDirectory:targetDirectory,
                comicName:comicName,
                downloadType:downloadType,
                onDownloadDone:callback
            }
        }))
    ]
    checkQueue();
}

function onDownloadCancelled(issueTitle, cancelCallback) {
    let comicIndex = queue.findIndex(x => x.issueTitle === issueTitle);
    let isDownloadCancelled = false;
    if (comicIndex !== -1 && queue[comicIndex].status === DOWNLOAD_STATUS.INPROGRESS) {
        console.log(`Download of ${issueTitle} cannot be cancelled...`);
    } else {
        queue = queue.filter(x => x.issueTitle === issueTitle);
        console.log(`Download of ${issueTitle} cancelled...`);
        isDownloadCancelled = true;
    }
    cancelCallback(isDownloadCancelled);
}

async function onDownloadSubmit(downloadObject) {
    TD_FULLPATH = makeTargetDirectory(downloadObject.targetDirectory,downloadObject.comicName);

    if(downloadObject.downloadType==DOWNLOAD_TYPE.ISSUE) {
        downloadIssue(`${DOWNLOAD_ENDPOINT}${downloadObject.issueLink}${DOWNLOAD_ARGS}`,downloadObject.issueName,TD_FULLPATH).then(()=>{
            let imgList = extractIssuePages(`source-${downloadObject.issueName}.txt`);
            console.log('received img links of issue');
            //let TMP_IMG_PATH = prepareForDownload(TD_FULLPATH);
            createPDF(imgList,downloadObject.issueName,downloadObject.comicName,TD_FULLPATH,(resObj)=>{
                if(resObj.success) {
                    IS_DOWNLOAD_INPROGRESS = false;
                    queue.shift();
                    checkQueue();
                }
                downloadObject.onDownloadDone(resObj);
            });
        });
    }
    else {
        //for download type series
    }
}

function checkQueue() {
    if(!IS_DOWNLOAD_INPROGRESS && queue.length>0) {
        queue[0].status = DOWNLOAD_STATUS.INPROGRESS;
        IS_DOWNLOAD_INPROGRESS = true;
        console.log('starting download of',queue[0].issueName);
        onDownloadSubmit(queue[0])
    }
    else if(IS_DOWNLOAD_INPROGRESS && queue.length>0) {
        console.log('download queued');
    }
}


function makeTargetDirectory(targetDirectory,comicName) {
    //let fullPath = `${targetDirectory}/${comicName}`;
    //let fullPath = path.join(targetDirectory, comicName)
    if(!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory)
    }
    return targetDirectory;
}

async function downloadIssue(downloadLink,issueName,destination) {
    console.log('downloading issue to',destination);

    let options = new Options();
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
    options.addArguments("--ignore-certificate-errors");
    options.addArguments("--user-agent=foo");

    try {
        //console.log('inside download try-catch block');
        var service = await new chrome.ServiceBuilder(driverPath).build();
        chrome.setDefaultService(service);

        downloadDriver = await new webdriver.Builder()
        .forBrowser("chrome")
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();
        console.log('driver build complete');

        await downloadDriver.get(downloadLink);

        await downloadDriver.wait(webdriver.until.titleContains("comic online")).then(res=>{
            return (async() =>{
                await downloadDriver.getPageSource().then(res=>{
                    return new Promise((resolve,reject)=>{
                        fs.writeFile(`source-${issueName}.txt`,res,(err)=>{
                            if(err) throw err;
                            else {
                                resolve(res);
                                console.log('quitting driver...');
                                downloadDriver.quit();
                            }
                        });
                    })
                }).catch(err=>{
                    console.log('error while getting src code',err);
                    downloadDriver.quit();
                })
            })();
        }).catch(err=>{
            console.log('error while getting src code match',err);
            downloadDriver.quit();
        }) 
    }
    catch(err){
        console.log('Error',err);
        downloadDriver.quit();
    }
}

function createPDF(imgLinks,issueName,comicName,destination,progressCallback) {
    console.log(`creating pdf of issue ${issueName}`);
    let resObj = {
        success:false,
        status:DOWNLOAD_STATUS.INPROGRESS,
        percentage:0
    }
    let pdfDoc = new PDFDocument({
        size:PAGE_SIZE,
        margins:{
            top:20,
            left:20,
            right:20,
            bottom:20
        }
    });
    pdfDoc.pipe(fs.createWriteStream(`${destination}/${issueName}.pdf`));
    pdfDoc.text(comicName,{align:"center"});
    pdfDoc.text(issueName,{align:"center",valign:"center"});
    downloadImages(imgLinks,pdfDoc,(count)=>{
        //trackDownloadProgress(imgLinks.length,count);
        if(count===imgLinks.length) {
            pdfDoc.end();
            console.log("written to pdf",pdfDoc.info);
            resObj.percentage = 100;
            resObj.status = DOWNLOAD_STATUS.DONE;
            resObj.success = true;
        }
        else {
            resObj.percentage = ((count/imgLinks.length)*100);
        }
        progressCallback(resObj);
    });
}



function extractIssuePages(srcFile) {
    let imgList = [];
    if(fs.existsSync(srcFile)) {
        console.log('got src code');
        const $ = parser.load(fs.readFileSync(srcFile));
        imgList = Array.from($('div#divImage img').toArray().map(img=>img.attribs.src));
        //removeSrcFile();
        utils.removeFile(srcFile);
    }
    else {
        console.log('src file does not exist');
    }
    return imgList;
}

async function downloadImages(imageLinks,pdfDoc,callback) {
    let c = 0;
    while(c<imageLinks.length) {
        try {
            let res = await downloadImage(imageLinks[c],pdfDoc);
            //console.log(c,'download done');
            c+=1;
            callback(c);
        }
        catch(err) {
            console.log("Error while getting downloadedl link",err);
            return;
        }
    }
    
}

async function downloadImage(url,pdfDoc) {
    
    return new Promise((resolve,reject)=>{
        request({uri:url,encoding:null},
        (err,res,body)=>{
            if(err) reject(err);
            else {
                let img = Buffer.from(body,'base64');
                pdfDoc.addPage().image(img,{
                    fit:PAGE_SIZE,
                    align:"left",
                    valign:"top"
                });
                resolve(res);
            }
        })
    })
}

function trackDownloadProgress(len,count) {
    console.log(`images downloaded ${count}/${len}`);
}

async function removeSrcFile() {
    try {
        fs.unlink("./source.txt",(err)=>{
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
module.exports = {
    onDownloadQueued,
    onDownloadCancelled
}