'use strict';

let DB = require('./database');

let POLYLIMIT = 9999;


exports.handleEvent = (event) => {
   return new Promise((resolve, reject) => {
      checkEventDependencies(event)
      .then(() => {return DB.insertIntoAttendence(event["user_ID"], event["event_ID"])})
      .then(() => {resolve(true)})
      .catch((error) => {
         console.log("Error in handleEvent:", error.message);
         resolve(false);
      });
   });
};


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
