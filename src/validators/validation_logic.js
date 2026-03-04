/**
 * Checkシートの初期化と基本情報の書き出し
 */
function initCheckSheet_() {
  initial_process();
  hideFilterVisibility();
  _cachedSheets.check.clear();
  const quotationRequestValidationContext =
    buildQuotationRequestValidationContext_();
  const facilities_value = quotationRequestValidationContext.facilities;
  const number_of_cases_value =
    quotationRequestValidationContext.number_of_cases;
  const targetTotal = {
    sheet: _cachedSheets.total,
    sheetName: _cachedSheets.total.getName(),
    array_item: get_fy_items_(
      _cachedSheets.total,
      TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
    ),
    col: TOTAL_AND_PHASE_SHEET.COLUMNS.COUNT,
    footer: null,
  };
  const targetTotalAmount = {
    sheet: _cachedSheets.total,
    sheetName: _cachedSheets.total.getName(),
    array_item: get_fy_items_(_cachedSheets.total, 2),
    col: 9,
    footer: "（金額）",
  };
  const enrollmentStartDate =
    quotationRequestValidationContext.enrollmentStartDate;
  const studyEndDate = quotationRequestValidationContext.studyEndDate;
  const trial_start_end = [
    ["OK/NG", "詳細", "", ""],
    [
      "",
      "症例登録開始〜試験終了日の月数チェック（作業用）",
      enrollmentStartDate.toLocaleDateString("ja"),
      studyEndDate.toLocaleDateString("ja"),
    ],
  ];

  _cachedSheets.check
    .getRange(1, 1, trial_start_end.length, trial_start_end[0].length)
    .setValues(trial_start_end);
  const res = {
    facilities_value,
    number_of_cases_value,
    targetTotal,
    targetTotalAmount,
    trial_start_end,
    quotationRequestValidationContext,
  };
  return res;
}
/**
 * 検証の基準となる月数データを取得する
 */
function calculateSetupAndClosingMonths(quotationRequestValidationContext) {
  const trial_type = quotationRequestValidationContext.trialType;
  const has_report_support =
    quotationRequestValidationContext.reportSupport ===
    COMMON_EXISTENCE_LABELS.YES;

  let setup_month = 3;
  let closing_month = 3;

  // 医師主導治験または特定臨床研究の場合
  if (
    trial_type === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED ||
    trial_type === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL
  ) {
    setup_month = 6;
    closing_month = 6;
  } else if (has_report_support) {
    closing_month += 3;
  }

  return {
    setup_month: setup_month,
    closing_month: closing_month,
    setup_closing_months: setup_month + closing_month,
  };
}
/**
 * 試験月数から、関連する期間情報（合計月数、満年数、切り上げ年数）を計算して返す
 * @param {number} trialMonths - 試験月数
 * @param {number} setupClosingMonths - SetupとClosingの合計月数
 * @return {Object} 計算結果のオブジェクト
 */
function calculateTrialDurationDetails_(trialMonths, setupClosingMonths) {
  return {
    totalMonths: trialMonths + setupClosingMonths,
    fullYears: trialMonths > 12 ? Math.trunc(trialMonths / 12) : "", // 満何年か
    ceilYears: Math.ceil(trialMonths / 12), // 切り上げ年数
  };
}
function compareTotalAmounts_(output_row) {
  const total_total_ammount = get_total_amount({
    sheet: _cachedSheets.total,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.AMMOUNT,
  });
  const total2_total_ammount = get_total_amount({
    sheet: _cachedSheets.total2,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 4,
    total_col_itemname: ITEM_LABELS.SUM,
  });
  const total3_total_ammount = get_total_amount({
    sheet: _cachedSheets.total3,
    item_cols: "B:B",
    total_row_itemname: ITEM_LABELS.SUM,
    header_row: 3,
    total_col_itemname: ITEM_LABELS.SUM,
  });
  const ammount_check = [null, "Total, Total2, Total3の合計金額チェック"];
  if (
    (total_total_ammount === total2_total_ammount) &
    (total_total_ammount === total3_total_ammount)
  ) {
    ammount_check[0] = VALIDATION_STATUS.OK;
    ammount_check[1] = ammount_check[1] + " ,想定値:" + total_total_ammount;
  } else {
    ammount_check[0] = buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH);
  }
  output_row++;
  _cachedSheets.check
    .getRange(output_row, 1, 1, ammount_check.length)
    .setValues([ammount_check]);
  return output_row;
}
function checkQuotationOfficeOperationItems_(
  trial_months,
  setup_month,
  quotationRequestValidationContext,
) {
  let office_bef_month = 0;
  let office_count = 0;
  let temp_value = 0;
  if (
    (quotationRequestValidationContext.trialType ===
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED) |
    (quotationRequestValidationContext.coordinatingOfficeSetup ===
      COMMON_EXISTENCE_LABELS.YES) |
    (quotationRequestValidationContext.fundingSource ===
      QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL)
  ) {
    temp_value = trial_months;
    office_count = 1;
    office_bef_month = setup_month;
  } else {
    temp_value = 0;
  }
  const res = new Map();
  res.set("officeOperationFromStartToEnd", {
    itemname: "事務局運営（試験開始後から試験終了まで）",
    value: temp_value,
  });
  res.set("officeOperationBeforeStart", {
    itemname: "事務局運営（試験開始前）",
    value: office_bef_month,
  });
  res.set("officeOperationAtEnd", {
    itemname: "事務局運営（試験終了時）",
    value: office_count,
  });
  return res;
}

function checkQuotationMonitoringItems_(
  facilities_value,
  number_of_cases_value,
  trial_ceil_year,
  quotationRequestValidationContext,
) {
  const monitoringPreparationDocumentCreation_value =
    quotationRequestValidationContext.monitoringVisitsPerCase > 0 ? 1 : 0;
  const monitoringPreparationDocumentCreation = {
    itemname: "モニタリング準備業務（関連資料作成）",
    value: monitoringPreparationDocumentCreation_value,
  };

  const preStudyMonitoringAndEssentialDocumentReview_value =
    quotationRequestValidationContext.annualRequiredDocMonitoringPerSite > 0
      ? parseInt(
          quotationRequestValidationContext.annualRequiredDocMonitoringPerSite,
        ) *
        facilities_value *
        trial_ceil_year
      : 0;
  const preStudyMonitoringAndEssentialDocumentReview = {
    itemname: "開始前モニタリング・必須文書確認",
    value: preStudyMonitoringAndEssentialDocumentReview_value,
  };

  const caseMonitoringAndSAESupport_value =
    quotationRequestValidationContext.monitoringVisitsPerCase > 0
      ? parseInt(quotationRequestValidationContext.monitoringVisitsPerCase) *
        number_of_cases_value
      : 0;
  const caseMonitoringAndSAESupport = {
    itemname: "症例モニタリング・SAE対応",
    value: caseMonitoringAndSAESupport_value,
  };
  const res = new Map();
  res.set(
    "monitoringPreparationDocumentCreation",
    monitoringPreparationDocumentCreation,
  );
  res.set(
    "preStudyMonitoringAndEssentialDocumentReview",
    preStudyMonitoringAndEssentialDocumentReview,
  );
  res.set("caseMonitoringAndSAESupport", caseMonitoringAndSAESupport);
  return res;
}
