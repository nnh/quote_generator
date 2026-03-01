/**
 * Date utility wrapper (Moment.js abstraction)
 * NOTE: Do not use moment directly outside this file.
 */
//const DateUtils = {
//  /**
//   * Add months to a date
//   * @param {Date|string} date
//   * @param {number} months
//   * @return {Date}
//   */
//  addMonths(date, months) {
//    return Moment.moment(date).add(months, "months").toDate();
//  },
//
//  /**
//   * Format date
//   * @param {Date|string} date
//   * @param {string} format
//   * @return {string}
//   */
//  format(date, format) {
//    return Moment.moment(date).format(format);
//  },
//
//  /**
//   * Difference in months
//   * @param {Date|string} from
//   * @param {Date|string} to
//   * @return {number}
//   */
//  diffInMonths(from, to) {
//    return Moment.moment(to).diff(Moment.moment(from), "months");
//  },
//};
///**
// * 日付文字列を Moment に変換する
// * Moment依存をここに閉じ込める
// *
// * @param {string|undefined|null} value
// * @return {Moment.Moment}
// */
//function toMoment_(value) {
//  return Moment.moment(value);
//}
/**
 * 日付文字列を Date に変換する（pure）
 *
 * @param {string|undefined|null} value
 * @return {Date|null}
 */
function toDate_(value) {
  if (!value) return null;

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
/**
 * 今日の日付を YYYY/MM/DD 形式で返す
 *
 * @param {Date} [baseDate]
 * @return {string}
 */
function formatTodayYmd_(baseDate = new Date()) {
  const y = baseDate.getFullYear();
  const m = String(baseDate.getMonth() + 1).padStart(2, "0");
  const d = String(baseDate.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}
///**
// * 指定日が属する日本年度の年度末（3/31）を返す
// * @param {Moment} date
// * @return {Moment}
// */
//function getFiscalYearEnd_(date) {
//  const fiscalYear = date.clone().subtract(3, "months").year();
//  return Moment.moment([fiscalYear + 1, 2, 31]);
//}
/**
 * 指定日が属する日本年度の年度末（3/31）を返す（Moment非依存）
 *
 * @param {Date|Object} date Date または Moment互換（toDate を持つ）
 * @return {Date}
 */
function getFiscalYearEnd_(date) {
  const d = normalizeDate_(date);

  // 3ヶ月引く（Moment互換ロジック）
  const shifted = addMonths_(d, -3);

  const fiscalYear = shifted.getFullYear();

  // 翌年3/31
  return new Date(fiscalYear + 1, 2, 31);
}

///**
// * 指定日が属する日本年度の年度初（4/1）を返す
// * @param {Moment} date
// * @return {Moment}
// */
//function getFiscalYearStart_(date) {
//  const fiscalYear = date.clone().subtract(3, "months").year();
//  return Moment.moment([fiscalYear, 3, 1]);
//}
/**
 * 指定日が属する日本年度の年度初（4/1）を返す
 * @param {Date} date
 * @return {Date}
 */
function getFiscalYearStart_(date) {
  if (!date) return null;

  // 3ヶ月戻す
  const shifted = addMonths_(date, -3);

  const fiscalYear = shifted.getFullYear();

  // 4/1 を返す
  return new Date(fiscalYear, 3, 1);
}
/**
 * 指定した日付の「月初日（1日）」を返す
 *
 * 時刻は 00:00:00 に正規化される。
 *
 * @param {Date} date
 *   基準となる日付
 * @return {Date}
 *   指定日付が属する月の月初日
 */
function startOfMonth_(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 指定した日付の「月末日」を返す
 *
 * 時刻は 23:59:59.999 ではなく、
 * 日付のみを表す Date オブジェクトとして返す。
 *
 * @param {Date} date
 *   基準となる日付
 * @return {Date}
 *   指定日付が属する月の月末日
 */
function endOfMonth_(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
/**
 * 2つの日付の月差が正かどうかを判定する（Moment互換）
 *
 * Moment の
 *   to.diff(from, "months") > 0
 * と同等の結果を返す。
 *
 * ※ 年月差だけでなく「日」も考慮する。
 *    to の日が from の日より小さい場合、
 *    1ヶ月未満とみなして月差を -1 補正する。
 *
 * 例:
 *   2024/03/31 → 2024/04/01 => false
 *   2024/03/01 → 2024/04/01 => true
 *
 * @param {Date} from - 基準日
 * @param {Date} to - 比較対象日
 * @return {boolean} 月差が正（Moment基準で to が後）なら true
 */
function hasPositiveMonthDiff_(from, to) {
  let monthDiff =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());

  // Moment互換の日補正
  if (to.getDate() < from.getDate()) {
    monthDiff -= 1;
  }

  return monthDiff > 0;
}

/**
 * Date / Moment 互換値を Date に正規化する
 *
 * Moment オブジェクトが渡された場合は toDate() を呼び出し、
 * Date の場合はそのまま返す。
 *
 * Moment依存をロジック層へ持ち込まないための境界関数。
 *
 * @param {Date|Object|null|undefined} v
 *   Date または Moment互換オブジェクト（toDate を持つ）
 *
 * @return {Date|null|undefined}
 *   Date に変換された値（null / undefined はそのまま返す）
 */
function normalizeDate_(v) {
  return v?.toDate?.() ?? v;
}
/**
 * 指定日から月を加減した日付を返す
 *
 * - 元の日付は変更しない（immutable）
 * - 月末補正あり（例: 1/31 + 1ヶ月 → 2/29 など）
 *
 * @param {Date|Object} date Date または Moment互換（toDate を持つ）
 * @param {number} months 加減する月数（負数可）
 * @return {Date}
 */
function addMonths_(date, months) {
  const d = normalizeDate_(date);

  const year = d.getFullYear();
  const month = d.getMonth() + months;
  const day = d.getDate();

  const result = new Date(year, month, 1);

  // 月末補正
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(day, lastDay));

  return result;
}
/**
 * 指定日から指定日数を加減した日付を返す
 * @param {Date} date
 * @param {number} days
 * @return {Date}
 */
function addDays_(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
/**
 * 月差を計算（Moment diff互換）
 * 切り捨て
 *
 * @param {Date|null} to
 * @param {Date|null} from
 * @return {number}
 */
function monthDiff_(to, from) {
  if (!to || !from) return 0;

  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());

  if (to.getDate() < from.getDate()) {
    months--;
  }

  return months;
}
