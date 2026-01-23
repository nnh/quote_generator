function check_output_values() {
  const trial_months_col = 5;
  let output_row = 1;
  let output_col = 1;
  const {
    get_s_p,
    sheet,
    array_quotation_request,
    facilities_value,
    number_of_cases_value,
    target_total,
    target_total_ammount,
    trial_start_end,
  } = initCheckSheet_();
  output_row = trial_start_end.length;
  output_col = output_col + trial_start_end[0].length;
  sheet.check
    .getRange(output_row, output_col)
    .setFormula('=datedif(C2, D2, "M") + if(day(C2) <= day(D2), 1, 2)');
  output_col++;
  const { setup_month, closing_month, setup_closing_months } =
    calculateSetupAndClosingMonths(array_quotation_request, get_s_p);
  SpreadsheetApp.flush();
  // 試験月数, setup~closing月数を取得
  const trial_months = sheet.check
    .getRange(output_row, trial_months_col)
    .getValue();
  // 試験月数出力
  const tempDateList = calculateTrialDurationDetails_(
    trial_months,
    setup_closing_months,
  );
  const total_months = tempDateList.totalMonths;
  const trial_year = tempDateList.fullYears;
  const trial_ceil_year = tempDateList.ceilYears;
  sheet.check.getRange(output_row, output_col).setValue(total_months);
  // 合計金額チェック
  output_row = compareTotalAmounts_(sheet, output_row);
  // 個別項目チェック
  const total_checkitems = [];
  const total_ammount_checkitems = [];
  total_checkitems.push({ itemname: "プロトコルレビュー・作成支援", value: 1 });
  total_checkitems.push({ itemname: "検討会実施（TV会議等）", value: 4 });
  const pmdaName = "PMDA相談資料作成支援";
  total_checkitems.push({
    itemname: pmdaName,
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, pmdaName),
      "あり",
      1,
      0,
    ),
  });

  const amedName = "AMED申請資料作成支援";
  total_checkitems.push({
    itemname: amedName,
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, amedName),
      "あり",
      1,
      0,
    ),
  });
  total_checkitems.push({ itemname: "プロジェクト管理", value: total_months });
  // 事務局運営
  const officeOperationItems = checkQuotationOfficeOperationItems_(
    get_s_p,
    array_quotation_request,
    trial_months,
    setup_month,
  );
  total_checkitems.push(
    officeOperationItems.get("officeOperationFromStartToEnd"),
  );
  total_checkitems.push(officeOperationItems.get("officeOperationBeforeStart"));
  total_checkitems.push(officeOperationItems.get("officeOperationAtEnd"));
  // キックオフミーティング
  total_checkitems.push(
    checkQuotationKickoffMeetingItems_(
      get_s_p,
      array_quotation_request,
      total_months,
    ),
  );

  total_checkitems.push({
    itemname: "症例検討会準備・実行",
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, "症例検討会"),
      "あり",
      1,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "薬剤対応",
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, "試験種別"),
      get_s_p.getProperty("investigator_initiated_trial"),
      facilities_value,
      0,
    ),
  });

  total_checkitems.push({ itemname: "PMDA対応、照会事項対応", value: 0 });

  total_checkitems.push({
    itemname: "監査対応",
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, "試験種別"),
      get_s_p.getProperty("investigator_initiated_trial"),
      1,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "SOP一式、CTR登録案、TMF管理",
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, "試験種別"),
      get_s_p.getProperty("investigator_initiated_trial"),
      1,
      0,
    ),
  });

  // IRB承認
  const [irbApprobal_name, irbApproval_value] =
    get_quotation_request_value(array_quotation_request, "試験種別") ==
    get_s_p.getProperty("investigator_initiated_trial")
      ? ["IRB承認確認、施設管理", facilities_value]
      : ["IRB準備・承認確認", 0];
  total_checkitems.push({
    itemname: irbApprobal_name,
    value: irbApproval_value,
  });

  total_checkitems.push({
    itemname: "特定臨床研究法申請資料作成支援",
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, "試験種別"),
      get_s_p.getProperty("specified_clinical_trial"),
      facilities_value,
      0,
    ),
  });

  // 契約・支払手続、実施計画提出支援
  total_checkitems.push({
    itemname: "契約・支払手続、実施計画提出支援",
    value: 0,
  });
  const monitoringItems = checkQuotationMonitoringItems_(
    array_quotation_request,
    facilities_value,
    number_of_cases_value,
    trial_ceil_year,
  );
  total_checkitems.push(
    monitoringItems.get("monitoringPreparationDocumentCreation"),
  );
  total_checkitems.push(
    monitoringItems.get("preStudyMonitoringAndEssentialDocumentReview"),
  );
  total_checkitems.push(monitoringItems.get("caseMonitoringAndSAESupport"));
  total_checkitems.push({ itemname: "問い合わせ対応", value: 0 });
  total_checkitems.push({
    itemname: "EDCライセンス・データベースセットアップ",
    value: 1,
  });
  total_checkitems.push({
    itemname: "データベース管理料",
    value: trial_months + closing_month,
  });
  total_checkitems.push({
    itemname: "業務分析・DM計画書の作成・CTR登録案の作成",
    value: 1,
  });
  total_checkitems.push({
    itemname: "紙CRFのEDC代理入力（含む問合せ）",
    value: 0,
  });
  total_checkitems.push({
    itemname: "DB作成・eCRF作成・バリデーション",
    value: 1,
  });
  total_checkitems.push({ itemname: "バリデーション報告書", value: 1 });

  const initialSiteAndUserAccountSetup_name =
    get_quotation_request_value(array_quotation_request, "試験種別") ==
    get_s_p.getProperty("investigator_initiated_trial")
      ? "初期アカウント設定（施設・ユーザー）"
      : "初期アカウント設定（施設・ユーザー）、IRB承認確認";
  total_checkitems.push({
    itemname: initialSiteAndUserAccountSetup_name,
    value: facilities_value,
  });

  total_checkitems.push({ itemname: "入力の手引作成", value: 1 });
  total_checkitems.push({
    itemname: "ロジカルチェック、マニュアルチェック、クエリ対応",
    value: trial_months,
  });
  const interim_count = target_total.sheet
    .getRange(
      target_total.array_item["中間解析報告書作成（出力結果＋表紙）"],
      target_total.col,
    )
    .getValue();
  const closing_count = target_total.sheet
    .getRange(
      target_total.array_item["データベース固定作業、クロージング"],
      target_total.col,
    )
    .getValue();
  total_checkitems.push({
    itemname: "データクリーニング",
    value: interim_count + closing_count,
  });
  total_checkitems.push({
    itemname: "データベース固定作業、クロージング",
    value: 1,
  });

  total_checkitems.push({
    itemname: "症例検討会資料作成",
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, "症例検討会"),
      "あり",
      1,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "安全性管理事務局業務",
    value: getValueIfMatch_(
      get_quotation_request_value(
        array_quotation_request,
        "安全性管理事務局設置",
      ),
      "設置・委託する",
      trial_months,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "効果安全性評価委員会事務局業務",
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, "効安事務局設置"),
      "設置・委託する",
      trial_months,
      0,
    ),
  });

  const statisticalAnalysisDocumentsPreparation_name =
    "統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成";
  let statisticalAnalysisDocumentsPreparation_value = 0;
  if (
    get_quotation_request_value(
      array_quotation_request,
      "中間解析業務の依頼",
    ) === "あり"
  ) {
    statisticalAnalysisDocumentsPreparation_value++;
  }
  if (
    get_quotation_request_value(
      array_quotation_request,
      "最終解析業務の依頼",
    ) === "あり"
  ) {
    statisticalAnalysisDocumentsPreparation_value++;
  }
  total_checkitems.push({
    itemname: statisticalAnalysisDocumentsPreparation_name,
    value: statisticalAnalysisDocumentsPreparation_value,
  });

  const trial_analysis_name =
    get_quotation_request_value(array_quotation_request, "試験種別") ==
    get_s_p.getProperty("investigator_initiated_trial")
      ? "中間解析プログラム作成、解析実施（ダブル）"
      : "中間解析プログラム作成、解析実施（シングル）";
  const trial_analysis_value =
    get_quotation_request_value(
      array_quotation_request,
      "中間解析業務の依頼",
    ) === "あり"
      ? "回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認"
      : 0;

  total_checkitems.push({
    itemname: trial_analysis_name,
    value: trial_analysis_value,
  });

  total_checkitems.push({
    itemname: "中間解析報告書作成（出力結果＋表紙）",
    value: getValueIfMatch_(
      get_quotation_request_value(
        array_quotation_request,
        "中間解析業務の依頼",
      ),
      "あり",
      1,
      0,
    ),
  });

  const final_analysis_name =
    get_quotation_request_value(array_quotation_request, "試験種別") ==
    get_s_p.getProperty("investigator_initiated_trial")
      ? "最終解析プログラム作成、解析実施（ダブル）"
      : "最終解析プログラム作成、解析実施（シングル）";

  total_checkitems.push({
    itemname: final_analysis_name,
    value: getValueIfMatch_(
      get_quotation_request_value(
        array_quotation_request,
        "最終解析業務の依頼",
      ),
      "あり",
      get_quotation_request_value(
        array_quotation_request,
        "統計解析に必要な図表数",
      ),
      0,
    ),
  });

  total_checkitems.push({
    itemname: "最終解析報告書作成（出力結果＋表紙）",
    value: getValueIfMatch_(
      get_quotation_request_value(
        array_quotation_request,
        "最終解析業務の依頼",
      ),
      "あり",
      1,
      0,
    ),
  });

  let csr_name;
  let csr_value = "";
  if (
    get_quotation_request_value(array_quotation_request, "試験種別") ==
    get_s_p.getProperty("investigator_initiated_trial")
  ) {
    csr_name = "CSRの作成支援";
    csr_value = 1;
  } else {
    csr_name = "研究結果報告書の作成";
    if (
      get_quotation_request_value(
        array_quotation_request,
        "研究結果報告書作成支援",
      ) === "あり"
    ) {
      csr_value = 1;
    } else {
      csr_value = 0;
    }
  }
  total_checkitems.push({ itemname: csr_name, value: csr_value });
  total_checkitems.push({ itemname: "監査計画書作成", value: 0 });
  total_checkitems.push({ itemname: "施設監査", value: 0 });
  total_checkitems.push({ itemname: "監査報告書作成", value: 0 });

  const trialStartPreparationCost_name = "試験開始準備費用";
  total_checkitems.push({
    itemname: trialStartPreparationCost_name,
    value: getValueIfMatch_(
      get_quotation_request_value(
        array_quotation_request,
        trialStartPreparationCost_name,
      ),
      "あり",
      facilities_value,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "症例登録",
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, "症例登録毎の支払"),
      "あり",
      number_of_cases_value,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "症例報告",
    value: getValueIfMatch_(
      get_quotation_request_value(
        array_quotation_request,
        "症例最終報告書提出毎の支払",
      ),
      "あり",
      number_of_cases_value,
      0,
    ),
  });
  total_checkitems.push({ itemname: "国内学会発表", value: 0 });
  total_checkitems.push({ itemname: "国際学会発表", value: 0 });
  total_checkitems.push({ itemname: "論文作成", value: 0 });

  total_checkitems.push({
    itemname: "名古屋医療センターCRB申請費用(初年度)",
    value: getValueIfMatch_(
      get_quotation_request_value(array_quotation_request, "CRB申請"),
      "あり",
      1,
      0,
    ),
  });
  const nagoyaMedicalCenterCRBApplicationFeeLaterYears_value =
    get_quotation_request_value(array_quotation_request, "CRB申請") === "あり"
      ? trial_year > 1
        ? trial_year - 1
        : 0
      : 0;
  total_checkitems.push({
    itemname: "名古屋医療センターCRB申請費用(2年目以降)",
    value: nagoyaMedicalCenterCRBApplicationFeeLaterYears_value,
  });

  const externalAuditFee_value =
    get_quotation_request_value(array_quotation_request, "監査対象施設数") > 0
      ? 2
      : 0;
  total_checkitems.push({
    itemname: "外部監査費用",
    value: externalAuditFee_value,
  });

  const facilitiesAuditFee_value =
    get_quotation_request_value(array_quotation_request, "監査対象施設数") > 0
      ? get_quotation_request_value(array_quotation_request, "監査対象施設数")
      : 0;
  total_checkitems.push({
    itemname: "施設監査費用",
    value: facilitiesAuditFee_value,
  });

  const insuranceFee_name = "保険料";
  const insuranceFee = get_quotation_request_value(
    array_quotation_request,
    insuranceFee_name,
  );
  const insuranceFee_value = insuranceFee > 0 ? 1 : 0;
  const total_ammount_value = insuranceFee > 0 ? insuranceFee : 0;

  total_checkitems.push({
    itemname: insuranceFee_name,
    value: insuranceFee_value,
  });
  total_ammount_checkitems.push({
    itemname: insuranceFee_name,
    value: total_ammount_value,
  });

  total_checkitems.push({ itemname: "QOL調査", value: 0 });

  const investigationalDrugTransport = "治験薬運搬";
  total_checkitems.push({
    itemname: investigationalDrugTransport,
    value: getValueIfMatch_(
      get_quotation_request_value(
        array_quotation_request,
        investigationalDrugTransport,
      ),
      "あり",
      facilities_value * trial_year,
      0,
    ),
  });

  const investigationalDrugManagement = "治験薬管理";
  total_checkitems.push({
    itemname: `${investigationalDrugManagement}（中央）`,
    value: getValueIfMatch_(
      get_quotation_request_value(
        array_quotation_request,
        investigationalDrugManagement,
      ),
      "あり",
      1,
      0,
    ),
  });

  total_checkitems.push({ itemname: "翻訳", value: 0 });
  total_checkitems.push({ itemname: "CDISC対応費", value: 0 });
  total_checkitems.push({ itemname: "中央診断謝金", value: 0 });

  const researchCooperationFee_total_ammount =
    get_quotation_request_value(
      array_quotation_request,
      "研究協力費、負担軽減費配分管理",
    ) === "あり"
      ? get_quotation_request_value(
          array_quotation_request,
          "研究協力費、負担軽減費",
        )
      : 0;
  total_ammount_checkitems.push({
    itemname: "研究協力費",
    value: researchCooperationFee_total_ammount,
  });

  const discount_byYear = checkDiscountByYearSheet_().every((x) => x)
    ? "OK"
    : "NG：値が想定と異なる";
  const temp_check_1 = [];
  temp_check_1.push([
    discount_byYear,
    "Setup〜Closingシートの特別値引後合計のチェック",
  ]);
  temp_check_1.push(compareTotalSheetTotaltoVerticalTotal_());
  temp_check_1.push(compareTotal2Total3SheetVerticalTotalToHorizontalTotal_());
  temp_check_1.push([
    checkQuoteSum_().every((x) => x) ? "OK" : "NG：値が想定と異なる",
    "Quote, total, total2, total3の合計・特別値引後合計一致チェック",
  ]);
  temp_check_1.push(
    compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_(),
  );
  // over all
  const res_total = total_checkitems.map((checkitems) =>
    check_itemName_and_value(
      target_total,
      checkitems.itemname,
      checkitems.value,
    ),
  );
  const res_total_ammount = total_ammount_checkitems.map(
    (total_ammount_checkitems) =>
      check_itemName_and_value(
        target_total_ammount,
        total_ammount_checkitems.itemname,
        total_ammount_checkitems.value,
      ),
  );
  const output_values_1 = res_total.concat(res_total_ammount);
  const output_values = output_values_1.concat(temp_check_1);
  output_row++;
  sheet.check
    .getRange(output_row, 1, output_values.length, output_values[0].length)
    .setValues(output_values);
}
