var webdriver = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome");
var driverPath = require("chromedriver").path;
var fs = require("fs");

const { Options } = require("selenium-webdriver/chrome");
const { elementLocated } = require("selenium-webdriver/lib/until");

exports.onSubmit = (url,seriesName) => onSubmit(url,seriesName);

async function getSeriesSourceCode(url,seriesName) {
    console.log('fetching code',url);
    let options = new Options();
    //options.addArguments("--headless");
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
        //let el = driver.findElement(webdriver.By.id("container"));

        /* works for normal chrome */
        
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id("container")),60000).then(src=>{
            console.log('element found');
            try {
                console.log("please wait fetching page source");
                driver.getPageSource().then(res=>{
                    console.log('fetching source complete');
                    pageSrc = res;
                    fs.writeFile("sourcetext.txt",res,(err)=>{
                        if(err) throw err;
                    })
                    driver.quit();
                    getListOfIssues(pageSrc);
                })
                .catch(err=>{
                    console.log(err);
                    driver.quit();
                });
                //driver.quit();
            }
            catch(err) {
                console.log('error:\n',err);
                driver.quit();
            }
        })
        .catch(error=>{
            console.log(error);
            driver.quit();
        });
    }
    catch{
        console.log('error');
        driver.quit();
    }
}

function getListOfIssues(srcCode) {
    
}

function onSubmit(url,seriesName) {
    console.log('yay communicating');
    getSeriesSourceCode(url,seriesName); 
}