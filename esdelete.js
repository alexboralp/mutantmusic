var client = require('./esconnection.js');
client.indices["delete"]({ index: 'gov' }, function (err, resp, status) {
    console.log("delete", resp);
});
