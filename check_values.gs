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
  sheet.check.getRange(output_row, output_col).setFormula('=datedif(C2, D2, "M") + if(day(C2) <= day(D2), 1, 2)');
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
  const trial_year = trial_months > 12 ? Math.trunc(trial_months / 12) : ''; 
  const trial_ceil_year = Math.ceil(trial_months / 12);
  sheet.check.getRange(output_row, output_col).setValue(total_months);
  const total_total_ammount = get_total_amount({sheet:sheet.total, item_cols:'B:B', total_row_itemname:'合計', header_row:4, total_col_itemname:'金額'});
  const total2_total_ammount = get_total_amount({sheet:sheet.total2, item_cols:'B:B', total_row_itemname:'合計', header_row:4, total_col_itemname:'合計'});
  const total3_total_ammount = get_total_amount({sheet:sheet.total3, item_cols:'B:B', total_row_itemname:'合計', header_row:3, total_col_itemname:'合計'});
  var ammount_check = [null, 'Total, Total2, Total3の合計金額チェック'];
  if ((total_total_ammount == total2_total_ammount) & (total_total_ammount == total3_total_ammount)){
    ammount_check[0] = 'OK';
    ammount_check[1] = ammount_check[1] + ' ,想定値:' + total_total_ammount;
  } else {
    ammount_check[0] = 'NG：値が想定と異なる';
  }
  output_row++;
  sheet.check.getRange(output_row, 1, 1, ammount_check.length).setValues([ammount_check]);
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
      ((get_quotation_request_value(array_quotation_request, '調整事務局設置の有無') == 'あり')) |
      ((get_quotation_request_value(array_quotation_request, get_s_p.getProperty('coefficient')) == get_s_p.getProperty('commercial_company_coefficient')))
     ){
    var temp_value = total_months;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    var temp_value = total_months;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:'医師主導治験対応', value:temp_value});
  var temp_name = 'ミーティング準備・実行';
  var temp_value = 0;
  if (get_quotation_request_value(array_quotation_request, 'キックオフミーティング') == 'あり'){
    temp_value++;
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
    var temp_value = parseInt(get_quotation_request_value(array_quotation_request, '年間1施設あたりの必須文書実地モニタリング回数')) * facilities_value * trial_ceil_year;
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
  if (get_quotation_request_value(array_quotation_request, '試験種別') == get_s_p.getProperty('investigator_initiated_trial')){
    var temp_name = '初期アカウント設定（施設・ユーザー）';
  } else {
    var temp_name = '初期アカウント設定（施設・ユーザー）、IRB承認確認';
  }
  total_checkitems.push({itemname:temp_name, value:facilities_value});
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
  if (get_quotation_request_value(array_quotation_request, '症例最終報告書提出毎の支払') == 'あり'){
    var temp_value = number_of_cases_value;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  total_checkitems.push({itemname:'国内学会発表', value:''});  
  total_checkitems.push({itemname:'国際学会発表', value:''});  
  total_checkitems.push({itemname:'論文作成', value:''});  
  var temp_name = '名古屋医療センターCRB申請費用(初年度)';
  if (get_quotation_request_value(array_quotation_request, 'CRB申請') == 'あり'){
    var temp_value = 1;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = '名古屋医療センターCRB申請費用(2年目以降)';
  if (get_quotation_request_value(array_quotation_request, 'CRB申請') == 'あり'){
    var temp_value = trial_year > 1 ? trial_year - 1 : '';
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
  const insuranceFee = get_quotation_request_value(array_quotation_request, temp_name);
  if (insuranceFee > 0){    
    var temp_value = 1;
    var temp_total_ammount = insuranceFee;
  } else {
    var temp_value = '';
    var temp_total_ammount = 0;
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  total_ammount_checkitems.push({itemname:temp_name, value:temp_total_ammount});
  total_checkitems.push({itemname:'QOL調査', value:''});  
  var temp_name = '治験薬運搬';
  if (get_quotation_request_value(array_quotation_request, temp_name) == 'あり'){
    var temp_value = facilities_value * trial_year;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  var temp_name = '治験薬管理（中央）';
  if (get_quotation_request_value(array_quotation_request, '治験薬管理') == 'あり'){
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
  var temp_name = 'TV会議';
  const tvConference = get_quotation_request_value(array_quotation_request, 'その他会議（のべ回数）');
  if (Number.isInteger(tvConference)){
    var temp_value = tvConference;
  } else {
    var temp_value = '';
  }
  total_checkitems.push({itemname:temp_name, value:temp_value});
  const discount_byYear = checkDiscountByYearSheet_().every(x => x) ? 'OK' : 'NG：値が想定と異なる'; 
  let temp_check_1= [];
  temp_check_1.push([discount_byYear, 'Setup〜Closingシートの割引後合計のチェック']);  
  temp_check_1.push(compareTotalSheetTotaltoVerticalTotal_());  
  temp_check_1.push(compareTotal2Total3SheetVerticalTotalToHorizontalTotal_());
  temp_check_1.push([checkQuoteSum_().every(x => x) ? 'OK' : 'NG：値が想定と異なる', 'Quote, total, total2, total3の合計・割引後合計一致チェック']);
  temp_check_1.push(compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_());
  // over all
  const res_total = total_checkitems.map(checkitems => check_itemName_and_value(target_total, checkitems.itemname, checkitems.value)); 
  const res_total_ammount = total_ammount_checkitems.map(total_ammount_checkitems => check_itemName_and_value(target_total_ammount, total_ammount_checkitems.itemname, total_ammount_checkitems.value)); 
  const output_values_1 = res_total.concat(res_total_ammount);
  const output_values =  output_values_1.concat(temp_check_1);
  output_row++;
  sheet.check.getRange(output_row, 1, output_values.length, output_values[0].length).setValues(output_values);
}
/**
 * In the Total sheet, compare the total to the vertical total.
 * @param none.
 * @return {string} <array> output message.
 */
function compareTotalSheetTotaltoVerticalTotal_(){
  const sheet = get_sheets();
  const GetRowCol = new GetTargetRowCol;
  const goukeikingakuCol = GetRowCol.getTargetCol(sheet.total, 4, '金額');
  const totalValues = sheet.total.getDataRange().getValues();
  const sum = totalValues.filter(x => x[1] == '合計')[0][goukeikingakuCol - 1];
  const arrayGoukeikingaku = totalValues.filter(x => x[goukeikingakuCol] != '' && x[goukeikingakuCol] != '　合計金額').map(x => x[goukeikingakuCol]);
  const sumGoukeikingaku = arrayGoukeikingaku.reduce((x, y) => x + y, 0); 
  return [sum == sumGoukeikingaku ? 'OK' : 'NG：値が想定と異なる', 'Totalシートの縦計と合計金額のチェック, 縦計:' +  + sumGoukeikingaku + ', 合計金額:' + sum];
}
/**
 * In the Total2 sheet and Total3 sheet, compare the horizontal total to the vertical total.
 * @param none.
 * @return {string} <array> output message.
 */
class CompareTotal2Total3SheetVerticalTotalToHorizontal{
  constructor(){
    const st = get_sheets();
    this.discountRate = st.trial.getRange('B47').getValue();
    this.targetSheet = [[st.total2, 3],
                        [st.total3, 2]]; 
    this.GetRowCol = new GetTargetRowCol; 
    this.target = this.targetSheet.map(x => {
      let res = {};
      res.sheet = x[0];
      res.termRowIdx = x[1];
      res.setupIdx = 3
      res.totalValues = res.sheet.getDataRange().getValues();
      return res;      
    });    
  }
  getTargetRowCol(target, rowItemName, colItemName){
    let res = {}
    res.col = this.GetRowCol.getTargetColIndex(target.sheet, target.termRowIdx, colItemName);
    res.row = this.GetRowCol.getTargetRowIndex(target.sheet, 1, rowItemName);
    return res;
  }
  getVerticalHorizontalTotal(target, goukeiRowCol){
    let res = {};
    res.horizontalTotal = this.getHorizontalTotal(target, goukeiRowCol);
    res.verticalTotal = this.getVerticalTotal(target, goukeiRowCol);
    return res;
  }
  getHorizontalTotal(target, goukeiRowCol){
    const targetSum = target.totalValues[goukeiRowCol.row].slice(target.setupIdx, goukeiRowCol.col);
    return targetSum.filter(x => x > 0).reduce((x, y) => x + y, 0);  
  }
  getVerticalTotal(target, goukeiRowCol){
    return target.totalValues.filter((x, idx) => x[goukeiRowCol.col] > 0 && idx < goukeiRowCol.row).map(x => x[goukeiRowCol.col]).reduce((x, y) => x + y, 0);
  }
  compareTotal(){
    const res = this.target.map(x => {
      const goukeiRowCol = this.getTargetRowCol(x, '合計', '合計');
      const compareTarget = this.getVerticalHorizontalTotal(x, goukeiRowCol);
      return this.getComparisonResultEqual(compareTarget);
    });
    return [res.every(x => x) ? 'OK' : 'NG：値が想定と異なる', 'Total2, Total3の縦計と横計のチェック']; 
  }
  compareDiscountTotal(){
    // Compare the vertical totals of Total2 and 3 multiplied by the overall discount with the discounted totals of Total2 and 3.
    // An error of 1 yen is acceptable.
    const res = this.target.map(x => {
      let res = {};
      const goukeiRowCol = this.getTargetRowCol(x, '合計', '合計');
      res.verticalTotal = this.getVerticalTotal(x, goukeiRowCol) * (1 - this.discountRate);
      const discountRowCol = this.getTargetRowCol(x, '割引後合計', '合計');
      res.horizontalTotal = this.getHorizontalTotal(x, discountRowCol);
      return res;
    });
    return res.map(x => x.horizontalTotal - 1 <= x.verticalTotal && x.verticalTotal <= x.horizontalTotal + 1);     
  }
  getComparisonResultEqual(compareTarget){
    return compareTarget.horizontalTotal == compareTarget.verticalTotal;
  }
}
function compareTotal2Total3SheetVerticalTotalToHorizontalTotal_(){
  const cp = new CompareTotal2Total3SheetVerticalTotalToHorizontal;
  return cp.compareTotal();
}
function compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_(){
  const cp = new CompareTotal2Total3SheetVerticalTotalToHorizontal;
  const res = cp.compareDiscountTotal();
  return [res.every(x => x) ? 'OK' : 'NG', 'Total2, Total3の縦計*割引率と割引後合計の横計のチェック'];
}
