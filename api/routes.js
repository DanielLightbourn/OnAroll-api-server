'use strict';
module.exports = function(app) {
  var controller = require('./controller');

  // Declare the API calls and map them to methods

  // Return the API version
  app.route('/version')
    .get(controller.getVersion);

  // Return the events occuring today in the given room
  app.route('/getEvents/:room')
    .get(controller.getEvents);

  // Mark attendance for the individual given their ID
  app.route('/addAttendance')
    .post(controller.addAttendance);

  // Get attendance for individuals given the specific event
  app.route('/getAttendance/:event')
    .get(controller.getAttendance);

  app.route('/test1/:name')
    .get(controller.test1);

// Uncomment this code to allow users to be added from outside the server
//  app.route('/addUser')
//    .post(controller.addUser);

  // Retrieves user data
  app.route('/getUser')
    .post(controller.getUser);
    
  // authenticate a kiosk so that it may add attendances
  app.route('/authenticate')
    .post(controller.authenticate);

};
