const glob = require("glob");
const fs = require("fs");
const simplify = require('simplify-geojson');
const tolerance = 0.001;
const turf = require('@turf/turf');

glob('./data/**/*', async (err, matches) => {
    if (err) {
        console.error('Unable to list data directories');
        return;
    }

    for (let file of matches) {
        console.log(file);

        await new Promise((resolve, reject) => {

            if (fs.lstatSync(file).isDirectory()) {
                resolve();
                return;
            }

            fs.readFile(file, 'utf8', (err, data) => {
                if (err) {
                  reject();
                  return console.log(err);
                }

                const geojson = JSON.parse(data);

                const geojsonAdjusted = {
                    'type': 'Feature',
                    'geometry': geojson.geometries[0]
                };

                const simplified = simplify(geojsonAdjusted, tolerance);
                const newPath = file.replace('data', 'extracts');

                let maxPoly = [];

                for (let poly of simplified.geometry.coordinates[0]) {
                    if (poly.length > maxPoly.length) {
                        maxPoly = poly;
                    }
                }

                let maxPolygon = turf.polygon([maxPoly]);

                let resPoly = null;

                for (let poly of simplified.geometry.coordinates) {
                    if (poly[0].length < 4) {
                        continue;
                    }

                    const pol = turf.polygon(poly);

                    if (!turf.booleanEqual(maxPolygon, pol) && turf.booleanContains(maxPolygon, pol)) {
                        maxPolygon = turf.difference(maxPolygon, pol);
                    } else {
                        if (!resPoly) {
                            resPoly = pol;
                        } else {
                            turf.union(resPoly, pol);   
                        }
                    }
                }

                if (!resPoly) {
                    resPoly = maxPolygon;
                } else {
                    resPoly = turf.union(maxPolygon, resPoly);
                }

                fs.writeFile(newPath, JSON.stringify(resPoly), (err) => {
                    if (err) {
                        console.error(err);
                        reject();
                        return;
                    }
                    
                    console.log(`Processing ${file} complete...`);
                    resolve();
                });
            });
        });
    }
});