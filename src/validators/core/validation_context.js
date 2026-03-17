/**
 * Validation context
 * シートvaluesキャッシュ
 */
const _validationContext = {
  sheetValues: new Map(),
};

/**
 * quotation request シートから
 * バリデーション用コンテキストを構築する。
 *
 * 本関数は Spreadsheet 依存処理を内包し、
 * ロジック層へ渡すための値オブジェクトを生成する。
 *
 * - 各項目は getQuotationRequestValue_ を通じて取得する
 * - 取得値に null が含まれる場合は不整合として例外をスローする
 *
 * @function validationBuildQuotationRequestValidationContext_
 * @returns {Object} quotation request のバリデーション用コンテキスト
 * @throws {Error} 項目値に null が含まれる場合
 */
function validationBuildQuotationRequestValidationContext_() {
  const quotationRequestValidationContext = {
    timestamp: getQuotationRequestValue_("タイムスタンプ"),

    quotationType: getQuotationRequestValue_("見積種別"),
    quotationRecipient: getQuotationRequestValue_("見積発行先"),

    principalInvestigatorName: getQuotationRequestValue_("研究代表者名"),
    trialTitle: getQuotationRequestValue_("試験課題名"),
    trialAcronym: getQuotationRequestValue_("試験実施番号"),
    trialType: getQuotationRequestValue_("試験種別"),

    pmdaConsultingSupport: getQuotationRequestValue_("PMDA相談資料作成支援"),
    caseReviewMeeting: getQuotationRequestValue_("症例検討会"),
    investigationalDrugManagement: getQuotationRequestValue_("治験薬管理"),
    investigationalDrugTransportation: getQuotationRequestValue_("治験薬運搬"),

    crbApplication: getQuotationRequestValue_("CRB申請"),
    studyReportSupport: getQuotationRequestValue_("研究結果報告書作成支援"),

    adverseEventMonitoringEndDate:
      getQuotationRequestValue_("副作用モニタリング終了日"),

    monitoringVisitsPerCase:
      getQuotationRequestValue_("1例あたりの実地モニタリング回数"),
    annualRequiredDocMonitoringPerSite: getQuotationRequestValue_(
      "年間1施設あたりの必須文書実地モニタリング回数",
    ),
    auditTargetSiteCount: getQuotationRequestValue_("監査対象施設数"),

    insuranceFee: getQuotationRequestValue_("保険料"),

    efficacyOfficeSetup: getQuotationRequestValue_("効安事務局設置"),
    safetyManagementOfficeSetup:
      getQuotationRequestValue_("安全性管理事務局設置"),

    amedApplicationSupport: getQuotationRequestValue_("AMED申請資料作成支援"),

    number_of_cases: getQuotationRequestValue_("目標症例数"),
    facilities: getQuotationRequestValue_("実施施設数"),
    crfItemCount: getQuotationRequestValue_("CRF項目数"),

    enrollmentStartDate: getQuotationRequestValue_("症例登録開始日"),
    enrollmentEndDate: getQuotationRequestValue_("症例登録終了日"),
    studyEndDate: getQuotationRequestValue_("試験終了日"),

    kickoffMeeting: getQuotationRequestValue_("キックオフミーティング"),
    otherMeetingCount: getQuotationRequestValue_("その他会議（のべ回数）"),

    interimAnalysisTableCount:
      getQuotationRequestValue_("中間解析に必要な図表数"),
    interimAnalysisFrequency: getQuotationRequestValue_("中間解析の頻度"),
    finalAnalysisTableCount:
      getQuotationRequestValue_("統計解析に必要な図表数"),

    researchFundingManagement:
      getQuotationRequestValue_("研究協力費、負担軽減費配分管理"),
    researchFunding: getQuotationRequestValue_("研究協力費、負担軽減費"),

    trialStartPreparationCost: getQuotationRequestValue_("試験開始準備費用"),
    paymentPerEnrollment: getQuotationRequestValue_("症例登録毎の支払"),
    paymentPerFinalReport:
      getQuotationRequestValue_("症例最終報告書提出毎の支払"),

    cdiscSupport: getQuotationRequestValue_("CDISC対応"),

    remarks: getQuotationRequestValue_("備考"),
    fundingSource: getQuotationRequestValue_("原資"),

    interimAnalysisRequest: getQuotationRequestValue_("中間解析業務の依頼"),
    finalAnalysisRequest: getQuotationRequestValue_("最終解析業務の依頼"),

    coordinatingOfficeSetup: getQuotationRequestValue_("調整事務局設置の有無"),
  };
  // --- nullチェック ---
  const nullKeys = Object.entries(quotationRequestValidationContext)
    .filter(([_, value]) => value === null)
    .map(([key]) => key);

  if (nullKeys.length > 0) {
    throw new Error(
      `Quotation Requestの項目値に不整合があります。: ${nullKeys.join(", ")}`,
    );
  }
  return quotationRequestValidationContext;
}

