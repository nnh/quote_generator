class CopyItemsSheet{
  constructor(){
    const sheetName = PropertiesService.getScriptProperties().getProperty('items_sheet_name');
    this.itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    this.itemsLastRow = this.itemsSheet.getLastRow();
  }
  get priceFormulaList(){
    return this._priceFormulaList;
  }
  set priceFormulaList(idx){
    this._priceFormulaList = [
      'Items!A' + idx,
      'Items!B' + idx,
      'Items!R' + idx,
      'Items!D' + idx,
      'IF(Items!R' + idx + '="","",Items!R' + idx + '*F$1)',
      'Items!D' + idx
    ];
  }
  setPriceFormulas(){
    // Price
    // 2行目以降をクリアする
    // setformulas
      // A列に'Items!A' + targetRow + 1
      // B列に'Items!B' + targetRow + 1
      // C列に'Items!R' + targetRow + 1
      // D列に'Items!D' + targetRow + 1
      // E列に'IF(Items!R' + targetRow + '="","",Items!R' + targetRow + '*F$1)'
      // F列に'Items!D' + targetRow + 1
    const resArray = this.createTwoDimensionalArray(6, this.itemsLastRow).map((_, idx) => {
      this.priceFormulaList = idx + 3;
      return [...this.priceFormulaList];  
    });
    return resArray;
  }
  createTwoDimensionalArray(i, j){
    return [...Array(j)].map(_ => Array(i).fill(null));
  }
}
function tst(){
  const copyItemsSheet = new CopyItemsSheet();
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Price');
  const lastRow = targetSheet.getLastRow();
  targetSheet.deleteRows(3, lastRow - 3);
  targetSheet.insertRowsBefore(3, copyItemsSheet.itemsLastRow);
  const priceFormulas = new CopyItemsSheet().setPriceFormulas();
  targetSheet.getRange(2, 1, priceFormulas.length, priceFormulas[0].length).setFormulas(priceFormulas);
}