var snmp = require ("net-snmp");
// var store = snmp.createModuleStore ();
var options = {
  port:162
}
// var mibDir= 'D:\\Program Files\\DudeBeta3\\data\\files\\mibs\\'
// store.loadFromFile (mibDir + "V1600D_20210909-MIB.txt");

providers = store.getProvidersForModule ("V1600D-MIB");

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
  const promise = new Promise((resolve, reject) => {
    const session = snmp.createSession(ip, community, options);
    const oidsData = [];
    session.subtree(
      oid,
      (varbinds) => {
        resultObject = {oid: oid};
        for (var i = 0; i < varbinds.length; i++) {
          if (snmp.isVarbindError(varbinds[i])) {
            console.log(snmp.varbindError(varbinds[i]));
          } else {
            oidsData.push({ oid: varbinds[i].oid, value: varbinds[i].value.toString() });
          }
        }
        resultObject.data = oidsData;
        //resolve(oidsData);
      },
      (error) => {
        //reject(error);
        if ( error ) {
            reject(error);
        } else {
          // console.log(oidsData)
            resolve({oid:oid,value:oidsData});
        }
      }
    );
  }).then((result) => {
    
    // console.log(result)
    callback(result)
  });
}
const getOids = (ip, community, oids,callback) => {
  var response ={}
  response.oids = [];
  for(const oid of oids )  {
    subtree(ip, community, oid, (result) => {
      response.oids.push(result);
      if (response.oids.length === oids.length) {
        console.log('entrada')
        callback(response);
      }
    });
  }
}

const subtreetoArrayofObjects = (ips, community, oids,callback) => {
  const promise = new Promise((resolve, reject) => {
    var results =[]
     
    for (const ip of ips) { 
      getOids(ip, community, oids, (result) => {
        result.ip = ip
        results.push(result)
        if (results.length === ips.length) {
          console.log(results)
          resolve(results)
        }
        // console.log(results)
      })

    // resolve(await response);
  }

  }
  ).then(result => {
    console.log(result)
    callback(result)
  } );
}

module.exports = {getSnmp, walkSnmp,subtreetoArrayofObjects};