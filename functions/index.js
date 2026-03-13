document.getElementById("csvForm").addEventListener("submit", function (event) {

    event.preventDefault();

    const input = document.getElementById("file");

    const file = input.files[0];

    if (!file) return;
    const reader = new FileReader();

    reader.onload = function (e) {

        const text = e.target.result;

        const lines = text.split("\n");

        const headers = lines[0].split(",");

        const result = [];

        for (let i = 1; i < lines.length; i++) {

            if (lines[i].trim() === "") continue;

            const values = lines[i].split(",");

            const obj = {
                name: values[0].trim(),
                price: parseFloat(values[1]),
                quantity: parseInt(values[2]),
                ean: values[3].trim()
            };

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