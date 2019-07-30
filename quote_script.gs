/**
* Momentライブラリの追加が必要
* ライブラリキー：MHMchiX6c1bwSqGM1PZiW_PxhMjh3Sh48
*/
/**
* quotation_requestの1行目（項目名）からフォーム入力情報を取得する
* @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
* @param {string} header_str 検索対象の値
* @return 項目名が完全一致すればその項目の値を返す。一致しなければnullを返す。
* @example 
*   var trial_start_date = get_quotation_request_value(array_quotation_request, const_trial_start);
*/
function get_quotation_request_value(array_quotation_request, header_str){
  const temp_col = array_quotation_request[0].indexOf(header_str);
  if (temp_col > -1){
    return(array_quotation_request[1][temp_col]);
  } else {
    return null;
  }  
}
/**
* 試験種別からSetup、Closing期間の判定を行いスクリプトプロパティに格納する
* @param {string} temp_str 試験種別 
* @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
* @return none
* @example 
*   get_setup_closing_term(temp_str, array_quotation_request);
*/
function get_setup_closing_term(temp_str, array_quotation_request){
  // Setup期間は医師主導治験、特定臨床研究が6ヶ月、それ以外が3ヶ月
  // Closing期間は医師主導治験、特定臨床研究、研究結果報告書作成支援ありの試験が6ヶ月、それ以外が3ヶ月
  const get_s_p = PropertiesService.getScriptProperties();
  var setup_term = 3;
  var closing_term = 3;
  if (temp_str == get_s_p.getProperty('investigator_initiated_trial') || temp_str == get_s_p.getProperty('specified_clinical_trial')){
    setup_term = 6;
    closing_term = 6;
  }
  if (get_quotation_request_value(array_quotation_request, '研究結果報告書作成支援') == 'あり'){
    closing_term = 6;
  }
  get_s_p.setProperty('setup_term', setup_term);
  get_s_p.setProperty('closing_term', closing_term);
}
/**
* 各シートの開始日、終了日を設定する
* @param {number} input_trial_start_date　試験開始日のセルの値
* @param {number} input_trial_end_date　試験終了日のセルの値
* @return 二次元配列（各シートの開始日、終了日）
* @example 
*   var array_trial_date = get_trial_start_end_date(trial_start_date, trial_end_date);
*/
function get_trial_start_end_date(input_trial_start_date, input_trial_end_date){
  const get_s_p = PropertiesService.getScriptProperties();
  // 試験開始日はその月の1日にする
  const trial_start_date = Moment.moment(input_trial_start_date).startOf('month');
  // 試験終了日はその月の末日にする
  const trial_end_date = Moment.moment(input_trial_end_date).endOf('month');
  // setup開始日
  const setup_start_date = trial_start_date.clone().subtract(parseInt(get_s_p.getProperty('setup_term')), 'months');
  // setupシートの最終日はsetup開始年度の3/31
  const setup_end_date = Moment.moment([setup_start_date.clone().subtract(3, 'months').year()　+ 1, 2, 31]);
  // closing終了日
  const closing_end_date = trial_end_date.clone().add(parseInt(get_s_p.getProperty('closing_term')), 'months');
  // closingシートの開始日はclosing終了年度の4/1
  const closing_start_date = Moment.moment([closing_end_date.clone().subtract(3, 'months').year(), 3, 1]);
  // registration_1シートの開始日はsetup終了日の翌日
  const registration_1_start_date = setup_end_date.clone().add(1, 'days');  
  // registration期間が1年以上あれば、1年めをregistration_1、残りをregistration_2にセットする
  const registration_1_end_date = registration_1_start_date.clone().add(1, 'years').subtract(1, 'days');
  var temp_registration_end_date = registration_1_end_date;
  var registration_2_start_date = ''; 
  var registration_2_end_date = '';
  var temp_array = [];
  if (registration_1_end_date < closing_start_date.clone().subtract(1, 'days')){
    registration_2_start_date = registration_1_end_date.clone().add(1, 'days');
    registration_2_end_date = closing_start_date.clone().subtract(1, 'days');
    temp_registration_end_date = registration_2_end_date;
  }
  // registrationの年数を取得
  get_s_p.setProperty('registration_years', get_years(registration_1_start_date, temp_registration_end_date));
  temp_array = [
    [setup_start_date, setup_end_date],
    [registration_1_start_date, registration_1_end_date],
    [registration_2_start_date, registration_2_end_date],
    ['', ''],
    ['', ''],
    ['', ''],
    ['', ''],
    [closing_start_date, closing_end_date],
    [setup_start_date, closing_end_date]
  ];
  return(temp_array);
}
/**
* quotation_requestシートの内容からtrialシートを設定する
* @param {associative array} sheet 当スプレッドシート内のシートオブジェクト
* @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
* @return none
* @example 
*   set_trial_sheet(sheet, array_quotation_request);
*/
function set_trial_sheet(sheet, array_quotation_request){
  const get_s_p = PropertiesService.getScriptProperties();
  const const_quotation_type = '見積種別';
  const const_trial_type = '試験種別';
  const const_trial_start = '症例登録開始日';
  const const_registration_end = '症例登録終了日';
  const const_trial_end = '試験終了日';
  const const_facilities = '実施施設数';
  const const_trial_start_col = parseInt(get_s_p.getProperty('trial_start_col'));
  const const_trial_end_col = parseInt(get_s_p.getProperty('trial_end_col'));
  const const_trial_setup_row = parseInt(get_s_p.getProperty('trial_setup_row'));
  const const_trial_closing_row = parseInt(get_s_p.getProperty('trial_closing_row'));
  const const_trial_years_col = parseInt(get_s_p.getProperty('trial_years_col'));
  const const_total_month_col = 6;
  var trial_list = [
    [const_quotation_type, 2],
    ['見積発行先', 4],
    ['研究代表者名', 8],
    ['試験課題名', 9],
    ['試験実施番号', 10],
    [const_trial_type, 27],
    ['目標症例数', 28],
    [const_facilities, 29],
    ['CRF項目数', 30]
  ];
  var temp_str, temp_start, temp_end, temp_start_addr, temp_end_addr, save_row, temp_total, trial_start_date, registration_end_date, trial_end_date;
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
        case const_facilities:
          get_s_p.setProperty('facilities_value', temp_str);
          break;
        case const_trial_type: 
          get_s_p.setProperty('trial_type_value', temp_str);
          // 試験期間を取得する
          trial_start_date = get_quotation_request_value(array_quotation_request, const_trial_start);
          registration_end_date = get_quotation_request_value(array_quotation_request, const_registration_end);
          trial_end_date = get_quotation_request_value(array_quotation_request, const_trial_end);
          if (trial_start_date == null || registration_end_date == null || trial_end_date == null){
            return;
          }
          get_setup_closing_term(temp_str, array_quotation_request);
          var array_trial_date = get_trial_start_end_date(trial_start_date, trial_end_date);
          sheet.trial.getRange(const_trial_setup_row, const_trial_start_col, array_trial_date.length, 2).clear();
          for (var j = 0; j < array_trial_date.length; j++){
            temp_start = sheet.trial.getRange(const_trial_setup_row + j, const_trial_start_col);
            temp_end = sheet.trial.getRange(const_trial_setup_row + j, const_trial_end_col);
            if (array_trial_date[j][0] != ''){
              temp_start.setValue(array_trial_date[j][0].format('YYYY/MM/DD'));
            }
            if (array_trial_date[j][1] != ''){
              temp_end.setValue(array_trial_date[j][1].format('YYYY/MM/DD'));
            }
            temp_start_addr = temp_start.getA1Notation();
            temp_end_addr = temp_end.getA1Notation();              
            sheet.trial.getRange(const_trial_setup_row + j, const_trial_years_col).setFormula('=if(and($' + temp_start_addr + '<>"",$' + temp_end_addr + '<>""),datedif($' + temp_start_addr + ',$' + temp_end_addr + ',"y")+1,"")');
            save_row = const_trial_setup_row + j;
          }
          // totalはx年xヶ月と月数を出力
          temp_total = sheet.trial.getRange(save_row, const_total_month_col);
          sheet.trial.getRange(save_row, const_total_month_col).setFormula('=datedif(' + sheet.trial.getRange(save_row, const_trial_start_col).getA1Notation() + ',(' + sheet.trial.getRange(save_row, const_trial_end_col).getA1Notation() + '+1),"m")');
          sheet.trial.getRange(save_row, const_trial_years_col).setFormula('=trunc(' + temp_total.getA1Notation() + '/12) & "年" & if(mod(' + temp_total.getA1Notation() + ',12)<>0,mod(' + temp_total.getA1Notation() + ',12) & "ヶ月","")');
          break;
        default:
          break;
      }
      sheet.trial.getRange(trial_list[i][1], 2).setValue(temp_str);
    } 
  }    
}
/**
* 条件が真ならば引数return_valueを返す。偽なら空白を返す。
*/
function get_count(subject_of_condition, object_of_condition, return_value){
  var temp = '';
  if (subject_of_condition == object_of_condition){
    temp = return_value;
  }
  return(temp);
}
function get_count_more_than(subject_of_condition, object_of_condition, return_value){
  var temp = '';
  if (subject_of_condition > object_of_condition){
    temp = return_value;
  }
  return(temp);
}
/**
* 該当する項目名の行に回数をセットする。該当項目がなければセットしない。
* @param {sheet} sheet 対象のシートオブジェクト
* @param {string} item_name　項目名
* @param {string} set_value　回数 
* @param {number} const_count_col 回数入力列
* @param {associative array} array_item 項目と行番号の連想配列
* @return none 
* @example 
*   set_range_value(sheet.setup, set_items_list[i][0], set_items_list[i][1], const_count_col, array_item);
*/
function set_range_value(target_sheet, item_name, set_value, const_count_col, array_item){
  const temp_row = array_item[item_name];
    if( temp_row !== void 0){
      target_sheet.getRange(temp_row, const_count_col).setValue(set_value);
    }
}
/**
* Setup〜Closing共通項目の設定
* @param {sheet} target_sheet 対象のシートオブジェクト
* @param {associative array} array_item 項目と行番号の連想配列
* @param {Moment.moment} sheet_start_date 開始日のMomentオブジェクト
* @param {Moment.moment} sheet_end_date 終了日のMomentオブジェクト
* @return 共通項目の設定月数
* @example 
*   var project_management = set_all_sheet_common_items(sheet.setup, array_item, 
*                             Moment.moment(sheet.trial.getRange(const_trial_setup_row, const_trial_start_col).getValue()),
*                             Moment.moment(sheet.trial.getRange(const_trial_setup_row, const_trial_end_col).getValue()));
*/
function set_all_sheet_common_items(target_sheet, array_item, sheet_start_date, sheet_end_date){
  // プロジェクト管理、事務局運営、医師主導治験対応はすべてのシートで全期間とる
  const get_s_p = PropertiesService.getScriptProperties();
  const const_count_col = get_s_p.getProperty('fy_sheet_count_col');
  const temp_months = get_months(sheet_start_date, sheet_end_date);
  var project_management = 12;
  var clinical_trials_office = ''; 
  var investigator_initiated_trial_support = '';
  var set_items_list = [];
  // １シート１年分なので最大月数は12となる
  if ((temp_months != null) && (temp_months < 12)){
    project_management = temp_months;
  }
  // 医師主導治験のみ
  if (get_s_p.getProperty('trial_type_value') == get_s_p.getProperty('investigator_initiated_trial')){
    clinical_trials_office = project_management; 
    investigator_initiated_trial_support = project_management;
  }
  set_items_list = [
    ['プロジェクト管理', project_management],
    ['事務局運営', clinical_trials_office],
    ['医師主導治験対応', investigator_initiated_trial_support]
  ];
  for (var i = 0; i < set_items_list.length; i++){
    set_range_value(target_sheet, set_items_list[i][0], set_items_list[i][1], const_count_col, array_item);
  }
  return(project_management);
}
/**
* registration期間に算定する項目の設定
* @param {sheet} target_sheet 対象のシートオブジェクト
* @param {associative array} array_item 項目と行番号の連想配列
* @param {number} project_management 共通項目の設定月数
* @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
* @return none
* @example 
*   set_registration_term_items(target_sheet, array_item, project_management, array_quotation_request);
*/
function set_registration_term_items(target_sheet, array_item, project_management, array_quotation_request){
  const get_s_p = PropertiesService.getScriptProperties();
  const const_count_col = get_s_p.getProperty('fy_sheet_count_col');
  // データベース管理料、中央モニタリング、安全性管理、効安　この年度にregistration期間がある場合その期間分とる
  var registration_term = '';
  var temp_overflowing_setup = 0;
  var set_items_list = [];
  if (target_sheet.getName() == get_s_p.getProperty('setup_sheet_name')){
    if (get_s_p.getProperty('setup_term') < project_management){
      // setupシートにregistration期間が入っている場合
      registration_term = project_management - get_s_p.getProperty('setup_term');
    } else if (get_s_p.getProperty('setup_term') > project_management){
      // registration_1シートにsetup期間が入っている場合
      temp_overflowing_setup = get_s_p.getProperty('setup_term') - project_management;
    }    
  } else if ((target_sheet.getName() == get_s_p.getProperty('registration_1_sheet_name')) && get_s_p.getProperty('flag_overflowing_setup') > 0){
    // registration_1シートにsetup期間が入っていたらその分を除く 
    registration_term = project_management - get_s_p.getProperty('flag_overflowing_setup');
    temp_overflowing_setup = 0;
  }
  get_s_p.setProperty('flag_overflowing_setup', temp_overflowing_setup);
  set_items_list = [
    ['データベース管理料', registration_term],
    [get_s_p.getProperty('central_monitoring_str'), registration_term],
    ['安全性管理事務局業務', get_count(get_quotation_request_value(array_quotation_request, '安全性管理事務局設置'), 'あり', registration_term)],
    ['効果安全性評価委員会事務局業務', get_count(get_quotation_request_value(array_quotation_request, '効安事務局設置'), 'あり', registration_term)],
  ];
  for (var i = 0; i < set_items_list.length; i++){
    set_range_value(target_sheet, set_items_list[i][0], set_items_list[i][1], const_count_col, array_item);
  }
}
function set_setup_items(array_quotation_request){
  const get_s_p = PropertiesService.getScriptProperties();
  var set_items_list = [];
  // 医師主導治験のみ算定または名称が異なる項目に対応する
  var sop = '';
  var office_irb_str = 'IRB準備・承認確認';
  var office_irb = '';
  var dm_irb = get_s_p.getProperty('facilities_value');
  var temp_str = '中央モニタリング、定期モニタリングレポート作成';
  if (get_s_p.getProperty('trial_type_value') == get_s_p.getProperty('investigator_initiated_trial')){
    sop = 1;
    office_irb_str = 'IRB承認確認、施設管理';
    office_irb = get_s_p.getProperty('facilities_value');
    dm_irb = '';
    temp_str = '中央モニタリング'
  }
  get_s_p.setProperty('central_monitoring_str', temp_str);
  set_items_list = [
    ['プロトコルレビュー・作成支援（図表案、統計解析計画書案を含む）', 1],
    ['検討会実施（TV会議等）', 4],
    ['PMDA相談資料作成支援', get_count(get_quotation_request_value(array_quotation_request, 'PMDA相談資料作成支援'), 'あり', 1)],
    ['AMED申請資料作成支援', get_count(get_quotation_request_value(array_quotation_request, 'AMED申請資料作成支援'), 'あり', 1)],
    ['特定臨床研究法申請資料作成支援', get_count(get_s_p.getProperty('trial_type_value'), get_s_p.getProperty('specified_clinical_trial'), get_s_p.getProperty('facilities_value'))],
    ['ミーティング準備・実行', get_count(get_quotation_request_value(array_quotation_request, 'キックオフミーティング'), 'あり', 1)],
    ['SOP一式、CTR登録案、TMF雛形', sop],
    [office_irb_str, office_irb],
    ['モニタリング準備業務（関連資料作成、キックオフ参加）', get_count_more_than(get_quotation_request_value(array_quotation_request, '1例あたりの実地モニタリング回数'), 0, 1)],
    ['EDCライセンス・データベースセットアップ', 1],
    ['業務分析・DM計画書の作成・CTR登録案の作成', 1],
    ['DB作成・eCRF作成・バリデーション', 1],
    ['バリデーション報告書', 1],
    ['初期アカウント設定（施設・ユーザー）、IRB承認確認', dm_irb],
    ['入力の手引作成', 1],
    ['外部監査費用', get_count_more_than(get_quotation_request_value(array_quotation_request, '監査対象施設数'), 0, 1)],
    ['試験開始準備費用', get_count(get_quotation_request_value(array_quotation_request, '試験開始準備費用'), 'あり', get_s_p.getProperty('facilities_value'))],
    ['CDISC対応費', get_count(get_quotation_request_value(array_quotation_request, 'CDISC対応'), 'あり', 1)]
  ];
  return(set_items_list);
}
function set_registration_items(target_sheet, array_quotation_request){
  const get_s_p = PropertiesService.getScriptProperties();
  var set_items_list = [];
  var interim_analysis = '中間解析プログラム作成、解析実施（シングル）';
  var interim_table_count = 0;
  var crb_first_year = '';
  var crb_after_second_year = '';
  var set_items_list = [];
  // 中間解析
  if (target_sheet.getSheetName() == get_s_p.getProperty('interim_1_sheet_name') || target_sheet.getSheetName() == get_s_p.getProperty('interim_2_sheet_name')){
    if (get_s_p.getProperty('trial_type_value') == get_s_p.getProperty('investigator_initiated_trial')){
      interim_analysis = '中間解析プログラム作成、解析実施（ダブル）';
      interim_table_count = get_quotation_request_value(array_quotation_request, '中間解析に必要な帳票数');
    }
  }
  // CRB申請費用
  if (target_sheet.getSheetName() == get_s_p.getProperty('registration_1_sheet_name')){
    crb_first_year = get_count(get_quotation_request_value(array_quotation_request, 'CRB申請'), 'あり', 1);
  } else {
    crb_after_second_year = get_count(get_quotation_request_value(array_quotation_request, 'CRB申請'), 'あり', 1);
  }
  set_items_list = [
    ['CRB申請費用(初年度)', crb_first_year],
    ['CRB申請費用(2年目以降)', crb_after_second_year],
    ['統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成', get_count_more_than(interim_table_count, 0, 1)],
    [interim_analysis, get_count_more_than(interim_table_count, 0, interim_table_count)],
    ['中間解析報告書作成（出力結果＋表紙）', get_count_more_than(interim_table_count, 0, 1)],
    ['施設監査費用', get_count_more_than(get_quotation_request_value(array_quotation_request, '監査対象施設数'), 0, 
                         Math.round(get_quotation_request_value(array_quotation_request, '監査対象施設数') / get_s_p.getProperty('registration_years')))]
  ];
  return(set_items_list);
}
function set_closing_items(array_quotation_request){
  const get_s_p = PropertiesService.getScriptProperties();
  var set_items_list = [];
  // csrの作成支援は医師主導治験ならば必須
  var csr_count = get_count(get_quotation_request_value(array_quotation_request, '研究結果報告書の作成'), 'あり', 1);
  // 医師主導治験のみ算定または名称が異なる項目に対応する
  var csr = '研究結果報告書の作成';
  var final_analysis = '最終解析プログラム作成、解析実施（シングル）';
  var clinical_conference = '';
  if (get_s_p.getProperty('trial_type_value') == get_s_p.getProperty('investigator_initiated_trial')){
    csr = 'CSRの作成支援';
    csr_count = 1;
    final_analysis = '最終解析プログラム作成、解析実施（ダブル）';
    // 医師主導治験で症例検討会ありの場合症例検討会資料作成に1をセット
    if (get_count(get_quotation_request_value(array_quotation_request, '症例検討会'), 'あり', 1) > 0){
      clinical_conference = 1;
    }
  }
  set_items_list = [
    ['開始前モニタリング・必須文書確認', get_count(get_quotation_request_value(array_quotation_request, 'PMDA相談資料作成支援'), 'あり', 1)],
    ['データクリーニング', 1],
    ['データベース固定作業、クロージング', 1],
    ['症例検討会資料作成', clinical_conference],
    ['統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成', get_count_more_than(get_quotation_request_value(array_quotation_request, '統計解析に必要な帳票数'), 0, 1)],
    [final_analysis, get_count_more_than(get_quotation_request_value(array_quotation_request, '統計解析に必要な帳票数'), 0, get_quotation_request_value(array_quotation_request, '統計解析に必要な帳票数'))],
    ['最終解析報告書作成（出力結果＋表紙）', get_count_more_than(get_quotation_request_value(array_quotation_request, '統計解析に必要な帳票数'), 0, 1)],
    [csr, csr_count],
    ['外部監査費用', get_count_more_than(get_quotation_request_value(array_quotation_request, '監査対象施設数'), 0, 1)]
  ];
  return(set_items_list);  
}
/**
* setupシートの編集
*/
function set_setup_sheet(sheet, array_quotation_request){
  const get_s_p = PropertiesService.getScriptProperties();
  const const_trial_start_col = get_s_p.getProperty('trial_start_col');
  const const_trial_end_col = get_s_p.getProperty('trial_end_col');
  const const_trial_setup_row = get_s_p.getProperty('trial_setup_row');
  const const_trial_setup_years = get_s_p.getProperty('trial_years_col');
  const const_count_col = get_s_p.getProperty('fy_sheet_count_col');
  const array_item = get_fy_items(sheet.setup, get_s_p.getProperty('fy_sheet_items_col'));
  // このシートの全期間
  const project_management = set_all_sheet_common_items(sheet.setup, array_item, 
                                                      Moment.moment(sheet.trial.getRange(const_trial_setup_row, const_trial_start_col).getValue()),
                                                      Moment.moment(sheet.trial.getRange(const_trial_setup_row, const_trial_end_col).getValue()));
  var set_items_list = [];
  // registration期間があれば
  set_registration_term_items(sheet.setup, array_item, project_management, array_quotation_request);
  set_items_list = set_setup_items(array_quotation_request);
  for (var i = 0; i < set_items_list.length; i++){
    set_range_value(sheet.setup, set_items_list[i][0], set_items_list[i][1], const_count_col, array_item);
  }
}
/**
* registration, interim, observationシートの編集
*/
function set_registration_sheet(trial_sheet, target_sheet, array_quotation_request, trial_target_row){
  const get_s_p = PropertiesService.getScriptProperties();
  const const_trial_start_col = get_s_p.getProperty('trial_start_col');
  const const_trial_end_col = get_s_p.getProperty('trial_end_col');
  const const_count_col = get_s_p.getProperty('fy_sheet_count_col');
  const array_item = get_fy_items(target_sheet, get_s_p.getProperty('fy_sheet_items_col'));
  const project_management = set_all_sheet_common_items(target_sheet, array_item, 
                                                      Moment.moment(trial_sheet.getRange(trial_target_row, const_trial_start_col).getValue()),
                                                      Moment.moment(trial_sheet.getRange(trial_target_row, const_trial_end_col).getValue()));
  set_registration_term_items(target_sheet, array_item, project_management, array_quotation_request);
  set_items_list = set_registration_items(array_quotation_request);
  for (var i = 0; i < set_items_list.length; i++){
    set_range_value(target_sheet, set_items_list[i][0], set_items_list[i][1], const_count_col, array_item);
  }
  // 期間が入っていない場合はシートを非表示にする
  if ((trial_sheet.getRange(trial_target_row, const_trial_start_col).getValue() == '') &&
      (trial_sheet.getRange(trial_target_row, const_trial_end_col).getValue() == '')){
    target_sheet.hideSheet();
  } else {
    target_sheet.showSheet();
  }
}
/**
* closingシートの編集
*/
function set_closing_sheet(sheet, array_quotation_request){
  const get_s_p = PropertiesService.getScriptProperties();
  const array_item = get_fy_items(sheet.closing, get_s_p.getProperty('fy_sheet_items_col'));
  const const_trial_closing_row = get_s_p.getProperty('trial_closing_row');
  const const_trial_closing_years = get_s_p.getProperty('trial_years_col');
  const const_trial_start_col = get_s_p.getProperty('trial_start_col');
  const const_trial_end_col = get_s_p.getProperty('trial_end_col');
  const const_count_col = get_s_p.getProperty('fy_sheet_count_col');
  // このシートの全期間
  const project_management = set_all_sheet_common_items(sheet.closing, array_item, 
                                                      Moment.moment(sheet.trial.getRange(const_trial_closing_row, const_trial_start_col).getValue()),
                                                      Moment.moment(sheet.trial.getRange(const_trial_closing_row, const_trial_end_col).getValue()));
  var set_items_list = [];
  // registration期間があれば
  set_registration_term_items(sheet.closing, array_item, project_management, array_quotation_request);
  set_items_list = set_setup_items(array_quotation_request);
  for (var i = 0; i < set_items_list.length; i++){
    set_range_value(sheet.closing, set_items_list[i][0], set_items_list[i][1], const_count_col, array_item);
  }
}
function set_value_each_sheet(trial_sheet, target_sheet, array_quotation_request, trial_target_row){
  const get_s_p = PropertiesService.getScriptProperties();
  const const_trial_closing_years = get_s_p.getProperty('trial_years_col');
  const const_trial_start_col = get_s_p.getProperty('trial_start_col');
  const const_trial_end_col = get_s_p.getProperty('trial_end_col');
  const const_count_col = get_s_p.getProperty('fy_sheet_count_col');
  const array_item = get_fy_items(target_sheet, get_s_p.getProperty('fy_sheet_items_col'));
  // このシートの全期間
  const project_management = set_all_sheet_common_items(target_sheet, array_item, 
                                                      Moment.moment(trial_sheet.getRange(trial_target_row, const_trial_start_col).getValue()),
                                                      Moment.moment(trial_sheet.getRange(trial_target_row, const_trial_end_col).getValue()));
  var set_items_list = [];
  // registration期間があればセット
  set_registration_term_items(target_sheet, array_item, project_management, array_quotation_request);
  switch(target_sheet.getSheetName()){
    case get_s_p.getProperty('setup_sheet_name'):
      set_items_list = set_setup_items(array_quotation_request);
      break;
    case get_s_p.getProperty('closing_sheet_name'):
      set_items_list = set_closing_items(array_quotation_request);
      break;
    default:
      set_items_list = set_registration_items(target_sheet, array_quotation_request);
      // 期間が入っていない場合はシートを非表示にする
      if ((trial_sheet.getRange(trial_target_row, const_trial_start_col).getValue() == '') &&
          (trial_sheet.getRange(trial_target_row, const_trial_end_col).getValue() == '')){
        target_sheet.hideSheet();
      } else {
        target_sheet.showSheet();
      }
      break;
  }
  for (var i = 0; i < set_items_list.length; i++){
    set_range_value(target_sheet, set_items_list[i][0], set_items_list[i][1], const_count_col, array_item);
  }
}

function quote_script_main(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  const quotation_request_last_col =  sheet.quotation_request.getDataRange().getLastColumn();
  const array_quotation_request = sheet.quotation_request.getRange(1, 1, 2, quotation_request_last_col).getValues();
  const array_target_sheet = [sheet.setup, sheet.registration_1, sheet.registration_2, sheet.interim_1, sheet.interim_2, sheet.observation_1, sheet.observation_2, sheet.closing];
  // Quotation requestシートのA2セルが空白の場合、Quotation requestが入っていないものと判断して処理を終了する
  if (array_quotation_request[1][0] == ''){
    return;
  }
  set_trial_sheet(sheet, array_quotation_request);
  for (var i = 0; i < array_target_sheet.length; i++){
    set_value_each_sheet(sheet.trial, array_target_sheet[i], array_quotation_request, parseInt(get_s_p.getProperty('trial_setup_row')) + i);
  }

}
