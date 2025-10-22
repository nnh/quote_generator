class UnitTest {
  constructor() {
    this.testData = this.createTestValues();
    this.sheets = get_sheets();
  }
  execTest(targetTestIdx) {
    console.log(`ユニットテスト${targetTestIdx + 1}を開始します`);
    setQuotationRequestTestData_(this.sheets, [this.testData[targetTestIdx]]);
    this.runTestSuite();
    console.log(`ユニットテスト${targetTestIdx + 1}が完了しました`);
  }
  runTestSuite() {
    initial_process();
    quote_script_main();
    SpreadsheetApp.flush();
    total2_3_add_del_cols();
    SpreadsheetApp.flush();
    check_output_values();
    SpreadsheetApp.flush();
    this.checkCheckSheetValue();
  }
  checkCheckSheetValue() {
    const okNg =
      this.sheets.check
        .getRange(2, 1, this.sheets.check.getLastRow(), 1)
        .getValues()
        .filter((row) => row[0] !== "OK" && row[0] !== "").length === 0;
    if (okNg) {
      console.log("✅ チェックシートの値はすべてOKです");
    } else {
      throw new Error("❌ チェックシートの値にNGがあります");
    }
  }
  createTestValues() {
    const rows = [
      [
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
        //      "メールアドレス",
      ],
      [
        "2025/10/21",
        "参考見積",
        "test見積発行先",
        "test研究代表者名",
        "test試験課題名",
        "test試験実施番号",
        "特定臨床研究",
        "",
        "",
        "",
        "",
        "あり",
        "あり",
        "",
        "0",
        "0",
        "4",
        "200000",
        "設置・委託する",
        "設置・委託する",
        "なし",
        "70",
        "15",
        "500",
        "2026/04/01",
        "2028/03/31",
        "2028/09/30",
        "あり",
        "",
        "",
        "",
        "50",
        "なし",
        "",
        "",
        "",
        "",
        "なし",
        "",
        "営利企業原資（製薬企業等）",
        "なし",
        "あり",
        "あり",
        //      "xxx@example.com",
      ],
      [
        "2025/10/21",
        "参考見積",
        "test見積発行先",
        "test研究代表者名",
        "test試験課題名",
        "test試験実施番号",
        "特定臨床研究",
        "",
        "",
        "",
        "",
        "なし",
        "なし",
        "",
        "10",
        "20",
        "0",
        "0",
        "設置しない、または委託しない",
        "設置しない、または委託しない",
        "あり",
        "70",
        "15",
        "500",
        "2026/04/01",
        "2028/03/31",
        "2028/09/30",
        "なし",
        "",
        "",
        "",
        "",
        "あり",
        "200000",
        "あり",
        "なし",
        "あり",
        "あり",
        "",
        "公的資金（税金由来）",
        "なし",
        "なし",
        "なし",
        //      "xxx@example.com",
      ],
      [
        "2025/10/21",
        "参考見積",
        "test見積発行先",
        "test研究代表者名",
        "test試験課題名",
        "test試験実施番号",
        "医師主導治験",
        "あり",
        "あり",
        "あり",
        "あり",
        "",
        "",
        "",
        "10",
        "20",
        "5",
        "500000",
        "設置・委託する",
        "設置しない、または委託しない",
        "なし",
        "100",
        "5",
        "30",
        "2022/08/01",
        "2024/07/31",
        "2026/07/31",
        "あり",
        "",
        "",
        "",
        "100",
        "あり",
        "50000",
        "あり",
        "あり",
        "なし",
        "あり",
        "",
        "営利企業原資（製薬企業等）",
        "なし",
        "あり",
        "あり",
        //      "xxx@example.com",
      ],
      [
        "2025/10/21",
        "参考見積",
        "test見積発行先",
        "test研究代表者名",
        "test試験課題名",
        "test試験実施番号",
        "医師主導治験",
        "なし",
        "なし",
        "なし",
        "なし",
        "",
        "",
        "",
        "0",
        "0",
        "0",
        "0",
        "設置しない、または委託しない",
        "設置・委託する",
        "あり",
        "100",
        "5",
        "30",
        "2022/08/01",
        "2024/07/31",
        "2026/07/31",
        "なし",
        "",
        "",
        "",
        "1",
        "あり",
        "50000",
        "なし",
        "あり",
        "なし",
        "なし",
        "",
        "公的資金（税金由来）",
        "なし",
        "あり",
        "なし",
        //      "xxx@example.com",
      ],
    ];

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const sheets = get_sheets();
    const quotationRequestSheetHeader = sheets.quotation_request
      .getRange(1, 1, 1, sheets.quotation_request.getLastColumn())
      .getValues()[0];
    if (
      JSON.stringify(quotationRequestSheetHeader) !== JSON.stringify(headers)
    ) {
      throw new Error(
        "Quotation Request sheet headers do not match expected headers."
      );
    }
    return dataRows;
  }
}
