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
      .then(() => {return insertIntoAttendence(row["eventKey"], row["user_ID"])})
      .then(() => {resolve(true)})
      .catch((error) => {
         console.log("Error durring handleEventRow:", error.message);
         resolve(false);
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
         if(checks.every(check => check)){
            resolve(true);
         }else {
            reject(new Error("Failed check"));
         }
      })
   });
};


let insertIntoAttendence = (eventKey, user_ID) => {
   return new Promise((resolve, reject) => {
      var query2 = "INSERT INTO Attendance (user_ID,event_ID) "
                 + "VALUES (?, ?)";
      d.query(query2, [user_ID, event_ID], (error, rows) => {
         if (error) {reject(new Error("Problem"))}
         resolve(true);
      })
   })
};


let withinTime = function(startTime, endTime) {
   return new Promise((resolve, reject) => {
      let today = new Date();
      let startTime = startTime.split(":");
      let endTime = endTime.split(":");
      let ans = 0;
      if (today.getHours() >= startTime[0] &&
          today.getHours() <= endTime[0] &&
          today.getMinutes() >= startTime[1] &&
          today.getMinutes() <= endTime[1]) {
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
