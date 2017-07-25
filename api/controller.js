'use strict';


// import necessary modules
let DB = require('./database');
let t = require('./tools');

exports.getVersion = function(req, res) {
  res.status(501).json({todo: 'implement version call'});
};

exports.getEvents = function(req, res) {
  // get the room data with req.params.room
  res.status(501).json({todo: 'implement getEvents call (' + req.params.room + ')'});
};

exports.test1 = function(req, res) {
   res.status(200).json({message: 'Hello ' + req.params.name + ' welcome to the attendence server'});

};

exports.getAttendance = function(req, res) {
   res.status(501).json({todo: "implement getAttendance call"});
};

exports.createPin = (req, res) => {
  /*
  if (user is logged in and can do so)
  {*/
    DB.createPinCode(t.sanitize(req.params.eventKey))
    .then((pin) => {
      res.status(201).json({pinCode: pin});
    })
    .catch((e) => {
      res.status(200).json({error: e.message});
    })
  /*} else {
    res.status(403).json({});
  }*/
}
// test function to allow us to add users to the table
exports.addUser = function(req, res) {
   const query1 = "INSERT INTO Users VALUES (?, ?, ?, ?, ?)";
   if (req.body.user_ID){
      let user_ID = req.body.user_ID;
   }else{
      res.status(100).json({message: "UserID is necessary for this function."});
      return;
   }

   let firstName = req.body.firstName || "";
   let lastName = req.body.lastName || "";
   let email = req.body.email || "";
   let userName = req.body.userName || "";


   var sData = t.sanitize([user_ID, firstName, lastName, email, userName]);

   DB.query(query1, sData)
   .then((rows) => {
      if (error) {
         res.status(200).json({message: "Failed to add user"});
      } else{
         res.status(201).json({message: "UserID: " + user_ID + " added successfully."});
      }
   });
};

// Pulls a user ID from the database
exports.getUser = function(req, res) {
   const query1 = "SELECT user_ID,firstName,lastName,email "
              + "FROM Users "
              + "WHERE user_ID=?";
   if (parseInt(req.body.user_ID) == "NaN"){
      res.status(100).json({message: "user_ID is invalid! "
                                    + "Error: user_ID must be a number"});
      return;
   }
   const sData = t.sanitize([req.body.user_ID]);
   DB.query(query1, sData)
   .then((rows) => {
      if (rows.length < 1){
         res.status(200).json({message:"No users exist"});
      }else{
         res.status(201).json({message: "User added successfully"});
      }
   });
};

// Adds an attendance record for a specified event
// POST message contains user_ID,eventKey,(firstName,lastName)

exports.addAttendance = (req, res) => {
   // Checks that the user_ID is a number
   if (isNaN(req.body.data.user_ID)) {
      res.status(400).json({message: "user_ID is not valid! "
                                    + "Error: user_ID must be a number"});
      return;
   }
   t.checkSignature(req.body.data, req.body.signature)
   .catch((e) => {
     console.log(e);
     res.status(403).json({message: "Kiosk isn't authenticated!"});
     return;
   })
   .then((sigOK) => {
     if(sigOK) {
       DB.getEventInfo(t.sanitize(req.body.data.eventKey))
       .then((events) => {
          // Adds user_ID for dependency checks
          events = events.map(event => {
             event["user_ID"] = t.sanitize(req.body.data.user_ID);
             return event;
          });
          let handleEventPromiseArray = events.map(event => t.handleEvent(event).catch((e) =>{return Promise.reject(e)}));
          return Promise.all(handleEventPromiseArray);
       })
       .then((eventChecks) => {
          let entries = eventChecks.reduce((sum, x) => {if (x) {return sum+1} else {return sum}}, 0);
          if(entries > 0) {
             res.json({status: 201, message: "Added " + entries
                                        + " entries to attendance table"});
          } else {
             res.json({status: 200, message: "No attendance entry added!"});
          }
       })
       .catch((error) => {
          if(error === "Bad Signature") {
            console.log("Bad Signature");
            res.status(403).json({message: "Kiosk isn't authenticated!"});
          } else if(error == "Error: User is already attending") {
            res.status(200).json({message: "User is already attending", genNewKey: true});
          } else if(error == "Error: User does not exist") {
            res.status(200).json({message: "User does not exist", genNewKey: true});
          } else if(error == "Error: No events exist with that eventKey") {
            res.status(200).json({message: "No events exist for this kiosk", genNewKey: true});
          } else {
            console.log("unhandled error:", error);
            res.status(200).json({message: "No attendance entry added!"});
          }
       })
     }
   });
};

exports.authenticate = (req, res) => {
DB.checkAndSaveKey(t.sanitize(req.body.pin), t.sanitize(req.body.key))
  .then((eventKey) => {
    res.status(201).json({key: eventKey});
  })
  .catch((e) => {
    res.status(200).json({messsage: "could not authenticate"});
  });
}
