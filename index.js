const glob = require("glob");
const fs = require("fs");
const simplify = require('simplify-geojson');
const tolerance = 0.001;

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
                    'type': 'FeatureCollection',
                    'geometry': geojson.geometries[0].coordinates.map((coords) => {
                        return {
                            'type': 'Polygon',
                            'coordinates': coords
                        };
                    })
                };

                console.log(geojsonAdjusted);

                const simplified = simplify(geojsonAdjusted, tolerance);

                const newPath = file.replace('data', 'extracts');

                console.log(newPath);

                fs.writeFile(newPath, JSON.stringify(simplified), (err) => {
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