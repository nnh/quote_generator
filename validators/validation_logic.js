/**
 * Checkシートの初期化と基本情報の書き出し
 */
function initCheckSheet_() {
  initial_process();
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  filterhidden();
  sheet.check.clear();
  const array_quotation_request = sheet.quotation_request
    .getRange(1, 1, 2, sheet.quotation_request.getDataRange().getLastColumn())
    .getValues();
  const facilities_value = get_quotation_request_value(
    array_quotation_request,
    get_s_p.getProperty("facilities_itemname"),
  );
  const number_of_cases_value = get_quotation_request_value(
    array_quotation_request,
    get_s_p.getProperty("number_of_cases_itemname"),
  );
  const target_total = {
    sheet: sheet.total,
    array_item: get_fy_items(
      sheet.total,
      get_s_p.getProperty("fy_sheet_items_col"),
    ),
    col: parseInt(get_s_p.getProperty("fy_sheet_count_col")),
    footer: null,
  };
  const target_total_ammount = {
    sheet: sheet.total,
    array_item: get_fy_items(sheet.total, 2),
    col: 9,
    footer: "（金額）",
  };
  const trial_start_end = [
    ["OK/NG", "詳細", "", ""],
    [
      "",
      "症例登録開始〜試験終了日の月数チェック（作業用）",
      get_quotation_request_value(
        array_quotation_request,
        "症例登録開始日",
      ).toLocaleDateString("ja"),
      get_quotation_request_value(
        array_quotation_request,
        "試験終了日",
      ).toLocaleDateString("ja"),
    ],
  ];

  sheet.check
    .getRange(1, 1, trial_start_end.length, trial_start_end[0].length)
    .setValues(trial_start_end);
  const res = {
    get_s_p,
    sheet,
    array_quotation_request,
    facilities_value,
    number_of_cases_value,
    target_total,
    target_total_ammount,
    trial_start_end,
  };
  return res;
}
/**
 * 検証の基準となる月数データを取得する
 */
function calculateSetupAndClosingMonths(array_quotation_request, get_s_p) {
  const trial_type = get_quotation_request_value(
    array_quotation_request,
    "試験種別",
  );
  const has_report_support =
    get_quotation_request_value(
      array_quotation_request,
      "研究結果報告書作成支援",
    ) === "あり";

  let setup_month = 3;
  let closing_month = 3;

  // 医師主導治験または特定臨床研究の場合
  if (
    trial_type === get_s_p.getProperty("investigator_initiated_trial") ||
    trial_type === get_s_p.getProperty("specified_clinical_trial")
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
function compareTotalAmounts_(sheet, output_row) {
  const total_total_ammount = get_total_amount({
    sheet: sheet.total,
    item_cols: "B:B",
    total_row_itemname: "合計",
    header_row: 4,
    total_col_itemname: "金額",
  });
  const total2_total_ammount = get_total_amount({
    sheet: sheet.total2,
    item_cols: "B:B",
    total_row_itemname: "合計",
    header_row: 4,
    total_col_itemname: "合計",
  });
  const total3_total_ammount = get_total_amount({
    sheet: sheet.total3,
    item_cols: "B:B",
    total_row_itemname: "合計",
    header_row: 3,
    total_col_itemname: "合計",
  });
  const ammount_check = [null, "Total, Total2, Total3の合計金額チェック"];
  if (
    (total_total_ammount === total2_total_ammount) &
    (total_total_ammount === total3_total_ammount)
  ) {
    ammount_check[0] = "OK";
    ammount_check[1] = ammount_check[1] + " ,想定値:" + total_total_ammount;
  } else {
    ammount_check[0] = "NG：値が想定と異なる";
  }
  output_row++;
  sheet.check
    .getRange(output_row, 1, 1, ammount_check.length)
    .setValues([ammount_check]);
  return output_row;
}
function checkQuotationOfficeOperationItems_(
  get_s_p,
  array_quotation_request,
  trial_months,
  setup_month,
) {
  let office_bef_month = "";
  let office_count = "";
  let temp_value = "";
  if (
    (get_quotation_request_value(array_quotation_request, "試験種別") ==
      get_s_p.getProperty("investigator_initiated_trial")) |
    (get_quotation_request_value(
      array_quotation_request,
      "調整事務局設置の有無",
    ) ==
      "あり") |
    (get_quotation_request_value(
      array_quotation_request,
      get_s_p.getProperty("coefficient"),
    ) ==
      get_s_p.getProperty("commercial_company_coefficient"))
  ) {
    temp_value = trial_months;
    office_count = 1;
    office_bef_month = setup_month;
  } else {
    temp_value = "";
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
function checkQuotationKickoffMeetingItems_(
  get_s_p,
  array_quotation_request,
  total_months,
) {
  let temp_value;
  if (
    get_quotation_request_value(array_quotation_request, "試験種別") ===
    get_s_p.getProperty("investigator_initiated_trial")
  ) {
    temp_value = total_months;
  } else {
    temp_value = "";
  }
  if (
    get_quotation_request_value(
      array_quotation_request,
      "キックオフミーティング",
    ) === "あり"
  ) {
    temp_value = 1;
  } else {
    temp_value = "";
  }
  return { itemname: "キックオフミーティング準備・実行", value: temp_value };
}
function checkQuotationMonitoringItems_(
  array_quotation_request,
  facilities_value,
  number_of_cases_value,
  trial_ceil_year,
) {
  const monitoringPreparationDocumentCreation_value =
    get_quotation_request_value(
      array_quotation_request,
      "1例あたりの実地モニタリング回数",
    ) > 0
      ? 1
      : "";
  const monitoringPreparationDocumentCreation = {
    itemname: "モニタリング準備業務（関連資料作成）",
    value: monitoringPreparationDocumentCreation_value,
  };

  const preStudyMonitoringAndEssentialDocumentReview_value =
    get_quotation_request_value(
      array_quotation_request,
      "年間1施設あたりの必須文書実地モニタリング回数",
    ) > 0
      ? parseInt(
          get_quotation_request_value(
            array_quotation_request,
            "年間1施設あたりの必須文書実地モニタリング回数",
          ),
        ) *
        facilities_value *
        trial_ceil_year
      : "";
  const preStudyMonitoringAndEssentialDocumentReview = {
    itemname: "開始前モニタリング・必須文書確認",
    value: preStudyMonitoringAndEssentialDocumentReview_value,
  };

  const caseMonitoringAndSAESupport_value =
    get_quotation_request_value(
      array_quotation_request,
      "1例あたりの実地モニタリング回数",
    ) > 0
      ? parseInt(
          get_quotation_request_value(
            array_quotation_request,
            "1例あたりの実地モニタリング回数",
          ),
        ) * number_of_cases_value
      : "";
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
