class CopyItemsSheet{
  constructor(){
    const sheetName = PropertiesService.getScriptProperties().getProperty('items_sheet_name');
    this.itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    this.itemsLastRow = this.itemsSheet.getRange(1, 1, this.itemsSheet.getLastRow(), 1).getValues().flat().indexOf('合計');
    this.setInSheetFormulaList = 0;
    this.arrayLastIndex = 0;
  }
  get setInSheetFormulaList(){
    return this._setInSheetFormulaList;
  }
  set setInSheetFormulaList(idx){
    this._setInSheetFormulaList = [
      'Items!A' + idx,
      'Items!B' + idx,
      'Items!R' + idx,
      'Items!D' + idx,
      'IF(Items!R' + idx + '="","",Items!R' + idx + '*F$1)',
      'Items!D' + idx
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
  deleteAndCopyItemsRows(targetSheet, startRow, lastRow = targetSheet.getLastRow()){
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
  constructor(){
    super(CopyItemsSheet);
    // A列が'※1:'の行の2行上まで削除してItemsと同じ行数を挿入する
  }
  get setInSheetFormulaList(){
    return this._setInSheetFormulaList;
  }
  set setInSheetFormulaList(idx){
    this._setInSheetFormulaList = [
      '=Items!A' + idx, 
      '=Items!B' + idx, 
      '=Items!R' + idx, 
      '=Items!D' + idx, 
      '=Items!S' + idx, 
      '=Items!T' + idx, 
      '=Items!U' + idx
    ];
  }
  setSheetInfo(targetSheet, startRow){
    this.deleteAndCopyItemsRows(targetSheet, startRow, 66);
    return this.getFormulasSetInSheet(startRow);
  }
}
function reorganizePriceLogicSheet(){
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PriceLogic');
  const priceFormulas = new CopyItemsSheetPriceLogic().setSheetInfo(targetSheet, 3);
  targetSheet.getRange(2, 1, priceFormulas.length, priceFormulas[0].length).setFormulas(priceFormulas);
}
function reorganizePriceSheet(){
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Price');
  const priceFormulas = new CopyItemsSheet().setSheetInfo(targetSheet, 3);
  targetSheet.getRange(2, 1, priceFormulas.length, priceFormulas[0].length).setFormulas(priceFormulas);
}