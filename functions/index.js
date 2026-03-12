document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const fileInput = document.getElementById('file');
    const resultArea = document.getElementById('result');

    if (!fileInput.files.length) {
        resultArea.value = 'Por favor, selecione um arquivo CSV primeiro.';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const text = event.target.result;
        try {
            const results = parseCSV(text);
            resultArea.value = JSON.stringify(results, null, 2);
        } catch (error) {
            resultArea.value = 'Erro ao processar o CSV: ' + error.message;
        }
    };

    reader.readAsText(file);
});

function parseCSV(text) {
    const rows = [];
    let currentField = '';
    let inQuotes = false;
    let currentRow = [];

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (inQuotes) {
            if (char === '"' && next === '"') {
                currentField += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\r' || char === '\n') {
                currentRow.push(currentField.trim());
                currentField = '';
                if (currentRow.some(field => field !== '')) {
                    rows.push(currentRow);
                }
                currentRow = [];
                if (char === '\r' && next === '\n') {
                    i++;
                }
            } else {
                currentField += char;
            }
        }
    }

    if (currentField !== '' || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field !== '')) {
            rows.push(currentRow);
        }
    }

    if (rows.length === 0) return [];

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const results = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        const row = {};

        headers.forEach((header, index) => {
            const val = values[index] !== undefined ? values[index] : '';
            const cleaned = clean(val);
            row[header] = autoType(cleaned);
        });

        results.push(row);
    }

    return results;
}

function clean(val) {
    if (typeof val === 'string') {
        return val.replace(/['"]/g, '').trim();
    }
    return val;
}

function autoType(val) {
    if (val === '' || val === null || val === undefined) return val;

    // Check if it's a number
    if (/^\d+$/.test(val)) {
        return parseInt(val, 10);
    }

    if (/^\d+\.\d+$/.test(val)) {
        return parseFloat(val);
    }

    return val;
}
