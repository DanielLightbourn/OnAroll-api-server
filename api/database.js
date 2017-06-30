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
function handleDatabase(query, sData, response) {
   
   pool.getConnection(function (error, connection){
      if (error) {
         //response.json({"code": 100, "status": "Error when connecting to the database"});
         // TODO: Add connection specific error
         return;
      }

      //console.log('client connected with id ' + connection.threadId);

         // This should be the lowest layer of the database call
         // the query should be sanitized by the command specific call
         connection.query(query, sData, function(error, rows){
            if (error) {
               // do error loggin here
            }
            connection.release();
            response("", rows);
      });
      
      connection.on('error', function (error){
         // TODO: Add connection error
         return;
      });
   });
}

//handleDatabase("SHOW tables", function (res){
//   for (var i of res){
//      console.log(i.Tables_in_OnARoll_MarkI);
//   }
//   console.log("\n\n\n" + res.toString());
//});
//setTimeout(function(){
//   pool.end(function(){console.log("Pool has ended.");});
//}, 1000);

module.exports.pool = pool;
module.exports.query = handleDatabase;
module.exports.close = function(){
   setTimeout(function(){
      pool.end(function(){
         console.log("Pool closed...");
      });
      console.log("Done!");
   }, 1000);

};
