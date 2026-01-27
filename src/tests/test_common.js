/**
 * テスト用の array_quotation_request を生成する
 * 指定した列（A, B, ..., AR など）の
 * 1行目・2行目に値を設定する
 *
 * @param {string} columnLetter 列文字（例: "O", "AA", "AR"）
 * @param {*} firstRowValue  1行目に設定する値
 * @param {*} secondRowValue 2行目に設定する値
 * @return {Array<Array<*>>} array_quotation_request
 */
function createTestQuotationRequestArrayWithColumn_(
  arrayQuotationRequest = null,
  columnLetter,
  firstRowValue,
  secondRowValue,
) {
  // A1:AR2 (44列, 2行) の空セル2次元配列
  const COL_COUNT = 44;
  const ROW_COUNT = 2;
  const array_quotation_request =
    arrayQuotationRequest === null
      ? Array.from({ length: ROW_COUNT }, () => Array(COL_COUNT).fill(""))
      : arrayQuotationRequest;

  // 列文字 → 0始まりインデックスに変換
  const colIndex = convertColumnLetterToIndexForTest_(columnLetter);

  // 範囲チェック（安全のため）
  if (colIndex < 0 || colIndex >= COL_COUNT) {
    throw new Error(`Invalid column letter: ${columnLetter}`);
  }

  // 値を設定
  array_quotation_request[0][colIndex] = firstRowValue;
  array_quotation_request[1][colIndex] = secondRowValue;

  return array_quotation_request;
}
/**
 * 列文字（A, B, ..., Z, AA, AB, ...）を 0始まりのインデックスに変換する
 *
 * @param {string} columnLetter
 * @return {number} 0始まりの列インデックス
 */
function convertColumnLetterToIndexForTest_(columnLetter) {
  let index = 0;
  const letters = columnLetter.toUpperCase();

  for (let i = 0; i < letters.length; i++) {
    index = index * 26 + (letters.charCodeAt(i) - 64);
  }

  // A = 1 → 0 始まりに補正
  return index - 1;
}
/**
 * テスト用に Trial シートのデータを保存・復元するクラス
 */
class TrialDatesBackupForTest_ {
  constructor() {
    this.sheetName = "Trial";
    this.rangeA1 = "D32:E40";
    this.propertyKey = "trial_dates_for_test";
    this.scriptProps = PropertiesService.getScriptProperties();
  }

  /**
   * Trial シートの D32:E40 を ScriptProperties に保存する
   */
  save() {
    const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      this.sheetName,
    );

    if (!trialSheet) {
      throw new Error(`${this.sheetName} シートが見つかりません`);
    }

    const values = trialSheet.getRange(this.rangeA1).getValues();
    this.scriptProps.setProperty(this.propertyKey, JSON.stringify(values));
  }

  /**
   * 保存しておいた値を Trial シートの D32:E40 に復元する
   */
  restore() {
    const saved = this.scriptProps.getProperty(this.propertyKey);

    if (!saved) {
      throw new Error(`保存された ${this.propertyKey} が存在しません`);
    }

    const saveValues = JSON.parse(saved);
    // 日付を "yyyy/mm/dd" 形式の文字列に変換
    const values = saveValues.map((row) =>
      row.map((cell) => {
        if (cell === "" || cell === null) return "";
        const date = new Date(cell);
        if (!isNaN(date.getTime())) {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          return `${yyyy}/${mm}/${dd}`;
        }
        return cell;
      }),
    );

    const trialSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      this.sheetName,
    );

    if (!trialSheet) {
      throw new Error(`${this.sheetName} シートが見つかりません`);
    }

    trialSheet.getRange(this.rangeA1).setValues(values);
  }

  /**
   * 保存データを削除する（必要に応じて）
   */
  clear() {
    this.scriptProps.deleteProperty(this.propertyKey);
  }
}
/**
 * 実際の値と期待値が一致するか検証し、結果をログ出力する
 * @param {any} actual - 実際の値
 * @param {any} expected - 期待値
 * @param {string} testName - テスト名
 * @return {boolean} 一致していればtrue
 */
function assertEquals_(actual, expected, testName) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);

  if (actualStr === expectedStr) {
    console.log(`[PASS] ${testName}`);
    return true;
  } else {
    console.error(`[FAIL] ${testName}`);
    console.error(`  Actual:   ${actualStr}`);
    console.error(`  Expected: ${expectedStr}`);
    return false;
  }
}
