/**
 * 開始日〜終了日に含まれる業務上の月数を返す
 * ※ start_date は必ず月初、end_date は必ず月末に正規化済みであること
 * ※ 正規化は buildTrialDateArray_() 側で行う前提
 */
function get_months_(start_date, end_date) {
  if (!start_date || !end_date) return null;

  const s = normalizeDate_(start_date);
  const e = normalizeDate_(end_date);

  // 年月差を算出
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());

  // 月末を含めるため +1
  return months + 1;
}

function get_years_(start_date, end_date) {
  const months = get_months_(start_date, end_date);
  if (months === null) return null;

  return Math.ceil(months / 12);
}
/**
 * Retrieve the trial period, heading, and number of years of trial period on the Trial sheet.
 * @return {Array.<string>} the trial period, heading, and number of years of trial period on the Trial sheet.
 */
function getTrialTermInfo_() {
  if (!_cachedSheets || !_cachedSheets.trial) {
    throw new Error("Trial シートが取得できません");
  }

  const trialSheet = _cachedSheets.trial;

  const trialYearsColumnNumber = TRIAL_SHEET.COLUMNS.TRIAL_YEARS;
  if (isNaN(trialYearsColumnNumber)) {
    throw new Error("trial_years_column が正しく設定されていません");
  }
  const setupRow = TRIAL_SHEET.ROWS.TRIAL_SETUP;
  const closingRow = TRIAL_SHEET.ROWS.TRIAL_CLOSING;

  if (isNaN(setupRow) || isNaN(closingRow)) {
    throw new Error(
      "trial_setup_row または trial_closing_row が正しく設定されていません",
    );
  }

  const startRow = Math.min(setupRow, closingRow);
  const endRow = Math.max(setupRow, closingRow);
  const rowCount = endRow - startRow + 1;

  if (rowCount <= 0) {
    throw new Error(
      "Trial 行範囲が不正です: startRow=" + startRow + ", endRow=" + endRow,
    );
  }

  return trialSheet
    .getRange(startRow, 1, rowCount, trialYearsColumnNumber)
    .getValues();
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
  getTargetTerm_(exclusionSheetNames = null) {
    let target = this.trialTermInfo.filter((x) => x[this.yearIdx] != "");
    if (!exclusionSheetNames) {
      return target;
    }
    if (exclusionSheetNames) {
      target = target.filter(
        (row) => !exclusionSheetNames.includes(row[this.sheetNameIdx]),
      );
    }
    return target;
  }
  getTotalCount_(setValueList, target) {
    return setValueList.reduce(
      (x, y, idx) => x + y * target[idx][this.yearIdx],
      0,
    );
  }
  /**
   * @param <number> totalNumber Total number of items to be split.
   * @param {Array.<string>} target A two-dimensional array of ['sheet name', 'title', 'years'].
   * @return A two-dimensional array of ['sheet name', 'count'].
   */
  dividedItemCount_(totalNumber, target) {
    const totalYear = target.reduce((x, y) => x + y[this.yearIdx], 0);
    const tempSum = Math.trunc(totalNumber / totalYear);
    let setValueList = Array(target.length);
    setValueList.fill(tempSum);
    let tempArraySum = this.getTotalCount_(setValueList, target);
    let remainder = totalNumber - tempArraySum;
    // 無限ループ防止用の最大試行回数
    const MAX_LOOP = 10;
    let loopCount = MAX_LOOP;
    while (remainder > 0) {
      for (let i = 0; i < target.length; i++) {
        const temp = [...setValueList];
        temp[i]++;
        const checkValue = this.getTotalCount_(temp, target);
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
      loopCount--;
      if (loopCount <= 0) {
        break;
      }
    }
    const res = target.map((x, idx) => [
      x[this.sheetNameIdx],
      setValueList[idx],
    ]);
    return res;
  }
  getArrayDividedItemsCount_(totalNumber, exclusionSheetNames) {
    const target = this.getTargetTerm_(exclusionSheetNames);
    return this.dividedItemCount_(totalNumber, target);
  }
}
class GetArrayDividedItemsCountAdd extends GetArrayDividedItemsCount {
  getArrayDividedItemsCount_(totalNumber, exclusionSheetNames) {
    const target = this.getTargetTerm_(exclusionSheetNames);
    return this.dividedItemCount_(totalNumber, target);
  }
}
