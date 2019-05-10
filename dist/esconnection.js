"use strict";
// Idea tomada de https://www.compose.com/articles/getting-started-with-elasticsearch-and-node/
// Crea una conección a ElasticSearch
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    hosts: ['http://localhost:9200/']
});
module.exports = client;
//# sourceMappingURL=esconnection.js.map