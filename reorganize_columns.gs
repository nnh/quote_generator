/**
* Configuration cache class to optimize PropertiesService access
*/
class ConfigCache {
  constructor() {
    try {
      const scriptProperties = PropertiesService.getScriptProperties();
      if (!scriptProperties) {
        console.error('Failed to get script properties');
        this.isValid = false;
        return;
      }
      
      this.setupSheetName = scriptProperties.getProperty('setup_sheet_name');
      this.closingSheetName = scriptProperties.getProperty('closing_sheet_name');
      this.total2SheetName = scriptProperties.getProperty('total2_sheet_name');
      this.total3SheetName = scriptProperties.getProperty('total3_sheet_name');
      this.nameNmc = scriptProperties.getProperty('name_nmc');
      this.nameOscr = scriptProperties.getProperty('name_oscr');
      
      this.isValid = true;
    } catch (error) {
      console.error('Error initializing ConfigCache:', error.toString());
      this.isValid = false;
    }
  }
  
  hasRequiredProperties() {
    return this.isValid && this.setupSheetName && this.closingSheetName && 
           this.total2SheetName && this.total3SheetName;
  }
}

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
/**
* Total2, Total3シート
* 合計0円の列を非表示に、0円以上の列を表示にする
* @param {sheet} target_sheet シート名
* @return none
*/
function show_hidden_cols(target_sheet, configCache = null){
  try {
    if (!target_sheet) {
      console.error('Target sheet is not provided');
      return;
    }
    
    const cache = configCache || new ConfigCache();
    if (!cache.isValid) {
      console.error('Failed to get script properties');
      return;
    }
    
    // 「合計」行を取得
    const goukei_row = get_goukei_row(target_sheet, cache);
    if (!goukei_row || goukei_row <= 0) {
      console.warn('Could not find goukei row');
      return;
    }
    
    // 「合計」列を取得
    const goukei_col = get_years_target_col(target_sheet, '合計', cache);
    if (!goukei_col || goukei_col <= 0) {
      console.warn('Could not find goukei column');
      return;
    }
    
    // 「Setup」列を取得
    const add_del = new Add_del_columns(target_sheet);
    const header_t = add_del.get_setup_closing_range();
    if (!header_t) {
      console.warn('Could not get setup closing range');
      return;
    }
    
    if (!cache.setupSheetName) {
      console.error('Setup sheet name property not found');
      return;
    }
    
    const setup_idx = header_t.indexOf(cache.setupSheetName);
    if (setup_idx < 0) {
      console.warn(`Setup sheet "${cache.setupSheetName}" not found in header`);
      return;
    }
    
    const setup_col = setup_idx + 1;
    
    // 「Setup」〜「合計」の一つ前のセルまでを処理対象にする
    for (let i = setup_col; i < goukei_col; i++){
      if (i > 0 && i <= target_sheet.getLastColumn()) {
        let temp_range = target_sheet.getRange(goukei_row, i);
        const value = temp_range.getValue();
        if (typeof value === 'number') {
          value > 0 ? target_sheet.unhideColumn(temp_range) : target_sheet.hideColumn(temp_range);
        } else {
          target_sheet.hideColumn(temp_range);
        }
      }
    }
  } catch (error) {
    console.error('Error in show_hidden_cols:', error.toString());
  }
}
function total2_3_show_hidden_cols(){
  try {
    const cache = new ConfigCache();
    const target_sheets = extract_target_sheet(cache);
    if (!target_sheets || target_sheets.length === 0) {
      console.warn('No target sheets found for show_hidden_cols');
      return;
    }
    target_sheets.forEach(x => show_hidden_cols(x, cache));
  } catch (error) {
    console.error('Error in total2_3_show_hidden_cols:', error.toString());
  }
}
/**
* 引数に与えた文字列があるセルの列番号を返す。
* @param {sheet} sheet Total2/Total3を指定
* @param {string} target_str 検索する文字列
* @return {number}
*/
function get_years_target_col(sheet, target_str, configCache = null){
  try {
    if (!sheet) {
      console.error('Sheet is not provided');
      return null;
    }
    
    if (!target_str) {
      console.error('Target string is not provided');
      return null;
    }
    
    const cache = configCache || new ConfigCache();
    if (!cache.isValid || !cache.total2SheetName || !cache.total3SheetName) {
      console.error('Total2 or Total3 sheet name properties not found');
      return null;
    }
    
    const sheet_name = sheet.getName();
    const target_row = sheet_name.includes(cache.total2SheetName) ? 4 
                     : sheet_name.includes(cache.total3SheetName) ? 3 
                     : null;
    
    if (!target_row){
      console.warn(`Sheet "${sheet_name}" does not match total2 or total3 sheet names`);
      return null;
    }
    
    const lastColumn = sheet.getLastColumn();
    if (lastColumn <= 0) {
      console.error('Sheet has no columns');
      return null;
    }
    
    const target_values = sheet.getRange(target_row, 1, 1, lastColumn).getValues()[0];
    if (!target_values || target_values.length === 0) {
      console.error('Target row is empty');
      return null;
    }
    
    const target_idx = target_values.indexOf(target_str);
    return target_idx >= 0 ? target_idx + 1 : null;
  } catch (error) {
    console.error('Error in get_years_target_col:', error.toString());
    return null;
  }
}
/**
* 「合計」の行番号を返す。
* @param {sheet} sheet Total2/Total3を指定
* @return {number}
*/
function get_goukei_row(sheet, configCache = null){
  try {
    if (!sheet) {
      console.error('Sheet is not provided');
      return null;
    }
    
    const cache = configCache || new ConfigCache();
    if (!cache.isValid || !cache.total2SheetName || !cache.total3SheetName) {
      console.error('Total2 or Total3 sheet name properties not found');
      return null;
    }
    
    const sheet_name = sheet.getName();
    const target_col = sheet_name.includes(cache.total2SheetName) ? 2 
                     : sheet_name.includes(cache.total3SheetName) ? 2 
                     : null;
    
    if (!target_col){
      console.warn(`Sheet "${sheet_name}" does not match total2 or total3 sheet names`);
      return null;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 0) {
      console.error('Sheet has no rows');
      return null;
    }
    
    const target_values = sheet.getRange(1, target_col, lastRow, 1).getValues();
    if (!target_values || target_values.length === 0) {
      console.error('Target column is empty');
      return null;
    }
    
    const goukei_indices = target_values.map((x, idx) => x[0] === '合計' ? idx : null).filter(x => x !== null && x >= 0);
    
    if (goukei_indices.length === 0) {
      console.warn('Could not find "合計" in target column');
      return null;
    }
    
    return goukei_indices[0] + 1;
  } catch (error) {
    console.error('Error in get_goukei_row:', error.toString());
    return null;
  }
}
/**
* Initialize the column reorganization process
* @return {void}
*/
function initializeColumnReorganization_() {
  try {
    initial_process();
    
    filtervisible();
  } catch (error) {
    console.error('Error in initializeColumnReorganization_:', error.toString());
    throw error;
  }
}

