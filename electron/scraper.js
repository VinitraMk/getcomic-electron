var webdriver = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome");
var driverPath = require("chromedriver").path;
var fs = require("fs");

const { Options } = require("selenium-webdriver/chrome");
const { elementLocated, titleMatches } = require("selenium-webdriver/lib/until");

exports.onSubmit = (url,seriesName) => onSubmit(url,seriesName);

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
        //let titlePattern = /[A-Z]+[a-z]*[-)|]*[0-9]*Read [A-Z]*[a-z]* comic online in high quality/
        //let el = driver.findElement(webdriver.By.id("container"));

        await driver.wait(webdriver.until.titleContains("comic online")).then(src=>{
            console.log('element found');
            try {
                driver.getPageSource().then(res=>{
                    fs.writeFile("source.txt",res,(err)=>{
                        if(err) throw err;
                    });
                    driver.quit();
                    //getListOfIssues();
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


        /* works for normal chrome */
        
        //await driver.wait(webdriver.until.elementLocated(webdriver.By.id("container")),60000).then(src=>{
            //console.log('element found');
            //try {
                //console.log("please wait fetching page source");
                //driver.getPageSource().then(res=>{
                    //console.log('fetching source complete');
                    //pageSrc = res;
                    //fs.writeFile("sourcetext.txt",res,(err)=>{
                        //if(err) throw err;
                    //})
                    //driver.quit();
                    //getListOfIssues(pageSrc);
                //})
                //.catch(err=>{
                    //console.log(err);
                    //driver.quit();
                //});
                ////driver.quit();
            //}
            //catch(err) {
                //console.log('error:\n',err);
                //driver.quit();
            //}
        //})
        //.catch(error=>{
            //console.log(error);
            //driver.quit();
        //});
    }
    catch{
        console.log('error');
        driver.quit();
    }
}

function getListOfIssues() {
    fs.unlinkSync("source.txt");
}

function onSubmit(url,seriesName) {
    console.log('yay communicating');
    getSeriesSourceCode(url,seriesName).then(()=>{
        getListOfIssues();
    })
    .catch((err)=>{
        console.log(err);
    }); 
}