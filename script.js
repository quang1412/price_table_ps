const readSheet2json = () => {
    var id = '1B0lsfTAz0T2YL2-J5D3ufloYwqlJeZbdqxn06VRbTno';
    var gid = '897983425';
    let range = 'C1:J';
    let headers = 0
    var url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&tq&gid=${gid}&range=${range}&headers=${headers}`;
    
    return new Promise((resolve, reject) => {
        var txt = window.fetch(url).then(r => {
            if (!r.ok) {
                throw new Error(`HTTP error! status: ${r.status}`);
            } 
            return r.text();
        }).then(txt => {
            var jsonString = txt.slice(47, -2);
            return(jsonString);
        }).then(jsonStr => {
            let json = [];
            let lines = jsonStr.split("\n");
            lines.forEach(line => {
                let row = [];
                    line.split(',').forEach(col => {
                        row.push(col);
                    })
                json.push(row);
                //console.log(row);
            })
            return resolve(json) 
            
        });
        
    });
} 


async function generateHtmlTable(x = "C3:J") {
  const data = await readSheet2json()
  let htmlTable = '<table id="myTable" class="pure-table pure-table-bordered">'; 
  htmlTable += '<tbody>'; 
  for (let row = 0; row < data.length; row++) { 
    let isEmptyRow = data[row][0] == '-'; 
    if(data[row][2] == ''){
      break;
    }
    if(isEmptyRow){
      htmlTable += '<tr class="emptyRow"><td colspan="8"></td></tr>';
    }
    else{
      htmlTable += '</tr>';
        data[row].forEach((value, index) => {
            htmlTable += '<td>' + value.replaceAll('"', '') + '</td>';
        });
      htmlTable += '</tr>';
    }
  }
  htmlTable += '</tbody>';
  htmlTable += '</table>';
document.body.innerHTML = htmlTable
  return htmlTable;
}

generateHtmlTable()
