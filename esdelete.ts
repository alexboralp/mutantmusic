var client = require('./esconnection.js');

client.indices.delete({index: 'gov'},function(err: any, resp: any, status: any) {  
  console.log("delete",resp);
});