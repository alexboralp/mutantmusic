var client = require('./esconnection.js');

client.indices.create({  
  index: 'gov'
},function(err: any, resp: any, status: any) {
  if(err) {
    console.log(err);
  }
  else {
    console.log("create",resp);
  }
});