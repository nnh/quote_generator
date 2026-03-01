/**
 * 見積期間キー定義
 */
const TRIAL_TERM_KEYS = {
  SETUP: "setup",
  REGISTRATION_1: "registration1",
  REGISTRATION_2: "registration2",
  OBSERVATION_2: "observation2",
  CLOSING: "closing",
  SETUP_TO_CLOSING: "setupToClosing",
};

/**
 * 試験開始日・終了日を基準に、setup / registration / observation / closing
 * 各期間の日付を計算し、表示・出力用の構造にまとめて返す。
 *
 * - 試験開始日は指定月の月初、終了日は月末に正規化する
 * - setup / closing 期間は日本年度（4/1〜3/31）を基準に算出する
 * - registration / observation 期間は setup 終了日と closing 開始日を元に動的に判定する
 *
 * @param {number} input_trial_start_date 試験開始日のセル値（シリアル値）
 * @param {number} input_trial_end_date 試験終了日のセル値（シリアル値）
 * @param {number} setupTermMonths setup期間（月数）
 * @param {number} closingTermMonths closing期間（月数）
 *
 * @return {Object} 計算結果オブジェクト
 * @return {Date} return.trialStart 試験開始日（月初）
 * @return {Date} return.trialEnd 試験終了日（月末）
 * @return {number} return.registrationYears registration期間の年数
 * @return {Object.<string, Array.<Date|null>>} return.termPeriods
 *         期間キー（TRIAL_TERM_KEYS）をキーに持つ、開始日・終了日の配列
 * @return {Array.<Array.<Date|null>>} return.sheetDateArray
 *         シート出力用に整形した二次元配列
 *
 * @example
 * const result = calculateTrialDates_(
 *   trialStartDate,
 *   trialEndDate,
 *   6,
 *   6
 * );
 * SpreadsheetApp.getActiveSheet().getRange(1, 1, result.sheetDateArray.length, 2)
 *   .setValues(result.sheetDateArray);
 */
function calculateTrialDates_(
  input_trial_start_date,
  input_trial_end_date,
  setupTermMonths,
  closingTermMonths,
) {
  // 試験開始日・終了日
  const { trialStart, trialEnd } = buildTrialMonthRange_(
    input_trial_start_date,
    input_trial_end_date,
  );

  // setup
  const { setupStart, setupEnd } = calculateSetupPeriod_(
    trialStart,
    setupTermMonths,
  );

  // closing
  const { closingStart, closingEnd } = calculateClosingPeriod_(
    trialEnd,
    closingTermMonths,
  );

  // registration / observation
  const registrationInfo = calculateRegistrationPeriods_(
    setupEnd,
    closingStart,
    trialStart,
    trialEnd,
  );

  const termPeriods = buildTermPeriods_({
    setupStart,
    setupEnd,
    closingStart,
    closingEnd,
    registrationInfo,
  });

  return {
    trialStart,
    trialEnd,
    registrationYears: registrationInfo.registrationYears,
    termPeriods,
    sheetDateArray: convertTermPeriodsToArray_(termPeriods),
  };
}

/**
 * 期間Objectを従来の配列形式に変換する（互換用）
 */
function convertTermPeriodsToArray_(termPeriods) {
  return [
    termPeriods[TRIAL_TERM_KEYS.SETUP],
    termPeriods[TRIAL_TERM_KEYS.REGISTRATION_1],
    termPeriods[TRIAL_TERM_KEYS.REGISTRATION_2],
    [null, null],
    [null, null],
    [null, null],
    termPeriods[TRIAL_TERM_KEYS.OBSERVATION_2],
    termPeriods[TRIAL_TERM_KEYS.CLOSING],
    termPeriods[TRIAL_TERM_KEYS.SETUP_TO_CLOSING],
  ];
}

/**
 * 各シートの開始日・終了日を設定する
 * @param {number} input_trial_start_date 試験開始日のセル値
 * @param {number} input_trial_end_date 試験終了日のセル値
 * @return {Array.<Array>} 各シートの開始日・終了日の二次元配列
 */
