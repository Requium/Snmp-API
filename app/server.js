var express = require('express') 
var app = express()   
var bodyParser = require('body-parser')            
var crypto = require('crypto')
var snmp = require (('../snmp.js'))
var port = process.env.PORT || 8286 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const hash = crypto.createHash('sha512');


app.post('/getoid', function(req, res) {
  console.log(req.body)
  if(req.body !== undefined){
    if (crypto.timingSafeEqual(
      hash.copy().update(req.body.apiKey).digest(),
      hash.copy().update('VkVGZHYzOEJOd1A1bnZob2dvNFQ6RW55R05tbERTM0ttRzc0MUUwR19zZw==').digest()
    )) {
     snmp.getSnmp(req.body.ip, req.body.community, req.body.oid, function(error, varbinds){
        if(error){
          res.json(error)
        }else{
          res.json(varbinds)
        }
      })


    } else {
      res.status(401).send('unauthorized');
    }
  }
  else{
    res.status(401).send('unauthorized');
  }

})

app.post('/walk', function(req, res) {
  console.log(req.body)
  if(req.body !== undefined){
    if (crypto.timingSafeEqual(
      hash.copy().update(req.body.apiKey).digest(),
      hash.copy().update('VkVGZHYzOEJOd1A1bnZob2dvNFQ6RW55R05tbERTM0ttRzc0MUUwR19zZw==').digest()
    )) {
      snmp.walkSnmp(req.body.ip, req.body.community, req.body.oid, function(error, varbinds){
        if(error){
          res.json(error)
        }else{
          res.json(varbinds)
        }
      })


    } else {
      res.status(401).send('unauthorized');
    }
  }
  else{
    res.status(401).send('unauthorized');
  }

})

app.post('/subtreetoarrayofobject', function(req, res) {
  console.log(req.body)
  if(req.body !== undefined){
    if (crypto.timingSafeEqual(
      hash.copy().update(req.body.apiKey).digest(),
      hash.copy().update('VkVGZHYzOEJOd1A1bnZob2dvNFQ6RW55R05tbERTM0ttRzc0MUUwR19zZw==').digest()
    )) {
      snmp.subtreetoArrayofObjects(req.body.ip, req.body.community, req.body.oid, function(error, varbinds){
        if(error){
          res.json(error)
        }else{
          res.json(varbinds)
        }
      })


    } else {
      res.status(401).send('unauthorized');
    }
  }
  else{
    res.status(401).send('unauthorized');
  }

})


// iniciamos nuestro servidor
app.listen(port)
console.log('API escuchando en el puerto ' + port)