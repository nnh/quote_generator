function test(test_condition){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = ss.getSheetByName('Quotation Request');
  sheet.getRange(2, 1, 1, getColumnNumber('AP')).setValue('');
  var target_col = 0;
  // タイムスタンプ
  var today = new Date();
  target_col++;
  sheet.getRange(2, target_col).setValue(today);
  // 見積種別
  target_col++;
  switch (test_condition.pattern_index){
  case 1:
      sheet.getRange(2, target_col).setValue('参考見積');
      break;
  default:
      sheet.getRange(2, target_col).setValue('正式見積');
      break;
  }
  // 見積発行先
  target_col++;
  sheet.getRange(2, target_col).setValue('テスト見積発行先');
  // 研究代表者名
  target_col++;
  sheet.getRange(2, target_col).setValue('テスト研究代表者名');
  // 試験課題名
  target_col++;
  sheet.getRange(2, target_col).setValue('テスト試験課題名');
  // 試験実施番号
  target_col++;
  sheet.getRange(2, target_col).setValue('テスト試験実施番号');
  // 試験種別
  target_col++;
  sheet.getRange(2, target_col).setValue(test_condition.trial_type);
  switch (test_condition.trial_type){
  case '観察研究・レジストリ':
      break;
  case '介入研究（特定臨床研究以外）':
      break;
  case '特定臨床研究':
      // CRB申請
      // 研究結果報告書作成支援
      target_col = getColumnNumber('L');
      switch (test_condition.pattern_index){
      case 1:
          sheet.getRange(2, target_col).setValue('あり');
          target_col++;
          sheet.getRange(2, target_col).setValue('あり');
          break;
      default:
          sheet.getRange(2, target_col).setValue('なし');
          target_col++;
          sheet.getRange(2, target_col).setValue('なし');
          break;
      };
      break;
  default:
      // 医師主導治験
      // PMDA相談資料作成支援
      // 症例検討会
      // 治験薬管理
      // 治験薬運搬
      for (var i = 1; i <= 4; i++){
        target_col++;
        switch (test_condition.pattern_index){
        case 1:
            sheet.getRange(2, target_col).setValue('あり');
            break;
        default:
            sheet.getRange(2, target_col).setValue('なし');
            break;
        };
      };
    break;
  }
  // 副作用モニタリング終了日は現在未使用のため暫定で今日を設定
  target_col = getColumnNumber('N');
  sheet.getRange(2, target_col).setValue(today);
  // 1例あたりの実地モニタリング回数  
  // 年間1施設あたりの必須文書実地モニタリング回数
  target_col++;
  switch (test_condition.pattern_index){
  case 1:
      sheet.getRange(2, target_col).setValue(2);
      target_col++;
      sheet.getRange(2, target_col).setValue(3);
      break;
  default:
      sheet.getRange(2, target_col).setValue(0);
      target_col++;
      sheet.getRange(2, target_col).setValue(0);
      break;
  };
  // 監査対象施設数
  target_col++;
  switch (test_condition.pattern_index){
  case 1:
      sheet.getRange(2, target_col).setValue(11);
      break;
  default:
      sheet.getRange(2, target_col).setValue(0);
      break;
  };
  // 保険料
  target_col++;
  switch (test_condition.pattern_index){
  case 1:
      sheet.getRange(2, target_col).setValue(1000000);
      break;
  default:
      sheet.getRange(2, target_col).setValue(0);
      break;
  };
  // 効安事務局設置
  target_col++;
  switch (test_condition.kouan){
  case 'あり':
      sheet.getRange(2, target_col).setValue('設置・委託する');
      break;
  default:
      sheet.getRange(2, target_col).setValue('設置しない、または委託しない');
      break;
  };
  // 安全性管理事務局設置
  target_col++;
  switch (test_condition.ankan){
  case 'あり':
      sheet.getRange(2, target_col).setValue('設置・委託する');
      break;
  default:
      sheet.getRange(2, target_col).setValue('設置しない、または委託しない');
      break;
  };
  // AMED申請資料作成支援
  target_col++;
  switch (test_condition.pattern_index){
  case 1:
      sheet.getRange(2, target_col).setValue('あり');
      break;
  default:
      sheet.getRange(2, target_col).setValue('なし');
      break;
  }
  // 目標症例数
  target_col++;
  sheet.getRange(2, target_col).setValue(100);
  // 実施施設数
  target_col++;
  sheet.getRange(2, target_col).setValue(200);
  // CRF項目数
  target_col++;
  sheet.getRange(2, target_col).setValue(300);
  // 症例登録開始日
  target_col++;
  sheet.getRange(2, target_col).setValue(test_condition.registration_start);
  // 症例登録終了日
  target_col++;
  sheet.getRange(2, target_col).setValue(test_condition.registration_end);
  // 試験終了日
  target_col++;
  sheet.getRange(2, target_col).setValue(test_condition.trial_end);
  // キックオフミーティング
  target_col++;
  switch (test_condition.pattern_index){
  case 1:
      sheet.getRange(2, target_col).setValue('あり');
      break;
  default:
      sheet.getRange(2, target_col).setValue('なし');
      break;
  }
  // その他会議（のべ回数）
  target_col++;
  switch (test_condition.pattern_index){
  case 1:
      sheet.getRange(2, target_col).setValue(5);
      break;
  default:
      sheet.getRange(2, target_col).setValue(0);
      break;
  }
  // 中間解析に必要な図表数
  // 中間解析業務の依頼
  target_col++;
  if (test_condition.interim_table > 0){
    sheet.getRange(2, target_col).setValue(test_condition.interim_table);
    target_col = getColumnNumber('AO');
    sheet.getRange(2, target_col).setValue('あり');    
  } else {
    sheet.getRange(2, target_col).setValue('');
    target_col = getColumnNumber('AO');
    sheet.getRange(2, target_col).setValue('なし');    
  }
  // 中間解析の頻度は空白にしておく
  target_col = getColumnNumber('AE');
  sheet.getRange(2, target_col).setValue('');    
  // 統計解析に必要な図表数
  // 最終解析業務の依頼
  target_col++;
  if (test_condition.stat_table > 0){
    sheet.getRange(2, target_col).setValue(test_condition.stat_table);
    target_col = getColumnNumber('AP');
    sheet.getRange(2, target_col).setValue('あり');    
  } else {
    sheet.getRange(2, target_col).setValue('');
    target_col = getColumnNumber('AP');
    sheet.getRange(2, target_col).setValue('なし');    
  }
  // 研究協力費、負担軽減費配分管理
  // 研究協力費、負担軽減費
  // 試験開始準備費用
  // 症例登録毎の支払
  // 症例最終報告書提出毎の支払
  target_col = getColumnNumber('AG');
  switch (test_condition.pattern_index){
  case 1:
      sheet.getRange(2, target_col).setValue('あり');
      target_col++;
      sheet.getRange(2, target_col).setValue(1500000);
      target_col++;
      sheet.getRange(2, target_col).setValue(test_condition.preparation_costs);
      target_col++;
      sheet.getRange(2, target_col).setValue(test_condition.registration_costs);
      target_col++;
      sheet.getRange(2, target_col).setValue(test_condition.report_costs);      
      break;
  default:
      sheet.getRange(2, target_col).setValue('なし');
      target_col++;
      sheet.getRange(2, target_col).setValue('');
      break;
  }
  // CDISC対応
  target_col = getColumnNumber('AL');
  switch (test_condition.pattern_index){
  case 1:
      sheet.getRange(2, target_col).setValue('あり');
      break;
  default:
      sheet.getRange(2, target_col).setValue('なし');
      break;
  }
  // 備考は空白で
  target_col++;
  sheet.getRange(2, target_col).setValue('');    
  // 原資
  target_col++;
  sheet.getRange(2, target_col).setValue(test_condition.principal);
  // 見積作成処理実行
  quote_script_main();
}
function call_test(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const const_pattern_index = [0, 1];
  const const_trial_type = ['観察研究・レジストリ', '介入研究（特定臨床研究以外）', get_s_p.getProperty('investigator_initiated_trial'), get_s_p.getProperty('specified_clinical_trial')];
  const const_ari_nashi = ['あり', 'なし'];
  const const_stat_table = [0, 1, 49, 50, 51, 100];
  const const_principal = ['営利企業原資（製薬企業等）', '公的資金（税金由来）'];
  const output_sheet = ss.getSheetByName('Validation');
  // 試験種別毎、パターン別
  var condition_table = [];
  for (var i = 0; i < const_pattern_index.length; i++){
    for (var j = 0; j < const_trial_type.length; j++){
      Logger.log(const_pattern_index[i]);
      condition_table[i, j] = [const_pattern_index[i], const_trial_type[j]];
    }
  }
  Logger.log(condition_table);
  return;
  var output_row = 1;
  output_sheet.clear();
  var test_condition = {};
  test_condition.pattern_index = const_pattern_index[0];
  test_condition.trial_type = const_trial_type[0];
  test_condition.kouan = const_ari_nashi[0];
  test_condition.ankan = const_ari_nashi[0]; 
  test_condition.registration_start = '2030/1/1';
  test_condition.registration_end = '2033/12/31';
  test_condition.trial_end = '2035/10/30';
  test_condition.interim_table = const_stat_table[0]; 
  test_condition.stat_table = const_stat_table[0];
  test_condition.preparation_costs = const_ari_nashi[0];
  test_condition.registration_costs = const_ari_nashi[0];
  test_condition.report_costs = const_ari_nashi[0];
  test_condition.principal = const_principal[0];
  test(test_condition);
  var test_result = total_check(test_condition, 'テスト1');
  output_sheet.getRange(output_row, 1, test_result.length, test_result[0].length).setValues(test_result);
  output_row = output_sheet.getLastRow() + 1;
  Logger.log(output_row);

}
function compare_value(compare_list){
  // 値が等しければOK, 異なればセルの内容を返す
  var res = 'OK';
  const cell_value = compare_list.target_sheet.getRange(compare_list.target_row, compare_list.target_col).getValue();
  if (cell_value != compare_list.compare_string){
    res = cell_value;
  }
  return res;
}
function total_check(test_condition, test_item){
  // 主にTotalシートのF列の回数をチェックする
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  const total_sheet = ss.getSheetByName('Total');
  const items_list = get_fy_items(total_sheet, get_s_p.getProperty('fy_sheet_items_col'));
  const quotation_request_sheet = ss.getSheetByName('Quotation Request');
  const facilities = quotation_request_sheet.getRange('W2').getValue();
  const number_of_cases = quotation_request_sheet.getRange('V2').getValue();
  const registration_start_date = Moment.moment(quotation_request_sheet.getRange('Y2').getValue());
  const trial_end_date = Moment.moment(quotation_request_sheet.getRange('AA2').getValue());
  const months_from_registration_start_to_trial_end = trial_end_date.diff(registration_start_date, 'months') + 1;
  var setup_closing_term;
  if (get_s_p.getProperty('investigator_initiated_trial') || get_s_p.getProperty('specified_clinical_trial')){
    setup_closing_term = 12;
  } else {
    if (quotation_request_sheet.getRange('M2').getValue() == 'あり'){
      setup_closing_term = 9;
    } else {
      setup_closing_term = 6;
    }
  }
  const term_of_contract = setup_closing_term + months_from_registration_start_to_trial_end;  // 契約月数
  var output_list = [];
  // 共通項目
	//	プロトコルレビュー・作成支援（図表案、統計解析計画書案を含む）が1である
  output_list.push([test_item, 'プロトコルレビュー・作成支援（図表案、統計解析計画書案を含む）', 1]);
	//	検討会実施（TV会議等）が4である
  output_list.push([test_item, '検討会実施（TV会議等）', 4]);
	//	削除予定が0である
  output_list.push([test_item, '削除予定', 0]);
	//	システム開発が0である
  output_list.push([test_item, 'システム開発', 0]);
	//	プロジェクト管理が1である
  output_list.push([test_item, 'プロジェクト管理', 1]);
	//	契約・支払手続、実施計画提出支援が0である
  output_list.push([test_item, '契約・支払手続、実施計画提出支援', 0]);
	//	問い合わせ対応が0である
  output_list.push([test_item, '問い合わせ対応', 0]);
	//	EDCライセンス・データベースセットアップが1である
  output_list.push([test_item, 'EDCライセンス・データベースセットアップ', 1]);
	//	業務分析・DM計画書の作成・CTR登録案の作成が1である
  output_list.push([test_item, '業務分析・DM計画書の作成・CTR登録案の作成', 1]);
	//	紙CRFのEDC代理入力（含む問合せ）が0である
  output_list.push([test_item, '紙CRFのEDC代理入力（含む問合せ）', 0]);
	//	DB作成・eCRF作成・バリデーションが1である
  output_list.push([test_item, 'DB作成・eCRF作成・バリデーション', 1]);
	//	バリデーション報告書が1である
  output_list.push([test_item, 'バリデーション報告書', 1]);
	//	入力の手引作成が1である
  output_list.push([test_item, '入力の手引作成', 1]);
	//	データベース固定作業、クロージングが1である
  output_list.push([test_item, 'データベース固定作業、クロージング', 1]);
	//	監査計画書作成が0である
  output_list.push([test_item, '監査計画書作成', 0]);
	//	施設監査が0である
  output_list.push([test_item, '施設監査', 0]);
	//	監査報告書作成が0である
  output_list.push([test_item, '監査報告書作成', 0]);
	//	国内学会発表が0である
  output_list.push([test_item, '国内学会発表', 0]);
	//	国際学会発表が0である
  output_list.push([test_item, '国際学会発表', 0]);
	//	論文作成が0である
  output_list.push([test_item, '論文作成', 0]);
	//	QOL調査が0である
  output_list.push([test_item, 'QOL調査', 0]);
	//	翻訳が0である
  output_list.push([test_item, '翻訳', 0]);
	//	CDISC対応費が0である
  output_list.push([test_item, 'CDISC対応費', 0]);
	//	中央診断謝金が0である
  output_list.push([test_item, '中央診断謝金', 0]);
	//	データベース管理料が症例登録開始〜試験終了の月数である
  output_list.push([test_item, 'データベース管理料', months_from_registration_start_to_trial_end]);
	//	中央モニタリング、定期モニタリングレポート作成が症例登録開始〜試験終了の月数である。医師主導治験なら項目名が中央モニタリングである。
  var temp_item_name = '中央モニタリング、定期モニタリングレポート作成';
  if (test_condition.trial_type == get_s_p.getProperty('investigator_initiated_trial')){
    temp_item_name = '中央モニタリング';
  }
  output_list.push([test_item, temp_item_name, months_from_registration_start_to_trial_end]);
	//	初期アカウント設定（施設・ユーザー）、IRB承認確認が施設数である
  output_list.push([test_item, '初期アカウント設定（施設・ユーザー）、IRB承認確認', facilities]);
  switch (test_condition.pattern_index){
  case 1:
	//	医師主導治験ならPMDA相談資料作成支援が1である、それ以外なら0である。
    //	医師主導治験なら症例検討会が1である、それ以外なら0である。
    //	医師主導治験なら治験薬管理が1である、それ以外なら0である。
    //	医師主導治験なら治験薬運搬が施設数である、それ以外なら0である。
    //  医師主導治験なら症例検討会資料作成が1である、それ以外なら0である。
      var temp_count = 0;
      var investigational_drug_transport = 0;
      var meeting_count = 1;
      var trial_report = 0;
      if (get_s_p.getProperty('investigator_initiated_trial')){
        temp_count = 1;
        investigational_drug_transport = facilities;
        meeting_count = 2;
        trial_report = 1;
      }
      output_list.push([test_item, 'PMDA相談資料作成支援', temp_count]);
      output_list.push([test_item, '症例検討会資料作成', temp_count]);
      output_list.push([test_item, '治験薬管理（中央）', temp_count]);
      output_list.push([test_item, '治験薬運搬', investigational_drug_transport]);
      output_list.push([test_item, '症例検討会資料作成', temp_count]);
	//	AMED申請資料作成支援が1である
      output_list.push([test_item, 'AMED申請資料作成支援', 1]);
	//	保険料が1である。単価が1000000である。
      output_list.push([test_item, '保険料', 1]);
	//	モニタリング準備業務（関連資料作成、キックオフ参加）が1である
      output_list.push([test_item, 'モニタリング準備業務（関連資料作成、キックオフ参加）', 1]);
	//	開始前モニタリング・必須文書確認が2*施設数である
      output_list.push([test_item, '開始前モニタリング・必須文書確認', facilities * 2]);
	//	症例モニタリング・SAE対応が3*症例数である
      output_list.push([test_item, '症例モニタリング・SAE対応', number_of_cases * 3]);
	//	外部監査費用が2である
      output_list.push([test_item, '外部監査費用', 2]);
	//	施設監査費用が11である
      output_list.push([test_item, '施設監査費用', quotation_request_sheet.getRange('Q2').getValue()]);
	//	ミーティング準備・実行が1である。医師主導治験ならば2である。
      output_list.push([test_item, 'ミーティング準備・実行', meeting_count]);
	//	試験開始準備費用が施設数である
      output_list.push([test_item, '試験開始準備費用', 0]);
	//	症例登録が症例数である
      output_list.push([test_item, '症例登録', number_of_cases]);
	//	症例報告が症例数である
      output_list.push([test_item, '症例報告', number_of_cases]);
	//	特定臨床研究ならCRB申請費用(初年度)が1である、それ以外なら0である。
	//	特定臨床研究ならCRB申請費用(2年目以降)が契約期間年数-1である、それ以外なら0である。
	//	特定臨床研究なら特定臨床研究法申請資料作成支援が施設数である、それ以外なら0である。
	//	特定臨床研究または医師主導治験なら研究結果報告書の作成が1である。それ以外なら0である。
      var temp_count = 0;
      var crb_after_2year = 0;
      var support_specified_clinical_trial = 0;
      var trial_report = 0;
      if (get_s_p.getProperty('specified_clinical_trial')){
        temp_count = 1;
        support_specified_clinical_trial = facilities;
        trial_report = 1;
        crb_after_2year = parseInt(term_of_contract / 12) - 1
      }
      output_list.push([test_item, 'CRB申請費用(初年度)', temp_count]);
      output_list.push([test_item, 'CRB申請費用(2年目以降)', crb_after_2year]);
      output_list.push([test_item, '特定臨床研究法申請資料作成支援', support_specified_clinical_trial]);
      output_list.push([test_item, '研究結果報告書の作成', trial_report]); 
      break;
  default:
	//	PMDA相談資料作成支援が0である。
      output_list.push([test_item, 'PMDA相談資料作成支援', 0]);
	//	AMED申請資料作成支援が0である。
      output_list.push([test_item, 'AMED申請資料作成支援', 0]);
	//	保険料が0である。
      output_list.push([test_item, '保険料', 0]);
	//	モニタリング準備業務（関連資料作成、キックオフ参加）
      output_list.push([test_item, 'モニタリング準備業務（関連資料作成、キックオフ参加）', 0]);
	//	開始前モニタリング・必須文書確認
      output_list.push([test_item, '開始前モニタリング・必須文書確認', 0]);
	//	症例モニタリング・SAE対応
      output_list.push([test_item, '症例モニタリング・SAE対応', 0]);
	//	外部監査費用が0である
      output_list.push([test_item, '外部監査費用', 0]);
	//	施設監査費用が0である
      output_list.push([test_item, '施設監査費用', 0]);
	//	ミーティング準備・実行が0である
      output_list.push([test_item, 'ミーティング準備・実行', 0]);
	//	試験開始準備費用が0である
      output_list.push([test_item, '試験開始準備費用', 0]);
	//	症例登録が0である
      output_list.push([test_item, '症例登録', 0]);
	//	症例報告が0である
      output_list.push([test_item, '症例報告', 0]);
    //  症例検討会が0である
      output_list.push([test_item, '症例検討会資料作成', 0]);
    //  治験薬管理が0である
      output_list.push([test_item, '治験薬管理（中央）', 0]);
    //  治験薬運搬が0である
      output_list.push([test_item, '治験薬運搬', 0]);
	//	CRB申請費用(初年度)が0である
      output_list.push([test_item, 'CRB申請費用(初年度)', 0]);
	//	CRB申請費用(2年目以降)が0である
      output_list.push([test_item, 'CRB申請費用(2年目以降)', 0]);
    //  特定臨床研究法申請資料作成支援が0である
      output_list.push([test_item, '特定臨床研究法申請資料作成支援', 0]);
    //  医師主導治験なら研究結果報告書の作成が1である。それ以外なら0である
      var temp_count = 0;
      if (get_s_p.getProperty('investigator_initiated_trial')){
        temp_count = 1;
      }
      output_list.push([test_item, '研究結果報告書の作成', temp_count]);
      break;
  }

  if (test_condition.ankan == 'あり'){
	//	安全性管理事務局業務が症例登録開始〜試験終了の月数である
    output_list.push([test_item, '安全性管理事務局業務', months_from_registration_start_to_trial_end]);
  } else {
	//	安全性管理事務局業務が0である
    output_list.push([test_item, '安全性管理事務局業務', 0]);
  }  
  if (test_condition.kouan == 'あり'){
	//	効果安全性評価委員会事務局業務が症例登録開始〜試験終了の月数である
    output_list.push([test_item, '効果安全性評価委員会事務局業務', months_from_registration_start_to_trial_end]);
  } else {
	//	効果安全性評価委員会事務局業務が0である
    output_list.push([test_item, '効果安全性評価委員会事務局業務', 0]);
  }  
  var temp_interim_name = '中間解析プログラム作成、解析実施（シングル）';
  var temp_stat_name = '最終解析プログラム作成、解析実施（シングル）';
  var temp_stat_table_count = quotation_request_sheet.getRange('AD2').getValue();
  // 医師主導治験ならダブル
  if (get_s_p.getProperty('investigator_initiated_trial')){
    temp_interim_name = '中間解析プログラム作成、解析実施（ダブル）';
    temp_stat_name = '最終解析プログラム作成、解析実施（ダブル）';
    if (temp_stat_table_count < 50){
      temp_stat_table_count = 50;
    }
  }
  var temp_stat_count = 0;
  if (test_condition.interim_table > 0){
    temp_stat_count++;
	//	中間解析プログラム作成、解析実施が帳票数と同じである。
    output_list.push([test_item, temp_interim_name, quotation_request_sheet.getRange('AD2').getValue()]);
	//	中間解析報告書作成（出力結果＋表紙）が1である
    output_list.push([test_item, '中間解析報告書作成（出力結果＋表紙）', 1]);
	//	データクリーニングが2である
    output_list.push([test_item, 'データクリーニング', 2]);
  } else {
	//	中間解析プログラム作成、解析実施（シングル）が0である
    output_list.push(['中間解析プログラム作成、解析実施（シングル）が0である', temp_interim_name, 0]);
	//	中間解析報告書作成（出力結果＋表紙）が0である
    output_list.push([test_item, '中間解析報告書作成（出力結果＋表紙）', 0]);
	//	データクリーニングが1である
    output_list.push([test_item, 'データクリーニング', 1]);
  }
  if (test_condition.stat_table > 0){
    temp_stat_count++;
	//	最終解析プログラム作成、解析実施が帳票数（医師主導治験で帳票数が49以下なら50）と同じである。。
    output_list.push([test_item, temp_stat_name, temp_stat_table_count]);
	//	最終解析報告書作成（出力結果＋表紙）が1である
    output_list.push([test_item, '最終解析報告書作成（出力結果＋表紙）', 1]);
  } else {
	//	最終解析プログラム作成、解析実施（シングル）が0である
    output_list.push(['最終解析プログラム作成、解析実施（シングル）', temp_stat_name, 0]);
	//	最終解析報告書作成（出力結果＋表紙）が0である
    output_list.push([test_item, '最終解析報告書作成（出力結果＋表紙）', 0]);
  }
  //	統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成が統計解析の回数分である
  output_list.push([test_item, '統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成', temp_stat_count]);

  switch (test_condition.trial_type){
  case '観察研究・レジストリ':
  case '介入研究（特定臨床研究以外）':
  case '特定臨床研究':
	//	事務局運営が0である
      output_list.push([test_item, '事務局運営', 0]);
	//	医師主導治験対応が0である
      output_list.push([test_item, '医師主導治験対応', 0]);
	//	SOP一式、CTR登録案、TMF雛形が0である
      output_list.push([test_item, 'SOP一式、CTR登録案、TMF雛形', 0]);
	//	IRB準備・承認確認が0である
      output_list.push([test_item, 'IRB準備・承認確認', 0]);
      break;
  default:
    //  医師主導治験
	//	事務局運営が全ての月数である　
      output_list.push([test_item, '事務局運営', term_of_contract]);
	//	医師主導治験対応が全ての月数である
      output_list.push([test_item, '医師主導治験対応', term_of_contract]);
	//	SOP一式、CTR登録案、TMF雛形が1である
      output_list.push([test_item, 'SOP一式、CTR登録案、TMF雛形', 0]);
    //  IRB承認確認、施設管理が施設数である
      output_list.push([test_item, 'IRB承認確認、施設管理', facilities]);
    break;
  }
  const test_result = output_list.map(function(x){
    var temp_target_row = items_list[x[1]]; 
    var output_value;
    const compare_list = {
      target_sheet: total_sheet,
      target_row: temp_target_row,
      target_col: parseInt(get_s_p.getProperty('fy_sheet_count_col')),
      compare_string: x[2]
    };
    if (compare_list.target_row != null){
      output_value = compare_value(compare_list)
    } else {
      output_value = '!!!項目なし!!!'
    }
    return [test_item, x[1], x[2], output_value];
  });
  return test_result;
}