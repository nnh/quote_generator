function setQuotationRequestTestData_(sheet, values) {
  const clearRangeAddress = "F:F";
  [
    "Setup",
    "Registration_1",
    "Registration_2",
    "Interim_1",
    "Observation_1",
    "Interim_2",
    "Observation_2",
    "Closing",
  ].forEach((sheetName) =>
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(sheetName)
      .getRange(clearRangeAddress)
      .clearContent()
  );
  sheet.quotation_request.getRange(2, 1, 1, values[0].length).setValues(values);
  SpreadsheetApp.flush();
}
// map objectを二次元配列に変換して返す
function mapTo2DArrayQuotationRequest_(map) {
  // タイムスタンプ	見積種別	見積発行先	研究代表者名	試験課題名	試験実施番号	試験種別	PMDA相談資料作成支援	症例検討会	治験薬管理	治験薬運搬	CRB申請	研究結果報告書作成支援	副作用モニタリング終了日	1例あたりの実地モニタリング回数	年間1施設あたりの必須文書実地モニタリング回数	監査対象施設数	保険料	効安事務局設置	安全性管理事務局設置	AMED申請資料作成支援	目標症例数	実施施設数	CRF項目数	症例登録開始日	症例登録終了日	試験終了日	キックオフミーティング	その他会議（のべ回数）	中間解析に必要な図表数	中間解析の頻度	統計解析に必要な図表数	研究協力費、負担軽減費配分管理	研究協力費、負担軽減費	試験開始準備費用	症例登録毎の支払	症例最終報告書提出毎の支払	CDISC対応	備考	原資	中間解析業務の依頼	最終解析業務の依頼	調整事務局設置の有無
  const orderedKeys = [
    "タイムスタンプ",
    "見積種別",
    "見積発行先",
    "研究代表者名",
    "試験課題名",
    "試験実施番号",
    "試験種別",
    "PMDA相談資料作成支援",
    "症例検討会",
    "治験薬管理",
    "治験薬運搬",
    "CRB申請",
    "研究結果報告書作成支援",
    "副作用モニタリング終了日",
    "1例あたりの実地モニタリング回数",
    "年間1施設あたりの必須文書実地モニタリング回数",
    "監査対象施設数",
    "保険料",
    "効安事務局設置",
    "安全性管理事務局設置",
    "AMED申請資料作成支援",
    "目標症例数",
    "実施施設数",
    "CRF項目数",
    "症例登録開始日",
    "症例登録終了日",
    "試験終了日",
    "キックオフミーティング",
    "その他会議（のべ回数）",
    "中間解析に必要な図表数",
    "中間解析の頻度",
    "統計解析に必要な図表数",
    "研究協力費、負担軽減費配分管理",
    "研究協力費、負担軽減費",
    "試験開始準備費用",
    "症例登録毎の支払",
    "症例最終報告書提出毎の支払",
    "CDISC対応",
    "備考",
    "原資",
    "中間解析業務の依頼",
    "最終解析業務の依頼",
    "調整事務局設置の有無",
  ];
  const arr = [];
  orderedKeys.forEach((key) => {
    arr.push([key, map.get(key) ?? ""]);
  });
  const transposedArr = arr[0].map((_, colIndex) =>
    arr.map((row) => row[colIndex])
  );
  return transposedArr;
}
function getQuotationRequestTemplateMap_() {
  const newMap = new Map();
  [
    "PMDA相談資料作成支援",
    "症例検討会",
    "治験薬管理",
    "治験薬運搬",
    "CRB申請",
    "研究結果報告書作成支援",
    "副作用モニタリング終了日",
    "1例あたりの実地モニタリング回数",
    "年間1施設あたりの必須文書実地モニタリング回数",
    "監査対象施設数",
    "保険料",
    "効安事務局設置",
    "安全性管理事務局設置",
    "その他会議（のべ回数）",
    "中間解析に必要な図表数",
    "中間解析の頻度",
    "統計解析に必要な図表数",
    "研究協力費、負担軽減費配分管理",
    "研究協力費、負担軽減費",
    "試験開始準備費用",
    "症例登録毎の支払",
    "症例最終報告書提出毎の支払",
  ].forEach((key) => {
    newMap.set(key, "");
  });
  newMap.set("試験種別", "観察研究・レジストリ");
  newMap.set("タイムスタンプ", "2000/01/03 00:00:00");
  newMap.set("見積種別", "正式見積");
  newMap.set("見積発行先", "test株式会社");
  newMap.set("研究代表者名", "test 研究太郎");
  newMap.set("試験課題名", "test試験");
  newMap.set("試験実施番号", "test実施番号");
  newMap.set("目標症例数", "100");
  newMap.set("実施施設数", "10");
  newMap.set("CRF項目数", "50");
  newMap.set("症例登録開始日", "2025/04/01");
  newMap.set("症例登録終了日", "2026/03/31");
  newMap.set("試験終了日", "2028/03/31");
  newMap.set("キックオフミーティング", "あり");
  newMap.set("AMED申請資料作成支援", "なし");
  newMap.set("中間解析業務の依頼", "なし");
  newMap.set("最終解析業務の依頼", "なし");
  newMap.set("調整事務局設置の有無", "なし");
  newMap.set("CDISC対応", "あり");
  newMap.set("備考", "ああああ");
  newMap.set("原資", "公的資金（税金由来）");
  return newMap;
}
