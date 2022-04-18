var snmp = require ("net-snmp");
var MIB = require('./lib/mib');
var mib = new MIB();
mib.LoadMIBs();
var options = {
  port:162
}


var getSnmp = function(ip, community, oid, callback) {
  var session = snmp.createSession (ip, community);
  session.get (oid, function (error, varbinds) {
    if (error) {
      callback(error);
  } else {
      for (var i = 0; i < varbinds.length; i++) {
          if (snmp.isVarbindError (varbinds[i])) {
              console.error (snmp.varbindError (varbinds[i]));
          } else {
             varbinds[i].value=varbinds[i].value.toString()

          }
      }
  }

  session.close ();
  callback (varbinds)
});
}
var walkSnmp = function(ip, community, oid, callback) {
  var maxRepetitions = 20;

  var session = snmp.createSession (ip, community);
  session.subtree (oid, maxRepetitions, feedCb, doneCb);
}

var delimiter2bracket = function (json, delimiter) {
  // console.log(json)
  // console.log('JSON',json)
  // console.log('JSON:',json)
	/*  ____________________________
	 *	Convert a delimeted Object to JSON 
	    ____________________________*/
  var ts = []
	var bracket = {}, t, parts, part;
	for (var k in json) {
		t = bracket;
		parts = k.split(delimiter);

		var key = parts.pop(); //last part
		while (parts.length) {
      // console.log(parts)
			part = parts.shift(); //first part
			t = t[part] = t[part] || {};
		}
		t[key] = json[k];//set value
    ts.push(t)
	}
  // console.log(bracket)
	return bracket;
}

function doneCb (error) {
  if (error)
      console.error (error.toString ());
}

function feedCb (varbinds,callback) {
  var result=[]
  for (var i = 0; i < varbinds.length; i++) {
      if (snmp.isVarbindError (varbinds[i]))
          console.error (snmp.varbindError (varbinds[i]));
      else
          varbinds[i].value=varbinds[i].value.toString()
          result.push(varbinds[i])
  }
  console.log(result)
  return (result);

}


const subtree = (ip, community, oid,callback) => {
  community = community || 'public'
  const promise = new Promise((resolve, reject) => {
    try {
    var NameSpaceTable = {};
    const session = snmp.createSession(ip, community, options);
    var oidsData 
    var NameSpace = {};
    session.subtree(
      oid,
      (varbinds) => {
     
        resultObject = {oid: oid,data:[]};

        mib.DecodeVarBinds(varbinds, function (Varbinds) {
          // console.log('Varbinds')
          // console.log(Varbinds)
          for (var i = 0; i < Varbinds.length; i++) {
            // console.log(Varbinds[i])
            if (snmp.isVarbindError(Varbinds[i])) {
              console.log(snmp.varbindError(Varbinds[i]));
              resolve ()
            } else {
              key=Varbinds[i].oid+','+Varbinds[i].ObjectName
              NameSpace[key] = Varbinds[i].Value.toString() 
              // oidsData.push({ oid: varbinds[i].oid, value: varbinds[i].value.toString() });
            }
            if (i==Varbinds.length-1) {
              // console.log(i)
              // console.log(NameSpace)
              NameSpaceTable = delimiter2bracket(NameSpace, ',');
              oidsData = NameSpaceTable;
              // console.log(JSON.stringify(NameSpaceTable, null, 4))
              // resolve(NameSpaceTable);
            }
          }
            
    
          //resolve(oidsData);
        });

      },
      (error) => {
        //reject(error);
        if ( error ) {
            // reject(error);

            resolve({"error":error})
        } else {

          for (object in oidsData) {
            if(oidsData.hasOwnProperty(object)) {
              resultObject.data.push(oidsData[object]) 
            }
     
          }
          resolve(resultObject);
        }
      }
    );
  }
  catch(error)
  {
    resolve(error)
  }
  }).then((result) => {
    
    // console.log(result)
    callback(result)
  });
}

const getOidsSubtree = (ip, community, oids,callback) => {
  var response ={}
  response.oids = [];
  for(const oid of oids )  {
    mib.GetObject(oid, function (Object) {
    // console.log(Object.OID)
    subtree(ip, community, oid, (result) => {
      response.oids.push(result);
      if (response.oids.length === oids.length) {
        // console.log('entrada')
        callback(response);
      }
    });
  });
  }
}




const subtreetoArrayofObjects = (ips, community, oids,callback) => {
  const promise = new Promise((resolve, reject) => {
    var results =[]
     
    for (const ip of ips) { 
      getOidsSubtree(ip, community, oids, (result) => {
        result.ip = ip
        results.push(result)
        if (results.length === ips.length) {
          // console.log(results)
          resolve(results)
        }
        // console.log(results)
      })

    // resolve(await response);
  }

  }
  ).then(result => {
    // console.log(result)
    callback(result)
  } );
}

module.exports = {getSnmp, walkSnmp,subtreetoArrayofObjects};