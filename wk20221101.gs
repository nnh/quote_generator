function myFunction() {
  const itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Items');
  const priceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Price');
  // Itemsは3行めから
  const itemsValues = itemsSheet.getDataRange().getValues().filter((_, idx) => idx > 1 && idx < 96);
  // Priceは2行目から
  const priceValues = priceSheet.getDataRange().getValues().filter((_, idx) => idx > 0);
  let checkList = [];
  // ItemsとPriceを比較
  // 見出し items!AとPrice!A
  checkList.push(checkEqual(itemsValues, priceValues, 0, 0));
  // 項目名 items!BとPrice!B
  checkList.push(checkEqual(itemsValues, priceValues, 1, 1));
  // 原資が税金
  // 　単価 items!CとPrice!C
  checkList.push(checkEqual(itemsValues, priceValues, 2, 2));
  // 　単位 items!DとPrice!D
  checkList.push(checkEqual(itemsValues, priceValues, 3, 3));
  // 原資が企業
  // 　単価 items!CとPrice!E
  const itemsValueForCompany = itemsValues.map((x, idx) => {
    let res = x;
    if (res[2] > 0){
      // 監査とかは*1.5しない
      const checkFormula = itemsSheet.getRange(idx + 3, 3).getFormula();
      if (/round/i.test(checkFormula)){
        res[2] = roundLower3Digits(res[2] * 1.5);
      }
    } 
    return res;
  });
  checkList.push(checkEqual(itemsValueForCompany, priceValues, 2, 4));
  // 　単位 items!DとPrice!F
  checkList.push(checkEqual(itemsValues, priceValues, 3, 5));
  // PriceとPriceLogicを比較
  const logicSheets = ['PriceLogicCompany', 'PriceLogic'].map(x => SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x));
  logicSheets.forEach(sheet => {
    // 2行目から
    const priceLogicValues = sheet.getDataRange().getValues().filter((_, idx) => idx > 0 && idx < 95);
    // 見出し、項目名、単価
    checkList.push(checkEqual(priceLogicValues, priceValues, 0, 0));
    checkList.push(checkEqual(priceLogicValues, priceValues, 1, 1));
    const colIdx = sheet.getName() === 'PriceLogicCompany' ? 4 : 2 ;
    checkList.push(checkEqual(priceLogicValues, priceValues, 2, colIdx));
    // 人日単価、日数、人数
    checkList.push(checkEqual(priceLogicValues, itemsValues, 4, 18));
    checkList.push(checkEqual(priceLogicValues, itemsValues, 5, 19));
    checkList.push(checkEqual(priceLogicValues, itemsValues, 6, 20));

  });
  console.log(checkList);
  if (checkList.every(x => x)){
    console.log('check OK.');    
  } else {
    console.log('check NG.');    
  }
}
function checkEqual(df1, df2, colIdx1, colIdx2){
  const check1 = df1.map(x => x[colIdx1]);
  const check2 = df2.map(x => x[colIdx2]);
  const res = JSON.stringify(check1) === JSON.stringify(check2);
  if (!res){
    const reCheck = check1.map((x, idx) => x !== check2[idx] ? df1[idx][1] + '|' + x + '|' + check2[idx] : null).filter(x => x);
    console.log('error:' + reCheck);
  }
  return res;
}
function roundLower3Digits(target) {
  // Rounded to the nearest thousand yen.
  return target > 1000 ? Math.round(target / 1000) * 1000 : target;
}