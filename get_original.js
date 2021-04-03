const request = require('request');
const WBK = require('wikibase-sdk');
var fs = require('fs');
var dir = './tmp';
const osmGeoJson = require('osm-geojson');
const { exit } = require('process');

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

var options = {
    headers: {'user-agent': 'node.js'}
};

request( url, options , async (err, response, body) => {
    const res = JSON.parse(body);

    let countries = [];

    res.results.bindings.forEach((x) => {
        countries.push({
            wikidata: x.item.value.replace('http://www.wikidata.org/entity/', ''),
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
            "name": country.name,
            "wikidata": country.wikidata,
            "osm": country.osm
        };

        fs.writeFileSync(fileName, JSON.stringify(json));

        await new Promise((resolve, reject) => {
            const sparql = `
            SELECT ?admin ?adminLabel ?adminIso ?relation
            WHERE 
            {
              wd:${country.wikidata} wdt:P150 ?admin .
              ?admin wdt:P402 ?relation .
              ?admin wdt:P300 ?adminIso .
              
              SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
            }
            `;

            const url = wdk.sparqlQuery(sparql);

            var options = {
                headers: {'user-agent': 'node.js'}
            };

            request( url, options , async (err, response, body) => {
                const res = JSON.parse(body);
                const admins = [];

                res.results.bindings.forEach((x) => {
                    if (x.relation.value) {
                        admins.push({
                            wikidata: x.admin.value.replace('http://www.wikidata.org/entity/', ''),
                            code: x.adminIso.value,
                            relation: x.relation.value,
                            name: x.adminLabel.value
                        });
                    }
                });

                for await (let admin of admins) {
                    const fileName = './data/' + country.code + '/' + admin.code + '.geojson';

                    if (fs.existsSync(fileName)) {
                        continue;
                    }

                    console.log('Getting ' + country.code + '/' + admin.code);
                    try {

                        console.log(admin.wikidata);

                        await new Promise((resolve, reject) => {
                            request('http://polygons.openstreetmap.fr/?id=' + admin.relation, {}, (e, r, b) => {
                                resolve();
                            });
                        });

                        const json = await osmGeoJson.get(admin.relation);

                        json.properties = {
                            "name": admin.name,
                            "wikidata": admin.wikidata,
                            "osm": admin.osm
                        };
                
                        fs.writeFileSync(fileName, JSON.stringify(json));
                    } catch (e) {
                        console.error(e);
                    }
                }
                
                resolve();
            });
        });
    }
});