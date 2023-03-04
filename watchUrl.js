const {exec} = require('child_process')
const { MongoClient } = require('mongodb')

let watchItems=[]
let watching=false
const checksDelay=10000     // 10 second delay by default

async function addWatcher(url, xpath, cookies="", callbackChange){
    if(!url || !xpath)
        throw new Error('Must define url, xpath and cookies')

    if(!callbackChange)
        throw new Error("Missing callback")

    if(watchItems.find((item)=>item.xpath===xpath && item.url===url)!==undefined)
        throw new Error("Job item already exists")        

    const client = new MongoClient("mongodb://localhost:27017")
    let id

    try {
        await client.connect("mongodb://localhost:27017")
        const myDB = client.db("urlsWatchDB")
        const myColl = myDB.collection("watches")
        const doc = { url, xpath }
        id = (await myColl.findOne(doc))?._id.toString()

        if(!id){
            await myColl.insertOne(doc)
            id = (await myColl.findOne(doc))._id.toString()
        }
    } catch (e) {
        throw e
    } finally {
        await client.close()
    }

    !watching && (watching=true) && setInterval(()=>{
        for(item of watchItems){
            exec(`./checkUrl.sh -u "${item.url}" -x "${item.xpath}" -c "${item.cookies}" -f "${item.id}"`, (err, stdo, stderr)=>{   
                stdo.length>0&&callbackChange({url: item.url, change:  stdo, date: new Date().toLocaleString()})
            })
        }
    },checksDelay)

    return watchItems.push({url, xpath, cookies, callbackChange, id})
}

function removeWatcher(id){
    if(watchItems[id]===undefined) 
        throw new Error(`Item jobNo ${id} doesn' t exist..`)

    watchItems.splice(id,1);
}

function listWatchers(){
    return watchItems.map((item,index)=>{
        return {jobNo: index, 
            url: item.url, 
            xpath: item.xpath
        }})
}

async function loggedChanges(id){
    
    if(watchItems[id]===undefined) 
        throw new Error(`Item jobNo ${id} doesn' t exist..`)

    const exec= require('util').promisify(require('child_process').exec)
    const {stdout: out}=await exec(`cd "${__dirname}/watches" && git log --pretty=format:'%H,%ad' --date=local ${watchItems[id].id}`)

    const changes=[]
    for(line of out.split('\n')){
        const [hash,date] =line.split(',')
        const {stdout: change}=await exec(`cd "${__dirname}/watches" && git show "${hash}" --pretty=format:'%b'`)
        changes.push({date, change})
    }
    return changes
}

module.exports.addWatcher=addWatcher
module.exports.removeWatcher=removeWatcher
module.exports.listWatchers=listWatchers
module.exports.loggedChanges=loggedChanges