// Constants for trial periods and thresholds

function check_output_values() {
  initial_process();
  filterhidden();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  const array_quotation_request = sheet.quotation_request.getRange(1, 1, 2, sheet.quotation_request.getDataRange().getLastColumn()).getValues();
  const facilities_value = get_quotation_request_value(array_quotation_request, get_s_p.getProperty('facilities_itemname'));  
  const number_of_cases_value = get_quotation_request_value(array_quotation_request, get_s_p.getProperty('number_of_cases_itemname'));
  
  let output_row = 1;
  
  sheet.check.clear();
  
  // Calculate trial periods
  const trialPeriods = calculateTrialPeriods(array_quotation_request, get_s_p, sheet, output_row);
  output_row = trialPeriods.output_row;
  
  // Validate total amounts
  const amountValidation = validateTotalAmounts(sheet, output_row);
  output_row = amountValidation.output_row;
  
  // Build check items
  const checkItemsResult = buildCheckItems(array_quotation_request, get_s_p, sheet, trialPeriods, facilities_value, number_of_cases_value);
  
  // Perform final validation and output
  performFinalValidation(sheet, checkItemsResult, output_row);
}

/**
 * Calculate trial periods including setup, closing, and total months
 */
function calculateTrialPeriods(array_quotation_request, get_s_p, sheet, output_row) {
  const trial_months_col = 5;
  let output_col = 1;
  let setup_month = 0;
  let closing_month = 0;
  
  const trial_start_end = [['OK/NG', '詳細', '', ''],
                           ['',
                            '症例登録開始〜試験終了日の月数チェック（作業用）',
                            get_quotation_request_value(array_quotation_request, '症例登録開始日').toLocaleDateString("ja"),
                            get_quotation_request_value(array_quotation_request, '試験終了日').toLocaleDateString("ja")]];
  
  sheet.check.getRange(output_row, output_col, trial_start_end.length, trial_start_end[0].length).setValues(trial_start_end);
  output_row = trial_start_end.length;
  output_col = output_col + trial_start_end[0].length;
  sheet.check.getRange(output_row, output_col).setFormula('=datedif(C2, D2, "M") + if(day(C2) <= day(D2), 1, 2)');
  output_col++;
  
  if ((get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')) | 
      (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('specified_clinical_trial'))){
    setup_month = INVESTIGATOR_SETUP_MONTHS;
    closing_month = INVESTIGATOR_CLOSING_MONTHS;
  } else {
    setup_month = OTHER_SETUP_MONTHS;
    closing_month = OTHER_CLOSING_MONTHS;
    if (get_quotation_request_value(array_quotation_request, '研究結果報告書作成支援') == 'あり'){
      closing_month = closing_month + ADDITIONAL_CLOSING_MONTHS;
    }
  }
  
  const setup_closing_months = setup_month + closing_month;
  SpreadsheetApp.flush();
  
  const trial_months = sheet.check.getRange(output_row, trial_months_col).getValue();
  const total_months = trial_months + setup_closing_months;
  const trial_year = trial_months > MONTHS_PER_YEAR ? Math.trunc(trial_months / MONTHS_PER_YEAR) : ''; 
  const trial_ceil_year = Math.ceil(trial_months / MONTHS_PER_YEAR);
  
  sheet.check.getRange(output_row, output_col).setValue(total_months);
  
  return {
    trial_months,
    total_months,
    trial_year,
    trial_ceil_year,
    setup_closing_months,
    setup_month,
    closing_month,
    output_row: output_row + 1
  };
}

/**
 * Validate total amounts across Total, Total2, and Total3 sheets
 */
function validateTotalAmounts(sheet, output_row) {
  const total_total_amount = get_total_amount({sheet:sheet.total, item_cols:'B:B', total_row_itemname:'合計', header_row:4, total_col_itemname:'金額'});
  const total2_total_amount = get_total_amount({sheet:sheet.total2, item_cols:'B:B', total_row_itemname:'合計', header_row:4, total_col_itemname:'合計'});
  const total3_total_amount = get_total_amount({sheet:sheet.total3, item_cols:'B:B', total_row_itemname:'合計', header_row:3, total_col_itemname:'合計'});
  
  const amount_check = [null, 'Total, Total2, Total3の合計金額チェック'];
  if ((total_total_amount == total2_total_amount) & (total_total_amount == total3_total_amount)){
    amount_check[0] = 'OK';
    amount_check[1] = amount_check[1] + ' ,想定値:' + total_total_amount;
  } else {
    amount_check[0] = 'NG：値が想定と異なる';
  }
  
  sheet.check.getRange(output_row, 1, 1, amount_check.length).setValues([amount_check]);
  
  return {
    output_row: output_row + 1,
    amounts: { total_total_amount, total2_total_amount, total3_total_amount }
  };
}

/**
 * Build all check items for validation
 */
function buildCheckItems(array_quotation_request, get_s_p, sheet, trialPeriods, facilities_value, number_of_cases_value) {
  const { trial_months, total_months, trial_year, trial_ceil_year, setup_month, closing_month } = trialPeriods;
  
  const total_checkitems = [];
  const total_amount_checkitems = [];
  
  const target_total = {sheet:sheet.total, 
                        array_item:get_fy_items(sheet.total, get_s_p.getProperty('fy_sheet_items_col')), 
                        col:parseInt(get_s_p.getProperty('fy_sheet_count_col')), 
                        footer:null};
  
  total_checkitems.push({itemname:'プロトコルレビュー・作成支援', value:PROTOCOL_REVIEW_VALUE});  
  total_checkitems.push({itemname:'検討会実施（TV会議等）', value:MEETING_COUNT});
  
  let temp_name; 
  let temp_value;
  addConditionalCheckItem(total_checkitems, 'PMDA相談資料作成支援', array_quotation_request, 'PMDA相談資料作成支援');  
  addConditionalCheckItem(total_checkitems, 'AMED申請資料作成支援', array_quotation_request, 'AMED申請資料作成支援');  
  total_checkitems.push({itemname:'プロジェクト管理', value:total_months});  
  
  let office_bef_month = "";
  let office_count = '';
  if ((get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')) | 
      ((get_quotation_request_value(array_quotation_request, '調整事務局設置の有無') == 'あり')) |
      ((get_quotation_request_value(array_quotation_request, get_s_p.getProperty('coefficient')) == get_s_p.getProperty('commercial_company_coefficient')))){
    temp_value = trial_months;
    office_count = 1;
    office_bef_month = setup_month;
  } else {
    temp_value = '';
  }
  
  total_checkitems.push({itemname:'事務局運営（試験開始後から試験終了まで）', value:temp_value});
  total_checkitems.push({itemname:'事務局運営（試験開始前）', value:office_bef_month});
  total_checkitems.push({itemname:'事務局運営（試験終了時）', value:office_count});
  
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    temp_value = total_months;
  } else {
    temp_value = '';
  }
  
  addConditionalCheckItem(total_checkitems, 'キックオフミーティング準備・実行', array_quotation_request, 'キックオフミーティング');
  addConditionalCheckItem(total_checkitems, '症例検討会準備・実行', array_quotation_request, '症例検討会');
  
  temp_name = '薬剤対応';
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    temp_value = facilities_value;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  temp_name = 'PMDA対応、照会事項対応';
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    temp_value = '';
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  addTrialTypeCheckItem(total_checkitems, '監査対応', array_quotation_request, get_s_p, 1);
  addTrialTypeCheckItem(total_checkitems, 'SOP一式、CTR登録案、TMF管理', array_quotation_request, get_s_p, 1);
  
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    temp_name = 'IRB承認確認、施設管理';
    temp_value = facilities_value;
  } else {
    temp_name = 'IRB準備・承認確認';
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  temp_name = '特定臨床研究法申請資料作成支援';
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('specified_clinical_trial')){
    temp_value = facilities_value;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  total_checkitems.push({itemname:'契約・支払手続、実施計画提出支援', value:''});  
  
  temp_name = 'モニタリング準備業務（関連資料作成）';
  if (get_quotation_request_value(array_quotation_request, '1例あたりの実地モニタリング回数') > 0 || get_quotation_request_value(array_quotation_request, '年間1施設あたりの必須文書実地モニタリング回数') > 0){
    temp_value = 1;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  
  temp_name = `開始前モニタリング・必須文書確認
症例モニタリング・SAE対応`;
  if (get_quotation_request_value(array_quotation_request, '1例あたりの実地モニタリング回数') > 0 || get_quotation_request_value(array_quotation_request, '年間1施設あたりの必須文書実地モニタリング回数') > 0){
    temp_value = facilities_value;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  

  total_checkitems.push({itemname:'問い合わせ対応', value:''});  
  total_checkitems.push({itemname:'EDCライセンス・データベースセットアップ', value:1});  
  total_checkitems.push({itemname:'データベース管理料', value:trial_months+closing_month});  
  total_checkitems.push({itemname:'業務分析・DM計画書の作成・CTR登録案の作成', value:1});  
  total_checkitems.push({itemname:'紙CRFのEDC代理入力（含む問合せ）', value:''});  
  total_checkitems.push({itemname:'DB作成・eCRF作成・バリデーション', value:1});  
  total_checkitems.push({itemname:'バリデーション報告書', value:1});  
  
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    temp_name = '初期アカウント設定（施設・ユーザー）';
  } else {
    temp_name = '初期アカウント設定（施設・ユーザー）、IRB承認確認';
  }
  total_checkitems.push({itemname:temp_name, value:facilities_value});
  
  total_checkitems.push({itemname:'入力の手引作成', value:1});  
  temp_value = trial_months;
  total_checkitems.push({itemname:'ロジカルチェック、マニュアルチェック、クエリ対応', value:temp_value});
  
  const interim_count = target_total.sheet.getRange(target_total.array_item['中間解析報告書作成（出力結果＋表紙）'], target_total.col).getValue();
  const closing_count = target_total.sheet.getRange(target_total.array_item['データベース固定作業、クロージング'], target_total.col).getValue();
  total_checkitems.push({itemname:'データクリーニング', value:interim_count + closing_count});  
  total_checkitems.push({itemname:'データベース固定作業、クロージング', value:1});  
  
  addConditionalCheckItem(total_checkitems, '症例検討会資料作成', array_quotation_request, '症例検討会');
  
  temp_name = '安全性管理事務局業務';
  if (get_quotation_request_value(array_quotation_request, '安全性管理事務局設置') == '設置・委託する'){
    temp_value = trial_months;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  
  temp_name = '効果安全性評価委員会事務局業務';
  if (get_quotation_request_value(array_quotation_request, '効安事務局設置') == '設置・委託する'){
    temp_value = trial_months;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});    
  
  temp_name = '統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成';
  temp_value = 0;
  if (get_quotation_request_value(array_quotation_request, '中間解析業務の依頼') == 'あり'){
    temp_value++;
  }
  if (get_quotation_request_value(array_quotation_request, '最終解析業務の依頼') == 'あり'){
    temp_value++;
  }
  if (temp_value == 0){
    temp_value = '';
  } 
  total_checkitems.push({itemname:temp_name, value:temp_value});    
  
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    temp_name = '中間解析プログラム作成、解析実施（ダブル）';
  } else {
    temp_name = '中間解析プログラム作成、解析実施（シングル）';
  }
  if (get_quotation_request_value(array_quotation_request, '中間解析業務の依頼') == 'あり'){
    temp_value = get_quotation_request_value(array_quotation_request, '統計解析に必要な図表数');
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  
  addConditionalCheckItem(total_checkitems, '中間解析報告書作成（出力結果＋表紙）', array_quotation_request, '中間解析業務の依頼');  
  
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    temp_name = '最終解析プログラム作成、解析実施（ダブル）';
  } else {
    temp_name = '最終解析プログラム作成、解析実施（シングル）';
  }
  if (get_quotation_request_value(array_quotation_request, '最終解析業務の依頼') == 'あり'){
    temp_value = get_quotation_request_value(array_quotation_request, '統計解析に必要な図表数');
    if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial') && temp_value < MIN_ANALYSIS_TABLES){
      temp_value = MIN_ANALYSIS_TABLES;
    }
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  
  addConditionalCheckItem(total_checkitems, '最終解析報告書作成（出力結果＋表紙）', array_quotation_request, '最終解析業務の依頼');  
  
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    temp_name = 'CSRの作成支援';
    temp_value = 1;
  } else {
    temp_name = '研究結果報告書の作成';
    if (get_quotation_request_value(array_quotation_request, '研究結果報告書作成支援') == 'あり'){
      temp_value = 1;
    } else {
      temp_value = '';
    }
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  
  total_checkitems.push({itemname:'監査計画書作成', value:''});  
  total_checkitems.push({itemname:'施設監査', value:''});  
  total_checkitems.push({itemname:'監査報告書作成', value:''});  
  
  temp_name = '試験開始準備費用';
  if (get_quotation_request_value(array_quotation_request, temp_name) == 'あり'){
    temp_value = facilities_value;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  
  temp_name = '症例登録';
  if (get_quotation_request_value(array_quotation_request, '症例登録毎の支払') == 'あり'){
    temp_value = number_of_cases_value;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});  
  
  temp_name = '症例報告';
  if (get_quotation_request_value(array_quotation_request, '症例最終報告書提出毎の支払') == 'あり'){
    temp_value = number_of_cases_value;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  total_checkitems.push({itemname:'国内学会発表', value:''});  
  total_checkitems.push({itemname:'国際学会発表', value:''});  
  total_checkitems.push({itemname:'論文作成', value:''});  
  
  temp_name = '名古屋医療センターCRB申請費用(初年度)';
  if (get_quotation_request_value(array_quotation_request, 'CRB申請') == 'あり'){
    temp_value = 1;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  temp_name = '名古屋医療センターCRB申請費用(2年目以降)';
  if (get_quotation_request_value(array_quotation_request, 'CRB申請') == 'あり'){
    temp_value = trial_year > 1 ? trial_year - 1 : '';
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  temp_name = '外部監査費用';
  if (get_quotation_request_value(array_quotation_request, '監査対象施設数') > 0){
    temp_value = 2;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  temp_name = '施設監査費用';
  if (get_quotation_request_value(array_quotation_request, '監査対象施設数') > 0){
    temp_value = get_quotation_request_value(array_quotation_request, '監査対象施設数');
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  temp_name = '保険料';
  const insuranceFee = get_quotation_request_value(array_quotation_request, temp_name);
  let temp_total_amount;
  if (insuranceFee > 0){    
    temp_value = 1;
    temp_total_amount = insuranceFee;
  } else {
    temp_value = '';
    temp_total_amount = 0;
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  total_amount_checkitems.push({itemname:temp_name, value:temp_total_amount});
  
  total_checkitems.push({itemname:'QOL調査', value:''});  
  
  temp_name = '治験薬運搬';
  if (get_quotation_request_value(array_quotation_request, temp_name) == 'あり'){
    if (trial_year > 0) {
      temp_value = facilities_value * trial_year;
    } else {
      temp_value = facilities_value;
    }
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  temp_name = '治験薬管理（中央）';
  if (get_quotation_request_value(array_quotation_request, '治験薬管理') == 'あり'){
    temp_value = 1;
  } else {
    temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  
  total_checkitems.push({itemname:'翻訳', value:''});  
  total_checkitems.push({itemname:'CDISC対応費', value:''});  
  total_checkitems.push({itemname:'中央診断謝金', value:''});  
  
  let total_amount;
  if (get_quotation_request_value(array_quotation_request, '研究協力費、負担軽減費配分管理') == 'あり'){
    total_amount = get_quotation_request_value(array_quotation_request, '研究協力費、負担軽減費');
  } else {
    total_amount = 0;
  }
  total_amount_checkitems.push({itemname:'研究協力費', value:total_amount});
  
  return { total_checkitems, total_amount_checkitems, target_total };
}

/**
 * Perform final validation checks and write output
 */
function performFinalValidation(sheet, checkItemsResult, output_row) {
  const { total_checkitems, total_amount_checkitems, target_total } = checkItemsResult;
  
  const target_total_amount = {sheet:sheet.total, 
                                array_item:get_fy_items(sheet.total, 2), 
                                col:9, 
                                footer:'（金額）'};
  
  const discount_byYear = checkDiscountByYearSheet_().every(x => x) ? 'OK' : 'NG：値が想定と異なる'; 
  const temp_check_1= [];
  temp_check_1.push([discount_byYear, 'Setup〜Closingシートの特別値引後合計のチェック']);  
  temp_check_1.push(compareTotalSheetTotaltoVerticalTotal_());  
  temp_check_1.push(compareTotal2Total3SheetVerticalTotalToHorizontalTotal_());
  temp_check_1.push([checkQuoteSum_().every(x => x) ? 'OK' : 'NG：値が想定と異なる', 'Quote, total, total2, total3の合計・特別値引後合計一致チェック']);
  temp_check_1.push(compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_());
  
  const res_total = total_checkitems.map(checkitems => check_itemName_and_value(target_total, checkitems.itemname, checkitems.value)); 
  const res_total_amount = total_amount_checkitems.map(total_amount_checkitems => check_itemName_and_value(target_total_amount, total_amount_checkitems.itemname, total_amount_checkitems.value)); 
  const output_values_1 = res_total.concat(res_total_amount);
  const output_values =  output_values_1.concat(temp_check_1);
  
  sheet.check.getRange(output_row, 1, output_values.length, output_values[0].length).setValues(output_values);
}

/**
 * Helper function to add conditional check item based on 'あり' condition
 */
function addConditionalCheckItem(checkItems, itemName, requestArray, conditionKey, trueValue = 1, falseValue = '') {
  const temp_value = get_quotation_request_value(requestArray, conditionKey) === 'あり' ? trueValue : falseValue;
  checkItems.push({itemname: itemName, value: temp_value});
  return temp_value;
}

/**
 * Helper function to add check item based on trial type
 */
function addTrialTypeCheckItem(checkItems, itemName, requestArray, properties, investigatorValue, otherValue = '') {
  const trialType = get_quotation_request_value(requestArray, '試験種別');
  const temp_value = trialType === properties.getProperty('investigator_initiated_trial') ? investigatorValue : otherValue;
  checkItems.push({itemname: itemName, value: temp_value});
  return temp_value;
}