/**
 * 指定シートの全セル値をキャッシュ付きで取得する
 * 同一シートの getValues() を1回だけ実行するようにする
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 対象シート
 * @returns {Array<Array<*>>} シートの全セル値（2次元配列）
 */
function validationGetCachedSheetValues_(sheet) {
  const sheetName = sheet.getName();

  if (!_validationContext.sheetValues.has(sheetName)) {
    const values = sheet.getDataRange().getValues();
    _validationContext.sheetValues.set(sheetName, values);
  }

  return _validationContext.sheetValues.get(sheetName);
}
/**
 * シート値のキャッシュをクリアする
 */
function validationResetContext_() {
  _validationContext.sheetValues.clear();
}

/**
 * Total, Total2, Total3シートから合計値チェックに必要な値を収集する
 * @returns {{
 *   totalSheetValues: any[][],
 *   total2SheetValues: any[][],
 *   total3SheetValues: any[][],
 *   totalSheetInfo: any,
 *   total2SheetInfo: any,
 *   total3SheetInfo: any,
 *   totalTotalAmountValue: number,
 *   totalDiscountTotalValue: number,
 *   total2TotalAmountValue: number,
 *   total2DiscountTotalValue: number,
 *   total3TotalAmountValue: number,
 *   total3DiscountTotalValue: number
 * }}
 */
function validationCollectTotalSheetValues_() {
  const TOTAL_HEADER_ROW_INDEX = 3;
  const TOTAL_HEADER_COL_INDEX = 1;
  const TOTAL3_HEADER_ROW_INDEX = 2;

  const totalSheetValues = validationGetCachedSheetValues_(_cachedSheets.total);
  const total2SheetValues = validationGetCachedSheetValues_(
    _cachedSheets.total2,
  );
  const total3SheetValues = validationGetCachedSheetValues_(
    _cachedSheets.total3,
  );

  const totalSheetInfo = validationGetTotalSheetInfo_(
    _cachedSheets.total,
    TOTAL_HEADER_ROW_INDEX,
    TOTAL_HEADER_COL_INDEX,
    VALIDATION_LABELS.SUM,
  );

  const total2SheetInfo = validationGetTotalSheetInfo_(
    _cachedSheets.total2,
    TOTAL_HEADER_ROW_INDEX,
    TOTAL_HEADER_COL_INDEX,
    VALIDATION_LABELS.SUM,
  );

  const total3SheetInfo = validationGetTotalSheetInfo_(
    _cachedSheets.total3,
    TOTAL3_HEADER_ROW_INDEX,
    TOTAL_HEADER_COL_INDEX,
    VALIDATION_LABELS.SUM,
  );

  const totalTotalAmountValue =
    totalSheetValues[totalSheetInfo.sumRowIndex][totalSheetInfo.amountColIndex];

  const totalDiscountTotalValue =
    totalSheetValues[totalSheetInfo.discountTotalRowIndex][
      totalSheetInfo.amountColIndex
    ];

  const total2TotalAmountValue =
    total2SheetValues[total2SheetInfo.sumRowIndex][total2SheetInfo.sumColIndex];

  const total2DiscountTotalValue =
    total2SheetValues[total2SheetInfo.discountTotalRowIndex][
      total2SheetInfo.sumColIndex
    ];

  const total3TotalAmountValue =
    total3SheetValues[total3SheetInfo.sumRowIndex][total3SheetInfo.sumColIndex];

  const total3DiscountTotalValue =
    total3SheetValues[total3SheetInfo.discountTotalRowIndex][
      total3SheetInfo.sumColIndex
    ];

  return {
    totalSheetValues,
    total2SheetValues,
    total3SheetValues,
    totalSheetInfo,
    total2SheetInfo,
    total3SheetInfo,
    totalTotalAmountValue,
    totalDiscountTotalValue,
    total2TotalAmountValue,
    total2DiscountTotalValue,
    total3TotalAmountValue,
    total3DiscountTotalValue,
  };
}

/**
 * 値チェックに必要な試験年月等の試験情報を構築する。
 * @param {*} rowOutput
 * @param {*} colOutput
 * @param {*} quotationRequestValidationContext
 * @returns
 */
function validationBuildTrialContext_(
  rowOutput,
  colOutput,
  quotationRequestValidationContext,
) {
  const trialMonthsFromSheet = validationCalculateTrialMonths_(
    rowOutput,
    colOutput,
  );

  // バリデーションコンテキストをリセット（シート値のキャッシュをクリア）
  validationResetContext_();

  const { setup_month, closing_month, setup_closing_months } =
    validationCalculateSetupAndClosingMonths(quotationRequestValidationContext);

  const trialInfo = validationCalculateTrialDurationDetails_(
    trialMonthsFromSheet,
    setup_closing_months,
  );

  return {
    trialMonthsFromSheet,
    setup_month,
    closing_month,
    setup_closing_months,
    ...trialInfo,
  };
}
