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
   var query1 = "INSERT INTO Users VALUES (?, ?, ?, ?, ?)";
   if (req.body.user_ID){
      var user_ID = req.body.user_ID;
   }else{
      res.json({status: 100, message: "UserID is necessary for this function."});
      return;
   }
   if (req.body.FirstName){
      var FirstName = req.body.FirstName;
   }else{var FirstName = "";}
   if (req.body.LastName){
      var LastName = req.body.LastName;
   }else{var LastName = "";}
   if (req.body.Email){
      var Email = req.body.Email;
   }else{var Email = "";}
   if (req.body.UserName){
      var UserName = req.body.UserName;
   }else{var UserName = "";}

   var sData = [user_ID, FirstName, LastName, Email, UserName];

   d.query(query1, sData)
   .next(rows => {
      res.json({status: 200, message: "UserID: " + user_ID + " added successfully."});
   })
   .catch(() => {res.json({status: 203, message: "Failed to add user"})});
};

// Pulls a user ID from the database
exports.getUser = function(req, res) {
   var query1 = "SELECT user_ID,firstName,lastName,email "
              + "FROM Users "
              + "WHERE user_ID=?";
   if (parseInt(req.body.user_ID) == "NaN"){
      res.json({status: 100, message: "user_ID is invalid! "
                                    + "Error: user_ID must be a number"});
      return;
   }
   var data = [req.body.user_ID];
   d.query(query1, data)
   .next(rows => {
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
   if (isNaN(req.body.user_ID)) {
      res.json({status: 100, message: "user_ID is not valid! "
                                    + "Error: user_ID must be a number"});
      return;
   }
   t.getEventInfo(req.body.eventKey)
   .next((rows) => {
      // Adds user_ID for dependency checks
      rows = rows.map(row => {
         row["user_ID"] = req.body.user_ID;
         return row;
      });
      return Promise.all(rows.map(row => t.handleRow(row)));
   })
   .next((eventChecks) => {
      let entries = 0;
      eventChecks.forEach((e) => {if (e) {entries++;}});
      res.json({status: 200, message: "Added " + entries + " entries to "
                                    + "attendance table"});
   })
   .catch((error) => {
      res.json({status: 200, message: "No attendance entry added!"})
   })
};
