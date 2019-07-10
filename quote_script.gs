function filtervisible(){
  // フィルタ：全条件を表示する
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws_t = ss.getSheets();
  var max_index = ws_t.length;
  var i, ws_filter;
  for (i = 0; i < max_index; i++){
    ws_filter = ws_t[i].getFilter();
    if (ws_filter != null){
      col = ws_filter.getRange().getColumn();
      ws_filter.removeColumnFilterCriteria(col)      
    } 
  }
}
function filterhidden(){
  // フィルタ：0を非表示にする
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws_t = ss.getSheets();
  var max_index = ws_t.length;
  var i, ws_filter, filter_criteria;
  for (i = 0; i < max_index; i++){
    ws_filter = ws_t[i].getFilter();
    if (ws_filter != null){
      col = ws_filter.getRange().getColumn();
      filter_criteria = ws_filter.getColumnFilterCriteria(col);
      if (filter_criteria != null){
        ws_filter.removeColumnFilterCriteria(col)
      } 
      filter_criteria = SpreadsheetApp.newFilterCriteria();
      filter_criteria.setHiddenValues(['0']);
      ws_filter.setColumnFilterCriteria(col, filter_criteria);
    } 
  }
}
function setProtectionEditusers(){
  // シートの保護権限設定変更
  // シート編集可能者全員の権限を設定する
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var users = ss.getEditors();
  var protections = ss.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  for (var i = 0; i < protections.length; i++){
   var protection = protections[i];
   protection.addEditors(users)
  }
}

function get_quotation_request_value(array_quotation_request, header_str){
  var temp_col = array_quotation_request[0].indexOf(header_str);
  if (temp_col > -1){
    return(array_quotation_request[1][temp_col]);
  } else {
    return null;
  }  
}
function get_setup_closing_term(temp_str, array_quotation_request){
  // Setup期間は医師主導治験、特定臨床研究が6ヶ月、それ以外が3ヶ月
  // Closing期間は医師主導治験、特定臨床研究、研究結果報告書作成支援ありの試験が6ヶ月、それ以外が3ヶ月
  var get_s_p = PropertiesService.getScriptProperties();
  var setup_term = 3;
  var closing_term = 3;
  if (temp_str == get_s_p.getProperty('investigator_initiated_trial') || temp_str == get_s_p.getProperty('specified_clinical_trial')){
    setup_term = 6;
    closing_term = 6;
  }
  if (get_quotation_request_value(array_quotation_request, '研究結果報告書作成支援') == 'あり'){
    closing_term = 6;
  }
  return({setup:setup_term, closing:closing_term});
}

function get_trial_start_end_date(trial_start_date, trial_end_date, term){
  // 試験開始日はその月の1日にする
  var trial_start_date = Moment.moment(trial_start_date).startOf('month');
  // 試験終了日はその月の末日にする
  var trial_end_date = Moment.moment(trial_end_date).endOf('month');
  // setup開始日
  var setup_start_date = trial_start_date.clone().subtract(term.setup, 'months');
  // setupシートの最終日はsetup開始年度の3/31
  var setup_end_date = Moment.moment([setup_start_date.clone().subtract(3, 'months').year()　+ 1, 2, 31]);
  // registration_1シートの開始日はsetup終了日の翌日
  var registration_1_start_date = setup_end_date.clone().add(1, 'days');  
  var registration_1_end_date;
  var registration_2_start_date, registration_2_end_date;
  var interim_1_start_date, interim_1_end_date;
  var interim_2_start_date, interim_2_end_date;
  var observation_1_start_date, observation_1_end_date;
  var closing_start_date;
  var observation_2_start_date, observation_2_end_date;  // closing終了日
  var closing_end_date = trial_end_date.clone().add(term.closing, 'months');
  // closingシートの開始日はclosing終了年度の4/1
  closing_start_date = Moment.moment([closing_end_date.clone().subtract(3, 'months').year(), 3, 1]);
  // registration_1シートの終了日を仮にclosingシートの開始日の１日前と設定しておく
  registration_1_end_date = closing_start_date.clone().subtract(1, 'days');
  // シート分け判定
  // CRB申請がある場合registration_1に最初の1年、registration_2に残りの年度を分ける
    // registration_1の終了日を開始日の一年後にする
    // registration_2の開始日をregistration_1の終了日の翌日にする
    // registration_2の終了日をclosingシートの開始日の１日前にする
  // 中間解析がある場合interim_2に症例登録期間の真ん中くらいの年度を1年、interim_1にその前の年度、observation_1に残りの年度を分ける
  
  return({trial_start:trial_start_date, trial_end:trial_end_date, setup_start:setup_start_date, setup_end:setup_end_date,
          registration_1_start:registration_1_start_date, registration_1_end:registration_1_end_date,
          closing_start:closing_start_date, closing_end:closing_end_date});
}

