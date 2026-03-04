function buildTotalCheckItems_(params) {
  const {
    quotationRequestValidationContext,
    facilities_value,
    number_of_cases_value,
    trial_months,
    total_months,
    trial_year,
    trial_ceil_year,
    setup_month,
    closing_month,
  } = params;

  const total_checkitems = [];
  const total_ammount_checkitems = [];
  total_checkitems.push({ itemname: "プロトコルレビュー・作成支援", value: 1 });
  total_checkitems.push({ itemname: "検討会実施（TV会議等）", value: 4 });
  const pmdaName = "PMDA相談資料作成支援";
  total_checkitems.push({
    itemname: pmdaName,
    value: getValueIfMatch_(
      quotationRequestValidationContext.pmdaConsultationSupport,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  const amedName = "AMED申請資料作成支援";
  total_checkitems.push({
    itemname: amedName,
    value: getValueIfMatch_(
      quotationRequestValidationContext.amedApplicationSupport,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });
  total_checkitems.push({ itemname: "プロジェクト管理", value: total_months });
  // 事務局運営
  const officeOperationItems = checkQuotationOfficeOperationItems_(
    trial_months,
    setup_month,
    quotationRequestValidationContext,
  );
  total_checkitems.push(
    officeOperationItems.get("officeOperationFromStartToEnd"),
  );
  total_checkitems.push(officeOperationItems.get("officeOperationBeforeStart"));
  total_checkitems.push(officeOperationItems.get("officeOperationAtEnd"));
  // キックオフミーティング
  total_checkitems.push({
    itemname: "キックオフミーティング準備・実行",
    value: getValueIfMatch_(
      quotationRequestValidationContext.kickoffMeeting,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "症例検討会準備・実行",
    value: getValueIfMatch_(
      quotationRequestValidationContext.caseReviewMeeting,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "薬剤対応",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED,
      facilities_value,
      0,
    ),
  });

  total_checkitems.push({ itemname: "PMDA対応、照会事項対応", value: 0 });

  total_checkitems.push({
    itemname: "監査対応",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED,
      1,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "SOP一式、CTR登録案、TMF管理",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED,
      1,
      0,
    ),
  });

  // IRB承認
  const [irbApprobal_name, irbApproval_value] =
    quotationRequestValidationContext.trialType ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
      ? ["IRB承認確認、施設管理", facilities_value]
      : ["IRB準備・承認確認", 0];
  total_checkitems.push({
    itemname: irbApprobal_name,
    value: irbApproval_value,
  });

  total_checkitems.push({
    itemname: "特定臨床研究法申請資料作成支援",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL,
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
    facilities_value,
    number_of_cases_value,
    trial_ceil_year,
    quotationRequestValidationContext,
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
    quotationRequestValidationContext.trialType ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
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

  total_checkitems.push({
    itemname: "データベース固定作業、クロージング",
    value: 1,
  });

  total_checkitems.push({
    itemname: "症例検討会資料作成",
    value: getValueIfMatch_(
      quotationRequestValidationContext.caseReviewMeeting,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "安全性管理事務局業務",
    value: getValueIfMatch_(
      quotationRequestValidationContext.safetyManagementOfficeSetup,
      "設置・委託する",
      trial_months,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "効果安全性評価委員会事務局業務",
    value: getValueIfMatch_(
      quotationRequestValidationContext.efficacyOfficeSetup,
      "設置・委託する",
      trial_months,
      0,
    ),
  });

  const statisticalAnalysisDocumentsPreparation_name =
    "統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成";
  let statisticalAnalysisDocumentsPreparation_value = 0;
  if (
    quotationRequestValidationContext.interimAnalysisRequest ===
    COMMON_EXISTENCE_LABELS.YES
  ) {
    statisticalAnalysisDocumentsPreparation_value++;
  }
  if (
    quotationRequestValidationContext.finalAnalysisRequest ===
    COMMON_EXISTENCE_LABELS.YES
  ) {
    statisticalAnalysisDocumentsPreparation_value++;
  }
  total_checkitems.push({
    itemname: statisticalAnalysisDocumentsPreparation_name,
    value: statisticalAnalysisDocumentsPreparation_value,
  });

  const trial_analysis_name =
    quotationRequestValidationContext.trialType ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
      ? "中間解析プログラム作成、解析実施（ダブル）"
      : "中間解析プログラム作成、解析実施（シングル）";
  const trial_analysis_value =
    quotationRequestValidationContext.interimAnalysisRequest ===
    COMMON_EXISTENCE_LABELS.YES
      ? "回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認"
      : 0;

  total_checkitems.push({
    itemname: trial_analysis_name,
    value: trial_analysis_value,
  });

  total_checkitems.push({
    itemname: "中間解析報告書作成（出力結果＋表紙）",
    value: getValueIfMatch_(
      quotationRequestValidationContext.interimAnalysisRequest,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  const final_analysis_name =
    quotationRequestValidationContext.trialType ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
      ? "最終解析プログラム作成、解析実施（ダブル）"
      : "最終解析プログラム作成、解析実施（シングル）";

  total_checkitems.push({
    itemname: final_analysis_name,
    value: getValueIfMatch_(
      quotationRequestValidationContext.finalAnalysisRequest,
      COMMON_EXISTENCE_LABELS.YES,
      quotationRequestValidationContext.finalAnalysisTableCount,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "最終解析報告書作成（出力結果＋表紙）",
    value: getValueIfMatch_(
      quotationRequestValidationContext.finalAnalysisRequest,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  let csr_name;
  let csr_value = "";
  if (
    quotationRequestValidationContext.trialType ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
  ) {
    csr_name = "CSRの作成支援";
    csr_value = 1;
  } else {
    csr_name = "研究結果報告書の作成";
    if (
      quotationRequestValidationContext.studyReportSupport ===
      COMMON_EXISTENCE_LABELS.YES
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
      quotationRequestValidationContext.trialStartPreparationCost,
      COMMON_EXISTENCE_LABELS.YES,
      facilities_value,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "症例登録",
    value: getValueIfMatch_(
      quotationRequestValidationContext.caseRegistrationPayment,
      COMMON_EXISTENCE_LABELS.YES,
      number_of_cases_value,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "症例報告",
    value: getValueIfMatch_(
      quotationRequestValidationContext.finalCaseReportPayment,
      COMMON_EXISTENCE_LABELS.YES,
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
      quotationRequestValidationContext.crbApplication,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });
  const nagoyaMedicalCenterCRBApplicationFeeLaterYears_value =
    quotationRequestValidationContext.crbApplication ===
    COMMON_EXISTENCE_LABELS.YES
      ? trial_year > 1
        ? trial_year - 1
        : 0
      : 0;
  total_checkitems.push({
    itemname: "名古屋医療センターCRB申請費用(2年目以降)",
    value: nagoyaMedicalCenterCRBApplicationFeeLaterYears_value,
  });

  const externalAuditFee_value =
    quotationRequestValidationContext.auditTargetSiteCount > 0 ? 2 : 0;
  total_checkitems.push({
    itemname: "外部監査費用",
    value: externalAuditFee_value,
  });

  const facilitiesAuditFee_value =
    quotationRequestValidationContext.auditTargetSiteCount > 0
      ? quotationRequestValidationContext.auditTargetSiteCount
      : 0;
  total_checkitems.push({
    itemname: "施設監査費用",
    value: facilitiesAuditFee_value,
  });

  const insuranceFee_name = "保険料";
  const insuranceFee = quotationRequestValidationContext.insuranceFee;
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
      quotationRequestValidationContext.investigationalDrugTransport,
      COMMON_EXISTENCE_LABELS.YES,
      facilities_value * trial_year,
      0,
    ),
  });

  const investigationalDrugManagement = "治験薬管理";
  total_checkitems.push({
    itemname: `${investigationalDrugManagement}（中央）`,
    value: getValueIfMatch_(
      quotationRequestValidationContext.investigationalDrugManagement,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  total_checkitems.push({ itemname: "翻訳", value: 0 });
  total_checkitems.push({ itemname: "CDISC対応費", value: 0 });
  total_checkitems.push({ itemname: "中央診断謝金", value: 0 });

  const researchCooperationFee_total_ammount =
    quotationRequestValidationContext.researchCooperationFeeDistributionManagement ===
    COMMON_EXISTENCE_LABELS.YES
      ? quotationRequestValidationContext.researchCooperationFee
      : 0;
  total_ammount_checkitems.push({
    itemname: "研究協力費",
    value: researchCooperationFee_total_ammount,
  });

  return {
    total_checkitems,
    total_ammount_checkitems,
  };
}
