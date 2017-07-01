let name = (name) => {
   return new Promise((resolve, reject) => {
      console.log("Hello " + name + " how are you doing today?");
      resolve(name);
   });
};


name("bob")
.next(name => {console.log("Hello again " + name);})

