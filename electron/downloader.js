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

const { DOWNLOAD_TYPE, DOWNLOAD_ENDPOINT, DOWNLOAD_ARGS } = require('../src/shared/constants');


async function onDownloadSubmit(downloadType,targetDirectory,comicName,comicIssueLinks) {
    const TD_FULLPATH = makeTargetDirectory(targetDirectory,comicName);

    if(downloadType===DOWNLOAD_TYPE.ISSUE) {
        downloadIssue(`${DOWNLOAD_ENDPOINT}${comicIssueLinks[0].issueLink}${DOWNLOAD_ARGS}`,TD_FULLPATH).then(()=>{
            let imgList = extractIssuePages();
            console.log('received img links of issue');
            //let TMP_IMG_PATH = prepareForDownload(TD_FULLPATH);
            createPDF(imgList,comicIssueLinks[0].issueName,TD_FULLPATH);
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
    console.log('downloading issue',downloadLink,destination);

    let options = new Options();
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
    options.addArguments("--ignore-certificate-errors");
    options.addArguments("--user-agent=foo");

    try {
        console.log('inside download try-catch block');
        var service = await new chrome.ServiceBuilder(driverPath).build();
        chrome.setDefaultService(service);

        let driver = await new webdriver.Builder()
        .forBrowser("chrome")
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();

        //console.log('driver build complete',driver);

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
    }
}

function createPDF(imgLinks,issueName,destination) {
    console.log(`creating pdf of issue ${issueName}`);
    let pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(`${destination}/${issueName}.pdf`));
    downloadImages(imgLinks,pdfDoc,(count)=>{
        trackDownloadProgress(imgLinks.length,count);
        if(count===imgLinks.length) {
            pdfDoc.end();
            console.log("written to pdf",pdfDoc.info);
        }
    });
    //pdfDoc.end();
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

function downloadImages(imageLinks,pdfDoc,callback) {
    let c = 0;
    imageLinks.forEach(async(imgLink,i)=>{
        await downloadImage(imgLink,pdfDoc,()=>{
            console.log(i,'download done');
            c+=1;
            callback(c);
        });
    });
    //pdfDoc.end();
}

async function downloadImage(url,pdfDoc,callback) {
    await request({
        uri:url,
        encoding:null
    },(err,res,body)=>{
        if(!err && res.statusCode===200) {
            let img = Buffer.from(body,'base64');
            pdfDoc.addPage().image(img,{
                fit:[521,800],
                align:"left",
                valign:"top"
            });
            callback();
        }
    })
    /* Old method of writing image into file */
    //let file = fs.createWriteStream(path);
    //await new Promise((resolve,reject)=>{
        //request({
            //uri:url,
            //gzip:true
        //})
        //.on("response",(res)=>{
            //console.log('got image data',res.statusCode,res.headers['content-type']);
        //})
        //.pipe(file)
        //.on('finish',async()=>{
            //pdfDoc.image(path,0,0);
            //callback();
            ////utils.removeFile(path);
            //resolve();
        //})
        //.on("error",(err)=>{
            //console.log('Error while downloading',err);
            //reject(err);
        //})
    //})
    //.catch((err)=>{
        //console.log('something went wrong',err);
    //})
}

function trackDownloadProgress(len,count) {
    console.log(`images downloaded ${count}/${len}`);
}

function prepareForDownload(targetDirectory) {
    let tmpImgPath = path.join(targetDirectory,'images').toString();
    console.log(tmpImgPath);
    if(!fs.existsSync(tmpImgPath)) {
        fs.mkdirSync(tmpImgPath);
    }
    return tmpImgPath;
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