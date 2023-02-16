// alternative to curl so that we can get html AFTER dom loaded
// node retrieveHtml.js <https://www.whatever.com>
// node retrieveHtml.js <https://www.whatever.com> '<cookies>'

const puppeteer = require("puppeteer-core");

(async ()=>{
    if(process.argv[2]===undefined || !/^https?:\/\//.test(process.argv[2]) )process.exit(1)

    const browser = await puppeteer.launch({
       product: "chrome", executablePath: "/usr/bin/chromium",
       headless: true
    })
    const page = await browser.newPage(), domainname="." + (new URL(process.argv[2])).hostname

    if(process.argv[3]!==undefined && process.argv[3]!==""){
        var cookies=process.argv[3].split(' ').map((item)=>{
                var items=item.split('=') 
                return {domain: domainname, name: items[0], value: items[1]}
            })
        await page.setCookie(...cookies)
    }
    try{
        await page.goto(process.argv[2],{waitUntil: 'domcontentloaded'})
    }catch(err){
        process.exit(1)
    }
    console.log(await page.content())
    browser.close()
})()