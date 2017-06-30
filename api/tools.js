'use strict';

var d = require('./database');

var POLYLIMIT = 9999;
var resp;

var withinTime = function(startTime, endTime) {
   var today = new Date();
   var timeStart = startTime.split(":");
   var timeEnd = endTime.split(":");
   var ans = 0;
   if (today.getHours() >= timeStart[0] &&
       today.getHours() <= timeEnd[0] &&
       today.getMinutes() >= timeStart[1] &&
       today.getMinutes() <= timeEnd[1]) {
      return 1;
   }else{
      return 0;
   }
};

var isPolyStudent = function(id, callback) {
   if (parseInt(id) == "NaN") {
      callback("ID not a number", 0);
      return;
   }
   if (id < 0 || id > POLYLIMIT) {
      callback("ID not within POLYLIMIT", 0);
      return;
   }
   var query1 = "SELECT user_ID FROM Users WHERE user_ID = ?";
   var data = [id];
   d.query(query1, data, function(error, rows) {
      if (error) {
           // Do error loggin here
      }
      var exist = 0;
      if (rows.length < 1) {
         // User doesn't exist
         exist = 0;
      }else {
         // Assume multiple users can't exist
         exist = 1;
      }
      callback("", exist);
   });

};


var handleRow = function(row, callback) {
   handleDependencies(row, callback, function handleDependenciesCallback(error, ans, finalcallback) {
      if (ans) {
         var query2 = "INSERT INTO Attendance (user_ID,event_ID) "
                    + "VALUES (?, ?)";
         var data = [row["user_ID"], row["event_ID"]];
         d.query(query2, data, function(error, rows){
            finalcallback("");
         });
      }else {
         finalcallback("debug: " + row["eventKey"] + " does not meet dependecies");
      }
   });
};

var handleDependencies = function(row, finalcallback, callback) {
   checkDependencies(row, function checkDependenciesCallback(error, checks) {
      // Add additional here
      var ans = 0
      if (checks.time && checks.poly) {
         ans = 1;
         callback(error, ans, finalcallback);
      }else {
         callback(error, ans, finalcallback);
      }
   });
};

var checkDependencies = function(row, callback) {
   var checks = new Object();
   checkTimeDependency(row, checks, function(error, checks) {
      if (error) {
         // Do error logging here
      }
      callback("", checks);
   });
};

var checkTimeDependency = function(row, checks, callback) {
   checks.time = 0;
   if (row["timeDependent"]) {
      if (withinTime(row["timeStart"], row["timeEnd"])){
         checks.time = 1;
         checkPolyDependency(row, checks, function(error, checks) {
            if (error) {
               // Do error logging here
            }
            callback("", checks);
         });
      }else {
         checks.time = 0;
         checkPolyDependency(row, checks, function(error, checks) {
            if (error){
               // Do error logging here
            }
            callback("", checks);
         });
      }
   }else{
      checks.time = 1;
      checkPolyDependency(row, checks, function(error, checks) {
         if (error) {
            // Do error loggin here
         }
         callback("", checks);
      });
   }
};

var checkPolyDependency = function(row, checks, callback) {
   checks.poly = 0;
   if (row["polyOnly"]) {
      isPolyStudent(row["user_ID"], function(error, ans) {
         if (error) {
            // Do error logging here
         }
         checks.poly = ans;
         // Insert additional checks here with the callback executing callback
         callback("", checks);
      });
   }else {
      checks.poly = 1;
      // Make sure to put it here also
      callback("", checks);
   }
};

exports.handleRows = function(rows, user_ID, id, entries, res, callback) {
   resp = res;
   if (id < rows.length){
      rows[id].user_ID = user_ID;
      handleRow(rows[id], function(error, pass){
         if (error) {
            // Do error handling here
         }
         var num = 0;
         if (pass) {num = 1;}
         exports.handleRows(rows, user_ID, id+1, entries+num, res, callback);
      });
   }else {
      callback("", entries, res);
   }
};
