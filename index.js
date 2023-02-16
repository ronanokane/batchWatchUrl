const express = require('express')
const cors = require('cors')
const watch= require('./watchUrl')

const app = express()
app.use(cors())
app.use(express.json())

var clients=[]
var changes=[]

app.post('/addWatcher', async ({body: {url, xpath, cookies=""}}, res)=>{
    try{ let jobNo=await watch.addWatcher(url,xpath,cookies,(change)=>{
                changes.push(change)
                sendEventsToAll(change)
            })
        res.status(200).send({jobNo: jobNo})
    }catch(err){
        res.status(404).send({Error: err.message})
    }
})

app.delete('/removeWatcher/:jobNo', ({params: {jobNo}}, res)=>{
    try{
        watch.removeWatcher(jobNo)
    }
    catch(err){
        res.status(404).send({Error: err.message})
        return
    }
    res.status(200).send({Message: "Item removed..."})
})

app.get('/listWatchers',(req, res)=>{
    try{
        res.send(watch.listWatchers())
    }
    catch(err){
        res.status(404).send({Error: err.message})
    }
})

app.get('/loggedChanges/:jobNo', async ({params: {jobNo}}, res)=>{
    try{
        res.status(200).json(await watch.loggedChanges(jobNo))
    }
    catch(err){
        res.status(404).json({Error: err.message})
    }
})

app.get('/events', eventsHandler)

function eventsHandler(request, response, next) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    }
    response.writeHead(200, headers)
  
    const data = `data: ${JSON.stringify(changes)}\n\n`
  
    response.write(data)
  
    const clientId = Date.now()
  
    const newClient = {
      id: clientId,
      response
    }
  
    clients.push(newClient)
  
    request.on('close', () => {
      clients = clients.filter(client => client.id !== clientId)
    })
}

function sendEventsToAll(change) {
    clients.forEach(client => client.response.write(`data: ${JSON.stringify(change)}\n\n`))
}

const port=process.argv[2]||4000
app.listen(port, ()=>console.log('listening on port ' + port))