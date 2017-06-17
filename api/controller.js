'use strict';

exports.getVersion = function(req, res) {
  res.json({todo: 'implement version call'});
};

exports.getEvents = function(req, res) {
  // get the room data with req.params.room
  res.json({todo: 'implement getEvents call (' + req.params.room + ')'});
};

exports.addAttendance = function(req, res) {
  // get the user's id and room number with req.body.{id, room}
  res.json({todo: 'implement addAttendance call (' + req.body.id
      + ', ' + req.body.room + ')'});
};

exports.getAttendance = function(req, res) {
  // get the event with req.params.event
  res.json({todo: 'implement getAttendance call (' + req.params.event + ')'});
};
