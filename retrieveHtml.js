// node.js retrieveHtml.js '<https://www.whatever.com>'
// node.js retrieveHtml.js '<https://www.whatever.com>' '<cookies>'

const puppeteer = require("puppeteer-core");

(async ()=>{
    if(process.argv[2]===undefined || !/^https?:\/\//.test(process.argv[2]) )process.exit(1)

    const browser = await puppeteer.launch({
       product: "chrome", executablePath: "/usr/bin/chromium",
       headless: true
    })
    const page = await browser.newPage(), domainname=(new URL(process.argv[2])).hostname

    if(process.argv[3]!==undefined && process.argv[3]!==""){
        var cookies=process.argv[3].split('; ').flatMap((item)=>{
            const equalsSign=item.indexOf('=')
            return equalsSign==-1 ? [] : {domain: domainname, name: item.slice(0,equalsSign), value: item.slice(equalsSign+1)}
        });
    }

    try{
        await page.goto(process.argv[2],{waitUntil: 'domcontentloaded'})
        console.log(await page.content())
    }catch(err){
        browser.close()     
        process.exit(1)
    } 
    console.log(await page.content())
    browser.close()
})()