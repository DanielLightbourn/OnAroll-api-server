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
function handleDatabase(query, sData, callback) {
   pool.query(query, sData, function(error, rows){
      if (error) {
         callback(new Error("Failed to query properly"));
         console.log("failed to query");
      }
      console.log("Connection released");
      console.log("rows:", rows);
      callback("", rows);
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