/**
* Setup configuration cache and get target sheets
* @return {Object} Object containing cache and target_sheets
*/
function setupColumnReorganization_() {
  try {
    const cache = new ConfigCache();
    const target_sheets = extract_target_sheet(cache);
    if (!target_sheets || target_sheets.length === 0) {
      throw new Error('No target sheets found for column operations');
    }
    return { cache, target_sheets };
  } catch (error) {
    console.error('Error in setupColumnReorganization_:', error.toString());
    throw error;
  }
}

/**
* Initialize columns for all target sheets
* @param {Array} target_sheets Array of sheet objects
* @param {ConfigCache} cache Configuration cache instance
* @return {void}
*/
function initializeTargetSheetColumns_(target_sheets, cache) {
  try {
    target_sheets.forEach(x => {
      if (x) {
        new Add_del_columns(x, cache).init_cols();
      }
    });
  } catch (error) {
    console.error('Error in initializeTargetSheetColumns_:', error.toString());
    throw error;
  }
}

/**
* Get and validate trial term information
* @return {Array} Filtered trial term info for column addition
*/
function getValidTrialTermInfo_() {
  try {
    const trial_term_info = getTrialTermInfo_();
    if (!trial_term_info || !Array.isArray(trial_term_info)) {
      throw new Error('Failed to get trial term info');
    }
    
    const add_columns = trial_term_info.filter(x => x && Array.isArray(x) && x.length > 2 && x[2] > 1);
    return add_columns;
  } catch (error) {
    console.error('Error in getValidTrialTermInfo_:', error.toString());
    throw error;
  }
}

