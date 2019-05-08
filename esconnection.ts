// Idea tomada de https://www.compose.com/articles/getting-started-with-elasticsearch-and-node/

// Crea una conección a ElasticSearch

var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  hosts: [
    'http://localhost:9200/'
  ]
});

module.exports = client;  