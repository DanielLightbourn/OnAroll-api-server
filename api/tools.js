'use strict';

let d = require('./database');

let POLYLIMIT = 9999;


// Returns an event with relavent information
// Update as more information is required
exports.getEventInfo = (eventKey) => {
   return new Promise((resolve, reject) => {
      let query1 = "SELECT e.event_ID,e.eventKey,e.allowDup,e.timeStart,"
                         + "e.timeEnd,et.name AS eventType,et.timeDependent,"
                         + "et.polyOnly "
                 + "FROM Events e, EventTypes et "
                 + "WHERE e.type_ID = et.type_ID AND e.eventKey = ?";

      return d.query(query1, [eventKey])
      .next((rows) => {
         if (rows.length < 1) {
            //res.json({status: 100, message: "No event(s) exists with that eventKey"});
            reject(new Error("New events exist with that key"));
         }else {
            resolve(rows);
         }
      });
   });
};


exports.handleRow = (row) => {
   return new Promise((resolve, reject) => {
      checkDependencies(row)
      .next(insertIntoAttendence(row["eventKey"], row["user_ID"]))
      .next(() => {resolve(true)})
      .catch(() => {resolve(false)});
   });
};


let checkDependencies = (row) => {
   return new Promise((resolve, reject) => {
      let checks = [new Promise().resolve(true)];
      // Add dependency checks here
      if (row["timeDependent"]) {
         checks.push(withinTime(row["timeStart"], row["timeEnd"]))}
      if (row["polyOnly"]) {checks.push(isPolyStudent(row["user_ID"]))}

      Promise.all(checks)
      .next((checkArray) => {
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
      d.query(query2, [row["user_ID"], row["event_ID"]])
      .next(() => { resolve() })
      .catch(() => { reject(error) });
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
      .next((pass) => {
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
      d.query(query1, [id])
      .next((rows) => {
         if (rows.length > 0) {
            resolve(true);
         }else {
            resolve(false);
         }
      });
   });
};


// Update as more information is required
exports.getEventInfo = (eventKey) => {
   let query1 = "SELECT e.event_ID,e.eventKey,e.allowDup,e.timeStart,"
                      + "e.timeEnd,et.name AS eventType,et.timeDependent,"
                      + "et.polyOnly "
              + "FROM Events e, EventTypes et "
              + "WHERE e.type_ID = et.type_ID AND e.eventKey = ?";

   return d.query(query1, [eventKey]);
}
