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
 * 試験開始日を基準に setup 期間を計算する
 *
 * @param {Moment} trialStart 試験開始日（月初に正規化済み）
 * @param {number} setupTermMonths setup期間（月数）
 *
 * @return {Object}
 * @return {Moment} return.setupStart setup開始日
 * @return {Moment} return.setupEnd setup終了日（年度末）
 */
function calculateSetupPeriod_(trialStart, setupTermMonths) {
  const setupStart = trialStart.clone().subtract(setupTermMonths, "months");
  const setupEnd = getFiscalYearEnd_(setupStart);

  return {
    setupStart,
    setupEnd,
  };
}

/**
 * Registration / Observation 期間を計算する
 * @param {Moment} setupEnd setup終了日
 * @param {Moment} closingStart closing開始日
 * @param {Moment} trialStart 試験開始日
 * @param {Moment} trialEnd 試験終了日
 * @return {Object} registration / observation 情報
 */
function calculateRegistrationPeriods_(
  setupEnd,
  closingStart,
  trialStart,
  trialEnd,
) {
  // setup終了日〜closing開始日（月単位）
  const diffSetupEndToClosingStart = closingStart.diff(setupEnd, "months");

  // registration_1
  const registration1Start =
    diffSetupEndToClosingStart > 0 ? setupEnd.clone().add(1, "days") : null;

  const registration1End = registration1Start
    ? registration1Start.clone().add(1, "years").subtract(1, "days")
    : null;

  // registration_1終了日〜closing開始日（月単位）
  const diffReg1EndToClosingStart = registration1End
    ? closingStart.diff(registration1End, "months")
    : 0;

  // observation_2
  const observation2End =
    diffReg1EndToClosingStart > 0
      ? closingStart.clone().subtract(1, "days")
      : null;

  const observation2Start = observation2End
    ? closingStart.clone().subtract(1, "years")
    : null;

  // registration_2
  const diffReg1EndToObs2Start = observation2Start
    ? observation2Start.diff(registration1End, "months")
    : 0;

  const registration2End =
    diffReg1EndToObs2Start > 0
      ? observation2Start.clone().subtract(1, "days")
      : null;

  const registration2Start = registration2End
    ? registration1End.clone().add(1, "days")
    : null;

  // registration年数計算用
  const registrationStart = registration1Start ?? trialStart.clone();

  const registrationEnd =
    observation2End ?? registration2End ?? registration1End ?? trialEnd.clone();

  return {
    registration1Start,
    registration1End,
    registration2Start,
    registration2End,
    observation2Start,
    observation2End,
    registrationYears: get_years_(registrationStart, registrationEnd),
  };
}

/**
 * 試験終了日を基準に closing 期間を計算する
 *
 * @param {Moment} trialEnd 試験終了日（月末に正規化済み）
 * @param {number} closingTermMonths closing期間（月数）
 *
 * @return {Object}
 * @return {Moment} return.closingStart closing開始日（年度初）
 * @return {Moment} return.closingEnd closing終了日
 */
function calculateClosingPeriod_(trialEnd, closingTermMonths) {
  const closingEnd = trialEnd
    .clone()
    .add(1, "days")
    .add(closingTermMonths, "months")
    .subtract(1, "days");

  const closingStart = getFiscalYearStart_(closingEnd);

  return {
    closingStart,
    closingEnd,
  };
}

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
 * @return {Moment} return.trialStart 試験開始日（月初）
 * @return {Moment} return.trialEnd 試験終了日（月末）
 * @return {number} return.registrationYears registration期間の年数
 * @return {Object.<string, Array.<Moment|null>>} return.termPeriods
 *         期間キー（TRIAL_TERM_KEYS）をキーに持つ、開始日・終了日の配列
 * @return {Array.<Array.<Moment|null>>} return.sheetDateArray
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
  const trialStart = Moment.moment(input_trial_start_date).startOf("month");
  const trialEnd = Moment.moment(input_trial_end_date).endOf("month");

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

  const termPeriods = {
    [TRIAL_TERM_KEYS.SETUP]: [setupStart, setupEnd],
    [TRIAL_TERM_KEYS.REGISTRATION_1]: [
      registrationInfo.registration1Start,
      registrationInfo.registration1End,
    ],
    [TRIAL_TERM_KEYS.REGISTRATION_2]: [
      registrationInfo.registration2Start,
      registrationInfo.registration2End,
    ],
    [TRIAL_TERM_KEYS.OBSERVATION_2]: [
      registrationInfo.observation2Start,
      registrationInfo.observation2End,
    ],
    [TRIAL_TERM_KEYS.CLOSING]: [closingStart, closingEnd],
    [TRIAL_TERM_KEYS.SETUP_TO_CLOSING]: [setupStart, closingEnd],
  };

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
 * 指定日が属する日本年度の年度末（3/31）を返す
 * @param {Moment} date
 * @return {Moment}
 */
function getFiscalYearEnd_(date) {
  const fiscalYear = date.clone().subtract(3, "months").year();
  return Moment.moment([fiscalYear + 1, 2, 31]);
}

/**
 * 指定日が属する日本年度の年度初（4/1）を返す
 * @param {Moment} date
 * @return {Moment}
 */
function getFiscalYearStart_(date) {
  const fiscalYear = date.clone().subtract(3, "months").year();
  return Moment.moment([fiscalYear, 3, 1]);
}

/**
 * 各シートの開始日・終了日を設定する
 * @param {number} input_trial_start_date 試験開始日のセル値
 * @param {number} input_trial_end_date 試験終了日のセル値
 * @return {Array.<Array>} 各シートの開始日・終了日の二次元配列
 */
function get_trial_start_end_date_(
  input_trial_start_date,
  input_trial_end_date,
) {
  const sp = PropertiesService.getScriptProperties();
  const setupTermMonths = Number(sp.getProperty("setup_term"));
  const closingTermMonths = Number(sp.getProperty("closing_term"));

  const dates = calculateTrialDates_(
    input_trial_start_date,
    input_trial_end_date,
    setupTermMonths,
    closingTermMonths,
  );

  sp.setProperty("trial_start_date", dates.trialStart.format());
  sp.setProperty("trial_end_date", dates.trialEnd.format());
  sp.setProperty("registration_years", dates.registrationYears);

  return dates.sheetDateArray;
}
