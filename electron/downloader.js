var chrome = require("selenium-webdriver/chrome");
var driverPath = require("chromedriver").path;
var fs = require("fs");
var parser = require("cheerio");
var utils = require("util");
var webdriver = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const { DOWNLOAD_TYPE, DOWNLOAD_ENDPOINT, DOWNLOAD_ARGS } = require('../src/shared/constants');


async function onDownloadSubmit(downloadType,targetDirectory,comicName,comicIssueLinks) {
    const TD_FULLPATH = makeTargetDirectory(targetDirectory,comicName);

    if(downloadType===DOWNLOAD_TYPE.ISSUE) {
        downloadIssue(`${DOWNLOAD_ENDPOINT}${comicIssueLinks[0]}${DOWNLOAD_ARGS}`,TD_FULLPATH).then(()=>{
            extractIssuePages();
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

function extractIssuePages() {
    if(fs.existsSync('source.txt')) {
        console.log('got src code');
        const $ = parser.load(fs.readFileSync("./source.txt"));
        let issuePages = $('lstImages');
        console.log(issuePages).children().toArray();
    }
    else {
        console.log('src file does not exist');
    }
}

module.exports = {
    onDownloadSubmit
}