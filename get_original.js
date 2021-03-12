const request = require('request');
const WBK = require('wikibase-sdk');
var fs = require('fs');
var dir = './tmp';
const osmGeoJson = require('osm-geojson');

const wdk = WBK({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
});

const sparql = `
SELECT ?item ?itemLabel ?countryRelation ?code
WHERE 
{
  ?item wdt:P31 wd:Q3624078.
  ?item wdt:P402 ?countryRelation .
  ?item wdt:P297 ?code .
        
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
`;

const url = wdk.sparqlQuery(sparql);
console.log(url);

var options = {
    headers: {'user-agent': 'node.js'}
};



request( url, options , async (err, response, body) => {
    const res = JSON.parse(body);

    let countries = [];

    res.results.bindings.forEach((x) => {
        countries.push({
            code: x.code.value,
            relation: x.countryRelation.value,
            name: x.itemLabel.value
        });
    });

    for await (let country of countries) {
        const dir = './data/' + country.code;
        const fileName = './data/' + country.code + '.geojson';

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        
        const json = await osmGeoJson.get(country.relation);

        json.properties = {
            "name": country.name
        };

        fs.writeFileSync(fileName, JSON.stringify(json));
    }
});