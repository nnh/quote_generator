function checkDiscountByYearSheet_(targetSheetsName = null){
  const testValues = new SetTestValues();
  const targetSheets = targetSheetsName || testValues.getTrialYearsItemsName();
  
  if (!Array.isArray(targetSheets)) {
    throw new Error('Target sheets must be an array');
  }
  
  const results = targetSheets.map((sheetName, idx) => {
    try {
      const discountRate = testValues.getDiscountRateValue(idx);
      return checkAmountByYearSheet_(sheetName, discountRate);
    } catch (error) {
      console.error(`Error checking sheet ${sheetName} at index ${idx}: ${error.message}`);
      return false;
    }
  });
  
  if (!results.every(result => result)){
    console.log(`checkDiscountByYearSheet NG\nSheets: ${targetSheets}\nResults: ${results}`);
  }
  
  return results;
}

function isAllTrue_(target, message){
  if (!Array.isArray(target)) {
    throw new Error('Target must be an array');
  }
  
  if (typeof message !== 'string') {
    throw new Error('Message must be a string');
  }
  
  const allTrue = target.every(value => value === true);
  if (!allTrue){
    console.log(message);
  }
  return allTrue;
}

function checkAmountByYearSheet_(sheetName, discountRate){
  if (!sheetName || typeof sheetName !== 'string') {
    throw new Error('Sheet name must be a non-empty string');
  }
  
  if (typeof discountRate !== 'number') {
    throw new Error('Discount rate must be a number');
  }
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheet = spreadsheet.getSheetByName(sheetName);
  if (!targetSheet) {
    throw new Error(`Sheet '${sheetName}' not found`);
  }
  
  const rowColHelper = new GetTargetRowCol();
  
  let sumRow, sumCol, sumValue, discountValue;
  try {
    sumRow = rowColHelper.getTargetRow(targetSheet, 2, '合計');
    sumCol = rowColHelper.getTargetCol(targetSheet, 4, '金額');
    sumValue = targetSheet.getRange(sumRow, sumCol).getValue();
    discountValue = targetSheet.getRange(sumRow + 1, sumCol).getValue();
  } catch (error) {
    throw new Error(`Failed to get values from sheet '${sheetName}': ${error.message}`);
  }
  
  const expectedDiscountValue = Math.trunc(sumValue * (1 - discountRate));
  const actualDiscountValue = Math.trunc(discountValue);
  
  const hasValidSetup = spreadsheet.getSheetByName(sheetName).getRange('B2').getValue() !== '';
  const discountCheck = (discountRate >= 0 || !hasValidSetup) ? 
    expectedDiscountValue === actualDiscountValue : 
    discountValue === '';
    
  return discountCheck;
}

