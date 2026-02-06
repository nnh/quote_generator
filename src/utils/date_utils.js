/**
 * Date utility wrapper (Moment.js abstraction)
 * NOTE: Do not use moment directly outside this file.
 */
const DateUtils = {
  /**
   * Add months to a date
   * @param {Date|string} date
   * @param {number} months
   * @return {Date}
   */
  addMonths(date, months) {
    return Moment.moment(date).add(months, "months").toDate();
  },

  /**
   * Format date
   * @param {Date|string} date
   * @param {string} format
   * @return {string}
   */
  format(date, format) {
    return Moment.moment(date).format(format);
  },

  /**
   * Difference in months
   * @param {Date|string} from
   * @param {Date|string} to
   * @return {number}
   */
  diffInMonths(from, to) {
    return Moment.moment(to).diff(Moment.moment(from), "months");
  },
};
