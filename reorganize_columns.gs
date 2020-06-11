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
  const get_s_p = PropertiesService.getScriptProperties();
  // 対象シート、Setup列の番号、見出し行の番号、見出し列の番号
  const total_T = [[get_s_p.getProperty('total2_sheet_name'), 4, 4, 2], 
                        [get_s_p.getProperty('total3_sheet_name'), 4, 3, 2]];
  const total_foot_T = ['', '_' + get_s_p.getProperty('name_nmc'), '_' + get_s_p.getProperty('name_oscr')];
  total_T.map(function(x){
    total_foot_T.map(function(total_foot){
      var total_name = x[0];
      var setup_col = x[1];
      var header_row = x[2];
      var header_col = x[3];
      var sheetname = total_name + total_foot;
      var temp_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
      if (temp_sheet != null){
        show_hidden_cols(temp_sheet, setup_col, header_row, header_col);
      }
    }, x)
  });
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
  const term_str = sheet.getRange(term_row, 1, 1, sheet.getLastColumn()).getValues();
  const term_str_first = term_str[0].indexOf(target_term_name);
  if (term_str_first == -1){
    return;
  }
  const term_str_count = term_str[0].filter(function(x){return(x == target_term_name)}).length;
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
function total2_3_add_del_cols(){
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  filtervisible();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  // 見出しが空白の行を削除する
  const total2_header_row = 2;
  const total3_header_row = 2;
  const total_T = [[get_s_p.getProperty('total2_sheet_name'), total2_header_row], 
                        [get_s_p.getProperty('total3_sheet_name'), total3_header_row]];
  const total_foot_T = ['', '_' + get_s_p.getProperty('name_nmc'), '_' + get_s_p.getProperty('name_oscr')];
  total_T.map(function(x){
    total_foot_T.map(function(total_foot){
      var total_name = x[0];
      var header_row = x[1];
      var sheetname = total_name + total_foot;
      var temp_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
      if (temp_sheet != null){
        remove_cols_without_header(temp_sheet, header_row);
      }
    }, x)
  });
  // 試験期間年数を取得
  const row_count = parseInt(get_s_p.getProperty('trial_closing_row')) - parseInt(get_s_p.getProperty('trial_setup_row')) + 1;
  const trial_term_info = sheet.trial.getRange(get_s_p.getProperty('trial_setup_row'), 1, row_count, 3).getValues();
  trial_term_info.filter(function(x){ return(x[2] > 1) }).map(
//    function(y){
//      add_del_cols(sheet.total2, total2_header_row, y[0], y[2]);
//      add_del_cols(sheet.total3, total3_header_row, y[0], y[2]);
//    });
    function(y){
      total_T.map(function(total_T){
        total_foot_T.map(function(total_foot){
          var term_name = y[0];
          var term_years = y[2];
          var total_name = total_T[0];
          var sheetname = total_name + total_foot;
          Logger.log(sheetname);
        }, y, total_T);
      }, y);
      
//* @param {sheet} sheet Total2/Total3を指定
//* @param {number} term_row Total2/Total3シートの年度の上の行
//* @param {string} target_term_name 試験期間名（Setupなど）
//* @param {number} term_years 試験期間年数
      
    });
  total2_3_show_hidden_cols();
  filterhidden();
}
/**
* Setup~Closingの間で見出しが空白の行は削除する。
* @param {sheet} sheet Total2/Total3を指定
* @param {number} term_row Total2/Total3シートの年度の上の行
* @return {boolean}
*/
function remove_cols_without_header(sheet, term_row){
  const header_t = sheet.getRange(term_row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const setup_col = header_t.indexOf('Setup') + 1;
  if (setup_col < 1) return;
  const closing_col = header_t.indexOf('Closing') + 1;
  if (closing_col < 1) return;
  for (var i = (closing_col - 1); i > setup_col; i--){
    if (sheet.getRange(term_row, i).getValue() == ''){
      sheet.deleteColumn(i);
    }
  }
}


function aaa(){  
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  filtervisible();
  const total2_header_row = 2;
  const total3_header_row = 2;
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  const total_T = [[get_s_p.getProperty('total2_sheet_name'), total2_header_row], [get_s_p.getProperty('total3_sheet_name'), total3_header_row]] 
  const total_foot_T = ['', '_' + get_s_p.getProperty('name_nmc'), '_' + get_s_p.getProperty('name_oscr')];
  // 対象シート名を取得する
  var target_sheets = total_T.map(function(x){
    var sheet_T = total_foot_T.map(function(y){
      var sheetname = (x[0] + y);
      var temp_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
      if (temp_sheet != null){
        remove_cols_without_header(temp_sheet, x[1]);
      }
      return [temp_sheet, x[1]];
    }, x)
    return sheet_T
  }, total_foot_T);
  // 配列の次元を落とす
  target_sheets = target_sheets.reduce(function(x, item){
    x.push(...item);
    return x;
  }, []);
  // total2_*, total3_* 存在しないシートを対象外にする
  target_sheets = target_sheets.filter(function(x){
    return(x[0] != null);
  })
/*  target_sheets.map(function(x){
    Logger.log(x[0].getName());
  });
  return;*/
  // Trialシートの試験期間、見出し、試験期間年数を取得する
  const row_count = parseInt(get_s_p.getProperty('trial_closing_row')) - parseInt(get_s_p.getProperty('trial_setup_row')) + 1;
  var trial_term_info = sheet.trial.getRange(parseInt(get_s_p.getProperty('trial_setup_row')), 1, row_count, 3).getValues();
  // total2, total2_nmc, total2_oscr, total3シート
/*  var target_sheets = total_T.map(function(x){
    var target_sheet = total_foot_T.map(function(total_foot){
      var total_name = x[0];
      var header_row = x[1];
      var sheetname = total_name + total_foot;
      var temp_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
      if (temp_sheet != null){
        remove_cols_without_header(temp_sheet, header_row);
        return [temp_sheet, header_row];
      } else { 
        return [null, null];
      }
    }, x)
    return target_sheet;
  });
*/
  // 列の追加削除
  trial_term_info.map(function(x){
    if (!(x[2] > 0)){
      // 試験期間年数が空白の場合は1列
      x[2] = 1;
    }
    target_sheets.map(function(y){
      var target_sheet = y[0];
      var header_row = y[1];
      var term = x[0];
      var years = x[2];
      add_del_cols(target_sheet, header_row, term, years);
    }, x)
  }, target_sheets);
}