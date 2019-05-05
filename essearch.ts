var client = require('./esconnection.js');

client.search({  
  index: 'gov',
  type: 'constituencies',
  body: {
    query: {
      match: { "constituencyname": "Harwich" }
    },
  }
},function (error: any, response: any, status: any) {
    if (error){
      console.log("search error: "+error)
    }
    else {
      console.log("--- Response ---");
      console.log(response);
      console.log("--- Hits ---");
      response.hits.hits.forEach(function(hit: any){
        console.log(hit);
      })
    }
});