function get_months(start_date, end_date){
  return(end_date.diff(start_date, 'months') + 1);
}
function get_years(start_date, end_date){
  if (start_date == '' || end_date == ''){
    return(null);
  }
  var temp = get_months(start_date, end_date);
  return(Math.ceil(temp / 12));
}
function set_trial_sheet(sheet, array_quotation_request){
  var get_s_p = PropertiesService.getScriptProperties();
  const const_quotation_type = '見積種別';
  const const_trial_type = '試験種別';
  const const_trial_start = '症例登録開始日';
  const const_registration_end = '症例登録終了日';
  const const_trial_end = '試験終了日';
  const const_trial_start_col = get_s_p.getProperty('trial_start_col');
  const const_trial_end_col = get_s_p.getProperty('trial_end_col');
  const const_trial_setup_row = get_s_p.getProperty('trial_setup_row');
  const const_trial_closing_row = get_s_p.getProperty('trial_closing_row');
  const const_trial_years_col = get_s_p.getProperty('trial_years_col');
  var trial_list = [
    [const_quotation_type, 2],
    ['見積発行先', 4],
    ['研究代表者名', 8],
    ['試験課題名', 9],
    ['試験実施番号', 10],
    [const_trial_type, 27],
    ['目標症例数', 28],
    ['実施施設数', 29],
    ['CRF項目数', 30]
  ];
  var temp_str;
  for (var i = 0; i < trial_list.length; i++){
    temp_str = get_quotation_request_value(array_quotation_request, trial_list[i][0]);
    if (temp_str != null){
      switch(trial_list[i][0]){
        case const_quotation_type:
          if (temp_str == '正式見積'){
            temp_str = '御見積書';
          } else {
            temp_str = '御参考見積書';
          }
          break;
        case const_trial_type: 
          get_s_p.setProperty('trial_type_value', temp_str);
          // 試験期間を取得する
          var trial_start_date = get_quotation_request_value(array_quotation_request, const_trial_start);
          var registration_end_date = get_quotation_request_value(array_quotation_request, const_registration_end);
          var trial_end_date = get_quotation_request_value(array_quotation_request, const_trial_end);
          if (trial_start_date == null || registration_end_date == null || trial_end_date == null){
            return;
          }
          var term = get_setup_closing_term(temp_str, array_quotation_request);
          var array_trial_date = get_trial_start_end_date(trial_start_date, trial_end_date, term);
          sheet.trial.getRange(const_trial_setup_row, const_trial_start_col, const_trial_closing_row - const_trial_setup_row + 1, const_trial_end_col - const_trial_years_col + 1).clear();
          // setup
          sheet.trial.getRange(const_trial_setup_row, const_trial_start_col).setValue(array_trial_date.setup_start.format('YYYY/MM/DD'));
          sheet.trial.getRange(const_trial_setup_row, const_trial_end_col).setValue(array_trial_date.setup_end.format('YYYY/MM/DD'));
          sheet.trial.getRange(const_trial_setup_row, const_trial_years_col).setValue(get_years(array_trial_date.setup_start, array_trial_date.setup_end));
          // registration
          Logger.log(const_trial_setup_row);
          sheet.trial.getRange(parseInt(const_trial_setup_row) + 1, const_trial_start_col).setValue(array_trial_date.registration_1_start.format('YYYY/MM/DD'));
          sheet.trial.getRange(parseInt(const_trial_setup_row) + 1, const_trial_end_col).setValue(array_trial_date.registration_1_end.format('YYYY/MM/DD'));
          sheet.trial.getRange(parseInt(const_trial_setup_row) + 1, const_trial_years_col).setValue(get_years(array_trial_date.registration_1_start, array_trial_date.registration_1_end));
          // closing
          sheet.trial.getRange(const_trial_closing_row, const_trial_start_col).setValue(array_trial_date.closing_start.format('YYYY/MM/DD'));
          sheet.trial.getRange(const_trial_closing_row, const_trial_end_col).setValue(array_trial_date.closing_end.format('YYYY/MM/DD'));
          sheet.trial.getRange(const_trial_closing_row, const_trial_years_col).setValue(get_years(array_trial_date.closing_start, array_trial_date.closing_end));
          break;
        default:
          break;
      }
      sheet.trial.getRange(trial_list[i][1], 2).setValue(temp_str);
    } 
  }    
}
function get_fy_items(sheet){
  // Setup〜Closing各シートの項目と行番号を配列に格納する
  var get_s_p = PropertiesService.getScriptProperties();
  const const_fy_sheet_items_col = get_s_p.getProperty('fy_sheet_items_col');
  var temp_array = sheet.getRange(1, const_fy_sheet_items_col, sheet.getDataRange().getLastRow(), 1).getValues();
  temp_array = Array.prototype.concat.apply([],temp_array);
  var array_fy_items = {};
  for (var i = 0; i < temp_array.length; i++){
    if (temp_array[i] != ''){
      array_fy_items[temp_array[i]] = i + 1;
    }
  }
  return(array_fy_items);
}
function set_setup_sheet(sheet, array_quotation_request, term){
  var get_s_p = PropertiesService.getScriptProperties();
  const const_trial_setup_row = get_s_p.getProperty('trial_setup_row');
  const const_trial_setup_years = get_s_p.getProperty('trial_years_col');
  const const_count_col = get_s_p.getProperty('fy_sheet_count_col');
  var facilities = get_quotation_request_value(array_quotation_request, 'PMDA相談資料作成支援');
  var array_item = get_fy_items(sheet);
  var pmda = '';
  if (get_quotation_request_value(array_quotation_request, 'PMDA相談資料作成支援') == 'あり'){
    pmda = 1;
  }
  var amed = '';
  if (get_quotation_request_value(array_quotation_request, 'AMED申請資料作成支援') == 'あり'){
    amed = 1;
  }
  var var_specified_clinical_trial = '';
  if (get_quotation_request_value(array_quotation_request, get_s_p.getProperty('trial_type')) == get_s_p.getProperty('specified_clinical_trial')){
    var_specified_clinical_trial = 1;
  }
  
  var set_items_list = [
    ['プロトコルレビュー・作成支援（図表案、統計解析計画書案を含む）', 1],
    ['検討会実施（TV会議等）', 4],
    ['PMDA相談資料作成支援', pmda],
    ['AMED申請資料作成支援', amed],
    ['Panda', 3]
  ];
  var temp_row;
//  Logger.log(array_item);
  for (i = 0; i < set_items_list.length; i++){
    temp_row = array_item[set_items_list[i][0]];
    if( temp_row !== void 0){
      sheet.getRange(temp_row, const_count_col).setFormula(set_items_list[i][1]);
    }
  }
  // 特定臨床研究法申請資料作成支援
  // プロジェクト管理
  // 事務局運営
  // 医師主導治験対応
  // ミーティング準備・実行
  // SOP一式、CTR登録案、TMF雛形
  // =if(and('Quotation Request'!$A$2<>"", Trial!$B$27="医師主導治験"),"IRB承認確認、施設管理","IRB準備・承認確認")
  // モニタリング準備業務（関連資料作成、キックオフ参加）
  // EDCライセンス・データベースセットアップ
  // データベース管理料
  // 業務分析・DM計画書の作成・CTR登録案の作成
  // DB作成・eCRF作成・バリデーション
  // バリデーション報告書
  // 初期アカウント設定（施設・ユーザー）、IRB承認確認
  // 入力の手引作成
  // =if(and('Quotation Request'!$A$2<>"", Trial!$B$27="医師主導治験"),"中央モニタリング","中央モニタリング、定期モニタリングレポート作成")
  // 安全性管理事務局業務
  // 効果安全性評価委員会事務局業務
  // 試験開始準備費用
}
function test(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var get_s_p = PropertiesService.getScriptProperties();
  var sheet = {trial:ss.getSheetByName(get_s_p.getProperty('trial_sheet_name')),
               quotation_request:ss.getSheetByName(get_s_p.getProperty('quotation_request_sheet_name')),
               setup:ss.getSheetByName(get_s_p.getProperty('setup_sheet_name')),
               closing:ss.getSheetByName(get_s_p.getProperty('closing_sheet_name'))}
  var quotation_request_last_col =  sheet.quotation_request.getDataRange().getLastColumn();
  var array_quotation_request = sheet.quotation_request.getRange(1, 1, 2, quotation_request_last_col).getValues();
  set_setup_sheet(sheet.setup, array_quotation_request, 0);
  set_trial_sheet(sheet, array_quotation_request);
}