var client = require('./esconnection.js');
client["delete"]({
    index: 'gov',
    id: '1',
    type: 'constituencies'
}, function (err, resp, status) {
    console.log(resp);
});
