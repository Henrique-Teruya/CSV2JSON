document.getElementById("csvForm").addEventListener("submit", function (event) {

    event.preventDefault();

    const input = document.getElementById("file");

    const file = input.files[0];

    if (!file) return;
    const reader = new FileReader();

    reader.onload = function (e) {

        const text = e.target.result;

        const clean = (val) => (typeof val === 'string' ? val.replace(/['"]/g, '').trim() : val);

        const lines = text.split("\n");

        const headers = lines[0].split(",").map(h => clean(h).toLowerCase());

        const result = [];

        for (let i = 1; i < lines.length; i++) {

            if (lines[i].trim() === "") continue;

            const values = lines[i].split(",");

            const obj = {};

            for (let j = 0; j < headers.length; j++) {

                let val = clean(values[j] || "");

                if (headers[j] === "ean") { obj[headers[j]] = val; continue; }

                const numVal = Number(val.replace(",", "."));

                obj[headers[j]] = val === "" ? null : isNaN(numVal) ? val : numVal;
            }

            result.push(obj);
        }

        const json = JSON.stringify(result, null, 2);

        const resultElement = document.getElementById("result");
        resultElement.value = json;

        const totalLines = json.split('\n').length;
        resultElement.rows = totalLines;
    };

    reader.readAsText(file);

});

document.getElementById("copyBtn").addEventListener("click", function () {
    const resultElement = document.getElementById("result");
    if (resultElement.value) {
        resultElement.select();
        navigator.clipboard.writeText(resultElement.value);
    }
});

// Ação para a área Drag & Drop
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("file");
const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const removeFileBtn = document.getElementById("removeFileBtn");

// Clicar aciona o input escondido
dropArea.addEventListener("click", function () {
    fileInput.click();
});

dropArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", function () {
    dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", function (e) {
    e.preventDefault();
    dropArea.classList.remove("dragover");

    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        atualizarVisualArquivo();
    }
});

fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
        atualizarVisualArquivo();
    }
});

function atualizarVisualArquivo() {
    let name = fileInput.files[0].name;

    if (name.length > 13) {
        name = name.substring(0, 10) + "... .csv";
    } else {
        // Se for menor que 13/17 no total, preenchemos a string com "non-breaking spaces" (espaços invisíveis inquebráveis)
        // O limite 18 equivale ao tamanho fixo gerado por: 10 letras + "... .csv" (8) = 18 caracteres totais
        name = name.padEnd(18, '\u00A0');
    }

    fileName.textContent = name;
    dropArea.style.display = "none";
    fileInfo.style.display = "flex";
}

removeFileBtn.addEventListener("click", function () {
    fileInput.value = "";
    fileName.textContent = "";
    fileInfo.style.display = "none";
    dropArea.style.display = "block";

    // Aproveita para limpar o textarea do JSON gerado do arquivo anterior
    const resultElement = document.getElementById("result");
    resultElement.value = "";
    resultElement.rows = 3;
});
document.getElementById("clearBtn").addEventListener("click", function () {
    const resultElement = document.getElementById("result");
    resultElement.value = "";
    resultElement.rows = 3;
});

document.getElementById("downloadBtn").addEventListener("click", function () {
    const resultElement = document.getElementById("result");
    if (resultElement.value) {
        const blob = new Blob([resultElement.value], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "result.json";
        a.click();
        URL.revokeObjectURL(url);
    }
});