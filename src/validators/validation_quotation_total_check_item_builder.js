function buildTotalCheckItems_(params) {
  const {
    quotationRequestValidationContext: ctx,
    facilities_value,
    number_of_cases_value,
    trial_year,
  } = params;

  const totalCheckItems = [];
  const totalAmountCheckItems = [];

  /** ==============================
   * Protocol
   ============================== */
  totalCheckItems.push(...buildProtocolItems_(params));

  /** ==============================
   * Monitoring
   ============================== */
  totalCheckItems.push(...buildMonitoringItems_(params));
  /** ==============================
   * Office / DM
   ============================== */
  totalCheckItems.push(...buildOfficeOperationItems_(params));

  /** ==============================
   * Statistical
   ============================== */
  totalCheckItems.push(...buildStatisticalItems_(params));

  /** ==============================
   * Audit
   ============================== */
  totalCheckItems.push(
    { itemname: "監査計画書作成", value: 0 },
    { itemname: "施設監査", value: 0 },
    { itemname: "監査報告書作成", value: 0 },
  );

  /** ==============================
   * Trial Start Cost
   ============================== */
  totalCheckItems.push({
    itemname: "試験開始準備費用",
    value: getValueIfMatch_(
      ctx.trialStartPreparationCost,
      COMMON_EXISTENCE_LABELS.YES,
      facilities_value,
      0,
    ),
  });

  /** ==============================
   * Case Payment
   ============================== */
  totalCheckItems.push(
    {
      itemname: "症例登録",
      value: getValueIfMatch_(
        ctx.paymentPerEnrollment,
        COMMON_EXISTENCE_LABELS.YES,
        number_of_cases_value,
        0,
      ),
    },
    {
      itemname: "症例報告",
      value: getValueIfMatch_(
        ctx.paymentPerFinalReport,
        COMMON_EXISTENCE_LABELS.YES,
        number_of_cases_value,
        0,
      ),
    },
  );

  /** ==============================
   * Publication
   ============================== */
  totalCheckItems.push(
    { itemname: "国内学会発表", value: 0 },
    { itemname: "国際学会発表", value: 0 },
    { itemname: "論文作成", value: 0 },
  );

  /** ==============================
   * Cost
   ============================== */
  const costItems = buildCostItems_({
    quotationRequestValidationContext: ctx,
    trial_year,
  });

  totalCheckItems.push(...costItems.totalCheckItems);
  totalAmountCheckItems.push(...costItems.totalAmountCheckItems);

  /** ==============================
   * Other
   ============================== */
  totalCheckItems.push({ itemname: "QOL調査", value: 0 });

  /** ==============================
   * Drug Handling
   ============================== */
  totalCheckItems.push(
    {
      itemname: "治験薬運搬",
      value: getValueIfMatch_(
        ctx.investigationalDrugTransportation,
        COMMON_EXISTENCE_LABELS.YES,
        facilities_value * trial_year,
        0,
      ),
    },
    {
      itemname: "治験薬管理（中央）",
      value: getValueIfMatch_(
        ctx.investigationalDrugManagement,
        COMMON_EXISTENCE_LABELS.YES,
        1,
        0,
      ),
    },
  );

  /** ==============================
   * Misc
   ============================== */
  totalCheckItems.push(
    { itemname: "翻訳", value: 0 },
    { itemname: "CDISC対応費", value: 0 },
    { itemname: "中央診断謝金", value: 0 },
  );

  /** ==============================
   * Research Funding
   ============================== */
  const researchFundingAmount =
    ctx.researchFundingManagement === COMMON_EXISTENCE_LABELS.YES
      ? ctx.researchFunding
      : 0;

  totalAmountCheckItems.push({
    itemname: "研究協力費",
    value: researchFundingAmount,
  });

  return {
    totalCheckItems,
    totalAmountCheckItems,
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
 * DM・事務局関連作業項目を構築する。
 *
 * EDCセットアップ、DB管理、データマネジメント業務、
 * 事務局業務等の項目を生成する。
 *
 * 【含まれる業務】
 * ・EDC関連
 * ・DB関連
 * ・ロジカルチェック
 * ・データ固定
 * ・症例検討会資料
 * ・安全性管理事務局
 * ・効果安全性評価委員会事務局
 *
 * @param {Object} params
 * @param {Object} params.quotationRequestValidationContext
 * @param {number} params.facilities_value
 * @param {number} params.trial_months
 * @param {number} params.closing_month
 * @param {number} params.interimCount
 * @param {number} params.closingCount
 * @return {Array<Object>}
 */
function buildOfficeOperationItems_(params) {
  const {
    quotationRequestValidationContext,
    facilities_value,
    trial_months,
    closing_month,
    interimCount,
    closingCount,
  } = params;

  const items = [];

  items.push({ itemname: "問い合わせ対応", value: 0 });

  items.push({
    itemname: "EDCライセンス・データベースセットアップ",
    value: 1,
  });

  items.push({
    itemname: "データベース管理料",
    value: trial_months + closing_month,
  });

  items.push({
    itemname: "業務分析・DM計画書の作成・CTR登録案の作成",
    value: 1,
  });

  items.push({
    itemname: "紙CRFのEDC代理入力（含む問合せ）",
    value: 0,
  });

  items.push({
    itemname: "DB作成・eCRF作成・バリデーション",
    value: 1,
  });

  items.push({ itemname: "バリデーション報告書", value: 1 });

  const initialAccountSetupName =
    quotationRequestValidationContext.trialType ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
      ? "初期アカウント設定（施設・ユーザー）"
      : "初期アカウント設定（施設・ユーザー）、IRB承認確認";

  items.push({
    itemname: initialAccountSetupName,
    value: facilities_value,
  });

  items.push({ itemname: "入力の手引作成", value: 1 });

  items.push({
    itemname: "ロジカルチェック、マニュアルチェック、クエリ対応",
    value: trial_months,
  });

  items.push({
    itemname: "データベース固定作業、クロージング",
    value: 1,
  });

  items.push({
    itemname: "データクリーニング",
    value: interimCount + closingCount,
  });

  items.push({
    itemname: "症例検討会資料作成",
    value: getValueIfMatch_(
      quotationRequestValidationContext.caseReviewMeeting,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({
    itemname: "安全性管理事務局業務",
    value: getValueIfMatch_(
      quotationRequestValidationContext.safetyManagementOfficeSetup,
      "設置・委託する",
      trial_months,
      0,
    ),
  });

  items.push({
    itemname: "効果安全性評価委員会事務局業務",
    value: getValueIfMatch_(
      quotationRequestValidationContext.efficacyOfficeSetup,
      "設置・委託する",
      trial_months,
      0,
    ),
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
 *
 * @return {Array<Object>} 統計関連作業項目の配列
 * @return {string} return[].itemname 作業項目名
 * @return {number} return[].value 作業量（数量）
 */

function buildStatisticalItems_(params) {
  const trialType = params.quotationRequestValidationContext.trialType;
  const interimAnalysisRequest =
    params.quotationRequestValidationContext.interimAnalysisRequest;
  const finalAnalysisRequest =
    params.quotationRequestValidationContext.finalAnalysisRequest;
  const finalAnalysisTableCount =
    params.quotationRequestValidationContext.finalAnalysisTableCount;
  const studyReportSupport =
    params.quotationRequestValidationContext.studyReportSupport;

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
/**
 * コスト関連作業項目を構築する。
 *
 * CRB申請費用、監査費用、保険料、
 *
 * 【含まれる項目】
 * ・名古屋医療センターCRB申請費用(初年度)
 * ・名古屋医療センターCRB申請費用(2年目以降)
 * ・外部監査費用
 * ・施設監査費用
 * ・保険料（数量）
 *
 * @param {Object} params
 * @param {Object} params.quotationRequestValidationContext
 * @param {number} params.trial_year
 *
 * @return {Object}
 * @return {Array<Object>} return.totalCheckItems
 * @return {Array<Object>} return.totalAmountCheckItems
 */
function buildCostItems_(params) {
  const { quotationRequestValidationContext, trial_year } = params;

  const totalCheckItems = [];
  const totalAmountCheckItems = [];

  /** ===== CRB ===== */
  const isCrbYes =
    quotationRequestValidationContext.crbApplication ===
      COMMON_EXISTENCE_LABELS.YES &&
    quotationRequestValidationContext.trialType ===
      TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL;

  totalCheckItems.push({
    itemname: "名古屋医療センターCRB申請費用(初年度)",
    value: isCrbYes ? 1 : 0,
  });

  totalCheckItems.push({
    itemname: "名古屋医療センターCRB申請費用(2年目以降)",
    value: isCrbYes && trial_year > 1 ? trial_year - 1 : 0,
  });

  /** ===== 監査費 ===== */
  const auditTargetCount =
    quotationRequestValidationContext.auditTargetSiteCount || 0;

  totalCheckItems.push({
    itemname: "外部監査費用",
    value: auditTargetCount > 0 ? 2 : 0,
  });

  totalCheckItems.push({
    itemname: "施設監査費用",
    value: auditTargetCount > 0 ? auditTargetCount : 0,
  });

  /** ===== 保険 ===== */
  const insuranceFee = quotationRequestValidationContext.insuranceFee || 0;

  totalCheckItems.push({
    itemname: "保険料",
    value: insuranceFee > 0 ? 1 : 0,
  });

  totalAmountCheckItems.push({
    itemname: "保険料",
    value: insuranceFee > 0 ? insuranceFee : 0,
  });

  return {
    totalCheckItems,
    totalAmountCheckItems,
  };
}
