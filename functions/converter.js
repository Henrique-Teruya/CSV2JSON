/**
 * CSV2JSON — Browser-side converter
 * Adapted from functions/index.js (Node.js version)
 *
 * Same normalization logic:
 *   - headers → lowercase + trim
 *   - clean() → remove quotes, trim
 *   - auto-detect numeric types (parseFloat / parseInt)
 */

(function () {
    'use strict';

    // ─── DOM Elements ───────────────────────────────────────
    const uploadZone = document.getElementById('upload-zone');
    const csvInput = document.getElementById('csv-input');
    const filenameDisplay = document.getElementById('filename-display');
    const btnConvert = document.getElementById('btn-convert');
    const btnCopy = document.getElementById('btn-copy');
    const btnDownload = document.getElementById('btn-download');
    const btnClear = document.getElementById('btn-clear');
    const resultArea = document.getElementById('result');
    const statLines = document.getElementById('stat-lines');
    const statFields = document.getElementById('stat-fields');
    const statSize = document.getElementById('stat-size');
    const toast = document.getElementById('toast');

    let currentFile = null;
    let convertedJSON = '';

    // ─── File Selection ─────────────────────────────────────

    // Click to browse
    uploadZone.addEventListener('click', () => csvInput.click());

    // Input change
    csvInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag & Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('upload-zone--active');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('upload-zone--active');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('upload-zone--active');
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.csv')) {
                handleFile(file);
            } else {
                showToast('⚠️ Please drop a .csv file');
            }
        }
    });

    function handleFile(file) {
        currentFile = file;
        filenameDisplay.textContent = '✅ ' + file.name;
        filenameDisplay.classList.add('visible');
        btnConvert.disabled = false;

        // Show file size
        statSize.textContent = formatFileSize(file.size);
    }

    // ─── Conversion ─────────────────────────────────────────

    btnConvert.addEventListener('click', () => {
        if (!currentFile) return;

        btnConvert.classList.add('loading');
        btnConvert.disabled = true;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const results = parseCSV(csvText);
                convertedJSON = JSON.stringify(results, null, 2);

                // Display result
                resultArea.value = convertedJSON;

                // Update stats
                statLines.textContent = results.length;
                if (results.length > 0) {
                    statFields.textContent = Object.keys(results[0]).length;
                } else {
                    statFields.textContent = '0';
                }

                // Enable action buttons
                btnCopy.disabled = false;
                btnDownload.disabled = false;

                showToast('✅ Conversion completed!');

            } catch (err) {
                resultArea.value = '❌ Error: ' + err.message;
                showToast('❌ Conversion failed');
            } finally {
                btnConvert.classList.remove('loading');
                btnConvert.disabled = false;
            }
        };

        reader.onerror = () => {
            resultArea.value = '❌ Error reading file';
            btnConvert.classList.remove('loading');
            btnConvert.disabled = false;
        };

        // Small delay for loading animation feedback
        setTimeout(() => {
            reader.readAsText(currentFile);
        }, 300);
    });

    // ─── CSV Parser ─────────────────────────────────────────
    // Replicates functions/index.js logic:
    //   - columns: header => header.map(h => h.toLowerCase().trim())
    //   - skip_empty_lines: true
    //   - trim: true
    //   - clean(val): remove quotes, trim
    //   - auto-detect number types

    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length === 0) {
            throw new Error('Empty CSV file');
        }

        // Parse header
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

        const results = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row = {};

            headers.forEach((header, idx) => {
                const rawVal = values[idx] !== undefined ? values[idx] : '';
                const cleaned = clean(rawVal);

                // Auto-detect numeric types
                row[header] = autoType(cleaned);
            });

            results.push(row);
        }

        return results;
    }

    /**
     * Parse a single CSV line, respecting quoted fields.
     * Handles: "field with, comma", "field with ""quotes"""
     */
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const next = line[i + 1];

            if (inQuotes) {
                if (char === '"' && next === '"') {
                    current += '"';
                    i++; // skip escaped quote
                } else if (char === '"') {
                    inQuotes = false;
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
        }

        result.push(current.trim());
        return result;
    }

    /**
     * clean() — same as functions/index.js
     * Removes surrounding quotes and trims whitespace.
     */
    function clean(val) {
        if (typeof val === 'string') {
            return val.replace(/['"]/g, '').trim();
        }
        return val;
    }

    /**
     * Auto-detect number types.
     * If value looks like an integer → parseInt
     * If value looks like a float → parseFloat
     * Otherwise → keep as string
     */
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

    // ─── Copy to Clipboard ──────────────────────────────────

    btnCopy.addEventListener('click', () => {
        if (!convertedJSON) return;

        navigator.clipboard.writeText(convertedJSON).then(() => {
            showToast('📋 Copied to clipboard!');
        }).catch(() => {
            // Fallback
            resultArea.select();
            document.execCommand('copy');
            showToast('📋 Copied to clipboard!');
        });
    });

    // ─── Download JSON ──────────────────────────────────────

    btnDownload.addEventListener('click', () => {
        if (!convertedJSON) return;

        const blob = new Blob([convertedJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Use original filename without extension
        const baseName = currentFile
            ? currentFile.name.replace(/\.csv$/i, '')
            : 'output';
        a.download = baseName + '.json';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('⬇ Downloaded ' + a.download);
    });

    // ─── Clear ──────────────────────────────────────────────

    btnClear.addEventListener('click', () => {
        currentFile = null;
        convertedJSON = '';
        csvInput.value = '';
        resultArea.value = '';
        filenameDisplay.textContent = 'No file selected';
        filenameDisplay.classList.remove('visible');
        btnConvert.disabled = true;
        btnCopy.disabled = true;
        btnDownload.disabled = true;
        statLines.textContent = '—';
        statFields.textContent = '—';
        statSize.textContent = '—';
    });

    // ─── Toast ──────────────────────────────────────────────

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('visible');
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 2500);
    }

    // ─── Helpers ────────────────────────────────────────────

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

})();
