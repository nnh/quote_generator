function wk20230316(){
/*
  Total
    Total!D98をclear()
    Total!H98にsetFormula('=H96*(1+Trial!$B$45)')
    Total!L98にsetFormula('=if(H96<>H98, 1, 0')
  Total2
    Total2!D98:L98にsetFormula => =if(D96 <> "", D96*(1+Trial!$B$45), "") 列は該当列に変更する。
    Total2!N98にsetFormula('=if(L96<>L98, 1, 0') 
*/
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const total = ss.getSheetByName('Total');
  total.getRange('D98').clear();
  total.getRange('H98').setFormula('=H96*(1+Trial!$B$45)');
  total.getRange('L98').setFormula('=if(H96<>H98, 1, 0)');
  const total2 = ss.getSheetByName('Total2');
  ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].forEach(colName => {
    total2.getRange(`${colName}98`).setFormula(`if(${colName}96 <> "", ${colName}96*(1+Trial!$B$45), "")`);
  });
  total2.getRange('N98').setFormula('=if(L96<>L98, 1, 0)');
  total2.getRange('N97').copyTo(total2.getRange('N98'), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
}
