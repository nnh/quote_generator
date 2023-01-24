function wk20230124(){
  // issue #48
  const ss = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  const targetSheets = ss.filter(x => /Total2.*/.test(x.getName()));
  targetSheets.forEach(x => _setSyoshiki(x));
}
function _setSyoshiki(sheet){
  const array = new Array(9);
  array.fill('#,##0_);(#,##0)');
  let array2 = new Array(93);
  for (let i = 0; i < 93; i++){
    array2[i] = [...array];
  }
  sheet.getRange('D5:L97').setNumberFormats(array2);
}
