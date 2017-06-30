'use strict';

// import necessary modules
var d = require('./database');
var mysql = require('mysql');


exports.getVersion = function(req, res) {
  res.json({todo: 'implement version call'});
};

exports.getEvents = function(req, res) {
  // get the room data with req.params.room
  res.json({todo: 'implement getEvents call (' + req.params.room + ')'});
};

exports.addAttendance = function(req, res) {
  // get the user's id and room number with req.body.{id, room}
  var query = "";

  res.json({todo: 'implement addAttendance call (' + req.body.id
      + ', ' + req.body.room + ')'});
};

exports.getAttendance = function(req, res) {
  // get the event with req.params.event
  res.json({todo: 'implement getAttendance call (' + req.params.event + ')'});
};

exports.test1 = function(req, res) {
   res.json({message: 'Hello ' + req.params.name + ' welcome to the attendence server'});

};

// test function to allow us to add users to the table
exports.addUser = function(req, res) {
   var query1 = "INSERT INTO Users VALUES (?, ?, ?, ?, ?)";
   if (req.body.user_ID){
      var user_ID = req.body.user_ID;
   }else{
      res.json({status: "100", message: "UserID is necessary for this function."});
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

   d.query(query1, sData, function (rows){
      res.json({message: "UserID: " + user_ID + " added successfully."});
   });
};

// Pulls a user ID from the database
exports.getUser = function(req, res) {
	var query1 = "SELECT user_ID,FirstName,LastName,Email FROM Users WHERE user_ID = ?";
	if (parseInt(req.body.user_ID) = "NaN"){
		res.json({status: 100, message: "User ID is invalid"});
		return;}
	var data = [req.body.user_ID];
	d.query(query1, data, function(rows){
	if (rows.length < 1){
		res.json({status: 200, message:"No users exist"});
	}else{var mess = "Users:\n";
		for (var i = 0; i < rows.length; i++){
		mess += rows[i] + "\n";
		}
	res.json({status: 200, message: mess});

	});
};
