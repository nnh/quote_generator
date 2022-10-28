function test20221028() {
  const inputSheetsName = [
    'Setup',
    'Registration_1',
    'Registration_2',
    'Interim_1',
    'Observation_1',
    'Interim_2',
    'Observation_2',
    'Closing'
  ];
  const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial');
  trialSheet.getRange('B28').setValue(100);
  trialSheet.getRange('B29').setValue(50);
  trialSheet.getRange('B30').setValue(1000);
  trialSheet.getRange('D32').setValue('2022/4/1');
  trialSheet.getRange('D33').setValue('2023/4/1');
  trialSheet.getRange('D34').setValue('2024/4/1');
  trialSheet.getRange('D35').setValue('2025/4/1');
  trialSheet.getRange('D36').setValue('2026/4/1');
  trialSheet.getRange('D37').setValue('2027/4/1');
  trialSheet.getRange('D38').setValue('2028/4/1');
  trialSheet.getRange('D39').setValue('2029/4/1');
  trialSheet.getRange('E32').setValue('2023/3/31');
  trialSheet.getRange('E33').setValue('2024/3/31');
  trialSheet.getRange('E34').setValue('2025/3/31');
  trialSheet.getRange('E35').setValue('2026/3/31');
  trialSheet.getRange('E36').setValue('2027/3/31');
  trialSheet.getRange('E37').setValue('2028/3/31');
  trialSheet.getRange('E38').setValue('2029/3/31');
  trialSheet.getRange('E39').setValue('2030/3/31');
  inputSheetsName.forEach(x => {
    const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x);
    for (let i = 6; i < 88; i++){
      if (targetSheet.getRange(i, 4).getValue() > 0){
        targetSheet.getRange(i, 6).setValue(2);
      }
    }
  });
}
// 試験事務局業務の項目修正を行う
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
        if (/Total($|_)/.test(x.getSheetName())){
          const targetRow = 24;
          x.getRange('F24').setFormula('Setup!$F' + targetRow + '*Trial!$C$32+Registration_1!$F' + targetRow + '*Trial!$C$33+Registration_2!$F' + targetRow + '*Trial!$C$34+Interim_1!$F' + targetRow + '*Trial!$C$35+Observation_1!$F' + targetRow + '*Trial!$C$36+Interim_2!$F' + targetRow + '*Trial!$C$37+Observation_2!$F' + targetRow + '*Trial!$C$38+Closing!$F' + targetRow + '*Trial!$C$39');
          x.getRange('L18').setFormula('=if(AND(H19=0,H20=0,H21=0,H22=0,H23=0,H24=0,H25=0,H26=0,H27=0,H28=0,H29=0),0,2)');
          x.getRange('I18').setFormula('=sum(H19:H29)')
        } else {
          x.getRange('L18').setFormula('if(AND(H19="",H20="",H21="",H22="",H23="",H24="",H25="",H26="",H27="",H28="",H29=""),0,2)');
        }
      for (let i = 0; i < 5; i++){
        const targetRow = 25 + i;
        const copyFromRow = targetRow - 1;
        x.getRange('C' + copyFromRow + ':L' + copyFromRow).copyTo(x.getRange('C' + targetRow + ':' + 'L' + targetRow));
        SpreadsheetApp.flush();
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
