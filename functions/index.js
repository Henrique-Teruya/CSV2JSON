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
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const results = [];

    const clean = (val) => (typeof val === 'string' ? val.replace(/['"]/g, '').trim() : val);

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};

        headers.forEach((header, index) => {
            const val = values[index] !== undefined ? values[index] : '';
            const cleaned = clean(val);

            // Mantendo a mesma lógica original de conversões específicas dos campos numéricos 
            if (header === 'price') {
                row[header] = parseFloat(cleaned) || 0;
            } else if (header === 'quantity') {
                row[header] = parseInt(cleaned, 10) || 0;
            } else {
                row[header] = cleaned;
            }
        });

        results.push(row);
    }

    return results;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"' && line[i + 1] === '"') {
                current += '"';
                i++; // Pula as aspas que vêm juntas
            } else if (char === '"') {
                inQuotes = false;
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
    }
    result.push(current);
    return result;
}
