class CopyItemsSheet{
  constructor(){
    const sheetName = PropertiesService.getScriptProperties().getProperty('items_sheet_name');
    this.itemsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    this.itemsLastRow = this.itemsSheet.getLastRow();
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
//    let resArray = [...Array(this.itemsLastRow)].map(_ => Array(6).fill(null));
    let resArray = this.createTwoDimensionalArray(6, this.itemsLastRow);
    for (let i = 3; i < this.itemsLastRow; i++){
      resArray[i - 3][0] = 'Items!A' + i;
      resArray[i - 3][1] = 'Items!B' + i;      
      resArray[i - 3][2] = 'Items!R' + i;      
      resArray[i - 3][3] = 'Items!D' + i;      
      resArray[i - 3][4] = 'IF(Items!R' + i + '="","",Items!R' + i + '*F$1)';      
      resArray[i - 3][5] = 'Items!D' + i;      
    }
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