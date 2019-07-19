// シート追加時のtotalシート足し込み処理
function edit_Add_Del_InTotal(total_sheet, add_sheet_name, trial_range, process_parameter){
  // process_parameter＝0：Totalシートの回数列に追加したシートの回数を追加する
  // process_parameter＝1：Totalシートの回数列から削除したシートの回数を削除する
  var target_col = 'F';
  var start_row = 6;
  var target_col_num = getColumnNumber(target_col);
  var target_row;
  var array_formula = total_sheet.getRange(start_row, target_col_num, total_sheet.getDataRange().getLastRow() - start_row).getFormulas();
  var temp_str;
  var temp_replace_str;
  for (var i = 0; i < array_formula.length; i++){
    if (array_formula[i] != ''){
      target_row = i + start_row;
      temp_str = '+' + add_sheet_name +'!F'+ target_row +'*Trial!' + trial_range;
      if (process_parameter == 0){
        total_sheet.getRange(target_row, target_col_num).setFormula(total_sheet.getRange(target_row, target_col_num).getFormula() + temp_str);
      } else {
        temp_replace_str = total_sheet.getRange(target_row, target_col_num).getFormula();
        temp_replace_str = temp_replace_str.replace(temp_str, '');
        total_sheet.getRange(target_row, target_col_num).setFormula(temp_replace_str);
      }
    }
  }
}
function edit_Add_InTotal_2_3(array_total_sheet, add_sheet_name, insert_col, trial_range){
  var insert_col_num = getColumnNumber(insert_col);
  var start_row = 2;
  var total_sheet;
  var array_formula;
  var copy_source_col;
  var copy_source;
  var temp_formula;
  var replace_str;
  var fy_row = 2;
  var fy_formula = '=if(Trial!' + trial_range + '<>"", OFFSET(INDIRECT(ADDRESS(ROW(),COLUMN())), 0, -1)+1, OFFSET(INDIRECT(ADDRESS(ROW(),COLUMN())), 0, -1))';
  for (var j = 0; j < array_total_sheet.length; j++){
    total_sheet = array_total_sheet[j];
    array_formula = total_sheet.getRange(start_row, insert_col_num, total_sheet.getDataRange().getLastRow()).getFormulas();
    // 列の挿入
    total_sheet.insertColumnBefore(insert_col_num);
    if (insert_col_num > 4){
      copy_source_col = insert_col_num - 1; 
    } else {
      // setupの前
      copy_source_col = insert_col_num + 1;
      total_sheet.getRange(fy_row, copy_source_col).setFormula('=if(Trial!$C$32<>"", OFFSET(INDIRECT(ADDRESS(ROW(),COLUMN())), 0, -1)+1, OFFSET(INDIRECT(ADDRESS(ROW(),COLUMN())), 0, -1))');
      fy_formula = '=if(Trial!' + trial_range + '<>"", year(edate(Trial!' + trial_range + ',-3)), 2019)';
    }
    // Setup列からコピーする
    copy_source = total_sheet.getRange(1, copy_source_col, total_sheet.getLastRow(), 1);
    copy_source.copyTo(total_sheet.getRange(1, insert_col_num));
    for (var i = 0; i <= array_formula.length; i++){
      if (array_formula[i] != ''){
        temp_formula = total_sheet.getRange(i, insert_col_num).getFormula();
        replace_str = temp_formula.replace(/Setup/g, add_sheet_name);
        total_sheet.getRange(i, insert_col_num).setFormula(replace_str);
      }
    }
    // 2行目に年度を出す
    total_sheet.getRange(fy_row, insert_col_num).setValue(add_sheet_name);
  }  
  // total2は4行目、total3は3行目にシート名を出す
　　　　array_total_sheet[0].getRange(4, insert_col_num).setFormula(fy_formula);
　　　　array_total_sheet[1].getRange(3, insert_col_num).setFormula(fy_formula);
}

function editTotalMain(){
  // ↓追加/削除したシート名をセット
  var add_sheet_name = 'test';
  // ↓追加なら0、削除なら1
  var process_parameter = 0;
  // ↓trialシートの年数のアドレスをセット
  var trial_range = '$C$38';
  // total2, 3のどの列に追加するか
  var insert_col = 'E';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var total_sheet = ss.getSheetByName('total');
  var array_total = [ss.getSheetByName('total2'), ss.getSheetByName('total3')];
  edit_Add_Del_InTotal(total_sheet, add_sheet_name, trial_range, process_parameter);
  edit_Add_InTotal_2_3(array_total, add_sheet_name, insert_col, trial_range);
}

