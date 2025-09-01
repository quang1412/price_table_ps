(function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const readSheetTable = (url) => {
        return new Promise((resolve, reject) => {
            window.fetch(url).then(r => {
                if (!r.ok) {
                    throw new Error(`HTTP error! status: ${r.status}`);
                }
                return r.text();
            }).then(html => {
                return resolve(html);
            });
        });
    }

    const groupByN = (n, arr) => {
        const result = [];
        for (let i = 0; i < arr.length; i += n) {
            result.push(arr.slice(i, i + n));
        }
        return result;
    }

    function csvToJson(csvString) {
        const lines = csvString.trim().split('\n'); // Split into lines and remove leading/trailing whitespace
        const headers = lines[0].split(','); // First line contains headers
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(','); // Split each subsequent line into values
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j].trim().replaceAll('"', '')] = values[j] ? values[j].trim().replaceAll('"', '') : '';
            }
            result.push(obj);
        }
        return result;
    }

    const setTime = function() {
        const today = new Date();
        const formattedDateVN = today.toLocaleDateString('vi-VN');
        console.log(formattedDateVN);
        $('span#date')?.text(formattedDateVN);

    }

    $(document).ready(async function() {
        setTime();
        let sid = '1B0lsfTAz0T2YL2-J5D3ufloYwqlJeZbdqxn06VRbTno';
        let gid = urlParams.get('gid') || 1285746717
        let url = `https://docs.google.com/spreadsheets/d/1B0lsfTAz0T2YL2-J5D3ufloYwqlJeZbdqxn06VRbTno/gviz/tq?tqx=out:csv&tq&gid=${gid}&range=A:D&headers=1`;
        const csvData = await readSheetTable(url)

        let jsonData = csvToJson(csvData);
        //console.log(jsonData);
        let uniqueModel = Array.from(new Map(jsonData.map(item => [item["model"]])).keys());
        //console.log(uniqueModel);
        let modelGroup = groupByN((uniqueModel.length / 2), uniqueModel);

        $('div#main div.col').each((h, col) => {
            let table = $('<table>').attr({
                "border": 1,
                "cellspacing": 0
            });
            $(col).html(null).append(table);
            let models = modelGroup[h];
            models.forEach((model, i) => {
                let modelData = jsonData.filter(e => e.model == model);
                let uniqueMem = Array.from(new Map(modelData.map(item => [item["mem"]])).keys()).sort();
                let uniqueColor = Array.from(new Map(modelData.map(item => [item["color"]])).keys()).sort((a, b) => a.localeCompare(b))

                let colorGroup = groupByN(3, uniqueColor);

                uniqueMem.forEach((mem, j) => {
                    colorGroup.forEach((colors, k) => {
                        let x = (!j && !k);
                        x && table.append('<tr class="spacer">');

                        let tr = $('<tr>').appendTo(table);

                        let td_1 = $('<td>').html('<div>' + model + '</div>').attr({
                            'rowspan': !x ? 1 : (uniqueMem.length * colorGroup.length),
                            'style': 'display:' + (!x ? 'none' : 'table-cell'),
                        }).appendTo(tr);

                        let td_2 = $('<td>').text(mem).attr({
                            'rowspan': k ? 1 : colorGroup.length,
                            'style': 'display:' + (k ? 'none' : 'table-cell'),
                        }).appendTo(tr);

                        for (var l = 0; l <= 2; l++) {
                            let color = colors[l] || '';
                            let price = !color ? '' : modelData.find(item => (item.mem == mem && item.color == color))?.price;
                            $('<td>').text(color).appendTo(tr);
                            $('<td>').text(price).appendTo(tr);
                        }
                    });
                });
            });
        })
    });
})();

window.localStorage.getItem('darkMode') && $('input#darkMode[type="checkbox"]').click()

function darkModeSwitch(e) {
    let isChecked = e.checked;
    $('body').toggleClass('darkMode', isChecked);
    window.localStorage.setItem('darkMode', isChecked || '');
}
