/**
* 「合計」の列または行の番号を返す
* @param {sheet} sheet 対象シート
* @param {boolean} target true:列, false:行
* @param {number} header_row 見出し行の番号
* @param {number} header_col 見出し列の番号
* @return number
*/
function get_col_row_number(sheet, target, header_row, header_col){
  var last_col = 1;
  var last_row = 1;
  if (target){
    last_col = sheet.getLastColumn();
  } else {
    last_row = sheet.getLastRow();
  }
  var temp_header = sheet.getRange(header_row, header_col, last_row, last_col).getValues();
  var header = [];
  if (!target){
    temp_header.map(function(x){ this.push(x[0]); }, header);
  } else {
    header = temp_header[0];
  }
  var sum_col_row = header.map(function(x, idx){
    if (x == '合計'){
      return(idx);
    }
  });
  sum_col_row = sum_col_row.filter(Boolean)[0];
  if (target){
    return(sum_col_row + header_col);
  } else {
    return(sum_col_row + header_row);
  }
}
/**
* Total2, Total3シート
* 合計0円の列を非表示に、0円以上の列を表示にする
* @param {sheet} target_sheet シート名
* @param {number} start_col setup列の番号
* @param {number} header_row 見出し行の番号
* @param {number} header_col 見出し列の番号
* @return none
*/
function show_hidden_cols(target_sheet, start_col, header_row, header_col){
  // 「合計」列を取得
  const sum_col = get_col_row_number(target_sheet, true, header_row, header_col);
  // 合計列の前までを処理範囲にする
  const last_col = sum_col - start_col;
  // 「合計」行を取得
  const sum_row = get_col_row_number(target_sheet, false, header_row, header_col);
  // 「合計」行が0より大きい数値の場合のみ表示
  const target_sum_rows = target_sheet.getRange(sum_row, start_col, 1, last_col);
  const sum_row_values = target_sum_rows.getValues();
  for (var i = 0; i < last_col; i++){
    if (target_sum_rows.offset(0, i, 1, 1).getValue() > 0){
      target_sheet.unhideColumn(target_sum_rows.offset(0, i, 1, 1));
    } else {
      target_sheet.hideColumn(target_sum_rows.offset(0, i, 1, 1));
    }
  }  
}
function total2_3_show_hidden_cols(){
  const target_sheets = extract_target_sheet();
  target_sheets.map(function(x){
    var target_sheet = x[0];
    var setup_col = x[1];
    var header_row = x[2];
    var header_col = x[3];
    show_hidden_cols(target_sheet, setup_col, header_row, header_col);
  })
}
/**
* Total2, Total3シート
* Trialシートの試験期間年数から列の追加削除を行う
* @param {sheet} sheet Total2/Total3を指定
* @param {number} term_row Total2/Total3シートの年度の上の行
* @param {string} target_term_name 試験期間名（Setupなど）
* @param {number} term_years 試験期間年数
* @return none
*/
function add_del_cols(sheet, term_row, target_term_name, term_years){
  const term_str = sheet.getRange(term_row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const term_str_first = term_str.indexOf(target_term_name);
  if (term_str_first == -1){
    return;
  }
  const term_str_count = term_str.filter(x => x == target_term_name).length;
  if (term_str_count > term_years){
    // 試験期間年数より列数が多ければ列の削除を行う
    sheet.deleteColumn(term_str_first + 1);
  } else if (term_str_count < term_years){
    // 試験期間年数より列数が少なければ列の追加を行う
    sheet.insertColumnAfter(term_str_first + 1);
    sheet.getRange(1, (term_str_first + 1), sheet.getLastRow(), 1).copyTo(sheet.getRange(1, (term_str_first + 2)));
  } else {
    return;
  }
  add_del_cols(sheet, term_row, target_term_name, term_years);
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
  const get_s_p = PropertiesService.getScriptProperties();
  const target_sheets = extract_target_sheet();
  const sheet = get_sheets();
  // 'Setup'などの見出しが指定行にない列は削除する
  target_sheets.forEach(x => new Add_del_columns(x[0], x[3]).remove_cols_without_header());
  // Trialシートの試験期間、見出し、試験期間年数を取得する
  const row_count = parseInt(get_s_p.getProperty('trial_closing_row')) - parseInt(get_s_p.getProperty('trial_setup_row')) + 1;
  let trial_term_info = sheet.trial.getRange(parseInt(get_s_p.getProperty('trial_setup_row')), 1, row_count, 3).getValues();
  // 試験期間年数が空白の場合は1列
  trial_term_info.forEach(x => x[2] = x[2] > 0 ? x[2] : 1);
  // 列の追加削除
  trial_term_info.forEach(function(x){
    target_sheets.forEach(function(y){
      const target_sheet = y[0];
      const header_row = y[3];
      const term = x[0];
      const years = x[2];
      add_del_cols(target_sheet, header_row, term, years);
    }, x)
  }, target_sheets);
  // 列の表示／非表示の制御
  total2_3_show_hidden_cols();
  //　0の行を非表示にするフィルタをセット
  filterhidden();
}
/**
* Setup~Closingの間で見出しが空白の行は削除する。
* @param {sheet} sheet Total2/Total3を指定
* @param {number} term_row Total2/Total3シートの年度の上の行
* @return {boolean}
*/
class Add_del_columns {
  constructor(sheet, term_row) {
    this.sheet = sheet;
    this.term_row = term_row;
  }
/**
* 見出し行の文字列を取得する。Setupより左、Closingより右の情報はダミーに置き換える。
*/
  get_setup_closing_range(){
    const dummy_str = '***dummy***';
    const header_t = this.sheet.getRange(this.term_row, 1, 1, this.sheet.getLastColumn()).getValues()[0];
    const setup_idx = header_t.indexOf('Setup');
    const closing_idx = header_t.indexOf('Closing');
    if (setup_idx < 0 || closing_idx < 0){
      return;
    };
    const res = header_t.map((x, idx) => idx < setup_idx || closing_idx < idx ? dummy_str : x);
    return res;
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
}
function getSetupClosingRange(){
  const sheet = get_sheets();
const aaa = new Add_del_columns(sheet.total2, 2);
const bbb = aaa.remove_cols_without_header();
}
/**
* Setup~Closingの間で見出しが空白の行は削除する。
* @param {sheet} sheet Total2/Total3を指定
* @param {number} term_row Total2/Total3シートの年度の上の行
* @return {boolean}
*/
function remove_cols_without_header(sheet, term_row){
/*  const header_t = sheet.getRange(term_row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const setup_idx = header_t.indexOf('Setup');
  const closing_idx = header_t.indexOf('Closing');
  if (setup_idx < 0 || closing_idx < 0){
    return;
  };
  const target = header_t.slice(setup_idx, closing_idx + 1);
  // 見出しが空白の行がなければ処理しない
  if (target.every(x => x)){
    return;
  }
  sheet.deleteColumn(header_t.indexOf('', setup_idx) + 1);
  remove_cols_without_header(sheet, term_row);*/
}
/**
* Total2, Total3シートの列構成用
* 対象シートを抽出し、対象シートオブジェクト、 シート名の列番号、　年度の開始列番号、　シート名の行番号の一次元配列を返す
* @param none
* @return {[sheet, number, number, number]}
*/
function extract_target_sheet(){
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  // 対象シート、 シート名の列、　年度の開始列、　シート名の行番号
  const total_T = [[get_s_p.getProperty('total2_sheet_name').toLowerCase(), 4, 4, 2], 
                   [get_s_p.getProperty('total3_sheet_name').toLowerCase(), 4, 3, 2]] 
  const total_foot_T = ['', '_' + get_s_p.getProperty('name_nmc'), '_' + get_s_p.getProperty('name_oscr')];
  const target_sheets = total_T.reduce((res, total) => {
    total_foot_T.forEach(foot => res.push([sheet[total[0] + foot], total[1], total[2], total[3]]));
    // total2_*, total3_* 存在しないシートを対象外にする
    return res.filter(x => x[0] != null);
  }, []);
  return target_sheets;
}
