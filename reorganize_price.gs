class CopyItemsSheet{
  constructor(){
    this.itemsSheetName = PropertiesService.getScriptProperties().getProperty('items_sheet_name');
    if (this.itemsSheetName === null){
      initial_process(); 
      this.itemsSheetName = PropertiesService.getScriptProperties().getProperty('items_sheet_name');
    }
    this.itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.itemsSheetName);
    this.itemsLastRow = this.itemsSheet.getRange(1, 1, this.itemsSheet.getLastRow(), 1).getValues().flat().indexOf('合計');
    this.setInSheetFormulaList = 0;
    this.arrayLastIndex = 0;
  }
  get setInSheetFormulaList(){
    return this._setInSheetFormulaList;
  }
  set setInSheetFormulaList(idx){
    this._setInSheetFormulaList = [
      this.itemsSheetName + '!$A$' + idx,
      this.itemsSheetName + '!$B$' + idx,
      this.itemsSheetName + '!$R$' + idx,
      this.itemsSheetName + '!$D$' + idx,
      'IF(' + this.itemsSheetName + '!$R$' + idx + '="","",' + this.itemsSheetName + '!$R$' + idx + '*F$1)',
      this.itemsSheetName + '!$D$' + idx
    ];
  }
  getFormulasSetInSheet(startRow){
    const resArray = this.createTwoDimensionalArray(6, this.arrayLastIndex).map((_, idx) => {
      this.setInSheetFormulaList = idx + startRow;
      return [...this.setInSheetFormulaList];  
    });
    return resArray;
  }
  createTwoDimensionalArray(i, j){
    return [...Array(j)].map(_ => Array(i).fill(null));
  }
  replaceTitle(titleRange){
    const thisYear = new Date().getMonth() > 2 ? new Date().getFullYear() : new Date().getFullYear() - 1;
    const titleValue = titleRange.getValue();
    const lastYear = /20\d{2}/.exec(titleValue)[0];
    const replaceValue = titleValue.replace(lastYear, thisYear);
    titleRange.setValue(replaceValue);
  }
  setDeleteLastRow(targetSheet){
    return targetSheet.getLastRow();
  }
  deleteAndCopyItemsRows(targetSheet, startRow){
    const lastRow = this.setDeleteLastRow(targetSheet);
    this.arrayLastIndex = this.itemsLastRow - startRow + 1;
    targetSheet.deleteRows(startRow, lastRow - startRow + 1);
    targetSheet.insertRowsBefore(startRow, this.arrayLastIndex);
  }
  setSheetInfo(targetSheet, startRow){
    this.deleteAndCopyItemsRows(targetSheet, startRow);
    return this.getFormulasSetInSheet(startRow);
  }
}
class CopyItemsSheetPriceLogic extends CopyItemsSheet{
  constructor(priceSheetName){
    super(CopyItemsSheet);
    this.priceSheetName = priceSheetName;
  }
  get setInSheetFormulaList(){
    return this._setInSheetFormulaList;
  }
  set setInSheetFormulaList(idx){
    const priceIdx = idx - 1;
    this._setInSheetFormulaList = [
      '=' + this.itemsSheetName + '!$A$' + idx, 
      '=' + this.itemsSheetName + '!$B$' + idx, 
      '=' + this.priceSheetName + '!$' + this.baseUnitPriceRefCol + '$' + priceIdx, // ここをPrice!C列から持ってきたらいい、カンパニーならE列からとる 
      '=' + this.itemsSheetName + '!$D$' + idx, 
      '=' + this.itemsSheetName + '!$S$' + idx, 
      '=' + this.itemsSheetName + '!$T$' + idx, 
      '=' + this.itemsSheetName + '!$U$' + idx
    ];
  }
  get baseUnitPriceRefCol(){
    return this._baseUnitPriceRefCol;
  }
  set baseUnitPriceRefCol(targetSheet){
    this._baseUnitPriceRefCol = targetSheet.getName() === 'PriceLogic' ? 'C' : 'E';
  }
  setDeleteLastRow(targetSheet){
    const res = targetSheet.getRange(1, 1, targetSheet.getLastRow(), 1).getValues().flat().indexOf('※1:');
    return res - 2;
  }
  setSheetInfo(targetSheet, startRow, titleAddress){
    this.replaceTitle(targetSheet.getRange(titleAddress));
    this.baseUnitPriceRefCol = targetSheet;
    return super.setSheetInfo(targetSheet, startRow);
  }
}
function reorganizePriceLogicCompanySheet(){
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PriceLogicCompany');
  const priceFormulas = new CopyItemsSheetPriceLogic('Price').setSheetInfo(targetSheet, 3, 'B1');
  targetSheet.getRange(2, 1, priceFormulas.length, priceFormulas[0].length).setFormulas(priceFormulas);
}
function reorganizePriceLogicSheet(){
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PriceLogic');
  const priceFormulas = new CopyItemsSheetPriceLogic('Price').setSheetInfo(targetSheet, 3, 'B1');
  targetSheet.getRange(2, 1, priceFormulas.length, priceFormulas[0].length).setFormulas(priceFormulas);
}
function reorganizePriceSheet(){
  const priceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Price');
  const priceFormulas = new CopyItemsSheet().setSheetInfo(priceSheet, 3);
  targetSheet.getRange(2, 1, priceFormulas.length, priceFormulas[0].length).setFormulas(priceFormulas);
}