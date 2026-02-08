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
  const trialStart = toMoment_(input_trial_start_date).startOf("month");
  const trialEnd = toMoment_(input_trial_end_date).endOf("month");

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
 * registration_1 期間を計算する
 * ※ Moment 依存あり
 *
 * setup 終了日と closing 開始日の月差が正の場合のみ、
 * setup 終了日の翌日から 1 年間を registration_1 とする。
 *
 * @param {Moment} setupEnd
 * @param {Moment} closingStart
 * @return {{
 *   start: Moment|null,
 *   end: Moment|null
 * }}
 */
function calculateRegistration1WithMoment_(setupEnd, closingStart) {
  if (!hasPositiveMonthDiffWithMoment_(setupEnd, closingStart)) {
    return { start: null, end: null };
  }

  const start = setupEnd.clone().add(1, "days");
  const end = start.clone().add(1, "years").subtract(1, "days");

  return { start, end };
}
/**
 * observation_2 期間を計算する
 * ※ Moment 依存あり
 *
 * registration_1 終了日と closing 開始日の月差が正の場合、
 * closing 開始日の前日を終了日、
 * closing 開始日の 1 年前を開始日とする。
 *
 * @param {Moment|null} registration1End
 * @param {Moment} closingStart
 * @return {{
 *   start: Moment|null,
 *   end: Moment|null
 * }}
 */
function calculateObservation2WithMoment_(registration1End, closingStart) {
  if (!registration1End) {
    return { start: null, end: null };
  }

  if (!hasPositiveMonthDiffWithMoment_(registration1End, closingStart)) {
    return { start: null, end: null };
  }

  const end = closingStart.clone().subtract(1, "days");
  const start = closingStart.clone().subtract(1, "years");

  return { start, end };
}
/**
 * registration2 期間を計算する
 *
 * @param {Moment} registration1End registration1 の終了日
 * @param {Moment|null} observation2Start observation2 の開始日
 *
 * @return {Object}
 * @return {Moment|null} return.start registration2 開始日
 * @return {Moment|null} return.end registration2 終了日
 */
function calculateRegistration2WithMoment_(
  registration1End,
  observation2Start,
) {
  // registration1 終了日〜 observation2 開始日の月差
  const diffReg1EndToObs2Start = observation2Start
    ? observation2Start.diff(registration1End, "months")
    : 0;

  // registration2 終了日
  const end =
    diffReg1EndToObs2Start > 0
      ? observation2Start.clone().subtract(1, "days")
      : null;

  // registration2 開始日
  const start = end ? registration1End.clone().add(1, "days") : null;

  return { start, end };
}

/**
 * Registration / Observation 期間を計算する
 * @param {Moment} setupEnd setup終了日
 * @param {Moment} closingStart closing開始日
 * @param {Moment} trialStart 試験開始日
 * @param {Moment} trialEnd 試験終了日
 * @return {Object} registration / observation 情報
 */
function calculateRegistrationPeriodsWithMoment_(
  setupEnd,
  closingStart,
  trialStart,
  trialEnd,
) {
  // setup終了日〜closing開始日（月単位）
  const diffSetupEndToClosingStart = hasPositiveMonthDiffWithMoment_(
    setupEnd,
    closingStart,
  );

  // registration_1
  const reg1 = calculateRegistration1WithMoment_(setupEnd, closingStart);
  const registration1Start = reg1.start;
  const registration1End = reg1.end;

  // observation_2
  const obs2 = calculateObservation2WithMoment_(registration1End, closingStart);
  const observation2Start = obs2.start;
  const observation2End = obs2.end;

  // registration_2
  const reg2 = calculateRegistration2WithMoment_(
    registration1End,
    observation2Start,
  );
  const registration2Start = reg2.start;
  const registration2End = reg2.end;

  // registration年数計算
  const registrationYears = calculateRegistrationYearsWithMoment_(
    registration1Start,
    observation2End,
    registration2End,
    registration1End,
    trialStart,
    trialEnd,
  );

  return {
    registration1Start,
    registration1End,
    registration2Start,
    registration2End,
    observation2Start,
    observation2End,
    registrationYears,
  };
}
/**
 * 2つの日付の月差が正（to が from より後）かを判定する
 * ※ Moment 依存あり
 *
 * @param {Moment} from
 * @param {Moment} to
 * @return {boolean}
 */
function hasPositiveMonthDiffWithMoment_(from, to) {
  return to.diff(from, "months") > 0;
}
/**
 * Registration 年数計算用の開始日を決定する
 * @param {Moment|null} registration1Start
 * @param {Moment} trialStart
 * @return {Moment}
 */
function determineRegistrationStartWithMoment_(registration1Start, trialStart) {
  return registration1Start ?? trialStart.clone();
}
/**
 * Registration 年数計算用の終了日を決定する
 * 優先順位：
 * observation2End → registration2End → registration1End → trialEnd
 *
 * @param {Moment|null} observation2End
 * @param {Moment|null} registration2End
 * @param {Moment|null} registration1End
 * @param {Moment} trialEnd
 * @return {Moment}
 */
function determineRegistrationEndWithMoment_(
  observation2End,
  registration2End,
  registration1End,
  trialEnd,
) {
  return (
    observation2End ?? registration2End ?? registration1End ?? trialEnd.clone()
  );
}
/**
 * Registration 年数を計算する
 * @param {Moment|null} registration1Start
 * @param {Moment|null} observation2End
 * @param {Moment|null} registration2End
 * @param {Moment|null} registration1End
 * @param {Moment} trialStart
 * @param {Moment} trialEnd
 * @return {number}
 */
function calculateRegistrationYearsWithMoment_(
  registration1Start,
  observation2End,
  registration2End,
  registration1End,
  trialStart,
  trialEnd,
) {
  const start = determineRegistrationStartWithMoment_(
    registration1Start,
    trialStart,
  );

  const end = determineRegistrationEndWithMoment_(
    observation2End,
    registration2End,
    registration1End,
    trialEnd,
  );

  return get_years_(start, end);
}
/**
 * 試験期間ごとの日付ペアをまとめた termPeriods を生成する
 * ※ 日付計算は行わず、受け取った値を構造化するだけ
 *
 * @param {{
 *   setupStart: Moment,
 *   setupEnd: Moment,
 *   closingStart: Moment,
 *   closingEnd: Moment,
 *   registrationInfo: Object
 * }} params
 *
 * @return {Object.<string, Array.<Moment|null>>}
 */
function buildTermPeriodsWithMoment_(params) {
  const { setupStart, setupEnd, closingStart, closingEnd, registrationInfo } =
    params;

  return {
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
}
