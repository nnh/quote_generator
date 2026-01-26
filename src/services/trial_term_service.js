/**
 * 開始日、終了日から月数・年数を返す
 */
function get_months(start_date, end_date) {
  if (start_date == "" || end_date == "") {
    return null;
  }
  return end_date.subtract(1, "days").diff(start_date, "months") + 1;
}
function get_years(start_date, end_date) {
  var temp;
  if (start_date == "" || end_date == "") {
    return null;
  }
  temp = get_months(start_date, end_date);
  return Math.ceil(temp / 12);
}
/**
 * Retrieve the trial period, heading, and number of years of trial period on the Trial sheet.
 * @param none.
 * @return {Array.<string>} the trial period, heading, and number of years of trial period on the Trial sheet.
 */
function getTrialTermInfo_() {
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  const row_count =
    parseInt(get_s_p.getProperty("trial_closing_row")) -
    parseInt(get_s_p.getProperty("trial_setup_row")) +
    1;
  const trial_term_info = sheet.trial
    .getRange(parseInt(get_s_p.getProperty("trial_setup_row")), 1, row_count, 3)
    .getValues();
  return trial_term_info;
}
class GetArrayDividedItemsCount {
  constructor() {
    this.sheetNameIdx = 0;
    this.yearIdx = 2;
    this.trialTermInfo = getTrialTermInfo_();
  }
  /**
   * Obtain the period information from the Trial sheet.
   * @param {Array.<string>} Define sheets that are not to be processed. An array of sheet names, such as ['Setup', 'Closing']. If not defined, set to null.
   * @return {Array.<string>} A two-dimensional array of ['sheet name', 'title', 'years'].
   */
  getTargetTerm(exclusionSheetNames = null) {
    let target = this.trialTermInfo.filter((x) => x[this.yearIdx] != "");
    if (!exclusionSheetNames) {
      return target;
    }
    exclusionSheetNames.forEach((x) => {
      for (let i = 0; i < target.length; i++) {
        if (x == target[i][this.sheetNameIdx]) {
          target[i][this.sheetNameIdx] = null;
          break;
        }
      }
    });
    target = target.filter((x) => x[this.sheetNameIdx]);
    return target;
  }
  getTotalCount(setValueList, target) {
    return setValueList.reduce(
      (x, y, idx) => x + y * target[idx][this.yearIdx],
      0,
    );
  }
  /**
   * @param <number> totalNumber Total number of items to be split.
   * @param {Array.<string>} target A two-dimensional array of ['sheet name', 'title', 'years'].
   * @param <number> inputAddStartSheetIdx If you want to specify a sheet to start adding, specify its index.
   * @param <number> inputAddEndSheetIdx If you want to specify a sheet to end adding, specify its index.
   * @return A two-dimensional array of ['sheet name', 'count'].
   */
  devidedItemCount(
    totalNumber,
    target,
    inputAddStartSheetIdx = 0,
    inputAddEndSheetIdx = target.length,
  ) {
    const totalYear = target.reduce((x, y) => x + y[this.yearIdx], 0);
    const tempSum = Math.trunc(totalNumber / totalYear);
    let setValueList = Array(target.length);
    setValueList.fill(tempSum);
    let tempArraySum = this.getTotalCount(setValueList, target);
    let remainder = totalNumber - tempArraySum;
    let roopCount = 10;
    while (remainder > 0) {
      for (let i = 0; i <= target.length; i++) {
        const temp = [...setValueList];
        temp[i]++;
        const checkValue = this.getTotalCount(temp, target);
        if (checkValue <= totalNumber) {
          setValueList[i]++;
          remainder--;
        } else {
          break;
        }
        if (remainder == 0) {
          break;
        }
      }
      roopCount--;
      if (roopCount <= 0) {
        break;
      }
    }
    const res = target.map((x, idx) => [
      x[this.sheetNameIdx],
      setValueList[idx],
    ]);
    return res;
  }
  getArrayDividedItemsCount(totalNumber, exclusionSheetNames) {
    const target = this.getTargetTerm(exclusionSheetNames);
    return this.devidedItemCount(totalNumber, target, 1, target.length - 1);
  }
}
class GetArrayDividedItemsCountAdd extends GetArrayDividedItemsCount {
  getArrayDividedItemsCount(totalNumber, exclusionSheetNames) {
    const target = this.getTargetTerm(exclusionSheetNames);
    return this.devidedItemCount(totalNumber, target, 1, target.length - 1);
  }
}
