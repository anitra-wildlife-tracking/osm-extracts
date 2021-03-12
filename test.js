const glob = require("glob");
const fs = require("fs");
const simplify = require('simplify-geojson');
const tolerance = 0.001;
const turf = require('@turf/turf');
const path = require('path');

const file = './data/CZ/CZ-20.geojson';

fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }

    const geojson = JSON.parse(data);

    const geojsonAdjusted = {
        'type': 'Feature',
        'geometry': geojson.geometries[0]
    };

    const simplified = simplify(geojsonAdjusted, tolerance);
    const newPath = file.replace('data', 'extracts');

    const dir = path.dirname(newPath);
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    let maxPoly = [];

    for (let poly of simplified.geometry.coordinates) {
        if (poly[0].length > maxPoly.length) {
            maxPoly = poly[0];
        }
    }

    let maxPolygon = turf.polygon([maxPoly]);
    let resPolygon = turf.polygon([maxPoly]);;

    let resPoly = null;

    for (let poly of simplified.geometry.coordinates) {
        if (poly[0].length < 4) {
            continue;
        }

        const pol = turf.polygon(poly);

        if (!pol || turf.booleanEqual(maxPolygon, pol)) {
            continue;
        }

        if (turf.booleanContains(maxPolygon, pol)) {
            let res = turf.difference(resPolygon, pol);

            if (res != null) {
                resPolygon = res;
                resPoly = res;
            }
        } else {
            console.log('here');
            if (!resPoly) {
                resPoly = pol;
            } else {
                resPoly = turf.union(resPoly, pol);   
            }
        }
    }

    if (!resPoly) {
        resPoly = maxPolygon;
    } else {
        resPoly = turf.union(resPolygon, resPoly);
    }

    fs.writeFile(newPath, JSON.stringify(resPoly), (err) => {
        if (err) {
            console.error(err);
            reject();
            return;
        }
        
        console.log(`Processing ${file} complete...`);
    });
});