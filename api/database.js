var mysql = require('mysql');



var pool = mysql.createPool({
   connectionLimit : 50,
   host : 'localhost',
   user : 'server',
   password : 'Server_123',
   database : 'OnARoll_MarkI',
   debug : false
});

const PIN_TIMEOUT = 300;//seconds
const KEY_TIMEOUT = 604800;//seconds

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
            reject(new Error("User does not exist"));
         }
      });
   });
};

exports.insertIntoAttendence = (user_ID, event_ID) => {
   console.log("Inserting user: ", user_ID, "into event: ", event_ID);
   return new Promise((resolve, reject) => {
      const query2 = "INSERT INTO Attendance (userID,eventID,time) "
                 + "VALUES (?, ?, NOW())";
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
            resolve(eventsFromDatabase);
         }
      });
   });
};

// Check if the given pin code is within the timeout period 
// and if it is save the given Public key to the event key that the pin code is related to.
// Resolves with the event key that the pin code is related to.
exports.checkAndSaveKey = (pin, newKey) => {
  return new Promise((resolve, reject) => {
    const query1 = "SELECT eventKey, dateCreated FROM authpins WHERE pinCode = ?";
    const query2 = "DELETE FROM authpins WHERE pinCode = ?";
    query(query1, [pin])
    .then((eventKeysForPin) => {
      if (eventKeysForPin.length > 0) {
        if((new Date()- new Date(eventKeysForPin[0]['dateCreated'])) / 1000 < PIN_TIMEOUT) {
          saveNewKey(eventKeysForPin[0]['eventKey'], newKey)
          .catch((e) => {reject(e);;})
          query(query2, [pin])
          .then(() => {
            resolve(eventKeysForPin[0]['eventKey']);
          })
          .catch((e) => {reject(e)});
        } else {
          query(query2, [pin]).then(() => {resolve();})
          reject(new Error("Pincode has timed out"));
        }
      } else {
        reject(new Error("Invalid pincode"));
      }
    })
  })
};

// deletes out of date kiosks and pins and creates a random pin code
// for the given event key. Resolves with the generated pin code.
exports.createPinCode = (newEventKey) => {
  return new Promise((resolve, reject) => {
    cleanPinsAndKeys();
    const query1 = "SELECT * FROM (SELECT eventKey AS eventKey, dateLastUpdate AS date, FALSE AS isPin FROM kioskkeys UNION SELECT eventKey AS eventKey, dateCreated AS date, TRUE AS isPin FROM authpins) AS t WHERE t.eventKey = ?";
    const query2 = "INSERT INTO authpins (eventKey, pinCode, dateCreated) VALUES (?, ?, NOW())";
    var pin = Math.random().toString(36).slice(2, 22);
    query(query1, [newEventKey])
    .then((pinsAndKiosksUsingEventKey) => {
      if (pinsAndKiosksUsingEventKey.length > 0) {
        /*  Since cleanPinsAndKeys is used at the beginning of this method, there should be no out of date pins/kiosks
        const inDate = (x)=> {return (new Date()- new Date(x['date'])) / 1000 < (x['isPin'] ? PIN_TIMEOUT : KEY_TIMEOUT)};
        if(pinsAndKiosksUsingEventKey.some(inDate)) {*/
          reject(new Error("EventKey already in use"));
        //}
      } else {
        query(query2, [newEventKey, pin])
        .then(() => {
          resolve(pin);
        })
        .catch((e) => {reject(e)});
      }
    });
  })
};

exports.getPublicKey = (eventKey) => {
  return new Promise((resolve, reject) => {
    const query1 = "SELECT pubKey FROM kioskKeys WHERE eventKey = ?"
    query(query1, [eventKey])
    .then((key) => {
      resolve(key);
    })
    .catch((e)=> {reject(e);})
  });
};

exports.updateKey = (eventKey, newPubKey) => {
  return new Promise((resolve, reject) => {
    const query1 = "UPDATE kioskKeys SET pubKey = ?, dateLastUpdate = NOW() WHERE eventKey = ?";
    query(query1, [newPubKey, eventKey])
    .then(() => {
      console.log("Updated", eventKey + "'s public key to",newPubKey);
      resolve();
    })
    .catch(e => {reject(e);});
  });
}

exports.checkDupAttendence = (user_ID, event_ID) => {
  const query1 = "SELECT userID,eventID FROM Attendance WHERE userID = ? AND eventID = ?";
  return new Promise((resolve, reject) => {
    query(query1, [user_ID, event_ID])
      .then((rows) => {
        if (rows.length < 1) {
          resolve(true);
        }else {
          reject(new Error("User is already attending"));
        }
      });
  });
};

let saveNewKey = (eventKey, pubKey) => {
  return new Promise((resolve, reject) => {
    const query1 = "INSERT INTO kioskKeys (eventKey, pubKey, dateLastUpdate) VALUES (?, ?, NOW())";
    query(query1, [eventKey, pubKey])
    .then(() => {
      console.log("Saved ", eventKey + "'s public key as", pubKey)
      resolve();
    })
    .catch((e) => {reject(e);});
  });
};

// Deletes pin codes and kiosk keys that have exceeded their timeout periods
let cleanPinsAndKeys = () => {
  return new Promise((resolve, reject) => {
    const query1 = "DELETE FROM kioskKeys WHERE (dateLastUpdate < DATE_SUB(NOW(), INTERVAL ? SECOND))"
    const query2 = "DELETE FROM authpins WHERE (dateCreated < DATE_SUB(NOW(), INTERVAL ? SECOND))";
    query(query1, [KEY_TIMEOUT])
    .catch((e)=> {reject(e);})
    query(query2, [PIN_TIMEOUT])
    .catch((e)=> {reject(e);})
    resolve();
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
