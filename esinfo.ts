var client = require('./esconnection.js');

client.cluster.health({},function(err: any, resp: any, status: any) {  
  console.log("-- Client Health --",resp);
});

client.count({index: 'gov',type: 'constituencies'},function(err,resp,status) {  
  console.log("constituencies",resp);
});