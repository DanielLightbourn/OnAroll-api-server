'use strict';

let d = require('./database');

let POLYLIMIT = 9999;


// Returns an event with relavent information
// Update as more information is required
exports.getEventInfo = (eventKey) => {
   console.log("getEventInfo was passed:", eventKey);
   return new Promise((resolve, reject) => {
      let query1 = "SELECT e.event_ID,e.eventKey,e.allowDup,e.timeStart,"
                         + "e.timeEnd,et.name AS eventType,et.timeDependent,"
                         + "et.polyOnly "
                 + "FROM Events e, EventTypes et "
                 + "WHERE e.type_ID = et.type_ID AND e.eventKey = ?";

      d.query(query1, [eventKey], (error, rows) => {
         console.log("Rows inside getEventInfo", rows);
         if (rows.length < 1) {
            //res.json({status: 100, message: "No event(s) exists with that eventKey"});
            reject(new Error("New events exist with that key"));
         }else {
            resolve(rows);
         }
      });
   });
};


exports.handleEventRow = (row) => {
   return new Promise((resolve, reject) => {
      checkEventDependencies(row)
      .then(() => {return insertIntoAttendence(row["user_ID"], row["event_ID"])})
      .then(() => {resolve(true)})
      .catch((error) => {
         console.log("Error durring handleEventRow:", error.message, error);
         if (error.id === 1) {
            reject(new Error("User does not exist"));
         } else {
            resolve(false);
         }
      });
   });
};


let checkEventDependencies = (row) => {
   return new Promise((resolve, reject) => {
      console.log("Check Dependency Row", row);
      let checks = [true];
      // Add dependency checks here
      if (row["timeDependent"]) {
         checks.push(withinTime(row["timeStart"], row["timeEnd"]))}
      if (row["polyOnly"]) {checks.push(isPolyStudent(row["user_ID"]))}

      Promise.all(checks)
      .then((checkArray) => {
         console.log("ChecksAttay for row:", row['event_ID'], " : ", checkArray);
         if(checkArray.every(check => check)){
            resolve(true);
         }else {
            reject(new Error("Failed check"));
         }
      })
   });
};


let insertIntoAttendence = (user_ID, event_ID) => {
   return new Promise((resolve, reject) => {
      var query2 = "INSERT INTO Attendance (user_ID,event_ID) "
                 + "VALUES (?, ?)";
      d.query(query2, [user_ID, event_ID], (error, rows) => {
         if (error) {
            let err = new Error("ErrProblemor adding attendance entry! "
                                  + "Most likly caused by invalid user_ID");
            err.id = 1;
            reject(err);

         }
         resolve(true);
      })
   })
};


let withinTime = function(startTime, endTime) {
   var sTime = startTime;
   var eTime = endTime;
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
      userExists(id)
      .then((pass) => {
         if (!pass || id < 0 || id > POLYLIMIT) {
            resolve(false);
         } else{
            resolve(true);
         }
      });
   });
};

let userExists = (id) => {
   return new Promise((resolve, reject) => {
      if (parseInt(id) == "NaN") {
         resolve(false);
      }
      let query1 = "SELECT user_ID FROM Users WHERE user_ID = ?";
      d.query(query1, [id], (error, rows) => {
         if (rows.length > 0) {
            resolve(true);
         }else {
            resolve(false);
         }
      })
   });
};


// Update as more information is required
exports.getEventInfo = (eventKey) => {
   return new Promise((resolve, reject) => {
      let query1 = "SELECT e.event_ID,e.eventKey,e.allowDup,e.timeStart,"
                         + "e.timeEnd,et.name AS eventType,et.timeDependent,"
                         + "et.polyOnly "
                 + "FROM Events e, EventTypes et "
                 + "WHERE e.type_ID = et.type_ID AND e.eventKey = ?";

      d.query(query1, [eventKey], (error, rows) => {
         resolve(rows);
      });
   })
}
