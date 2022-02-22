/**
* Setup~Closingの間で見出しが空白の行は削除する。
* @param {sheet} sheet Total2/Total3を指定
* @param {number} term_row Total2/Total3シートの年度の上の行
* @return {boolean}
*/
class Add_del_columns {
  constructor(sheet) {
    this.sheet = sheet;
    this.term_row = 2;
    this.dummy_str = '***dummy***';
  }
  /**
  * 見出し行の文字列を取得する。Setupより左、Closingより右の情報はダミー文字列に置き換える。
  */
  get_setup_closing_range(){
    const header_t = this.sheet.getRange(this.term_row, 1, 1, this.sheet.getLastColumn()).getValues()[0];
    const get_s_p = PropertiesService.getScriptProperties();
    const setup_idx = header_t.indexOf(get_s_p.getProperty('setup_sheet_name'));
    const closing_idx = header_t.indexOf(get_s_p.getProperty('closing_sheet_name'));
    if (setup_idx < 0 || closing_idx < 0){
      return;
    };
    const res = header_t.map((x, idx) => idx < setup_idx || closing_idx < idx ? this.dummy_str : x);
    return res;
  }
  /**
  * 列の初期化を行う。
  */
  init_cols(){
    this.remove_cols_without_header();
    this.remove_col();
  }
  /**
  * Setup~Closingを一列ずつにする。
  */
  remove_col(){
    // Setup、Closingの見出しがなければ処理しない
    const header_t = this.get_setup_closing_range();
    if (!header_t){
      return;
    }
    // ダミー文字列を削除
    const check_header_t = header_t.filter(x => x != this.dummy_str);
    // 見出しの重複文字列を削除
    const check_duplication = [...new Set(check_header_t)];
    // 全ての項目が一列だけなら処理しない
    if (check_header_t.length == check_duplication.length){
      return;
    }
    // 重複列の番号を降順で取得
    const duplication_cols = check_duplication.filter(x => check_header_t.filter(y => y == x).length > 1);
    let duplication_col_numbers = duplication_cols.map(x => header_t.indexOf(x) + 1);
    duplication_col_numbers.sort((x, y) => y - x);
    for (let i = duplication_col_numbers.length - 1; i >= 0; i--){
      this.sheet.deleteColumn(duplication_col_numbers[i]);
    }
    this.remove_col();
  }
  /**
  * Setup~Closingの間で見出しが空白の行は削除する。
  */
  remove_cols_without_header(){
    // Setup、Closingの見出しがなければ処理しない
    const header_t = this.get_setup_closing_range();
    if (!header_t){
      return;
    }
    // 見出しが空白の行がなければ処理しない
    if (header_t.every(x => x)){
      return;
    }
    this.sheet.deleteColumn(header_t.indexOf('') + 1);
    this.remove_cols_without_header();
  }
  /**
   * 列の追加を行う。
   */
  set add_target(target_array){
    this.target_head = target_array[0];
    this.target_columns_count = target_array[2];
  }
  add_cols(){
    // Setup、Closingの見出しがなければ処理しない
    const header_t = this.get_setup_closing_range();
    if (!header_t){
      return;
    }
    // すでに必要な列数が作成されていたら処理しない
    const columns_count = header_t.filter(x => x == this.target_head).length;
    if (columns_count >= this.target_columns_count){
      return;
    }
    const col_number = header_t.indexOf(this.target_head) + 1;
    this.sheet.insertColumnAfter(col_number);
    this.sheet.getRange(1, col_number, this.sheet.getLastRow(), 1).copyTo(this.sheet.getRange(1, col_number + 1));
    this.add_cols();
  }
}
/**
* Total2, Total3シート
* 合計0円の列を非表示に、0円以上の列を表示にする
* @param {sheet} target_sheet シート名
* @return none
*/
function show_hidden_cols(target_sheet){
  const get_s_p = PropertiesService.getScriptProperties();
  // 「合計」行を取得
  const goukei_row = get_goukei_row(target_sheet);
  // 「合計」列を取得
  const goukei_col = get_years_target_col(target_sheet, '合計');
  // 「Setup」列を取得
  const add_del = new Add_del_columns(target_sheet);
  const header_t = add_del.get_setup_closing_range();
  const setup_col = header_t.indexOf(get_s_p.getProperty('setup_sheet_name')) + 1;
  // 「Setup」〜「合計」の一つ前のセルまでを処理対象にする
  for (let i = setup_col; i < goukei_col; i++){
    let temp_range = target_sheet.getRange(goukei_row, i);
    temp_range.getValue() > 0 ? target_sheet.unhideColumn(temp_range) : target_sheet.hideColumn(temp_range);
  }
}
function total2_3_show_hidden_cols(){
  const target_sheets = extract_target_sheet();
  target_sheets.forEach(x => show_hidden_cols(x));
}
/**
* 引数に与えた文字列があるセルの列番号を返す。
* @param {sheet} sheet Total2/Total3を指定
* @param {string} target_str 検索する文字列
* @return {number}
*/
function get_years_target_col(sheet, target_str){
  const get_s_p = PropertiesService.getScriptProperties();
  const target_row =  sheet.getName().includes(get_s_p.getProperty('total2_sheet_name')) ? 4 
                    : sheet.getName().includes(get_s_p.getProperty('total3_sheet_name')) ? 3 
                    : null;
  if (!target_row){
    return;
  }
  const target_values = sheet.getRange(target_row, 1, 1, sheet.getLastColumn()).getValues()[0];
  return target_values.indexOf(target_str) + 1;
}
/**
* 「合計」の行番号を返す。
* @param {sheet} sheet Total2/Total3を指定
* @return {number}
*/
function get_goukei_row(sheet){
  const get_s_p = PropertiesService.getScriptProperties();
  const target_col =  sheet.getName().includes(get_s_p.getProperty('total2_sheet_name')) ? 2 
                    : sheet.getName().includes(get_s_p.getProperty('total3_sheet_name')) ? 2 
                    : null;
  if (!target_col){
    return;
  }
  const target_values = sheet.getRange(1, target_col, sheet.getLastRow(), 1).getValues();
  const goukei_idx = target_values.map((x, idx) => x == '合計' ? idx : null).filter(x => x > 0)[0];
  return goukei_idx + 1;
}
/**
* Trialシートの試験期間年数から列の追加削除を行う
* @param none
* @return none
*/
function total2_3_add_del_cols(){  
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  //　フィルタを解除し全行表示する
  filtervisible();
  const target_sheets = extract_target_sheet();
  const sheet = get_sheets();
  // 列を初期化する
  target_sheets.forEach(x => new Add_del_columns(x).init_cols());
  // Trialシートの試験期間、見出し、試験期間年数を取得する
  const trial_term_info = getTrialTermInfo();
  // 列の追加
  const add_columns = trial_term_info.filter(x => x[2] > 1);
  if (add_columns.length > 0){
    target_sheets.forEach(x => {
      const add_del = new Add_del_columns(x);
      add_columns.forEach(y => {
        add_del.add_target = y;
        add_del.add_cols();
      });
    });
  }
  // 合計0円の年度を非表示にする
  total2_3_show_hidden_cols();
  //　0の行を非表示にするフィルタをセット
  filterhidden();
}
/**
* Total2, Total3シートの列構成用
* 対象のシートオブジェクトの配列を返す
* @param none
* @return {[sheet]}
*/
function extract_target_sheet(){
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  const total_T = [get_s_p.getProperty('total2_sheet_name').toLowerCase(), get_s_p.getProperty('total3_sheet_name').toLowerCase()];
  const total_foot_T = ['', '_' + get_s_p.getProperty('name_nmc'), '_' + get_s_p.getProperty('name_oscr')];
  const target_sheets = total_T.reduce((res, total) => {
    total_foot_T.forEach(foot => res.push(sheet[total + foot]));
    // total2_*, total3_* 存在しないシートを対象外にする
    return res.filter(x => x != null);
  }, []);
  return target_sheets;
}
