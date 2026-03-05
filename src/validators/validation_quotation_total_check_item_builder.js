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

  total_checkitems.push(...buildProtocolItems_(params));
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

  total_checkitems.push(
    ...buildStatisticalItems_({
      trialType: quotationRequestValidationContext.trialType,
      interimAnalysisRequest:
        quotationRequestValidationContext.interimAnalysisRequest,
      finalAnalysisRequest:
        quotationRequestValidationContext.finalAnalysisRequest,
      finalAnalysisTableCount:
        quotationRequestValidationContext.finalAnalysisTableCount,
      studyReportSupport: quotationRequestValidationContext.studyReportSupport,
    }),
  );
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
      quotationRequestValidationContext.paymentPerEnrollment,
      COMMON_EXISTENCE_LABELS.YES,
      number_of_cases_value,
      0,
    ),
  });

  total_checkitems.push({
    itemname: "症例報告",
    value: getValueIfMatch_(
      quotationRequestValidationContext.paymentPerFinalReport,
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

  const investigationalDrugTransportation = "治験薬運搬";
  total_checkitems.push({
    itemname: investigationalDrugTransportation,
    value: getValueIfMatch_(
      quotationRequestValidationContext.investigationalDrugTransportation,
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

  const researchFunding_total_ammount =
    quotationRequestValidationContext.researchFundingManagement ===
    COMMON_EXISTENCE_LABELS.YES
      ? quotationRequestValidationContext.researchFunding
      : 0;
  total_ammount_checkitems.push({
    itemname: "研究協力費",
    value: researchFunding_total_ammount,
  });

  return {
    totalCheckItems: total_checkitems,
    totalAmountCheckItems: total_ammount_checkitems,
  };
}
/**
 * プロトコル関連作業項目を構築する。
 *
 * プロトコルレビュー、PMDA/AMED対応、
 * プロジェクト管理、キックオフ等の
 * 上流業務項目を生成する。
 *
 * @param {Object} params
 * @param {Object} params.quotationRequestValidationContext Quotation Requestシートの入力値をまとめたMapオブジェクト
 * @param {string} params.facilities_value 施設数
 * @param {number} params.total_months 契約期間（月数）
 * @return {Array<Object>}
 */
function buildProtocolItems_(params) {
  const { quotationRequestValidationContext, facilities_value, total_months } =
    params;

  const items = [];

  items.push({ itemname: "プロトコルレビュー・作成支援", value: 1 });

  items.push({ itemname: "検討会実施（TV会議等）", value: 4 });

  items.push({
    itemname: "PMDA相談資料作成支援",
    value: getValueIfMatch_(
      quotationRequestValidationContext.pmdaConsultingSupport,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({
    itemname: "AMED申請資料作成支援",
    value: getValueIfMatch_(
      quotationRequestValidationContext.amedApplicationSupport,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({ itemname: "プロジェクト管理", value: total_months });

  items.push({
    itemname: "キックオフミーティング準備・実行",
    value: getValueIfMatch_(
      quotationRequestValidationContext.kickoffMeeting,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({
    itemname: "症例検討会準備・実行",
    value: getValueIfMatch_(
      quotationRequestValidationContext.caseReviewMeeting,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({
    itemname: "薬剤対応",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED,
      facilities_value,
      0,
    ),
  });

  items.push({ itemname: "PMDA対応、照会事項対応", value: 0 });

  items.push({
    itemname: "監査対応",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED,
      1,
      0,
    ),
  });

  items.push({
    itemname: "SOP一式、CTR登録案、TMF管理",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED,
      1,
      0,
    ),
  });

  const [irbApprobal_name, irbApproval_value] =
    quotationRequestValidationContext.trialType ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
      ? ["IRB承認確認、施設管理", facilities_value]
      : ["IRB準備・承認確認", 0];

  items.push({
    itemname: irbApprobal_name,
    value: irbApproval_value,
  });

  items.push({
    itemname: "特定臨床研究法申請資料作成支援",
    value: getValueIfMatch_(
      quotationRequestValidationContext.trialType,
      TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL,
      facilities_value,
      0,
    ),
  });

  items.push({
    itemname: "契約・支払手続、実施計画提出支援",
    value: 0,
  });

  return items;
}
/**
 * 統計解析ドキュメントセット数をカウントする。
 *
 * 以下の条件で加算する：
 * ・中間解析業務の依頼 が あり の場合 +1
 * ・最終解析業務の依頼 が あり の場合 +1
 *
 * 戻り値は 0 / 1 / 2 のいずれかとなる。
 *
 * @param {string} interimRequest 中間解析業務の依頼の値
 * @param {string} finalRequest 最終解析業務の依頼の値
 * @return {number} 必要な統計解析ドキュメントセット数
 */
function countStatisticalDocumentSets_(interimRequest, finalRequest) {
  return (
    Number(interimRequest === COMMON_EXISTENCE_LABELS.YES) +
    Number(finalRequest === COMMON_EXISTENCE_LABELS.YES)
  );
}
/**
 * 統計関連作業項目一覧を構築する。
 *
 * 試験種別および各種解析実施有無に応じて、
 * 見積用の統計作業項目リストを生成する。
 *
 * 生成される項目は以下を含む：
 * ・統計解析計画書関連一式
 * ・中間解析プログラム
 * ・中間解析報告書
 * ・最終解析プログラム
 * ・最終解析報告書
 * ・CSR作成支援 または 研究結果報告書作成
 *
 * 医師主導治験かどうかにより、
 * プログラム作成種別（ダブル／シングル）および
 * 最終報告関連項目の内容が変わる。
 *
 * @param {Object} params パラメータオブジェクト
 * @param {string} params.trialType 試験種別（TRIAL_TYPE_LABELS）
 * @param {string} params.interimAnalysisRequest 中間解析実施有無（COMMON_EXISTENCE_LABELS）
 * @param {string} params.finalAnalysisRequest 最終解析実施有無（COMMON_EXISTENCE_LABELS）
 * @param {number} params.finalAnalysisTableCount 解析表数
 * @param {string} params.studyReportSupport 研究結果報告書作成支援有無（COMMON_EXISTENCE_LABELS）
 *
 * @return {Array<Object>} 統計関連作業項目の配列
 * @return {string} return[].itemname 作業項目名
 * @return {number} return[].value 作業量（数量）
 */

function buildStatisticalItems_({
  trialType,
  interimAnalysisRequest,
  finalAnalysisRequest,
  finalAnalysisTableCount,
  studyReportSupport,
}) {
  const isInvestigatorInitiated =
    trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED;

  const adjustedFinalAnalysisTableCount = isInvestigatorInitiated
    ? finalAnalysisTableCount >= 1 && finalAnalysisTableCount <= 49
      ? 50
      : finalAnalysisTableCount
    : finalAnalysisTableCount;

  const items = [];

  // 統計解析計画書関連
  items.push({
    itemname:
      "統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成",
    value: countStatisticalDocumentSets_(
      interimAnalysisRequest,
      finalAnalysisRequest,
    ),
  });
  // 中間解析プログラム
  items.push({
    itemname: isInvestigatorInitiated
      ? "中間解析プログラム作成、解析実施（ダブル）"
      : "中間解析プログラム作成、解析実施（シングル）",
    value:
      interimAnalysisRequest === COMMON_EXISTENCE_LABELS.YES
        ? "回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認"
        : 0,
  });

  // 中間解析報告書
  items.push({
    itemname: "中間解析報告書作成（出力結果＋表紙）",
    value: interimAnalysisRequest === COMMON_EXISTENCE_LABELS.YES ? 1 : 0,
  });

  // 最終解析プログラム
  items.push({
    itemname: isInvestigatorInitiated
      ? "最終解析プログラム作成、解析実施（ダブル）"
      : "最終解析プログラム作成、解析実施（シングル）",
    value:
      finalAnalysisRequest === COMMON_EXISTENCE_LABELS.YES
        ? adjustedFinalAnalysisTableCount
        : 0,
  });

  // 最終解析報告書
  items.push({
    itemname: "最終解析報告書作成（出力結果＋表紙）",
    value: finalAnalysisRequest === COMMON_EXISTENCE_LABELS.YES ? 1 : 0,
  });

  // CSR / 研究結果報告書
  if (isInvestigatorInitiated) {
    items.push({
      itemname: "CSRの作成支援",
      value: 1,
    });
  } else {
    items.push({
      itemname: "研究結果報告書の作成",
      value: studyReportSupport === COMMON_EXISTENCE_LABELS.YES ? 1 : 0,
    });
  }

  return items;
}
