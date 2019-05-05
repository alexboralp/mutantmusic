var client = require('./esconnection.js');
var inputfile = require("./esconstituencies.json");
var bulk: any[] = [];

var makebulk = function(constituencylist: any, callback: any){
  for (var current in constituencylist){
    bulk.push(
      { index: {_index: 'gov', _type: 'constituencies', _id: constituencylist[current].PANO } },
      {
        'constituencyname': constituencylist[current].ConstituencyName,
        'constituencyID': constituencylist[current].ConstituencyID,
        'constituencytype': constituencylist[current].ConstituencyType,
        'electorate': constituencylist[current].Electorate,
        'validvotes': constituencylist[current].ValidVotes,
        'regionID': constituencylist[current].RegionID,
        'county': constituencylist[current].County,
        'region': constituencylist[current].Region,
        'country': constituencylist[current].Country
      }
    );
  }
  callback(bulk);
}

var indexall = function(madebulk: any, callback: any) {
  client.bulk({
    maxRetries: 5,
    index: 'gov',
    type: 'constituencies',
    body: madebulk
  },function(err: any, resp: any, status: any) {
      if (err) {
        console.log(err);
      }
      else {
        callback(resp.items);
      }
  })
}

makebulk(inputfile,function(response: any){
  console.log("Bulk content prepared");
  indexall(response,function(response: any){
    console.log(response);
  })
});