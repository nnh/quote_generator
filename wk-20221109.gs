function test20221109_2(){
  // 事務局運営の月数のテスト
  let targetMonth;
  console.log('年度跨ぎ：Setupシートが7ヶ月の場合');
  targetMonth = 43;
  execTest20221109_(
    [['試験種別', '医師主導治験'],
     ['症例登録開始日', '2022/03/01']],
    [['事務局運営（試験開始前）', 6], 
     ['SOP一式、CTR登録案、TMF雛形', 1], 
     ['IRB承認確認、施設管理', 2], 
     ['薬剤対応', 2], 
     ['事務局運営（試験開始後から試験終了まで）', targetMonth], 
     ['事務局運営（試験終了時）', 1], 
     ['PMDA対応、照会事項対応', 1], 
     ['監査対応', 1], 
     ['開始前モニタリング・必須文書確認', 24], 
     ['症例モニタリング・SAE対応', 21], 
     ['データベース管理料', targetMonth], 
     ['中央モニタリング', targetMonth], 
     ['CSRの作成支援', 1]
  ]);
  console.log('年度跨ぎ：Setupシートが5ヶ月の場合');
  targetMonth = 41;
  execTest20221109_(
    [['試験種別', '医師主導治験'],
     ['症例登録開始日', '2022/05/01']],
    [['事務局運営（試験開始前）', 6], 
     ['SOP一式、CTR登録案、TMF雛形', 1], 
     ['IRB承認確認、施設管理', 2], 
     ['薬剤対応', 2], 
     ['事務局運営（試験開始後から試験終了まで）', targetMonth], 
     ['事務局運営（試験終了時）', 1], 
     ['PMDA対応、照会事項対応', 1], 
     ['監査対応', 1], 
     ['開始前モニタリング・必須文書確認', 24], 
     ['症例モニタリング・SAE対応', 21], 
     ['データベース管理料', targetMonth], 
     ['中央モニタリング', targetMonth], 
     ['CSRの作成支援', 1]
  ]);
  console.log('Setupシートがちょうど6ヶ月の場合');
  targetMonth = 42;
  execTest20221109_(
    [['試験種別', '医師主導治験'],
     ['症例登録開始日', '2022/04/01']],
    [['事務局運営（試験開始前）', 6], 
     ['SOP一式、CTR登録案、TMF雛形', 1], 
     ['IRB承認確認、施設管理', 2], 
     ['薬剤対応', 2], 
     ['事務局運営（試験開始後から試験終了まで）', targetMonth], 
     ['事務局運営（試験終了時）', 1], 
     ['PMDA対応、照会事項対応', 1], 
     ['監査対応', 1], 
     ['開始前モニタリング・必須文書確認', 24], 
     ['症例モニタリング・SAE対応', 21], 
     ['データベース管理料', targetMonth], 
     ['中央モニタリング', targetMonth], 
     ['CSRの作成支援', 1]
  ]);
}
function test20221109_1(){
  // 事務局運営取るか取らないかのテスト
  let targetMonth = 36;
  console.log('試験種別が医師主導治験ならば事務局運営が積まれることを確認する');
  execTest20221109_(
    [['試験種別', '医師主導治験']],
    [['事務局運営（試験開始前）', 6], 
     ['SOP一式、CTR登録案、TMF雛形', 1], 
     ['IRB承認確認、施設管理', 2], 
     ['薬剤対応', 2], 
     ['事務局運営（試験開始後から試験終了まで）', targetMonth], 
     ['事務局運営（試験終了時）', 1], 
     ['PMDA対応、照会事項対応', 1], 
     ['監査対応', 1], 
     ['開始前モニタリング・必須文書確認', 16], 
     ['症例モニタリング・SAE対応', 21], 
     ['データベース管理料', targetMonth], 
     ['中央モニタリング', targetMonth], 
     ['CSRの作成支援', 1]
  ]);
  console.log('原資が営利企業原資（製薬企業等）ならば事務局運営が積まれることを確認する');
  execTest20221109_(
    [['原資', '営利企業原資（製薬企業等）']],
    [['事務局運営（試験開始前）', 6], 
     ['SOP一式、CTR登録案、TMF雛形', ''], 
     ['IRB承認確認、施設管理', ''], 
     ['薬剤対応', ''], 
     ['事務局運営（試験開始後から試験終了まで）', targetMonth], 
     ['事務局運営（試験終了時）', 1], 
     ['PMDA対応、照会事項対応', ''], 
     ['監査対応', ''], 
     ['開始前モニタリング・必須文書確認', 16], 
     ['症例モニタリング・SAE対応', 21], 
     ['データベース管理料', targetMonth], 
     ['中央モニタリング', targetMonth], 
     ['CSRの作成支援', 1]
  ]);
  console.log('医師主導治験以外で公的資金で調整事務局設置の有無がなしならば事務局運営が積まれることを確認する');
  execTest20221109_(
    null,
    [['事務局運営（試験開始前）', ''], 
     ['SOP一式、CTR登録案、TMF雛形', ''], 
     ['IRB承認確認、施設管理', ''], 
     ['薬剤対応', ''], 
     ['事務局運営（試験開始後から試験終了まで）', ''], 
     ['事務局運営（試験終了時）', ''], 
     ['PMDA対応、照会事項対応', ''], 
     ['監査対応', ''], 
     ['開始前モニタリング・必須文書確認', 16], 
     ['症例モニタリング・SAE対応', 21], 
     ['データベース管理料', targetMonth], 
     ['中央モニタリング', targetMonth], 
     ['CSRの作成支援', 1]
  ]);
  console.log('調整事務局設置の有無がありならば事務局運営が積まれることを確認する');
  execTest20221109_(
    [['調整事務局設置の有無', 'あり']],
    [['事務局運営（試験開始前）', 3], 
     ['SOP一式、CTR登録案、TMF雛形', 0], 
     ['IRB承認確認、施設管理', 0], 
     ['薬剤対応', 0], 
     ['事務局運営（試験開始後から試験終了まで）', targetMonth], 
     ['事務局運営（試験終了時）', 1], 
     ['PMDA対応、照会事項対応', 0], 
     ['監査対応', 0], 
     ['開始前モニタリング・必須文書確認', 16], 
     ['症例モニタリング・SAE対応', 21], 
     ['データベース管理料', targetMonth], 
     ['中央モニタリング、定期モニタリングレポート作成', targetMonth]
  ]);
}
function setDefaultFlg_(targetMap){
  targetMap.set('試験種別', '観察研究・レジストリ');
  targetMap.set('原資', '公的資金（税金由来）');
  targetMap.set('調整事務局設置の有無', 'なし');
  targetMap.set('症例登録開始日', '2022/10/01');
  targetMap.set('試験終了日', '2025/9/30');
  return targetMap;
}
function execTest20221109_(setKeyValues = null, setTotalKeyValues = null){
  const totalCountMap = defaultTotalCount_();
  if (setTotalKeyValues !== null){
    setTotalKeyValues.forEach(x => totalCountMap.set(x[0], x[1]));
  }
  clearSheetsForTest();
  const targetMap = setDefaultFlg_(defaultQuotationRequestItems_());
  if (setKeyValues !== null){
    setKeyValues.forEach(x => targetMap.set(x[0], x[1]));
  }
  const quotationRequestSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quotation Request');
  quotationRequestSheet.getRange('A2:AQ2').clearContent();
  quotationRequestSheet.getRange('A1:AQ1').getValues()[0].forEach((x, idx) => quotationRequestSheet.getRange(2, idx + 1).setValue(targetMap.get(x)));
  quote_script_main();
  Utilities.sleep(1000);
  SpreadsheetApp.flush();
  Utilities.sleep(1000);
  console.log('test start.');
  if (!check20221109Comment()){
    console.log('check20221109Comment NG');
    return;
  }
  const itemNameIdx = 2;
  const countIdx = 5;
  const totalValues = SpreadsheetApp.getActiveSpreadsheet().getDataRange().getValues().filter(x => x[itemNameIdx] !== '');
  totalCountMap.forEach((value, key) => {
    const target = totalValues.filter(x => x[itemNameIdx] === key);
    if (target.length === 1){
      const test = target[0][countIdx] === value;
      if (!test){
        console.log('count check NG:' + key + ':想定値=' + value + '|結果=' + target[0][countIdx]);
      }
    }
  });
  console.log('test end.')

}

