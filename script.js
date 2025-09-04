(async function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let Config_ = JSON.parse(localStorage.getItem('Config') || '{}');

    const CONFIG = {
        name: 'config',
        get: async function(k){
            let data = JSON.parse( await localStorage.getItem(this.name) || '{}' );
            return data[k];
        },
        set: async function(k, v){
            let data = JSON.parse( localStorage.getItem(this.name) || '{}' );
            data[k] = v;
            await localStorage.setItem(this.name, JSON.stringify(data));
        }
    }
    
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

    let starModels = await CONFIG.get('starModels') || [];
    const starToggle = function(e){
        let star = $(e.target);
        let model = star.attr('data-model');
        // star.toggleClass("fa-solid fa-regular");
        star.toggleClass("active");

        $(`tr[data-model="${model}"]`).toggleClass('star');
        
        if(star.hasClass('active')){
            starModels.push(model);
        } else {
            starModels = starModels.filter(i => i !== model);
        }
        starModels = [...new Set(starModels)];
        CONFIG.set('starModels', starModels);
    }
    
    $(document).ready(async function() {
        setTime();
        let sid = '1B0lsfTAz0T2YL2-J5D3ufloYwqlJeZbdqxn06VRbTno';
        let gid = urlParams.get('gid') || 1285746717
        let url = `https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:csv&tq&gid=${gid}&range=A:D&headers=1`;
        let csvData = await readSheetTable(url)

        let jsonData = csvToJson(csvData);
        let uniqueModel = Array.from(new Map(jsonData.map(item => [item["model"]])).keys());
        let modelGroup = groupByN(Math.ceil(uniqueModel.length / 1.8), uniqueModel);

        $('div#main div.col').each((h, col) => {
            let table = $('<table>').attr({
                "class": "",
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
                let modelRowspan = (uniqueMem.length * colorGroup.length)
                table.append('<tr data-model="'+model+'" class="spacer">');

                uniqueMem.forEach((mem, j) => {
                    let memData = modelData.filter(obj => obj.mem == mem);
                    colorGroup.forEach((colors, k) => {
                        let x = (!j && !k);

                        let tr = $('<tr>').attr('data-model', model).appendTo(table);
                        tr.on('mouseover mouseout', _ => {
                            $(`tr[data-model="${model}"]`).toggleClass('isHover');
                        });
                        
                        let td_1 = $('<td>').html('<div>' + model + '</div>').attr({
                            'rowspan': !x ? 1 : modelRowspan,
                        }).appendTo(tr);
                        !x && td_1.hide();

                        x && $(`<i class="fa-solid fa-star" data-model="${model}">`).click(starToggle).appendTo(td_1);

                        let td_2 = $('<td>').text(mem).attr({
                            'rowspan': k ? 1 : colorGroup.length,
                            'style': 'display:' + (k ? 'none' : 'table-cell'),
                        }).appendTo(tr);

                        for (var l = 0; l <= 2; l++) {
                            let color = colors[l] || '';
                            let price = !color ? '' : memData.find(item => (item.mem == mem && item.color == color))?.price;
                            $('<td>').text(color).appendTo(tr);
                            $('<td>').text(price).appendTo(tr);
                        }
                    });
                });
            });
        });

        starModels.forEach((model, i) => $(`tr[data-model="${model}"] i:not(.active)`)?.click() )
    });

    let darkModeSwitcher = $('input#darkMode[type="checkbox"]');
    darkModeSwitcher.change(darkModeSwitch);
    
    let on = await CONFIG.get('darkMode');
    darkModeSwitcher.prop('checked', on == true);
    
    function darkModeSwitch(e) {
        let isChecked = this.checked;
        console.log(isChecked)
        $('body').toggleClass('darkMode', isChecked);
        CONFIG.set('darkMode', isChecked);
    }
})()
