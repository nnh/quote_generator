function check_itemName_and_value(target, item_name, value_ok){
  if (target.footer != null){
    var temp_item_name = item_name + target.footer; 
  } else {
    var temp_item_name = item_name; 
  }
  const res_message = 'シート名:' + target.sheet.getName() + ',項目名:' + temp_item_name + ',想定値:' + value_ok;
  if (!(target.array_item[item_name] > 0)){
    return ['NG：該当する項目名なし', res_message];
  }
  var check_value = target.sheet.getRange(target.array_item[item_name], target.col).getValue();
  if (check_value != value_ok){
    return ['NG：値が想定と異なる', res_message];
  }
  return ['OK', res_message];
}
function get_total_amount(target){
  const items = target.sheet.getRange(target.item_cols).getValues().flat();
  const target_row = items.indexOf(target.total_row_itemname) + 1;
  const header = target.sheet.getRange(target.header_row, 1, 1, target.sheet.getLastColumn()).getValues().flat();
  const target_col = header.indexOf(target.total_col_itemname) + 1;
  return target.sheet.getRange(target_row, target_col).getValue();
} 
function check_output_values() {
  initial_process();
  filterhidden();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  const array_quotation_request = sheet.quotation_request.getRange(1, 1, 2, sheet.quotation_request.getDataRange().getLastColumn()).getValues();
  const facilities_value = get_quotation_request_value(array_quotation_request, get_s_p.getProperty('facilities_itemname'));  
  const number_of_cases_value = get_quotation_request_value(array_quotation_request, get_s_p.getProperty('number_of_cases_itemname'));
  const trial_months_col = 5;
  var output_row = 1;
  var output_col = 1;
  var setup_closing_months = 0;
  sheet.check.clear();
  const trial_start_end = [['OK/NG', '詳細', '', ''],
                           ['',
                            '症例登録開始〜試験終了日の月数チェック（作業用）',
                            get_quotation_request_value(array_quotation_request, '症例登録開始日').toLocaleDateString("ja"),
                            get_quotation_request_value(array_quotation_request, '試験終了日').toLocaleDateString("ja")]];
  sheet.check.getRange(output_row, output_col, trial_start_end.length, trial_start_end[0].length).setValues(trial_start_end);
  output_row = trial_start_end.length;
  output_col = output_col + trial_start_end[0].length;
  sheet.check.getRange(output_row, output_col).setFormula('=datedif(C2, D2, "M") + if(day(C2) < day(D2), 1, 2)');
  output_col++;
  if ((get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')) | 
      (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('specified_clinical_trial'))){
    setup_closing_months = 12;
  } else {
    setup_closing_months = 6;
    if (get_quotation_request_value(array_quotation_request, '研究結果報告書作成支援') == 'あり'){
      setup_closing_months = setup_closing_months + 3;
    }
  }
  SpreadsheetApp.flush();
  // 試験月数, setup~closing月数を取得
  const trial_months = sheet.check.getRange(output_row, trial_months_col).getValue();
  const total_months = trial_months + setup_closing_months;
  sheet.check.getRange(output_row, output_col).setValue(total_months);
  const total_total_ammount = get_total_amount({sheet:sheet.total, item_cols:'B:B', total_row_itemname:'合計', header_row:4, total_col_itemname:'金額'});
  const total2_total_ammount = get_total_amount({sheet:sheet.total2, item_cols:'B:B', total_row_itemname:'合計', header_row:4, total_col_itemname:'合計'});
  const total3_total_ammount = get_total_amount({sheet:sheet.total3, item_cols:'B:B', total_row_itemname:'合計', header_row:3, total_col_itemname:'合計'});
  var ammount_check = [null, 'Total, Total2, Total3の合計金額チェック'];
  if ((total_total_ammount == total2_total_ammount) & (total_total_ammount == total3_total_ammount)){
    ammount_check[0] = 'OK';
  } else {
    ammount_check[0] = 'NG';
  }
  output_row++;
  sheet.check.getRange(output_row, 1, 1, ammount_check[0].length).setValues([ammount_check]);
  var total_checkitems = [];
  var total_ammount_checkitems = [];
  const target_total = {sheet:sheet.total, 
                        array_item:get_fy_items(sheet.total, get_s_p.getProperty('fy_sheet_items_col')), 
                        col:parseInt(get_s_p.getProperty('fy_sheet_count_col')), 
                        footer:null};
  const target_total_ammount = {sheet:sheet.total, 
                                array_item:get_fy_items(sheet.total, 2), 
                                col:9, 
                                footer:'（金額）'};
  total_checkitems.push({itemname:'プロトコルレビュー・作成支援（図表案、統計解析計画書案を含む）', value:1});  
  total_checkitems.push({itemname:'検討会実施（TV会議等）', value:4}); 
  var temp_name = 'PMDA相談資料作成支援';
  if (get_quotation_request_value(array_quotation_request, temp_name) == 'あり'){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  var temp_name = 'AMED申請資料作成支援';
  if (get_quotation_request_value(array_quotation_request, temp_name) == 'あり'){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  total_checkitems.push({itemname:'削除予定', value:''});  
  total_checkitems.push({itemname:'システム開発', value:''});  
  total_checkitems.push({itemname:'プロジェクト管理', value:1});  
  var temp_name = '事務局運営';
  if ((get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')) | 
      ((get_quotation_request_value(array_quotation_request, '調整事務局設置の有無') == 'あり'))){
    var temp_value = total_months;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  total_checkitems.push({itemname:'医師主導治験対応', value:temp_value});
  var temp_name = 'ミーティング準備・実行';
  var temp_value = 0;
  if (get_quotation_request_value(array_quotation_request, 'キックオフミーティング') == 'あり'){
    temp_value++;
  }
  if (Number.isInteger(get_quotation_request_value(array_quotation_request, 'その他会議（のべ回数）'))){
    temp_value = temp_value + parseInt(get_quotation_request_value(array_quotation_request, 'その他会議（のべ回数）'));
  }
  if (get_quotation_request_value(array_quotation_request, '症例検討会') == 'あり'){
    temp_value++;
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = 'SOP一式、CTR登録案、TMF雛形';
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    var temp_name = 'IRB承認確認、施設管理';
    var temp_value = facilities_value;
  } else {
    var temp_name = 'IRB準備・承認確認';
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = '特定臨床研究法申請資料作成支援';
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('specified_clinical_trial')){
    var temp_value = facilities_value;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  total_checkitems.push({itemname:'契約・支払手続、実施計画提出支援', value:''});  
  var temp_name = 'モニタリング準備業務（関連資料作成、キックオフ参加）';
  if (get_quotation_request_value(array_quotation_request, '1例あたりの実地モニタリング回数') > 0){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  var temp_name = '開始前モニタリング・必須文書確認';
  if (get_quotation_request_value(array_quotation_request, '年間1施設あたりの必須文書実地モニタリング回数') > 0){
    var temp_value = parseInt(get_quotation_request_value(array_quotation_request, '年間1施設あたりの必須文書実地モニタリング回数')) * facilities_value;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = '症例モニタリング・SAE対応';
  if (get_quotation_request_value(array_quotation_request, '1例あたりの実地モニタリング回数') > 0){
    var temp_value = parseInt(get_quotation_request_value(array_quotation_request, '1例あたりの実地モニタリング回数')) * number_of_cases_value;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  total_checkitems.push({itemname:'問い合わせ対応', value:''});  
  total_checkitems.push({itemname:'EDCライセンス・データベースセットアップ', value:1});  
  total_checkitems.push({itemname:'データベース管理料', value:trial_months});  
  total_checkitems.push({itemname:'業務分析・DM計画書の作成・CTR登録案の作成', value:1});  
  total_checkitems.push({itemname:'紙CRFのEDC代理入力（含む問合せ）', value:''});  
  total_checkitems.push({itemname:'DB作成・eCRF作成・バリデーション', value:1});  
  total_checkitems.push({itemname:'バリデーション報告書', value:1});  
  total_checkitems.push({itemname:'初期アカウント設定（施設・ユーザー）、IRB承認確認', value:facilities_value});  
  total_checkitems.push({itemname:'入力の手引作成', value:1});  
  var temp_value = trial_months;
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    var temp_name = '中央モニタリング';
  } else {
    var temp_name = '中央モニタリング、定期モニタリングレポート作成';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  const interim_count = target_total.sheet.getRange(target_total.array_item['中間解析報告書作成（出力結果＋表紙）'], target_total.col).getValue();
  const closing_count = target_total.sheet.getRange(target_total.array_item['データベース固定作業、クロージング'], target_total.col).getValue();
  total_checkitems.push({itemname:'データクリーニング', value:interim_count + closing_count});  
  total_checkitems.push({itemname:'データベース固定作業、クロージング', value:1});  
  var temp_name = '症例検討会資料作成';
  if (get_quotation_request_value(array_quotation_request, '症例検討会') == 'あり'){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = '安全性管理事務局業務';
  if (get_quotation_request_value(array_quotation_request, '安全性管理事務局設置') == '設置・委託する'){
    var temp_value = trial_months;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  var temp_name = '効果安全性評価委員会事務局業務';
  if (get_quotation_request_value(array_quotation_request, '効安事務局設置') == '設置・委託する'){
    var temp_value = trial_months;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});    
  var temp_name = '統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成';
  var temp_value = 0;
  if (get_quotation_request_value(array_quotation_request, '中間解析業務の依頼') == 'あり'){
    temp_value++;
  }
  if (get_quotation_request_value(array_quotation_request, '最終解析業務の依頼') == 'あり'){
    temp_value++;
  }
  if (temp_value == 0){
    var temp_value = '';
  } 
  total_checkitems.push({itemname:temp_name, value:temp_value});    
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    var temp_name = '中間解析プログラム作成、解析実施（ダブル）';
  } else {
    var temp_name = '中間解析プログラム作成、解析実施（シングル）';
  }
  if (get_quotation_request_value(array_quotation_request, '中間解析業務の依頼') == 'あり'){
    var temp_value = '回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認';
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  var temp_name = '中間解析報告書作成（出力結果＋表紙）';
  if (get_quotation_request_value(array_quotation_request, '中間解析業務の依頼') == 'あり'){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    var temp_name = '最終解析プログラム作成、解析実施（ダブル）';
  } else {
    var temp_name = '最終解析プログラム作成、解析実施（シングル）';
  }
  if (get_quotation_request_value(array_quotation_request, '最終解析業務の依頼') == 'あり'){
    var temp_value = get_quotation_request_value(array_quotation_request, '統計解析に必要な図表数');
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  var temp_name = '最終解析報告書作成（出力結果＋表紙）';
  if (get_quotation_request_value(array_quotation_request, '最終解析業務の依頼') == 'あり'){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    var temp_name = 'CSRの作成支援';
    var temp_value = 1;
  } else {
    var temp_name = '研究結果報告書の作成';
    if (get_quotation_request_value(array_quotation_request, '研究結果報告書作成支援') == 'あり'){
      var temp_value = 1;
    } else {
      var temp_value = '';
    }
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  total_checkitems.push({itemname:'監査計画書作成', value:''});  
  total_checkitems.push({itemname:'施設監査', value:''});  
  total_checkitems.push({itemname:'監査報告書作成', value:''});  
  var temp_name = '試験開始準備費用';
  if (get_quotation_request_value(array_quotation_request, temp_name) == 'あり'){
    var temp_value = facilities_value;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  var temp_name = '症例登録';
  if (get_quotation_request_value(array_quotation_request, '症例登録毎の支払い') == 'あり'){
    var temp_value = number_of_cases_value;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  var temp_name = '症例報告';
  if (get_quotation_request_value(array_quotation_request, '症例最終報告書提出毎の支払い') == 'あり'){
    var temp_value = number_of_cases_value;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  total_checkitems.push({itemname:'国内学会発表', value:''});  
  total_checkitems.push({itemname:'国際学会発表', value:''});  
  total_checkitems.push({itemname:'論文作成', value:''});  
  var temp_name = 'CRB申請費用(初年度)';
  if (get_quotation_request_value(array_quotation_request, 'CRB申請') == 'あり'){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = 'CRB申請費用(2年目以降)';
  if (get_quotation_request_value(array_quotation_request, 'CRB申請') == 'あり'){
    if (trial_months > 12){
      var temp_year = Math.trunc(trial_months / 12) - 1;
    } else {
      var temp_year = '';
    }
    var temp_value = temp_year;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = '外部監査費用';
  if (get_quotation_request_value(array_quotation_request, '監査対象施設数') > 0){
    var temp_value = 2;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = '施設監査費用';
  if (get_quotation_request_value(array_quotation_request, '監査対象施設数') > 0){
    var temp_value = get_quotation_request_value(array_quotation_request, '監査対象施設数');
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = '保険料';
  if (get_quotation_request_value(array_quotation_request, temp_name) > 0){
    var temp_value = 1;
    var temp_total_ammount = get_quotation_request_value(array_quotation_request, temp_name);
  } else {
    var temp_value = '';
    var temp_total_ammount = 0;
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  total_ammount_checkitems.push({itemname:temp_name, value:temp_total_ammount});
  total_checkitems.push({itemname:'QOL調査', value:''});  
  var temp_name = '治験薬運搬';
  if (get_quotation_request_value(array_quotation_request, temp_name) > 0){
    var temp_value = facilities_value;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = '治験薬管理（中央）';
  if (get_quotation_request_value(array_quotation_request, '治験薬管理') > 0){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  total_checkitems.push({itemname:'翻訳', value:''});  
  total_checkitems.push({itemname:'CDISC対応費', value:''});  
  total_checkitems.push({itemname:'中央診断謝金', value:''});  
  if (get_quotation_request_value(array_quotation_request, '研究協力費、負担軽減費配分管理') == 'あり'){
    var total_ammount = get_quotation_request_value(array_quotation_request, '研究協力費、負担軽減費');
  } else {
    var total_ammount = 0;
  }
  total_ammount_checkitems.push({itemname:'研究協力費', value:total_ammount});
  const res_total = total_checkitems.map(checkitems => check_itemName_and_value(target_total, checkitems.itemname, checkitems.value)); 
  const res_total_ammount = total_ammount_checkitems.map(total_ammount_checkitems => check_itemName_and_value(target_total_ammount, total_ammount_checkitems.itemname, total_ammount_checkitems.value)); 
  const output_values = res_total.concat(res_total_ammount);
  output_row++;
  sheet.check.getRange(output_row, 1, output_values.length, output_values[0].length).setValues(output_values);
}