/*function buildTrialDateArray_(input_trial_start_date, input_trial_end_date) {
  const sp = PropertiesService.getScriptProperties();
  const setupTermMonths = Number(
    sp.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
  );
  const closingTermMonths = Number(
    sp.getProperty(SCRIPT_PROPERTY_KEYS.CLOSING_TERM),
  );

  const dates = calculateTrialDates_(
    input_trial_start_date,
    input_trial_end_date,
    setupTermMonths,
    closingTermMonths,
  );

  sp.setProperty(
    SCRIPT_PROPERTY_KEYS.TRIAL_START_DATE,
    dates.trialStart.format(),
  );
  sp.setProperty(SCRIPT_PROPERTY_KEYS.TRIAL_END_DATE, dates.trialEnd.format());
  sp.setProperty(
    SCRIPT_PROPERTY_KEYS.REGISTRATION_YEARS,
    dates.registrationYears,
  );

  return dates.sheetDateArray;
}*/
function buildTrialDateArray_(input_trial_start_date, input_trial_end_date) {
  const sp = PropertiesService.getScriptProperties();
  const setupTermMonths = Number(
    sp.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
  );
  const closingTermMonths = Number(
    sp.getProperty(SCRIPT_PROPERTY_KEYS.CLOSING_TERM),
  );

  const dates = calculateTrialDates_(
    input_trial_start_date,
    input_trial_end_date,
    setupTermMonths,
    closingTermMonths,
  );

  sp.setProperty(
    SCRIPT_PROPERTY_KEYS.TRIAL_START_DATE,
    Utilities.formatDate(dates.trialStart, "Asia/Tokyo", "yyyy-MM-dd"),
  );

  sp.setProperty(
    SCRIPT_PROPERTY_KEYS.TRIAL_END_DATE,
    Utilities.formatDate(dates.trialEnd, "Asia/Tokyo", "yyyy-MM-dd"),
  );

  sp.setProperty(
    SCRIPT_PROPERTY_KEYS.REGISTRATION_YEARS,
    dates.registrationYears,
  );

  return dates.sheetDateArray;
}

/**
 * 登録月数を計算する
 *
 * @param {Object} params
 * @param {number} params.trial_target_terms
 * @param {Date|Object} params.trial_start_date
 * @param {Date|Object} params.trial_end_date
 * @param {Date|Object} params.trial_target_start_date
 * @param {Date|Object} params.trial_target_end_date
 * @return {number|string}
 */
function calcRegistrationMonth_({
  trial_target_terms,
  trial_start_date,
  trial_end_date,
  trial_target_start_date,
  trial_target_end_date,
}) {
  const trialStart = normalizeDate_(trial_start_date);
  const trialEnd = normalizeDate_(trial_end_date);
  const targetStart = normalizeDate_(trial_target_start_date);
  const targetEnd = normalizeDate_(trial_target_end_date);

  if (trial_target_terms > 12) {
    return 12;
  }

  if (trialStart <= targetStart && targetEnd <= trialEnd) {
    return trial_target_terms;
  }

  if (targetStart < trialStart) {
    return monthDiff_(addDays_(targetEnd, 1), trialStart);
  }

  if (trialEnd < targetEnd) {
    return monthDiff_(addDays_(trialEnd, 1), targetStart);
  }

  return "";
}
/**
 * Setup / Closing期間を決定する
 * @param {string} trialType 試験種別
 * @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
 * @return {{setupTerm: number, closingTerm: number}} Setup / Closing期間（月数）
 */
function calculateSetupClosingTerm_(trialType, quotationRequest) {
  const isSpecialTrial = isSpecialTrial_(trialType);
  const hasReportSupport = hasReportSupport_(quotationRequest);

  return decideSetupClosingTerm_(isSpecialTrial, hasReportSupport);
}
