/**
 * Trial / Items シート生成・価格設定・コメント操作
 */
function convertQuotationTypeLabel_(value) {
  return value === "正式見積" ? "御見積書" : "御参考見積書";
}
/**
 * 見積係数を正規化する
 * - 商用企業の場合は 1.5
 * - それ以外は 1
 *
 * @param {string} coefficientValue quotation_request から取得した値
 * @param {PropertiesService.Properties} scriptProperties
 * @return {number} 正規化後の係数
 */
function normalizeCoefficient_(coefficientValue) {
  const commercialCoefficient = QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL;

  return coefficientValue === commercialCoefficient ? 1.5 : 1;
}
/**
 * CRF数をCDISC加算用の式に変換する
 *
 * @param {string|number} crfCount
 * @return {string}
 */
function buildCdiscCrfFormula_(crfCount) {
  const crfValue = typeof crfCount === "number" ? crfCount : `"${crfCount}"`;
  return `=${crfValue}*${CDISC_ADDITION}`;
}

function isCdiscEnabled_() {
  return (
    getQuotationRequestValue_(
      QUOTATION_REQUEST_SHEET.ITEMNAMES.CDISC_SUPPORT,
    ) === COMMON_EXISTENCE_LABELS.YES
  );
}

function convertCrfValueForCdisc_(crfCount, isCdiscEnabled) {
  if (!isCdiscEnabled) {
    return crfCount;
  }

  return buildCdiscCrfFormula_(crfCount);
}

function applyCdiscComment_(isCdiscEnabled) {
  if (!isCdiscEnabled) return;
  const CRF_COMMENT_DEFAULT =
    '="CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"';
  const CRF_COMMENT_CDISC =
    '="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"';

  deleteTrialComment_(CRF_COMMENT_DEFAULT);

  setTrialComment_(CRF_COMMENT_CDISC);
}

/**
 * 見積用スプレッドシート名をリネームする
 *
 * 形式:
 *   Quote {acronym} {yyyyMMdd}
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
 * 試験期間に必要な日付を取得する
 * @return {{trialStartDate:any, trialEndDate:any}|null}
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
 * trialシートに試験期間配列を書き込む
 *
 * @param {Object} sheet sheetsオブジェクト
 * @param {Array.<Array.<Date>>} trialDateArray 試験期間配列
 * @param {number} trialSetupRow trialSetup開始行
 * @param {number} trialStartCol trial開始列
 * @param {number} trialEndCol trial終了列
 * @param {number} trialYearsCol 年数表示列
 * @param {number} totalMonthCol 総月数表示列
 * @return {void}
 */
function writeTrialDatesToSheet_(
  sheet,
  trialDateArray,
  trialSetupRow,
  trialStartCol,
  trialEndCol,
  trialYearsCol,
  totalMonthCol,
) {
  let lastRow = null;

  trialDateArray.forEach((dates, i) => {
    const startCell = sheet.trial.getRange(trialSetupRow + i, trialStartCol);
    const endCell = sheet.trial.getRange(trialSetupRow + i, trialEndCol);

    const [startDate, endDate] = dates;

    if (startDate) startCell.setValue(startDate);
    if (endDate) endCell.setValue(endDate);

    const startAddr = startCell.getA1Notation();
    const endAddr = endCell.getA1Notation();

    sheet.trial
      .getRange(trialSetupRow + i, trialYearsCol)
      .setFormula(
        `=if(and($${startAddr}<>"",$${endAddr}<>""),datedif($${startAddr},$${endAddr},"y")+1,"")`,
      );

    lastRow = trialSetupRow + i;
  });

  // total（月数）
  const totalCell = sheet.trial.getRange(lastRow, totalMonthCol);
  totalCell.setFormula(
    `=datedif(${sheet.trial
      .getRange(lastRow, trialStartCol)
      .getA1Notation()},(${sheet.trial
      .getRange(lastRow, trialEndCol)
      .getA1Notation()}+1),"m")`,
  );

  // x年xヶ月 表示
  sheet.trial
    .getRange(lastRow, trialYearsCol)
    .setFormula(
      `=trunc(${totalCell.getA1Notation()}/12) & "年" & if(mod(${totalCell.getA1Notation()},12)<>0,mod(${totalCell.getA1Notation()},12) & "ヶ月","")`,
    );
  return;
}

/**
 * 試験種別に応じて試験期間を計算し、trialシートへ反映する
 *
 * @param {string} trialType 試験種別
 * @param {Object} sheet sheets オブジェクト
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
  const totalMonthCol = 6;

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

function resolveTrialFieldValue_(key, fieldValue, options = {}) {
  if (fieldValue == null) return null;

  const { isCdiscEnabled = false } = options;

  switch (key) {
    case TRIAL_SHEET.ITEMNAMES.QUOTATION_TYPE:
      return convertQuotationTypeLabel_(fieldValue);

    case ITEM_LABELS.FUNDING_SOURCE_LABEL:
      return normalizeCoefficient_(fieldValue);

    case TRIAL_SHEET.ITEMNAMES.CRF:
      return convertCrfValueForCdisc_(fieldValue, isCdiscEnabled);

    default:
      return fieldValue;
  }
}

function applyTrialSideEffects_(key, fieldValue, context) {
  const { scriptProperties, isCdiscEnabled } = context;

  switch (key) {
    case TRIAL_SHEET.ITEMNAMES.TRIAL_TYPE:
      applyTrialType_(fieldValue, _cachedSheets);
      break;
    case ITEM_LABELS.NUMBER_OF_CASES:
      setNumberOfCasesProperty_(fieldValue, scriptProperties);
      break;
    case ITEM_LABELS.FACILITIES:
      setFacilitiesProperty_(fieldValue, scriptProperties);
      break;
    case ITEM_LABELS.ACRONYM:
      renameSpreadsheetWithAcronym_(fieldValue);
      break;
    case TRIAL_SHEET.ITEMNAMES.CRF:
      applyCdiscComment_(isCdiscEnabled);
      break;
  }
}
/**
 * quotation_requestシートの内容からtrialシート, itemsシートを設定する
 * @return {void}
 * @example
 *   applyQuotationRequestToSheets_();
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
    [TRIAL_SHEET.ITEMNAMES.CRF, 30],
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
    trialSheet.getRange(row, 2).setValue(result);
  }
  // 発行年月日に今日の日付を入れる
  const date_of_issue = findRowByValue_(trialSheet, 1, "発行年月日");
  if (date_of_issue > 0) {
    trialSheet.getRange(date_of_issue, 2).setValue(formatTodayYmd_());
  }
  const itemSheet = _cachedSheets.items;
  if (!itemSheet) {
    throw new Error("Items シートが取得できません");
  }
  applyItemPrices_(itemSheet);
}
