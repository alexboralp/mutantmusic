var client = require('./esconnection.js');

client.index({  
  index: 'gov',
  id: '1',
  type: 'constituencies',
  body: {
    "ConstituencyName": "Ipswich",
    "ConstituencyID": "E14000761",
    "ConstituencyType": "Borough",
    "Electorate": 74499,
    "ValidVotes": 48694,
  }
},function(err: any, resp: any, status: any) {
    console.log(resp);
});