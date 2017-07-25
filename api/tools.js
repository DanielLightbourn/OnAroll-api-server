'use strict';

let DB = require('./database');
let RS = require('jsrsasign');

let POLYLIMIT = 9999;
const ALGORITHM = {'alg':'SHA256withECDSA'};
const CURVE = "secp256r1";

exports.sanitize = (data) => {
  console.error("WARING SANITIZE IS NOT IMPLEMENTED!");
  return data;
}

exports.handleEvent = (event) => {
   return new Promise((resolve, reject) => {
      checkEventDependencies(event)
      .then(() => {return DB.insertIntoAttendence(event["user_ID"], event["event_ID"])})
      .then(() => {resolve(true)})
      .catch((e) => {reject(e);});
   });
};

exports.checkSignature = (signedData, signature) => {
  return new Promise((resolve, reject) => {
    DB.getPublicKey(exports.sanitize(signedData.eventKey))
    .then((publicKey) => {
      if(publicKey.length > 0) {
        var signedString = JSON.stringify(signedData);
        var signatureVerify = new RS.KJUR.crypto.Signature(ALGORITHM);
        signatureVerify.init(new RS.KJUR.crypto.ECDSA({'curve': CURVE, 'pub': RS.b64utohex(publicKey[0]["pubKey"])}));
        signatureVerify.updateString(signedString);
        if(!signatureVerify.verify(RS.b64utohex(signature))) {
          return reject("Bad Signature")
        } else {
          //replace old key with the new one if it exists
          if(signedData.newKey != undefined) {
            DB.updateKey(exports.sanitize(signedData.eventKey), exports.sanitize(signedData.newKey))
            .catch((e) => {reject(e)});
          }
          resolve(true);
        }
      } else {
        return reject("Bad Signature")
      }
    })
  })
}

let checkEventDependencies = (event) => {
   return new Promise((resolve, reject) => {
      console.log("Check dependencies for event:", event.event_ID);
      DB.userExists(event.user_ID)
      .then(() => {
         let checks = [true];
         // Add dependency checks here
         if (event["timeDependent"]) {
            checks.push(withinTime(event["timeStart"], event["timeEnd"]))}
         if (event["polyOnly"]) {
            checks.push(isPolyStudent(event.user_ID))}

         checks.push(DB.checkDupAttendence(event["user_ID"], event["event_ID"]).catch(e => {reject(e);}));
         console.log("Checks for event_ID:", event.event_ID, " : ", checks);
         Promise.all(checks)
         .then((checkArray) => {
            console.log("Dependency check results for event_ID:", event.event_ID)
            console.log(checkArray);
            if(checkArray.every(check => check)){
               console.log("Event: ", event.event_ID, "passed dependency checks");
               resolve();
            }else {
               console.log("Event: ", event.event_ID, "failed dependency checks");
               reject(new Error("Event: ", event.event_ID, " Failed dependency check(s)"));
            }
         })
      })
      .catch(error => {
         reject(error);
      });
   });
};


let withinTime = function(startTime, endTime) {
   console.log("Making sure current time is between", startTime, "and", endTime);
   var sTime = startTime, eTime = endTime;
   return new Promise((resolve, reject) => {
      let today = new Date();
      let startTime = sTime.split(":");
      let endTime = eTime.split(":");

      let startDate = new Date(today.getTime());
      startDate.setHours(startTime[0]);
      startDate.setMinutes(startTime[1]);
      startDate.setSeconds(startTime[2]);

      let endDate = new Date(today.getTime());
      endDate.setHours(endTime[0]);
      endDate.setMinutes(endTime[1]);
      endDate.setSeconds(endTime[2]);

      if (startDate < today && endDate > today) {
         console.log("Now is between startTime and endTime");
         resolve(true);
      }else{
         console.log("Now is not between startTime and endTime");
         resolve(false);
      }
   });
};

let isPolyStudent = (id) => {
   console.log("Checking if id: ", id, " is a poly student");
   return new Promise((resolve, reject) => {
      if ( id < 0 || id > POLYLIMIT) {
         console.log("User",id,"is not a polystudent");
         resolve(false);
      } else{
         console.log("User",id,"is a polystudent");
         resolve(true);
      }
   });
};
