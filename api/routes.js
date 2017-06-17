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
  app.route('/addAttendance/')
    .post(controller.addAttendance);

  // Get attendance for individuals given the specific event
  app.route('/getAttendance/:event')
    .get(controller.getAttendance);

};
