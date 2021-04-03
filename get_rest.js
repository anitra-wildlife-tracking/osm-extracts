const osmCountries = require('osm-countries');
const getCountryISO2 = require("country-iso-3-to-2");
const fs = require("fs");
const osmGeoJson = require('osm-geojson');
const { getName } = require('country-list');

for (const [key, relation] of Object.entries(osmCountries.map())) {
    const isoCode = getCountryISO2(key);
    
    if (!isoCode) {
        continue;
    }

    if (!fs.existsSync("data/" + isoCode + ".geojson")) {
        console.log('Country ' + isoCode + " does not exist, downloading...");

        osmGeoJson.get(relation).then(function (json) {
            json.properties = {
                "name": getName(isoCode),
                "wikidata": null,
                "osm": relation
            };
    
            fs.writeFileSync("data/" + isoCode + ".geojson", JSON.stringify(json));
        });
    }
}