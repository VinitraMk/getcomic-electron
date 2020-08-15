var webdriver = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const { elementLocated } = require("selenium-webdriver/lib/until");

exports.onSubmit = (url,seriesName) => onSubmit(url,seriesName);

async function getSeriesSourceCode(url,seriesName) {
    console.log('fetching code',url);
    try {
        driver = await new webdriver.Builder()
        .usingServer("http://localhost:9515")
        .withCapabilities({
            binary:"/dist/ElectronReactBoilerPlate Setup 0.1.0.exe",
        })
        .forBrowser("chrome")
        //.setChromeOptions(new Options().addArguments("--headless"))
        .build();
        await driver.get(url);
        console.log('fetched source code');
        let pageSrc = "";
        
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id("container")),60000).then(src=>{
            console.log(src);
            try {
                console.log("please wait fetching page source");
                driver.getPageSource().then(res=>{
                    //console.log('found page',res);
                    pageSrc = res;
                    driver.quit();
                    getListOfIssues();
                })
                .catch(err=>{
                    console.log(err);
                    driver.quit();
                });
                driver.quit();
            }
            catch {
                console.log('error');
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