/**
 * Column Operations Module (column-operations.gs)
 * 
 * This module provides the core functionality for adding, removing, and reorganizing columns
 * in Google Sheets. It includes batch processing optimizations for improved performance.
 * 
 * Classes:
 * - Add_del_columns: Handles column addition, deletion, and batch operations
 * 
 * Dependencies: 
 * - ConfigCache (from config-cache.gs)
 * - Google Apps Script Sheet API
 */

/**
* Setup~Closingの間で見出しが空白の行は削除する。
* @param {sheet} sheet Total2/Total3を指定
* @param {number} term_row Total2/Total3シートの年度の上の行
* @return {boolean}
*/
class Add_del_columns {
  constructor(sheet, configCache = null) {
    this.sheet = sheet;
    this.term_row = 2;
    this.dummy_str = '***dummy***';
    this.configCache = configCache || new ConfigCache();
  }
  /**
  * 見出し行の文字列を取得する。Setupより左、Closingより右の情報はダミー文字列に置き換える。
  */
  get_setup_closing_range(){
    try {
      if (!this.sheet) {
        console.error('Sheet is not defined');
        return null;
      }
      
      const lastColumn = this.sheet.getLastColumn();
      if (lastColumn <= 0) {
        console.error('Sheet has no columns');
        return null;
      }
      
      const header_t = this.sheet.getRange(this.term_row, 1, 1, lastColumn).getValues()[0];
      if (!header_t || header_t.length === 0) {
        console.error('Header row is empty');
        return null;
      }
      
      if (!this.configCache.isValid) {
        console.error('ConfigCache is not valid');
        return null;
      }
      
      if (!this.configCache.hasRequiredProperties()) {
        console.error('Setup or Closing sheet name property is not set');
        return null;
      }
      
      const setup_idx = header_t.indexOf(this.configCache.setupSheetName);
      const closing_idx = header_t.indexOf(this.configCache.closingSheetName);
      
      if (setup_idx < 0 || closing_idx < 0){
        console.warn(`Setup sheet (${this.configCache.setupSheetName}) or Closing sheet (${this.configCache.closingSheetName}) not found in header`);
        return null;
      }
      
      const res = header_t.map((x, idx) => idx < setup_idx || closing_idx < idx ? this.dummy_str : x);
      return res;
    } catch (error) {
      console.error('Error in get_setup_closing_range:', error.toString());
      return null;
    }
  }
  /**
  * 列の初期化を行う。
  */
  init_cols(){
    try {
      this.remove_cols_without_header();
      this.remove_col();
    } catch (error) {
      console.error('Error in init_cols:', error.toString());
    }
  }
  /**
  * Setup~Closingを一列ずつにする。
  */
  remove_col(){
    try {
      // Setup、Closingの見出しがなければ処理しない
      const header_t = this.get_setup_closing_range();
      if (!header_t){
        return;
      }
      
      // ダミー文字列を削除
      const check_header_t = header_t.filter(x => x != this.dummy_str);
      if (check_header_t.length === 0) {
        console.warn('No valid headers found after filtering dummy strings');
        return;
      }
      
      // 見出しの重複文字列を削除
      const check_duplication = [...new Set(check_header_t)];
      // 全ての項目が一列だけなら処理しない
      if (check_header_t.length == check_duplication.length){
        return;
      }
      
      // 重複列の番号を降順で取得
      const duplication_cols = check_duplication.filter(x => check_header_t.filter(y => y == x).length > 1);
      if (duplication_cols.length === 0) {
        return;
      }
      
      let duplication_col_numbers = duplication_cols.map(x => {
        const idx = header_t.indexOf(x);
        let removeColIndexes = [];
        for (let col = idx + 1; col <= header_t.length; col++) {
          if (x === header_t[col]) {
            removeColIndexes.push(col);
          } else {
            break;
          }
        }
        return(removeColIndexes);
      }).flat();
      
      if (duplication_col_numbers.length === 0) {
        console.warn('No valid column numbers found for deletion');
        return;
      }
      
      duplication_col_numbers.sort((x, y) => y - x);
      
      const batchGroups = this._groupConsecutiveColumns(duplication_col_numbers, false);
      
      batchGroups.forEach(group => {
        const startCol = group.start - group.count + 1;
        if (startCol > 0 && startCol <= this.sheet.getLastColumn()) {
          this.sheet.deleteColumns(startCol, group.count);
        } else {
          console.warn(`Invalid column range for batch deletion: start=${startCol}, count=${group.count}`);
        }
      });      
    } catch (error) {
      console.error('Error in remove_col:', error.toString());
    }
  }
  /**
  * Setup~Closingの間で見出しが空白の行は削除する。
  */
  remove_cols_without_header(){
    try {
      // Setup、Closingの見出しがなければ処理しない
      const header_t = this.get_setup_closing_range();
      if (!header_t){
        return;
      }
      
      // 見出しが空白の行がなければ処理しない
      if (header_t.every(x => x)){
        return;
      }
      
      // Collect all empty column indices
      const emptyColumns = [];
      header_t.forEach((header, index) => {
        if (header === '') {
          emptyColumns.push(index + 1);
        }
      });
      
      if (emptyColumns.length === 0) {
        return;
      }
      
      const batchGroups = this._groupConsecutiveColumns(emptyColumns, true);
      
      batchGroups.reverse().forEach(group => {
        if (group.start > 0 && group.start <= this.sheet.getLastColumn()) {
          this.sheet.deleteColumns(group.start, group.count);
        } else {
          console.warn(`Invalid column range for batch deletion: start=${group.start}, count=${group.count}`);
        }
      });
    } catch (error) {
      console.error('Error in remove_cols_without_header:', error.toString());
    }
  }
  /**
   * 列の追加を行う。
   */
  set add_target(target_array){
    try {
      if (!target_array || !Array.isArray(target_array) || target_array.length < 3) {
        console.error('Invalid target_array provided to add_target setter');
        return;
      }
      this.target_head = target_array[0];
      this.target_columns_count = target_array[2];
      
      if (!this.target_head || typeof this.target_columns_count !== 'number' || this.target_columns_count <= 0) {
        console.error('Invalid target_head or target_columns_count in target_array');
        this.target_head = null;
        this.target_columns_count = null;
      }
    } catch (error) {
      console.error('Error in add_target setter:', error.toString());
      this.target_head = null;
      this.target_columns_count = null;
    }
  }
  add_cols(){
    try {
      // Setup、Closingの見出しがなければ処理しない
      const header_t = this.get_setup_closing_range();
      if (!header_t){
        return;
      }
      
      if (!this.target_head || !this.target_columns_count) {
        console.error('Target head or columns count not set');
        return;
      }
      
      // すでに必要な列数が作成されていたら処理しない
      const columns_count = header_t.filter(x => x == this.target_head).length;
      if (columns_count >= this.target_columns_count){
        return;
      }
      
      const target_idx = header_t.indexOf(this.target_head);
      if (target_idx < 0) {
        console.warn(`Target header "${this.target_head}" not found`);
        return;
      }
      
      const col_number = target_idx + 1;
      if (col_number <= 0 || col_number > this.sheet.getLastColumn()) {
        console.error(`Invalid column number: ${col_number}`);
        return;
      }
      
      // Calculate how many columns need to be added
      const columns_to_add = this.target_columns_count - columns_count;
      if (columns_to_add <= 0) {
        return;
      }
      
      // Batch insert all needed columns at once
      this.sheet.insertColumnsAfter(col_number, columns_to_add);
      
      // Copy the source column to all newly inserted columns
      const lastRow = this.sheet.getLastRow();
      if (lastRow > 0) {
        const sourceRange = this.sheet.getRange(1, col_number, lastRow, 1);
        for (let i = 1; i <= columns_to_add; i++) {
          const targetRange = this.sheet.getRange(1, col_number + i, lastRow, 1);
          sourceRange.copyTo(targetRange);
        }
      }
    } catch (error) {
      console.error('Error in add_cols:', error.toString());
    }
  }
  /**
   * Groups consecutive column numbers for batch operations
   * @param {Array<number>} columnNumbers Array of column numbers to group
   * @param {boolean} ascending Whether to group in ascending order (for insertions) or descending (for deletions)
   * @return {Array<{start: number, count: number}>} Array of batch groups
   */
  _groupConsecutiveColumns(columnNumbers, ascending = true) {
    if (columnNumbers.length === 0) return [];
    
    const sorted = ascending ? 
      [...columnNumbers].sort((a, b) => a - b) : 
      [...columnNumbers].sort((a, b) => b - a);
    
    const groups = [];
    let currentGroup = { start: sorted[0], count: 1 };
    
    for (let i = 1; i < sorted.length; i++) {
      const expected = ascending ? 
        currentGroup.start + currentGroup.count : 
        currentGroup.start - currentGroup.count;
      
      if (sorted[i] === expected) {
        currentGroup.count++;
      } else {
        groups.push(currentGroup);
        currentGroup = { start: sorted[i], count: 1 };
      }
    }
    groups.push(currentGroup);
    
    return groups;
  }
}
