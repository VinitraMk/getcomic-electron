var webdriver = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome");
var driverPath = require("chromedriver").path;
var fs = require("fs");
var parser = require("cheerio");
var utils = require("util");

const { Options } = require("selenium-webdriver/chrome");
const { elementLocated, titleMatches } = require("selenium-webdriver/lib/until");

exports.onSubmit = (url,seriesName) => { 
    return onSubmit(url,seriesName).then(res=>{
        console.log('receiving results',res);
        if(res!==undefined) {
            return res;
        }
    });
};

async function getSeriesSourceCode(url,seriesName) {
    console.log('fetching code',url);
    let options = new Options();
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
    options.addArguments("--ignore-certificate-errors");
    options.addArguments("--user-agent=foo");

    
    try {
        var service = await new chrome.ServiceBuilder(driverPath).build();
        chrome.setDefaultService(service);

        driver = await new webdriver.Builder()
        .forBrowser("chrome")
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();
        
        await driver.get(url);
        console.log('driver build complete');

        await driver.wait(webdriver.until.titleContains("comic online")).then(src=>{
            console.log('element found');
            return (async() =>{
                await driver.getPageSource().then(res=>{
                    return (async()=>{
                        console.log("writing into file, please wait...");
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
                    })();
                });
            })();
        })
        .catch(err=>{
            driver.getTitle().then(title=>{
                console.log(title);
            }).catch(err=>{
                console.log(err);
                driver.quit();
            });
            console.log(err);
            driver.quit();
        })
    }
    catch{
        console.log('error');
        driver.quit();
    }
}

function getListOfIssues(seriesName) {
    if(fs.existsSync("./source.txt")) {
        console.log("source file found");
        const $ = parser.load(fs.readFileSync("./source.txt"));
        let issueListTags = $('ul.list').children().toArray();
        let issueList = [];
        //let issueLinks = [];
        //let issueTitles = [];
        issueListTags.forEach(item=>{
            //issueLinks.push(item.children[0].attribs["href"]);
            let issueLink = item.children[0].attribs["href"];
            let startIndex = issueLink.lastIndexOf("/")+1;
            let endIndex = issueLink.indexOf("?");
            let issueTitle = issueLink.substring(startIndex,endIndex);
            issueList.push({
                issueTitle:issueTitle,
                issueLink:issueLink
            });
        });
        
        let result = {
            comicName:seriesName,
            issueList:issueList
        };

        return (async() => 
            {
                try {
                    fs.unlink("./source.txt",(err)=>{
                        if(err) throw err;
                        //console.log('removed file');
                        //return result;
                    });
                    console.log('removed file');
                    return result;
                }
                catch(err) {
                    if(err) {
                        console.log(err);
                        return;
                    }
                }
            }
        )();

    }
    else {
        console.log('file does not exist');
    }
    //return result;
}

async function onSubmit(url,seriesName) {
    console.log('yay communicating');
    return getSeriesSourceCode(url,seriesName).then(()=>{
        console.log('got series code res');
        return getListOfIssues(seriesName);
    })
    .catch((err)=>{
        console.log(err);
        return err;
    }); 
}