function checkQuoteSum_(){
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const rowColHelper = new GetTargetRowCol();
  
  const sheetNames = ['Quote', 'Total', 'Total2', 'Total3'];
  const sheets = {};
  
  for (const sheetName of sheetNames) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Required sheet '${sheetName}' not found`);
    }
    sheets[sheetName] = sheet;
  }
  
  let totalRows, totalCols;
  try {
    totalRows = {
      quote: rowColHelper.getTargetRow(sheets.Quote, 3, '小計'),
      total: rowColHelper.getTargetRow(sheets.Total, 2, '合計'),
      total2: rowColHelper.getTargetRow(sheets.Total2, 2, '合計'),
      total3: rowColHelper.getTargetRow(sheets.Total3, 2, '合計')
    };
    
    totalCols = {
      quote: rowColHelper.getTargetCol(sheets.Quote, 11, '金額'),
      total: rowColHelper.getTargetCol(sheets.Total, 4, '金額'),
      total2: rowColHelper.getTargetCol(sheets.Total2, 4, '合計'),
      total3: rowColHelper.getTargetCol(sheets.Total3, 3, '合計')
    };
  } catch (error) {
    throw new Error(`Failed to locate total rows/columns: ${error.message}`);
  }
  
  const amountValues = [
    sheets.Quote.getRange(totalRows.quote, totalCols.quote).getValue(),
    sheets.Total.getRange(totalRows.total, totalCols.total).getValue(),
    sheets.Total2.getRange(totalRows.total2, totalCols.total2).getValue(),
    sheets.Total3.getRange(totalRows.total3, totalCols.total3).getValue()
  ].map(value => value === '' ? 0 : Math.round(value));
  
  const discountValues = [
    sheets.Quote.getRange(totalRows.quote + 2, totalCols.quote).getValue(),
    sheets.Total.getRange(totalRows.total + 1, totalCols.total).getValue(),
    sheets.Total2.getRange(totalRows.total2 + 1, totalCols.total2).getValue(),
    sheets.Total3.getRange(totalRows.total3 + 1, totalCols.total3).getValue()
  ].map(value => value === '' ? 0 : Math.round(value));
  
  const amountCheck = amountValues.every(value => value === amountValues[0]);
  const discountCheck = discountValues.every(value => value === discountValues[0]);
  
  return [amountCheck, discountCheck];
}

function compareTotalSheetTotaltoVerticalTotal_(){
  const sheet = get_sheets();
  const GetRowCol = new GetTargetRowCol;
  const goukeikingakuCol = GetRowCol.getTargetCol(sheet.total, 4, '金額');
  const totalValues = sheet.total.getDataRange().getValues();
  const sum = totalValues.filter(x => x[1] == '合計')[0][goukeikingakuCol - 1];
  const arrayGoukeikingaku = totalValues.filter(x => x[goukeikingakuCol] != '' && x[goukeikingakuCol] != '　合計金額').map(x => x[goukeikingakuCol]);
  const sumGoukeikingaku = arrayGoukeikingaku.reduce((x, y) => x + y, 0); 
  return [sum == sumGoukeikingaku ? 'OK' : 'NG：値が想定と異なる', 'Totalシートの縦計と合計金額のチェック, 縦計:' +  + sumGoukeikingaku + ', 合計金額:' + sum];
}

class CompareTotal2Total3SheetVerticalTotalToHorizontal{
  constructor(){
    const st = get_sheets();
    this.discountRate = st.trial.getRange('B47').getValue();
    this.targetSheet = [[st.total2, 3],
                        [st.total3, 2]]; 
    this.GetRowCol = new GetTargetRowCol; 
    this.target = this.targetSheet.map(x => {
      let res = {};
      res.sheet = x[0];
      res.termRowIdx = x[1];
      res.setupIdx = 3
      res.totalValues = res.sheet.getDataRange().getValues();
      return res;      
    });    
  }
  getTargetRowCol(target, rowItemName, colItemName){
    let res = {}
    res.col = this.GetRowCol.getTargetColIndex(target.sheet, target.termRowIdx, colItemName);
    res.row = this.GetRowCol.getTargetRowIndex(target.sheet, 1, rowItemName);
    return res;
  }
  getVerticalHorizontalTotal(target, goukeiRowCol){
    let res = {};
    res.horizontalTotal = this.getHorizontalTotal(target, goukeiRowCol);
    res.verticalTotal = this.getVerticalTotal(target, goukeiRowCol);
    return res;
  }
  getHorizontalTotal(target, goukeiRowCol){
    const targetSum = target.totalValues[goukeiRowCol.row].slice(target.setupIdx, goukeiRowCol.col);
    return targetSum.filter(x => x > 0).reduce((x, y) => x + y, 0);  
  }
  getVerticalTotal(target, goukeiRowCol){
    return target.totalValues.filter((x, idx) => x[goukeiRowCol.col] > 0 && idx < goukeiRowCol.row).map(x => x[goukeiRowCol.col]).reduce((x, y) => x + y, 0);
  }
  compareTotal(){
    const res = this.target.map(x => {
      const goukeiRowCol = this.getTargetRowCol(x, '合計', '合計');
      const compareTarget = this.getVerticalHorizontalTotal(x, goukeiRowCol);
      return this.getComparisonResultEqual(compareTarget);
    });
    return [res.every(x => x) ? 'OK' : 'NG：値が想定と異なる', 'Total2, Total3の縦計と横計のチェック']; 
  }
  compareDiscountTotal(){
    const res = this.target.map(x => {
      let res = {};
      const goukeiRowCol = this.getTargetRowCol(x, '合計', '合計');
      res.verticalTotal = this.getVerticalTotal(x, goukeiRowCol) * (1 - this.discountRate);
      const discountRowCol = this.getTargetRowCol(x, '特別値引後合計', '合計');
      res.horizontalTotal = this.getHorizontalTotal(x, discountRowCol);
      return res;
    });
    return res.map(x => x.horizontalTotal - 1 <= x.verticalTotal && x.verticalTotal <= x.horizontalTotal + 1);     
  }
  getComparisonResultEqual(compareTarget){
    return compareTarget.horizontalTotal == compareTarget.verticalTotal;
  }
}

function compareTotal2Total3SheetVerticalTotalToHorizontalTotal_(){
  const cp = new CompareTotal2Total3SheetVerticalTotalToHorizontal;
  return cp.compareTotal();
}

function compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_(){
  const cp = new CompareTotal2Total3SheetVerticalTotalToHorizontal;
  const res = cp.compareDiscountTotal();
  return [res.every(x => x) ? 'OK' : 'NG', 'Total2, Total3の縦計*特別値引率と特別値引後合計の横計のチェック'];
}
