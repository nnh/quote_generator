/**
 * Reconfigure the Price sheet, PriceLogic sheet, and PriceLogicCompany sheet.
 */
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
  /**
   * Create an array of formulas to be set in the cell.
   * @param {Number} Row number of the referenced cell.
   * @return {Array.<string>} an array of formulas.
   */
  get setInSheetFormulaList(){
    return this._setInSheetFormulaList;
  }
  set setInSheetFormulaList(idx){
    const priceCompanyPrice = idx > 0 ? this.itemsSheet.getRange(idx, 3).getFormula().replace('Trial!$B$44', '$F$1').replace(/R(?=[1-9])/, 'Items!$R$').replace(/(?<=R\$)(\d*)/, '$1') : null;
    this._setInSheetFormulaList = [
      this.itemsSheetName + '!$A$' + idx,
      this.itemsSheetName + '!$B$' + idx,
      this.itemsSheetName + '!$R$' + idx,
      this.itemsSheetName + '!$D$' + idx,
      priceCompanyPrice,
      this.itemsSheetName + '!$D$' + idx
    ];
  }
  /**
   * Creates a two-dimensional array of formulas to be set in a cell.
   * @param {Number} Row number of the cell where the output will start.
   * @return {Array.<string>} a two-dimensional array of formulas.
   */
  getFormulasSetInSheet(startRow){
    const resArray = this.createTwoDimensionalArray(this.setInSheetFormulaList[0].length, this.arrayLastIndex).map((_, idx) => {
      this.setInSheetFormulaList = idx + startRow;
      return [...this.setInSheetFormulaList];  
    });
    return resArray;
  }
  /**
   * Creates an empty two-dimensional array of the appropriate format for the arguments of setValues.
   * @param {Number} Number of rows to output.
   * @param {Number} Number of columns to output.
   * @return {Array.<null>}
   */
  createTwoDimensionalArray(i, j){
    return [...Array(j)].map(_ => Array(i).fill(null));
  }
  /**
   * Replace the year in the title with the current year.
   * @param {Object} Range object where the title string exists. 
   * @return none.
   */
  replaceTitle(titleRange){
    const thisYear = new Date().getMonth() > 2 ? new Date().getFullYear() : new Date().getFullYear() - 1;
    const titleValue = titleRange.getValue();
    const lastYear = /20\d{2}/.exec(titleValue)[0];
    const replaceValue = titleValue.replace(lastYear, thisYear);
    titleRange.setValue(replaceValue);
  }
  getLastSignIdx(targetSheet){
    const targetColumn = 1;
    const signIdx = targetSheet.getRange(1, targetColumn, targetSheet.getLastRow(), 1).getValues().flat().indexOf('※1:');
    if (signIdx === -1){
      targetSheet.getRange(targetSheet.getLastRow() + 3, targetColumn).setValue('※1:');
      this.getLastSignIdx(targetSheet);
    }
    return signIdx;
  }
  /**
   * Returns the last row number of the deletion range.
   * @param {Object} Target sheet for row deletion.
   * @return {Number}
   */
  setDeleteLastRow(targetSheet){
    const res = this.getLastSignIdx(targetSheet);
    return res - 2;
  }
  /**
   * Delete existing rows and add rows for output.
   * @param {Object} Target Sheet for deletion and addition.
   * @param {Number} Starting row number for deletion and addition.
   * @return none.
   */
  deleteAndCopyItemsRows(targetSheet, startRow){
    const lastRow = this.setDeleteLastRow(targetSheet);
    this.arrayLastIndex = this.itemsLastRow - startRow + 1;
    targetSheet.deleteRows(startRow, lastRow - startRow + 1);
    targetSheet.insertRowsBefore(startRow, this.arrayLastIndex - 1);
  }
  /**
   * Reconfigure the sheet formulas.
   * @param {Object} Target Sheet to be reconfigured.
   * @param {Number} First row number to be reconfigured.
   * @return none.
   */
  setSheetInfo(targetSheet, startRow){
    this.deleteAndCopyItemsRows(targetSheet, startRow);
    const targetFormulas = this.getFormulasSetInSheet(startRow);
    this.reSetFormulas(targetSheet, targetFormulas, 2, 1);
  }
  /**
   * Set formulas in cells.
   * @param {Object} Sheet to reconfigure formulas.
   * @param {Array.<string>} A two-dimensional array containing the formulas to reconfigure.
   * @param {Number} First row number to be reconfigured.
   * @param {Number} First column number to be reconfigured.
   * @return none.
   */
  reSetFormulas(targetSheet, targetFormulas, startRow, startCol){
    targetSheet.getRange(startRow, startCol, targetFormulas.length, targetFormulas[0].length).setFormulas(targetFormulas);
    targetSheet.getRange(startRow, 3, targetFormulas.length, 1).setNumberFormat('#,##0');
    targetSheet.getRange(startRow, 5, targetFormulas.length, 1).setNumberFormat('#,##0');
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
      '=' + this.priceSheetName + '!$' + this.baseUnitPriceRefCol + '$' + priceIdx, 
      '=' + this.itemsSheetName + '!$D$' + idx, 
      '=' + this.itemsSheetName + '!$S$' + idx, 
      '=' + this.itemsSheetName + '!$T$' + idx, 
      '=' + this.itemsSheetName + '!$U$' + idx
    ];
  }
  /**
   * Get the referencing column from the sheet name.
   * @param {Object} The sheet to be processed for reconstruction.
   * @return {String}
   */
  get baseUnitPriceRefCol(){
    return this._baseUnitPriceRefCol;
  }
  set baseUnitPriceRefCol(targetSheet){
    this._baseUnitPriceRefCol = targetSheet.getName() === 'PriceLogic' ? 'C' : 'E';
  }
  /**
   * Reconfigure the sheet formulas.
   * @param {Object} Target Sheet to be reconfigured.
   * @param {Number} First row number to be reconfigured.
   * @param {String} Address of the cell in which the title string resides.
   * @return none.
   */
  setSheetInfo(targetSheet, startRow, titleAddress){
    this.replaceTitle(targetSheet.getRange(titleAddress));
    this.baseUnitPriceRefCol = targetSheet;
    super.setSheetInfo(targetSheet, startRow);
  }
}
function reorganizePriceSheets(){
  const priceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Price');
  priceSheet.getRange(priceSheet.getLastRow() + 3, 1).setValue('※1:');
  const outputStartRow = 3;
  const titleCellAddress = 'B1';
  const copyItemsSheet = new CopyItemsSheet();
  copyItemsSheet.setSheetInfo(priceSheet, outputStartRow);
  priceSheet.getRange(copyItemsSheet.getLastSignIdx(priceSheet) + 1, 1).clearContent();
  const copyItemsSheetPriceLogic = new CopyItemsSheetPriceLogic(priceSheet.getName());
  copyItemsSheetPriceLogic.setSheetInfo(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PriceLogic'), outputStartRow, titleCellAddress);
  copyItemsSheetPriceLogic.setSheetInfo(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PriceLogicCompany'), outputStartRow, titleCellAddress);
}