function check20221109Comment(){
  const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trial');
  if (trialSheet.getRange('B13').getValue() !== '参加施設数を2施設と想定しております。'){
    return false;
  }
  if (trialSheet.getRange('B14').getValue() !== 'CRFのべ項目数を一症例あたり500項目と想定しております。'){
    return false;
  }
  if (trialSheet.getRange('B15').getValue() !== '目標症例数を3例と想定しております。'){
    return false;
  }
  return true;
}
function defaultQuotationRequestItems_(){
  return new Map([
    ['タイムスタンプ', '2022/11/09 10:55'],
    ['見積種別', '参考見積'],
    ['見積発行先', 'test病院'],
    ['研究代表者名', 'test研究代表者名'],
    ['試験課題名', 'test課題名'],
    ['試験実施番号', 'jRCTxxxx'],
    ['試験種別', null],
    ['PMDA相談資料作成支援', 'なし'],
    ['症例検討会', 'なし'],
    ['治験薬管理', 'なし'],
    ['治験薬運搬', 'なし'],
    ['CRB申請', ''],
    ['研究結果報告書作成支援', ''],
    ['副作用モニタリング終了日', ''],
    ['1例あたりの実地モニタリング回数', '7'],
    ['年間1施設あたりの必須文書実地モニタリング回数', '4'],
    ['監査対象施設数', '0'],
    ['保険料', '0'],
    ['効安事務局設置', '設置しない、または委託しない'],
    ['安全性管理事務局設置', '設置しない、または委託しない'],
    ['AMED申請資料作成支援', 'なし'],
    ['目標症例数', '3'],
    ['実施施設数', '2'],
    ['CRF項目数', '500'],
    ['症例登録開始日', null],
    ['症例登録終了日', '2023/1/31'],
    ['試験終了日', null],
    ['キックオフミーティング', 'なし'],
    ['その他会議（のべ回数）', '0'],
    ['中間解析に必要な図表数', ''],
    ['中間解析の頻度', ''],
    ['統計解析に必要な図表数', ''],
    ['研究協力費、負担軽減費配分管理', 'なし'],
    ['研究協力費、負担軽減費', ''],
    ['試験開始準備費用', ''],
    ['症例登録毎の支払', ''],
    ['症例最終報告書提出毎の支払', ''],
    ['CDISC対応', 'なし'],
    ['備考', ''],
    ['原資', null],
    ['中間解析業務の依頼', 'なし'],
    ['最終解析業務の依頼', 'なし'],
    ['調整事務局設置の有無', null]    
  ]);
}
function defaultTotalCount_(){
  return new Map([    
    ['プロトコルレビュー・作成支援（図表案、統計解析計画書案を含む）', 1], 
    ['検討会実施（TV会議等）', 4], 
    ['PMDA相談資料作成支援', 0], 
    ['AMED申請資料作成支援', 0], 
    ['プロジェクト管理', 1], 
    ['事務局運営（試験開始前）', null], 
    ['ミーティング準備・実行', 0], 
    ['SOP一式、CTR登録案、TMF雛形', null], 
    ['IRB承認確認、施設管理', null], 
    ['特定臨床研究法申請資料作成支援', 0], 
    ['契約・支払手続、実施計画提出支援', 0], 
    ['薬剤対応', null], 
    ['事務局運営（試験開始後から試験終了まで）', null], 
    ['事務局運営（試験終了時）', null], 
    ['PMDA対応、照会事項対応', null], 
    ['監査対応', null], 
    ['モニタリング準備業務（関連資料作成、キックオフ参加）', 1], 
    ['開始前モニタリング・必須文書確認', null], 
    ['症例モニタリング・SAE対応', null], 
    ['問い合わせ対応', 0], 
    ['EDCライセンス・データベースセットアップ', 1], 
    ['データベース管理料', null], 
    ['業務分析・DM計画書の作成・CTR登録案の作成', 1], 
    ['紙CRFのEDC代理入力（含む問合せ）', 0], 
    ['DB作成・eCRF作成・バリデーション', 1], 
    ['バリデーション報告書', 1], 
    ['初期アカウント設定（施設・ユーザー）', 2], 
    ['入力の手引作成', 1], 
    ['データクリーニング', 1], 
    ['データベース固定作業、クロージング', 1], 
    ['症例検討会資料作成', 0], 
    ['安全性管理事務局業務', 0], 
    ['効果安全性評価委員会事務局業務', 0], 
    ['統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成', 0], 
    ['中間解析プログラム作成、解析実施（ダブル）', 0], 
    ['中間解析報告書作成（出力結果＋表紙）', 0], 
    ['最終解析プログラム作成、解析実施（ダブル）', 0], 
    ['最終解析報告書作成（出力結果＋表紙）', 0], 
    ['監査計画書作成', 0], 
    ['施設監査', 0], 
    ['監査報告書作成', 0], 
    ['試験開始準備費用', 0], 
    ['症例登録', 0], 
    ['症例報告', 0], 
    ['国内学会発表', 0], 
    ['国際学会発表', 0], 
    ['論文作成', 0], 
    ['名古屋医療センターCRB申請費用(初年度)', 0], 
    ['名古屋医療センターCRB申請費用(2年目以降)', 0], 
    ['外部監査費用', 0], 
    ['施設監査費用', 0], 
    ['保険料', 0], 
    ['QOL調査', 0], 
    ['治験薬運搬', 0], 
    ['治験薬管理（中央）', 0], 
    ['翻訳', 0], 
    ['CDISC対応費', 0], 
    ['中央診断謝金', 0], 
    ['TV会議', 0]
  ]);
}