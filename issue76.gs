function myFunction() {
  const targetSheetName = [
    'Setup', 
    'Registration_1', 
    'Registration_2', 
    'Interim_1', 
    'Observation_1', 
    'Interim_2', 
    'Observation_2', 
    'Closing',
    'Total'
  ];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  targetSheetName.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow === 97){
      sheet.insertRowBefore(lastRow);
    }
    sheet.getRange('B98:C98').breakApart();
    sheet.getRange('C98').setFontWeight(null);
    sheet.getRange(97, 2, 2, 2).setValues(
      [
	      ['割引後合計', ''],
	      ['合計', '（税込）'],
      ]
    );
    sheet.getRange('H97').setFormula('=H96*(1-Trial!$B$47)');
    sheet.getRange('H98').setFormula('=H97*(1+Trial!$B$45)');
    sheet.getRange('L97:L98').setFormulas([['=if(Trial!$B$47=0,0,1)'], ['=if(H96<>H98, 1, 0)']]);
  });
  const total2 = ss.getSheetByName('Total2');
  const total2TargetRange = total2.getRange('D98:L98');
  const targetFormulas = total2TargetRange.getFormulas();
  const replaceFormulas = targetFormulas[0].map(x => x.replaceAll('96', '97'));
  total2TargetRange.setFormulas([replaceFormulas]);
}
