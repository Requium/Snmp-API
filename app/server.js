var express = require('express') 
var app = express()   
var bodyParser = require('body-parser')            
var crypto = require('crypto')
var snmp = require (('../snmp.js'))
var port = process.env.PORT || 8286 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const { ValidationError } = require("express-json-validator-middleware");
const { Validator } = require("express-json-validator-middleware");
const { validate } = new Validator();
var validatorSubtree = require('../schema/subtree.js');

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
      hash.copy().update(process.env('AGENT_TOKEN')).digest()
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

app.post('/subtreetoarrayofobject', validate({ body: validatorSubtree.subtreeSchema }), function(req, res) {
  // console.log(req.body)
 
  if(req.body !== undefined){
    if(process.env.AGENT_TOKEN == undefined){
      res.status(500).send('enviroment_variable Not configured');
    }
    else{
    // console.log(process.env.AGENT_TOKEN)
    if (crypto.timingSafeEqual(
      hash.copy().update(req.body.apiKey).digest(),
      hash.copy().update(process.env.AGENT_TOKEN).digest()
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
  }
  else{
    res.status(400).send('No Arguments added');
  }
  

})

function validationErrorMiddleware(error, request, response, next) {
	if (response.headersSent) {
		return next(error);
	}

	const isValidationError = error instanceof ValidationError;
	if (!isValidationError) {
		return next(error);
	}

	response.status(400).json({
		errors: error.validationErrors,
	});

	next();
}

app.use(validationErrorMiddleware);
// iniciamos nuestro servidor
app.listen(port)
console.log('API escuchando en el puerto ' + port)