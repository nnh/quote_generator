/**
 * 試験開始日・終了日を月初・月末に丸める
 * ※ Moment 依存あり
 *
 * @param {Date|string|Moment.Moment} input_trial_start_date
 * @param {Date|string|Moment.Moment} input_trial_end_date
 * @return {{
 *   trialStart: Moment.Moment,
 *   trialEnd: Moment.Moment
 * }}
 */
function buildTrialMonthRangeWithMoment_(
  input_trial_start_date,
  input_trial_end_date,
) {
  const trialStart = Moment.moment(input_trial_start_date).startOf("month");
  const trialEnd = Moment.moment(input_trial_end_date).endOf("month");

  return {
    trialStart,
    trialEnd,
  };
}
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
function calculateSetupPeriodWithMoment_(trialStart, setupTermMonths) {
  const setupStart = trialStart.clone().subtract(setupTermMonths, "months");
  const setupEnd = getFiscalYearEnd_(setupStart);

  return {
    setupStart,
    setupEnd,
  };
}

/**
 * Closing 期間を算出する
 * ※ Moment 依存あり
 * @param {Moment} trialEnd 試験終了日（月末に正規化済み）
 * @param {number} closingTermMonths closing期間（月数）
 * @return {Object}
 * @return {Moment} return.closingStart closing開始日（年度初）
 * @return {Moment} return.closingEnd closing終了日
 */
function calculateClosingPeriodWithMoment_(trialEnd, closingTermMonths) {
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
 * Registration / Observation 期間を算出する
 * ※ Moment 依存あり
 *
 * @param {Moment.Moment} setupEnd Setup 終了日
 * @param {Moment.Moment} closingStart Closing 開始日
 * @param {Moment.Moment} trialStart 試験開始日
 * @param {Moment.Moment} trialEnd 試験終了日
 * @return {{
 *   registrationStart: Moment.Moment,
 *   registrationEnd: Moment.Moment,
 *   observationStart: Moment.Moment,
 *   observationEnd: Moment.Moment
 * }}
 */
function calculateRegistrationPeriodsWithMoment_(
  setupEnd,
  closingStart,
  trialStart,
  trialEnd,
) {
  const registrationStart = setupEnd.clone().add(1, "day");
  const registrationEnd = closingStart.clone().subtract(1, "day");

  const observationStart = trialStart.clone();
  const observationEnd = trialEnd.clone();

  return {
    registrationStart,
    registrationEnd,
    observationStart,
    observationEnd,
  };
}
