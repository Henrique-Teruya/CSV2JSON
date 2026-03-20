const fs = require('fs');
const { parse } = require('csv-parse');

const results = [];

fs.createReadStream('/Users/henrique/CSV2JSON/data/produtos_sem_string.csv')
    .pipe(parse({
        columns: header => header.map(h => h.toLowerCase().trim()),
        skip_empty_lines: true,
        trim: true
    }))
    .on('data', (data) => {
        const clean = (val) => (typeof val === 'string' ? val.replace(/['"]/g, '').trim() : val);

        const normalizedRow = {
            name: clean(data.name),
            price: parseFloat(clean(data.price)),
            quantity: parseInt(clean(data.quantity)),
            ean: clean(data.ean)
        };
        results.push(normalizedRow);
    })
    .on('end', () => {
        const jsonOutput = JSON.stringify(results, null, 2);
        fs.writeFileSync('produtos.json', jsonOutput);
        console.log('JSON file successfully created: produtos.json');
    })
    .on('error', (err) => {
        console.error(err);
    });