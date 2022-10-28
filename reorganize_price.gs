class CopyItemsSheet{
  constructor(){
    const sheetName = PropertiesService.getScriptProperties().getProperty('items_sheet_name');
    this.itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    this.itemsLastRow = this.itemsSheet.getLastRow();  // 「合計」を削除する処理を入れる
    this.setInSheetFormulaList = 0;
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
    const resArray = this.createTwoDimensionalArray(6, this.itemsLastRow).map((_, idx) => {
      this.setInSheetFormulaList = idx + startRow;
      return [...this.setInSheetFormulaList];  
    });
    return resArray;
  }
  createTwoDimensionalArray(i, j){
    return [...Array(j)].map(_ => Array(i).fill(null));
  }
  deleteAndCopyItemsRows(targetSheet, startRow){
    const lastRow = targetSheet.getLastRow();
    targetSheet.deleteRows(startRow, lastRow - startRow + 1);
    targetSheet.insertRowsBefore(startRow, this.itemsLastRow);
  }
  setSheetInfo(targetSheet, startRow){
    this.deleteAndCopyItemsRows(targetSheet, startRow);
    return this.getFormulasSetInSheet(startRow);
  }
}
function reorganizePriceSheet(){
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Price');
  const priceFormulas = new CopyItemsSheet().setSheetInfo(targetSheet, 3);
  targetSheet.getRange(2, 1, priceFormulas.length, priceFormulas[0].length).setFormulas(priceFormulas);
}