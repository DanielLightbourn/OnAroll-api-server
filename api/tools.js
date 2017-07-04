'use strict';

let d = require('./database');

let POLYLIMIT = 9999;


// Returns an event with relavent information
// Update as more information is required
exports.getEventInfo = (eventKey) => {
   console.log("getEventInfo was passed:", eventKey);
   return new Promise((resolve, reject) => {
      const query1 = "SELECT e.event_ID,e.eventKey,e.allowDup,e.timeStart,"
                         + "e.timeEnd,et.name AS eventType,et.timeDependent,"
                         + "et.polyOnly "
                 + "FROM Events e, EventTypes et "
                 + "WHERE e.type_ID = et.type_ID AND e.eventKey = ?";

      d.query(query1, [eventKey])
      .then((rows) => {
         console.log("Rows inside getEventInfo", rows);
         if (rows.length < 1) {
            //res.json({status: 100, message: "No event(s) exists with that eventKey"});
            reject(new Error("No events exist with that eventKey"));
         }else {
            resolve(rows);
         }
      });
   });
};


exports.handleEvent = (event) => {
   return new Promise((resolve, reject) => {
      checkEventDependencies(event)
      .then((passedDependencyCheck) => {
         if (passedDependencyCheck){
            console.log("Event:", event["event_ID"], " Passed dependency check");
         }
      })
      .then(() => {return insertIntoAttendence(event["user_ID"], event["event_ID"])})
      .then(() => {resolve(true)})
      .catch((error) => {
         console.log("Error durring handleEvent function:", error.message, error);
         if (error.id === 1) {
            reject(new Error("User does not exist"));
         } else {
            resolve(false);
         }
      });
   });
};


let checkEventDependencies = (event) => {
   return new Promise((resolve, reject) => {
      console.log("Check dependencies for event:", event["event_ID"]);
      userExists(event["user_ID"])
      .then((pass) => {
         let checks = [];
         if (pass) {
            checks.push(true);
         } else {
            console.log("This should not run");
            reject(new Error("User does not exist"));
            return;
         }
         // Add dependency checks here
         if (event["timeDependent"]) {
            checks.push(withinTime(event["timeStart"], event["timeEnd"]))}
         if (event["polyOnly"]) {checks.push(isPolyStudent(event["user_ID"]))}
         console.log("Checks for event_ID:", event["event_ID"], " : ",checks);
         Promise.all(checks)
         .then((checkArray) => {
            console.log("Dependency check results for event_ID:", event["event_ID"],
                     checkArray);
            if(checkArray.every(check => check)){
               resolve(true);
            }else {
               reject(new Error("Event: ", event["event_ID"], " Failed dependency check"));
            }
         })
      });
   });
};


let insertIntoAttendence = (user_ID, event_ID) => {
   return new Promise((resolve, reject) => {
      const query2 = "INSERT INTO Attendance (user_ID,event_ID) "
                 + "VALUES (?, ?)";
      d.query(query2, [user_ID, event_ID])
      .then((events) => {
         resolve(true);
      })
      .catch((error) => {
         let err = new Error("Problem adding attendance entry! "
                           + "Most likly caused by invalid user_ID");
         err.id = 1;
         reject(err);
      });
   })
};


let withinTime = function(startTime, endTime) {
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

      console.log("StartDate:", startDate);
      console.log("endDate:", endDate);
      console.log("today:", today);
      console.log("startDate is less than now:", startDate < today);
      console.log("endDate is greater than now:", endDate > today);
      if (startDate < today && endDate > today) {
         resolve(true);
      }else{
         resolve(false);
      }
   });
};

let isPolyStudent = (id) => {
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

let userExists = (id) => {
   return new Promise((resolve, reject) => {
      if (parseInt(id) == "NaN") {
         resolve(false);
      }
      const query1 = "SELECT user_ID FROM Users WHERE user_ID = ?";
      d.query(query1, [id])
      .then((rows) => {
         if (rows.length > 0) {
            resolve(true);
         }else {
            resolve(false);
         }
      });
   });
};
