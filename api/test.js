var d = require('./database');


// This is an example for using the database module
d.query("show tables", function(res){
   console.log(res);
});


// This is an example of closing the thread pool at the end of the server
d.close();