/**
* Add columns based on trial term information
* @param {Array} target_sheets Array of sheet objects
* @param {Array} add_columns Filtered trial term info for addition
* @param {ConfigCache} cache Configuration cache instance
* @return {void}
*/
function addTrialTermColumns_(target_sheets, add_columns, cache) {
  try {
    if (add_columns.length > 0) {
      target_sheets.forEach(x => {
        if (x) {
          const add_del = new Add_del_columns(x, cache);
          add_columns.forEach(y => {
            if (y && Array.isArray(y)) {
              add_del.add_target = y;
              add_del.add_cols();
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('Error in addTrialTermColumns_:', error.toString());
    throw error;
  }
}

/**
* Finalize column reorganization by hiding columns and setting filters
* @return {void}
*/
function finalizeColumnReorganization_() {
  try {
    total2_3_show_hidden_cols();
    
    filterhidden();
  } catch (error) {
    console.error('Error in finalizeColumnReorganization_:', error.toString());
    throw error;
  }
}

/**
* Trialシートの試験期間年数から列の追加削除を行う
* @param none
* @return none
*/
function total2_3_add_del_cols(){  
  try {
    initializeColumnReorganization_();
    
    const { cache, target_sheets } = setupColumnReorganization_();
    
    initializeTargetSheetColumns_(target_sheets, cache);
    
    const add_columns = getValidTrialTermInfo_();
    
    addTrialTermColumns_(target_sheets, add_columns, cache);
    
    finalizeColumnReorganization_();
  } catch (error) {
    console.error('Error in total2_3_add_del_cols:', error.toString());
  }
}
/**
* Total2, Total3シートの列構成用
* 対象のシートオブジェクトの配列を返す
* @param none
* @return {[sheet]}
*/
function extract_target_sheet(configCache = null){
  try {
    const cache = configCache || new ConfigCache();
    if (!cache.isValid) {
      console.error('Failed to get script properties');
      return [];
    }
    
    const sheet = get_sheets();
    if (!sheet) {
      console.error('Failed to get sheets');
      return [];
    }
    
    if (!cache.total2SheetName || !cache.total3SheetName) {
      console.error('Total2 or Total3 sheet name properties not found');
      return [];
    }
    
    const total_T = [cache.total2SheetName.toLowerCase(), cache.total3SheetName.toLowerCase()];
    const total_foot_T = ['', cache.nameNmc ? '_' + cache.nameNmc : '', cache.nameOscr ? '_' + cache.nameOscr : ''].filter(x => x !== null);
    
    const target_sheets = total_T.reduce((res, total) => {
      if (!total) {
        console.warn('Empty total sheet name found');
        return res;
      }
      // Total3は_nmc, _oscrが存在しない
      const sheetsToAdd = total_foot_T.filter((_, idx) => {
        return !(total === cache.total3SheetName.toLowerCase() && idx > 0);
      })
      .map(foot => {
        const sheet_key = total + foot;
        if (sheet[sheet_key]) {
          return sheet[sheet_key];
        }
        console.warn(`Sheet "${sheet_key}" not found`);
        return null; // 存在しない場合はnullを返しておく
      })
      .filter(sheetObject => sheetObject !== null);
      return res.concat(sheetsToAdd);
    }, []);
    if (target_sheets.length === 0) {
      console.warn('No target sheets found');
    }
    
    return target_sheets;
  } catch (error) {
    console.error('Error in extract_target_sheet:', error.toString());
    return [];
  }
}
