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
function handleDatabase(query, sData) {
   return new Promise((resolve, reject) => {
      pool.getConnection((error, connection) => {
         if (error) {
            reject(new Error("Failed to get connection from pool"));
         }

         connection.query(query, sData, function(error, rows){
            if (error) {
               reject(new Error("Failed to query properly"));
            }
            connection.release();
            resolve(rows);
         });

         connection.on('error', function (error){
            reject(new Error("Connection Error"));
         });
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
module.exports.close = () => {
   setTimeout(() => {
      pool.end(() => {
         console.log("Pool closed...");
      });
      console.log("Done!");
   }, 1000);

};
