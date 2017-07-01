var express = require('express'),
  app = express(),
  port = process.env.PORT || 3001,
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var routes = require('./api/routes.js');
routes(app);

app.listen(port);

console.log('OnAroll RESTful API server started on ' + port);
