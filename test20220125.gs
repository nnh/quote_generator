function test20220125() {
  const itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Items');
  let x = 0;
  let y = 8;
  for (let i = 86; i <= 92; i++){
    x++;
    y--;
    itemsSheet.getRange(i, 2).setValue('テストitems' + i);
    itemsSheet.getRange(i, getColumnNumber('S')).setValue(parseInt(i * 100));
    itemsSheet.getRange(i, getColumnNumber('T')).setValue(x);
    itemsSheet.getRange(i, getColumnNumber('U')).setValue(y);
  }
  const yearsSheet = ['Setup',
  'Registration_1',
  'Registration_2',
  'Interim_1',
  'Observation_1',
  'Interim_2',
  'Observation_2',
  'Closing'];
  yearsSheet.forEach(x => {
    const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x);
    let arrValues = Array(8);
    arrValues.fill(1);
    const countValues = arrValues.map(x => [x]);
    targetSheet.getRange('F87:F94').setValues(countValues);
  });
  let startYear = 2022;
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(40, 4).setValue(new Date(startYear, 3, 1));
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(40, 5).setValue(new Date(startYear + 8, 2, 31));
  for (let i = 32; i <= 39; i++){
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(i, 4).setValue(new Date(startYear, 3, 1));
    startYear++;
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial').getRange(i, 5).setValue(new Date(startYear, 2, 31));
  }
  test20220125ValueCheck();
}
function test20220125ValueCheck(){
  let res = true;
  const itemsCompareValue = [[ 81000 ], [ 60000 ], [ 104000 ], [ 132000 ], [ 142000 ], [ 135000 ], [ 109000 ], [ 64000 ]];
  const itemsValue = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Items').getRange('C85:C92').getValues();
  let temp = arrayCompare(itemsValue, itemsCompareValue);
  if (temp.length > 0){
    res = false;
    console.log('items:' + temp);
    return;
  }
  const goukeiCompareValue = [[ 6616000 ], [ 6616000 ], [ 6616000 ], [ 6616000 ],
                              [ 6551200 ], [ 6551200 ], [ 6551200 ],
                              [ 64800 ], [ 64800 ], [ 64800 ]];
  const goukeiValues = [[SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quote').getRange('D32').getValue()],
                        [SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total').getRange('H96').getValue()],
                        [SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total2').getRange('L96').getValue()],
                        [SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total3').getRange('L27').getValue()],
                        [SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quote_nmc').getRange('D32').getValue()],
                        [SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total_nmc').getRange('H96').getValue()],
                        [SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total2_nmc').getRange('L96').getValue()],
                        [SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quote_oscr').getRange('D32').getValue()],
                        [SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total_oscr').getRange('H96').getValue()],
                        [SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Total2_oscr').getRange('L96').getValue()]];
  temp = arrayCompare(goukeiValues, goukeiCompareValue);
  if (temp.length > 0){
    res = false;
    console.log('quote_goukei:');
    return;
  }
  const yearsSheet = ['Setup',
  'Registration_1',
  'Registration_2',
  'Interim_1',
  'Observation_1',
  'Interim_2',
  'Observation_2',
  'Closing'];
  temp = yearsSheet.map(x => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x).getRange('H96').getValue() == 827000).filter(x => !x);
  if (temp.length > 0){
    res = false;
    console.log('quote_goukei:');
    return;
  }
  if (res){
    console.log('*** value check ok. ***')
  } else {
    console.log('!!! value check ng. !!!')
  }
}
function arrayCompare(targetList, compareList){
  return targetList.filter((x, idx) => x[0] != compareList[idx][0]); 
}
