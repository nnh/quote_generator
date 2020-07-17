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
  const const_pattern_index = [0, 1];
  const const_trial_type = ['観察研究・レジストリ', '介入研究（特定臨床研究以外）', '医師主導治験', '特定臨床研究'];
  const const_ari_nashi = ['あり', 'なし'];
  const const_stat_table = [0, 1, 49, 50, 51, 100];
  const const_principal = ['営利企業原資（製薬企業等）', '公的資金（税金由来）'];
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
}
function total_check(test_condition){
  // F列の回数をチェックする
  // 共通
	//	プロトコルレビュー・作成支援（図表案、統計解析計画書案を含む）が1である
	//	検討会実施（TV会議等）が4である
	//	削除予定が0である
	//	システム開発が0である
	//	プロジェクト管理が1である
	//	契約・支払手続、実施計画提出支援が0である
	//	問い合わせ対応が0である
	//	EDCライセンス・データベースセットアップが1である
	//	業務分析・DM計画書の作成・CTR登録案の作成が1である
	//	紙CRFのEDC代理入力（含む問合せ）が0である
	//	DB作成・eCRF作成・バリデーションが1である
	//	バリデーション報告書が1である
	//	入力の手引作成が1である
	//	データベース固定作業、クロージングが1である
	//	監査計画書作成が0である
	//	施設監査が0である
	//	監査報告書作成が0である
	//	国内学会発表が0である
	//	国際学会発表が0である
	//	論文作成が0である
	//	QOL調査が0である
	//	治験薬運搬が0である
	//	治験薬管理（中央）が0である
	//	翻訳が0である
	//	CDISC対応費が0である
	//	中央診断謝金が0である
	//	データベース管理料が症例登録開始〜試験終了の月数である
	//	中央モニタリング、定期モニタリングレポート作成が症例登録開始〜試験終了の月数である

  switch (test_condition.pattern_index){
  case 1:
	//	PMDA相談資料作成支援
	//	AMED申請資料作成支援
	//	保険料
	//	モニタリング準備業務（関連資料作成、キックオフ参加）
	//	開始前モニタリング・必須文書確認
	//	症例モニタリング・SAE対応
	//	外部監査費用
	//	施設監査費用
	//	ミーティング準備・実行
      
      break;
  default:
	//	PMDA相談資料作成支援
	//	AMED申請資料作成支援
	//	保険料
	//	モニタリング準備業務（関連資料作成、キックオフ参加）
	//	開始前モニタリング・必須文書確認
	//	症例モニタリング・SAE対応
	//	外部監査費用
	//	施設監査費用
	//	ミーティング準備・実行
      break;
  }
  	//安全性管理業務	
	//	安全性管理事務局業務
	//	効果安全性評価委員会事務局業務
	//統計解析業務	
	//	統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成
	//	中間解析プログラム作成、解析実施（シングル）
	//	中間解析報告書作成（出力結果＋表紙）
	//	最終解析プログラム作成、解析実施（シングル）
	//	最終解析報告書作成（出力結果＋表紙）

  
  
  //試験事務局業務	
	//	事務局運営
	//	医師主導治験対応
	//	SOP一式、CTR登録案、TMF雛形
	//	IRB準備・承認確認
	//	特定臨床研究法申請資料作成支援
	//データマネジメント業務	
	//EDC構築	
	//	初期アカウント設定（施設・ユーザー）、IRB承認確認
	//中央モニタリング	
	//	データクリーニング
	//	症例検討会資料作成
	//研究結果報告書業務	
	//	研究結果報告書の作成
	//研究協力費	
	//	試験開始準備費用
	//	症例登録
	//	症例報告
	//CRB申請費用	
	//	CRB申請費用(初年度)
	//	CRB申請費用(2年目以降)
}