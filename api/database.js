var mysql = require('mysql');


var pool = mysql.createPool({
   connectionLimit : 50,
   host : 'localhost',
   user : 'server',
   password : 'Server_123',
   database : 'OnARoll_MarkI',
   debug : false
});


// query: string containing SQL formated query    Ex: "SELECT * FROM ?"
// sData: sanitized array of data for query       Ex: ["Users"]
// response: function that will act on the response
let query = (query, sData) => {
   console.log("Running query: \n", query, "\nwith data: ", sData);
   return new Promise((resolve, reject) => {
      pool.query(query, sData, (error, rows) => {
         if (error) {
            console.log("Database query error: ", error);
            reject(new Error("Query Error"));
         } else {
            console.log("Query completed successfully!");
            resolve(rows);
         }
      });
   });
};

exports.userExists = (id) => {
   console.log("Checking if user exists with ID: ", id);
   return new Promise((resolve, reject) => {
      if (parseInt(id) == "NaN") {
         console.log("User id: ", id, " is not a number!");
         resolve(false);
      }
      const query1 = "SELECT user_ID FROM Users WHERE user_ID = ?";
      query(query1, [id])
      .then((rows) => {
         if (rows.length > 0) {
            console.log("User found with ID: ", id);
            resolve(true);
         }else {
            console.log("No user found with ID: ", id);
            reject(new Error("No user found with ID: ", id));
         }
      });
   });
};

exports.insertIntoAttendence = (user_ID, event_ID) => {
   console.log("Inserting user: ", user_ID, "into event: ", event_ID);
   return new Promise((resolve, reject) => {
      const query2 = "INSERT INTO Attendance (user_ID,event_ID) "
                 + "VALUES (?, ?)";
      query(query2, [user_ID, event_ID])
      .then((events) => {
         console.log("User: ", user_ID,
                     "was seccessfully added to event: ", event_ID);
         resolve(true);
      })
      .catch((error) => {
         console.log("User: ", user_ID,
                     "failed to be added to event: ", event_ID);
         reject(error);
      });
   })
};

// Returns an event with relavent information
// Update as more information is required
exports.getEventInfo = (eventKey) => {
   console.log("Getting event info for eventKey:", eventKey);
   return new Promise((resolve, reject) => {
      const query1 = "SELECT e.event_ID,e.eventKey,e.allowDup,e.timeStart,"
                         + "e.timeEnd,et.name AS eventType,et.timeDependent,"
                         + "et.polyOnly "
                 + "FROM Events e, EventTypes et "
                 + "WHERE e.type_ID = et.type_ID AND e.eventKey = ?";

      query(query1, [eventKey])
      .then((eventsFromDatabase) => {
         if (eventsFromDatabase.length < 1) {
            console.log("No event info was found for eventKey: ", eventKey);
            reject(new Error("No events exist with that eventKey"));
         }else {
            console.log("Database returned ", eventsFromDatabase.length,
                        "events with the key: ", eventKey);
            resolve(rows);
         }
      });
   });
};


module.exports.pool = pool;
module.exports.query = query;
module.exports.close = () => {
   setTimeout(() => {
      pool.end(() => {
         console.log("Pool closed...");
      });
      console.log("Done!");
   }, 1000);

};
