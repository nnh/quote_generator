function myFunction() {
  const targetSheetsName = [
    'Total',
    'Total2',
    'Total_nmc',
    'Total2_nmc',
    'Total_oscr',
    'Total2_oscr',
    'Setup',
    'Registration_1',
    'Registration_2',
    'Interim_1',
    'Observation_1',
    'Interim_2',
    'Observation_2',
    'Closing'
  ];
  const itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Items');
  // 18行目を削除
  if (itemsSheet.getRange('B18').getValue() === '医師主導治験対応'){
    itemsSheet.deleteRow(18);
  }
  // 22行目から5行追加
  if (itemsSheet.getRange('B23').getValue() !== '事務局運営（試験開始後から試験終了まで）'){
    itemsSheet.insertRowsAfter(22, 5);

  }
  // 入力規則を削除する
  itemsSheet.getRange('B17').clearDataValidations();
  itemsSheet.getRange('B23:B27').clearDataValidations();
  // 項目名を設定
  const jimukyokuRule = SpreadsheetApp.newDataValidation().requireValueInList(['事務局運営（試験開始前）','事務局運営(TV会議含む)','問い合わせ対応(FPI以降)'], true);
  itemsSheet.getRange('B17').setDataValidation(jimukyokuRule);
  itemsSheet.getRange('B17').setValue('事務局運営（試験開始前）');
  const setItemNames = ['事務局運営（試験開始後から試験終了まで）', '薬剤対応', '事務局運営（試験終了時）', 'PMDA対応、照会事項対応', '監査対応'];
  const setItemUnit = ['ヶ月', '施設', '式', '式', '式'];
  const setItemColS = [65000, 65000, 65000, 65000, 65000];
  const setItemColT = [2, 1, 4, 40, 5];
  const setItemColU = [1, 1, 1, 1, 1];
  const setItemColV = [67, 67, 67, 67, 67];
  const setItemColW = [33, 33, 33, 33, 33];
  setItemNames.forEach((x, idx) => {
    const targetRow = 23 + idx;
    itemsSheet.getRange(targetRow, 2).setValue(x);
    itemsSheet.getRange(targetRow, 4).setValue(setItemUnit[idx]);
    itemsSheet.getRange(targetRow, 3).setFormula('round(R' + targetRow + '*Trial!$B$44,-3)');
    itemsSheet.getRange(targetRow, 18).setFormula('round(S' + targetRow + '*T' + targetRow + '*U' + targetRow + ',-3)');
    itemsSheet.getRange(targetRow, 19).setValue(setItemColS[idx]);
    itemsSheet.getRange(targetRow, 20).setValue(setItemColT[idx]);
    itemsSheet.getRange(targetRow, 21).setValue(setItemColU[idx]);
    itemsSheet.getRange(targetRow, 22).setValue(setItemColV[idx]);
    itemsSheet.getRange(targetRow, 23).setValue(setItemColW[idx]);
  });
  // IRB準備・承認確認の単価変更
  itemsSheet.getRange('S20').setValue(65000);
  // Total~Closing
  const targetSheets = targetSheetsName.map(x => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x)); 
  targetSheets.forEach(x => {
    // 20行目を削除
    if (x.getRange('C20').getValue() !== 'ミーティング準備・実行'){
      x.deleteRow(20);
    }
    // 24行目の下に5行追加
    if (x.getRange('C25').getValue() !== '事務局運営（試験開始後から試験終了まで）'){
      x.insertRowsAfter(24, 5);
    }
    if (!/Total2.*/.test(x.getSheetName())){
      for (let i = 0; i < 5; i++){
        const targetRow = 25 + i;
        const setRow = targetRow - 2;
//        x.getRange(targetRow, 2).setFormula('Items!A' + setRow);
//        x.getRange(targetRow, 3).setFormula('Items!B' + setRow);
//        x.getRange(targetRow, 4).setFormula('Items!C' + setRow);
//        x.getRange(targetRow, 5).setValue('x');
//        x.getRange(targetRow, 7).setFormula('Items!D' + setRow);
//        x.getRange(targetRow, 8).setFormula('IF(F' + targetRow + '="","",D' + targetRow + '*F' + targetRow + ')');
//        x.getRange(targetRow, 12).setFormula('if(F' + targetRow + '="",0,1)');
        x.getRange('C24:L24').copyTo(x.getRange('C' + targetRow + ':' + 'L' + targetRow));
        x.getRange('L18').setFormula('if(AND(H19="",H20="",H21="",H22="",H23="",H24="",H25="",H26="",H27="",H28="",H29=""),0,2)');
      }
    } else {
      for (let i = 0; i < 5; i++){
        const targetRow = 25 + i;
        x.getRange('B24:N24').copyTo(x.getRange('B' + targetRow + ':' + 'N' + targetRow));
      }
      x.getRange('N18').setFormula('if(AND(L19="",L20="",L21="",L22="",L23="",L24="",L25="",L26="",L27="",L28="",L29=""),0,2)');
    }
  });
}
