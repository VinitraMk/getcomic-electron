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
        return res;
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
        let pageSrc = "";
        let issueResults = {};
        //let titlePattern = /[A-Z]+[a-z]*[-)|]*[0-9]*Read [A-Z]*[a-z]* comic online in high quality/
        //let el = driver.findElement(webdriver.By.id("container"));

        await driver.wait(webdriver.until.titleContains("comic online")).then(src=>{
            console.log('element found');
            try {
                driver.getPageSource().then(res=>{
                    fs.writeFileSync("source.txt",res,(err)=>{
                        if(err) throw err;
                    });
                    console.log("quiting driver...");
                    driver.quit();
                });
            }
            catch(err) {
                console.log(err);
                driver.quit();
            }
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
    if(fs.existsSync("source.txt")) {
        console.log("source file found");
        const $ = parser.load(fs.readFileSync("source.txt"));
        let issueListTags = $('ul.list').children().toArray();
        let issueLinks = [];
        let issueTitles = [];
        issueListTags.forEach(item=>{
            issueLinks.push(item.children[0].attribs["href"]);
        });
        issueLinks.forEach(item=>{
            let startIndex = item.lastIndexOf("/")+1;
            let endIndex = item.indexOf("?");
            let issueTitle = item.substring(startIndex,endIndex);
            issueTitles.push(issueTitle);
        })
        let result = {
            comicName:seriesName,
            issueTitle:issueTitles,
            issueLinks:issueLinks
        }
        fs.unlinkSync("source.txt");
        return result;
    }
    else {
        console.log("file not found :-(");
        return null;
    }
}

async function onSubmit(url,seriesName) {
    console.log('yay communicating');
    return getSeriesSourceCode(url,seriesName).then(()=>{
        return getListOfIssues(seriesName);
    })
    .catch((err)=>{
        console.log(err);
        return err;
    }); 
}