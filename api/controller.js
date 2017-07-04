'use strict';

// import necessary modules
var d = require('./database');
var mysql = require('mysql');
var t = require('./tools');


exports.getVersion = function(req, res) {
  res.json({todo: 'implement version call'});
};

exports.getEvents = function(req, res) {
  // get the room data with req.params.room
  res.json({todo: 'implement getEvents call (' + req.params.room + ')'});
};

exports.test1 = function(req, res) {
   res.json({message: 'Hello ' + req.params.name + ' welcome to the attendence server'});

};

exports.getAttendance = function(req, res) {
   res.json({todo: "implement getAttendance call"});
};

// test function to allow us to add users to the table
exports.addUser = function(req, res) {
   const query1 = "INSERT INTO Users VALUES (?, ?, ?, ?, ?)";
   if (req.body.user_ID){
      let user_ID = req.body.user_ID;
   }else{
      res.json({status: 100, message: "UserID is necessary for this function."});
      return;
   }

   let firstName = req.body.firstName || "";
   let lastName = req.body.lastName || "";
   let email = req.body.email || "";
   let userName = req.body.userName || "";


   var sData = [user_ID, firstName, lastName, email, userName];

   d.query(query1, sData)
   .then((rows) => {
      if (error) {
         res.json({status: 203, message: "Failed to add user"});
      } else{
         res.json({status: 200, message: "UserID: " + user_ID + " added successfully."});
      }
   });
};

// Pulls a user ID from the database
exports.getUser = function(req, res) {
   const query1 = "SELECT user_ID,firstName,lastName,email "
              + "FROM Users "
              + "WHERE user_ID=?";
   if (parseInt(req.body.user_ID) == "NaN"){
      res.json({status: 100, message: "user_ID is invalid! "
                                    + "Error: user_ID must be a number"});
      return;
   }
   const data = [req.body.user_ID];
   d.query(query1, data)
   .then((rows) => {
      if (rows.length < 1){
         res.json({status: 201, message:"No users exist"});
      }else{
         res.json({status: 200, message: "User added successfully"});
      }
   });
};

// Adds an attendance record for a specified event
// POST message contains user_ID,eventKey,(firstName,lastName)

exports.addAttendance = (req, res) => {
   // Checks that the user_ID is a number
   if (isNaN(req.body.user_ID)) {
      res.json({status: 100, message: "user_ID is not valid! "
                                    + "Error: user_ID must be a number"});
      return;
   }

   t.getEventInfo(req.body.eventKey)
   .then((events) => {
      console.log("Events inside of then", events);
      // Adds user_ID for dependency checks
      events = events.map(event => {
         event["user_ID"] = req.body.user_ID;
         return row;
      });
      return Promise.all(events.map(event => t.handleEvent(event)));
   })
   .then((eventChecks) => {
      let entries = 0;
      eventChecks.forEach((e) => {if (e) {entries++;}});
      if(entries > 0) {
         res.json({status: 200, message: "Added " + entries
                                    + " entries to attendance table"});
      } else {
         res.json({status: 203, message: "No attendance entry added!"});
      }
   })
   .catch((error) => {
      res.json({status: 200, message: "No attendance entry added!"});
   })
};
