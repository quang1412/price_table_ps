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

	const setTime = function(){
		const today = new Date(); 
		const formattedDateVN = today.toLocaleDateString('vi-VN');
		console.log(formattedDateVN); 
		$('span#date')?.text(formattedDateVN);
	
	}
  $(document).ready(async function() {
	setTime();
    let sid = '1B0lsfTAz0T2YL2-J5D3ufloYwqlJeZbdqxn06VRbTno';
    let gid = urlParams.get('gid') || 1074479198
    let headers = 0
   
		let range = 'A2:H';
    let url = `https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:html&tq&gid=${gid}&range=${range}&headers=${headers}`;
    let htmlTable1 = window.location.protocol == 'file:' ? testdata() : await readSheetTable(url);
		
    let range2 = 'J2:Q';
    let url2 = `https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:html&tq&gid=${gid}&range=${range2}&headers=${headers}`;
		let htmlTable2 = window.location.protocol == 'file:' ? testdata() : await readSheetTable(url2);
   
    document.querySelector('div#col1').innerHTML = htmlTable1;
		document.querySelector('div#col2').innerHTML = htmlTable2;
	
    mergeCols();
  });

  function mergeCols() {
    let lastTd;
    let rowSpan = 1;
    $('table tr td:first-child').each((i, td) => {
      let tr = $(td).closest('tr')[0]
      let text = td.textContent;
      if (text == '-') tr.classList.add('emptyRow');
      if (text == '\u00a0') {
        rowSpan += 1;
        lastTd.setAttribute('rowspan', rowSpan);
        $(td).hide();
      } else {
        rowSpan = 1;
        lastTd = td;
      }
    });

    let lastTd2;
    let rowSpan2 = 1;
    $('table tr td:nth-child(2)').each((i, td) => {
      let tr = $(td).closest('tr')[0]
      let text = td.textContent;
      if (text == '\u00a0') {
        rowSpan2 += 1;
        lastTd2.setAttribute('rowspan', rowSpan2);
        $(td).hide();
      } else {
        rowSpan2 = 1;
        lastTd2 = td;
      }
    });

    $('table tr td').each((i, td) => {
      let text = td.textContent;
      if (text !== '\u00a0') {
        td.innerHTML = `<div>${text}</div>`;
      }
    });

    // $(document.body).show();
  }
})();
