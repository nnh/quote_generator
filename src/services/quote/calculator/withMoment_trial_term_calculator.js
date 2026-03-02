/**
 * 試験開始日・終了日を月初・月末に丸める
 *
 * @param {Date|string|Object} input_trial_start_date
 * @param {Date|string|Object} input_trial_end_date
 * @return {{
 *   trialStart: Date,
 *   trialEnd: Date
 * }}
 */
function buildTrialMonthRange_(input_trial_start_date, input_trial_end_date) {
  const start = normalizeDate_(input_trial_start_date);
  const end = normalizeDate_(input_trial_end_date);

  return {
    trialStart: start ? startOfMonth_(start) : null,
    trialEnd: end ? endOfMonth_(end) : null,
  };
}

/**
 * setup期間を算出する
 *
 * @param {Date} trialStart 試験開始日（月初に正規化済み）
 * @param {number} setupTermMonths setup期間（月数）
 * @return {{
 *   setupStart: Date,
 *   setupEnd: Date
 * }}
 */
function calculateSetupPeriod_(trialStart, setupTermMonths) {
  const setupStart = addMonths_(trialStart, -setupTermMonths);
  const setupEnd = getFiscalYearEnd_(setupStart);

  return {
    setupStart,
    setupEnd,
  };
}

/**
 * Closing期間を算出する
 *
 * @param {Date} trialEnd 試験終了日（月末に正規化済み）
 * @param {number} closingTermMonths closing期間（月数）
 * @return {{closingStart: Date, closingEnd: Date}}
 */
function calculateClosingPeriod_(trialEnd, closingTermMonths) {
  if (!trialEnd || !closingTermMonths) {
    return { closingStart: null, closingEnd: null };
  }

  // trialEnd + 1日
  const nextDay = addDays_(trialEnd, 1);

  // + closingTermMonthsヶ月
  const addedMonths = addMonths_(nextDay, closingTermMonths);

  // - 1日
  const closingEnd = addDays_(addedMonths, -1);

  const closingStart = getFiscalYearStart_(closingEnd);

  return {
    closingStart,
    closingEnd,
  };
}

/**
 * registration_1 期間を計算する
 *
 * setup 終了日と closing 開始日の月差が正の場合のみ、
 * setup 終了日の翌日から 1 年間を registration_1 とする。
 *
 * @param {Date} setupEnd
 * @param {Date} closingStart
 * @return {{start: Date|null, end: Date|null}}
 */
function calculateRegistration1_(setupEnd, closingStart) {
  if (!hasPositiveMonthDiff_(setupEnd, closingStart)) {
    return { start: null, end: null };
  }

  const start = new Date(setupEnd);
  start.setDate(start.getDate() + 1); // setupEnd + 1日

  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1); // 1年足す
  end.setDate(end.getDate() - 1); // 1日引く

  return { start, end };
}

/**
 * observation_2 期間を計算する
 *
 * registration_1 終了日と closing 開始日の月差が正の場合、
 * closing 開始日の前日を終了日、
 * closing 開始日の 1 年前を開始日とする。
 *
 * @param {Date|null} registration1End
 * @param {Date} closingStart
 * @return {{start: Date|null, end: Date|null}}
 */
function calculateObservation2_(registration1End, closingStart) {
  if (!registration1End) return { start: null, end: null };

  if (!hasPositiveMonthDiff_(registration1End, closingStart)) {
    return { start: null, end: null };
  }

  const end = new Date(closingStart);
  end.setDate(end.getDate() - 1); // closingStart の前日

  const start = new Date(closingStart);
  start.setFullYear(start.getFullYear() - 1); // 1年前

  return { start, end };
}

/**
 * registration2 期間を計算する
 *
 * registration1 終了日〜 observation2 開始日の月差が正の場合、
 * observation2 開始日の前日を終了日、
 * registration1 終了日の翌日を開始日とする。
 *
 * @param {Date|Object|null} registration1End
 * @param {Date|Object|null} observation2Start
 *
 * @return {{
 *   start: Date|null,
 *   end: Date|null
 * }}
 */
function calculateRegistration2_(registration1End, observation2Start) {
  const reg1End = normalizeDate_(registration1End);
  const obs2Start = normalizeDate_(observation2Start);

  if (!reg1End || !obs2Start) {
    return { start: null, end: null };
  }

  if (!hasPositiveMonthDiff_(reg1End, obs2Start)) {
    return { start: null, end: null };
  }

  const end = addDays_(obs2Start, -1);
  const start = addDays_(reg1End, 1);

  return { start, end };
}
/**
 * Registration / Observation 期間を計算する
 * @param {Date} setupEnd setup終了日
 * @param {Date} closingStart closing開始日
 * @param {Date} trialStart 試験開始日
 * @param {Date} trialEnd 試験終了日
 * @return {Object} registration / observation 情報
 */
function calculateRegistrationPeriods_(
  setupEnd,
  closingStart,
  trialStart,
  trialEnd,
) {
  // registration_1
  const reg1 = calculateRegistration1_(setupEnd, closingStart);
  const registration1Start = reg1.start;
  const registration1End = reg1.end;

  // observation_2
  const obs2 = calculateObservation2_(registration1End, closingStart);
  const observation2Start = obs2.start;
  const observation2End = obs2.end;

  // registration_2
  const reg2 = calculateRegistration2_(registration1End, observation2Start);
  const registration2Start = reg2.start;
  const registration2End = reg2.end;

  // registration年数計算
  const registrationYears = calculateRegistrationDurationYears_(
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
 * Registration 年数を計算する
 *
 * Moment / Date の両方を受け取れる
 *
 * @param {Moment|null|Date} registration1Start
 * @param {Moment|null|Date} observation2End
 * @param {Moment|null|Date} registration2End
 * @param {Moment|null|Date} registration1End
 * @param {Moment|Date} trialStart
 * @param {Moment|Date} trialEnd
 * @return {number}
 */
function calculateRegistrationDurationYears_(
  registration1Start,
  observation2End,
  registration2End,
  registration1End,
  trialStart,
  trialEnd,
) {
  const start = normalizeDate_(registration1Start ?? trialStart);

  const end = normalizeDate_(
    observation2End ?? registration2End ?? registration1End ?? trialEnd,
  );

  return get_years_(start, end);
}

function buildTermPeriods_({
  setupStart,
  setupEnd,
  closingStart,
  closingEnd,
  registrationInfo,
}) {
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
