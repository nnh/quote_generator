/**
 * 開始日〜終了日に含まれる業務上の月数（包含）を計算する
 *
 * ※ startDate は月初、endDate は月末に正規化済みであること
 * ※ 正規化は buildTrialDateArray_() 側で行う前提
 *
 * @param {Date} startDate 開始日（月初）
 * @param {Date} endDate 終了日（月末）
 * @return {number|null} 月数（開始月・終了月を含む）。不正な場合は null
 */
function calculateMonthSpan_(startDate, endDate) {
  if (!startDate || !endDate) return null;

  const s = normalizeDate_(startDate);
  const e = normalizeDate_(endDate);

  // 年月差を算出
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());

  // 月末を含めるため +1
  return months + 1;
}

/**
 * 開始日〜終了日に含まれる業務上の年数（切り上げ）を計算する
 *
 * @param {Date} startDate 開始日
 * @param {Date} endDate 終了日
 * @return {number|null} 年数（端数月は切り上げ）。不正な場合は null
 */
function calculateYearSpan_(startDate, endDate) {
  const months = calculateMonthSpan_(startDate, endDate);
  if (months === null) return null;

  return Math.ceil(months / 12);
}

/**
 * Trial シートから試験期間情報を取得する
 *
 * 指定された行範囲（Setup〜Closing）および列範囲から値を取得する。
 *
 * @throws {Error} Trial シートが取得できない場合
 * @throws {Error} 設定値（列・行）が不正な場合
 * @return {Array<Array<*>>} 試験期間情報の2次元配列
 *   例: [[sheetName, termInfo, years], ...]
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

/**
 * 試験期間情報の年数列を数値に正規化する
 *
 * @param {Array<Array<*>>} data 試験期間情報の2次元配列
 * @return {Array<Array<*>>} 年数を数値化した配列（不正値は 0）
 */
function normalizeTrialTermInfo_(data) {
  const COL = TRIAL_SHEET.COLUMN_INDEX;

  return data.map((row) => {
    const newRow = [...row];
    newRow[COL.TRIAL_YEARS] = Number(newRow[COL.TRIAL_YEARS]) || 0;
    return newRow;
  });
}

/**
 * 対象となる試験期間情報を抽出する
 *
 * - 年数が 0 より大きいもののみ対象
 * - 指定されたシート名は除外
 *
 * @param {Array<Array<*>>} trialTermInfo 試験期間情報
 * @param {Array<string>} [exclusionSheetNames=[]] 除外するシート名
 * @return {Array<Array<*>>} フィルタ後の試験期間情報
 */
function filterTargetTerms_(trialTermInfo, exclusionSheetNames = []) {
  const COL = TRIAL_SHEET.COLUMN_INDEX;

  return trialTermInfo
    .filter((row) => row[COL.TRIAL_YEARS] > 0)
    .filter((row) => !exclusionSheetNames.includes(row[COL.SHEET_NAME]));
}

/**
 * 分配値と年数から総数を計算する
 *
 * @param {Array<number>} setValueList 各要素の分配数
 * @param {Array<Array<*>>} target 試験期間情報
 * @return {number} 総数
 */
function calculateTotalCount_(setValueList, target) {
  const COL = TRIAL_SHEET.COLUMN_INDEX;

  return setValueList.reduce(
    (sum, count, idx) => sum + count * target[idx][COL.TRIAL_YEARS],
    0,
  );
}

/**
 * 総数を試験期間（年数）に応じて分配する
 *
 * - 各シートの年数に応じて配分
 * - remainder は順次加算
 * - 最大ループ回数で打ち切り
 *
 * @param {number} totalNumber 分配対象の総数
 * @param {Array<Array<*>>} trialTermInfo 試験期間情報
 * @param {Array<string>} [exclusionSheetNames=[]] 除外するシート名
 * @return {Array<Array<*>>} 分配結果
 *   例: [[sheetName, count], ...]
 */
function getArrayDividedItemsCount_(
  totalNumber,
  trialTermInfo,
  exclusionSheetNames = [],
) {
  const COL = TRIAL_SHEET.COLUMN_INDEX;

  const target = filterTargetTerms_(trialTermInfo, exclusionSheetNames);

  const totalYear = target.reduce((sum, row) => sum + row[COL.TRIAL_YEARS], 0);

  const tempSum = Math.trunc(totalNumber / totalYear);
  let setValueList = Array(target.length).fill(tempSum);

  let tempArraySum = calculateTotalCount_(setValueList, target);
  let remainder = totalNumber - tempArraySum;

  const MAX_LOOP = 10;
  let loopCount = MAX_LOOP;

  while (remainder > 0) {
    for (let i = 0; i < target.length; i++) {
      const temp = [...setValueList];
      temp[i]++;

      const checkValue = calculateTotalCount_(temp, target);

      if (checkValue <= totalNumber) {
        setValueList[i]++;
        remainder--;
      } else {
        break;
      }

      if (remainder === 0) break;
    }

    loopCount--;
    if (loopCount <= 0) break;
  }

  return target.map((row, idx) => [row[COL.SHEET_NAME], setValueList[idx]]);
}

/**
 * 試験期間が設定されている見積対象シート一覧を取得する
 *
 * - Setup〜Closing の期間が存在するシートのみ対象
 * - 見積処理メイン（runQuotationProcess）から利用
 *
 * @return {Array<{sheetName: string, termInfo: *, active: boolean}>}
 *   見積対象シート情報の配列
 */
function getActiveTrialTermSheets_() {
  return getTrialTermInfo_()
    .map(([sheetName, termInfo, flag]) => ({
      sheetName,
      termInfo,
      active: flag !== "",
    }))
    .filter((x) => x.active);
}

/**
 * 各シートの開始日・終了日を設定する
 * @param {number} input_trialStartDate 試験開始日のセル値
 * @param {number} input_trialEndDate 試験終了日のセル値
 * @return {Array.<Array>} 各シートの開始日・終了日の二次元配列
 */
function buildTrialDateArray_(input_trialStartDate, input_trialEndDate) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const setupTermMonths = Number(
    getScriptProperty_(SCRIPT_PROPERTY_KEYS.SETUP_TERM, scriptProperties),
  );
  const closingTermMonths = Number(
    getScriptProperty_(SCRIPT_PROPERTY_KEYS.CLOSING_TERM, scriptProperties),
  );

  const dates = calculateTrialDates_(
    input_trialStartDate,
    input_trialEndDate,
    setupTermMonths,
    closingTermMonths,
  );

  setScriptProperty_(
    SCRIPT_PROPERTY_KEYS.TRIAL_START_DATE,
    Utilities.formatDate(dates.trialStart, "Asia/Tokyo", "yyyy-MM-dd"),
    scriptProperties,
  );

  setScriptProperty_(
    SCRIPT_PROPERTY_KEYS.TRIAL_END_DATE,
    Utilities.formatDate(dates.trialEnd, "Asia/Tokyo", "yyyy-MM-dd"),
    scriptProperties,
  );

  setScriptProperty_(
    SCRIPT_PROPERTY_KEYS.REGISTRATION_YEARS,
    dates.registrationYears,
    scriptProperties,
  );

  return dates.sheetDateArray;
}
