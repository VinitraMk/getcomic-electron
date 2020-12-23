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

const { DOWNLOAD_TYPE, DOWNLOAD_ENDPOINT, DOWNLOAD_ARGS, DOWNLOAD_STATUS } = require('../src/shared/constants');


async function onDownloadSubmit(downloadType,targetDirectory,comicName,comicIssueLinks,callback) {
    const TD_FULLPATH = makeTargetDirectory(targetDirectory,comicName);

    if(downloadType===DOWNLOAD_TYPE.ISSUE) {
        downloadIssue(`${DOWNLOAD_ENDPOINT}${comicIssueLinks[0].issueLink}${DOWNLOAD_ARGS}`,TD_FULLPATH).then(()=>{
            let imgList = extractIssuePages();
            console.log('received img links of issue');
            //let TMP_IMG_PATH = prepareForDownload(TD_FULLPATH);
            createPDF(imgList,comicIssueLinks[0].issueName,comicName,TD_FULLPATH,(resObj)=>{
                callback(resObj);
            });
        });
    }
    else {
        //for download type series
    }
}


function makeTargetDirectory(targetDirectory,comicName) {
    let fullPath = `${targetDirectory}${comicName}`;
    if(!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath)
    }
    return fullPath;
}

async function downloadIssue(downloadLink,destination) {
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

        let driver = await new webdriver.Builder()
        .forBrowser("chrome")
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();

        console.log('driver build complete');

        await driver.get(downloadLink);

        await driver.wait(webdriver.until.titleContains("comic online")).then(res=>{
            return (async() =>{
                await driver.getPageSource().then(res=>{
                    return new Promise((resolve,reject)=>{
                        fs.writeFile("source.txt",res,(err)=>{
                            if(err) throw err;
                            else {
                                resolve(res);
                                console.log('quitting driver...');
                                driver.quit();
                            }
                        });
                    })
                }).catch(err=>{
                    console.log('error while getting src code',err);
                    driver.quit();
                })
            })();
        }).catch(err=>{
            console.log('error while getting src code match',err);
            driver.quit();
        }) 
    }
    catch(err){
        console.log('Error',err);
        driver.quit();
    }
}

function createPDF(imgLinks,issueName,comicName,destination,progressCallback) {
    console.log(`creating pdf of issue ${issueName}`);
    let resObj = {
        success:false,
        status:DOWNLOAD_STATUS.INPROGRESS,
        percentage:0
    }
    let pdfDoc = new PDFDocument();
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



function extractIssuePages() {
    let imgList = [];
    if(fs.existsSync('source.txt')) {
        console.log('got src code');
        const $ = parser.load(fs.readFileSync("./source.txt"));
        imgList = Array.from($('div#divImage img').toArray().map(img=>img.attribs.src));
        removeSrcFile();
    }
    else {
        console.log('src file does not exist');
    }
    return imgList;
}

async function downloadImages(imageLinks,pdfDoc,callback) {
    let c = 0;
    while(c<imageLinks.length) {
        //downloadImage(imageLinks[c],pdfDoc,()=>{
            //console.log(c,'download done');
            //c+=1;
            //callback(c);
        //});A
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
                    fit:[521,780],
                    align:"left",
                    valign:"top"
                });
                resolve(res);
            }
        })
    })
    

    //await request({
        //uri:url,
        //encoding:null
    //},(err,res,body)=>{
        //if(!err && res.statusCode===200) {
            //let img = Buffer.from(body,'base64');
            //pdfDoc.addPage().image(img,{
                //fit:[521,780],
                //align:"left",
                //valign:"top"
            //});
            //return res;
        //}
        //else {
            //return err;
        //}
    //})
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
    onDownloadSubmit
}