/**
 * 見積用スプレッドシート名をリネームする（副作用あり）
 *
 * 形式: Quote {acronym} {yyyyMMdd}
 *
 * @param {string} acronym 試験実施番号
 * @return {void}
 */
function renameSpreadsheetWithAcronym_(acronym) {
  if (!acronym) return;
  const today = Utilities.formatDate(new Date(), "JST", "yyyyMMdd");
  const ss = getSpreadsheet_();
  ss.rename(`Quote ${acronym} ${today}`);
}

/**
 * 試験期間の開始日・終了日を取得する
 *
 * @return {{trialStartDate: *, trialEndDate: *}|null}
 *   両方存在する場合のみオブジェクトを返し、欠損があれば null を返す
 */
function getTrialDates_() {
  const trialStartDate = getQuotationRequestValue_(
    QUOTATION_REQUEST_SHEET.ITEMNAMES.TRIAL_REGISTRATION_START_DATE,
  );
  const trialEndDate = getQuotationRequestValue_(
    QUOTATION_REQUEST_SHEET.ITEMNAMES.TRIAL_END_DATE,
  );

  if (!trialStartDate || !trialEndDate) {
    return null;
  }

  return {
    trialStartDate,
    trialEndDate,
  };
}

/**
 * 試験種別に応じて試験期間を計算しtrialシートへ反映する（副作用あり）
 *
 * @param {string} trialType 試験種別
 * @param {{trial: GoogleAppsScript.Spreadsheet.Sheet}} sheet sheetsオブジェクト
 * @return {void}
 */
function applyTrialType_(trialType, sheet) {
  const scriptProperties = PropertiesService.getScriptProperties();
  setTrialTypeProperty_(trialType, scriptProperties);
  const trialDates = getTrialDates_();
  if (!trialDates) {
    return;
  }

  const { trialStartDate, trialEndDate } = trialDates;
  // Setup / Closing期間の決定とプロパティへの保存
  applySetupClosingTerm_(trialType);

  // 試験期間配列を取得
  const trialDateArray = buildTrialDateArray_(trialStartDate, trialEndDate);

  const trialStartCol = TRIAL_SHEET.COLUMNS.TRIAL_START;
  const trialEndCol = TRIAL_SHEET.COLUMNS.TRIAL_END;
  const trialSetupRow = TRIAL_SHEET.ROWS.TRIAL_SETUP;
  const trialYearsCol = TRIAL_SHEET.COLUMNS.TRIAL_YEARS;
  const totalMonthCol = TRIAL_SHEET.COLUMNS.TRIAL_MONTHS;

  // 既存値クリア
  sheet.trial
    .getRange(trialSetupRow, trialStartCol, trialDateArray.length, 2)
    .clear();

  writeTrialDatesToSheet_(
    sheet,
    trialDateArray,
    trialSetupRow,
    trialStartCol,
    trialEndCol,
    trialYearsCol,
    totalMonthCol,
  );
  return;
}

/**
 * quotation_requestシートの内容をもとに
 * trialシートおよびitemsシートを更新する（副作用あり）
 *
 * @return {void}
 */
function applyQuotationRequestToSheets_() {
  const const_facilities = ITEM_LABELS.FACILITIES;
  const const_number_of_cases = ITEM_LABELS.NUMBER_OF_CASES;
  const trialSheet = _cachedSheets.trial;
  if (!trialSheet) {
    throw new Error("Trial シートが取得できません");
  }
  const trial_list = [
    [TRIAL_SHEET.ITEMNAMES.QUOTATION_TYPE, 2],
    ["見積発行先", 4],
    ["研究代表者名", 8],
    ["試験課題名", 9],
    [ITEM_LABELS.ACRONYM, 10],
    [TRIAL_SHEET.ITEMNAMES.TRIAL_TYPE, 27],
    [const_number_of_cases, TRIAL_SHEET.ROWS.CASES],
    [const_facilities, TRIAL_SHEET.ROWS.FACILITIES],
    [TRIAL_SHEET.ITEMNAMES.CRF, TRIAL_SHEET.ROWS.CRF],
    [ITEM_LABELS.FUNDING_SOURCE_LABEL, 44],
  ];
  const scriptProperties = PropertiesService.getScriptProperties();
  const isCdiscEnabled = isCdiscEnabled_();

  for (let i = 0; i < trial_list.length; i++) {
    const key = trial_list[i][0];
    const row = Number(trial_list[i][1]);
    const context = {
      scriptProperties,
      isCdiscEnabled,
    };
    const quotationRequestValue = getQuotationRequestValue_(key);
    if (quotationRequestValue == null) {
      throw new Error(`Missing quotation request value for key: ${key}`);
    }

    applyTrialSideEffects_(key, quotationRequestValue, context);
    const result = resolveTrialFieldValue_(key, quotationRequestValue, {
      isCdiscEnabled,
    });
    trialSheet.getRange(row, TRIAL_SHEET.COLUMNS.VALUE).setValue(result);
  }
  // 発行年月日に今日の日付を入れる
  const date_of_issue = findRowByValue_(trialSheet, 1, "発行年月日");
  if (date_of_issue > 0) {
    trialSheet
      .getRange(date_of_issue, TRIAL_SHEET.COLUMNS.VALUE)
      .setValue(formatTodayYmd_());
  }
  const itemSheet = _cachedSheets.items;
  if (!itemSheet) {
    throw new Error("Items シートが取得できません");
  }
  applyItemPrices_(itemSheet);
}
