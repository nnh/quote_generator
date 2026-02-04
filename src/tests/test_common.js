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
/**
 * 【テスト用】
 * 試験種別の一覧を返す
 */
function getTrialTypeListForTest_() {
  return [
    "医師主導治験",
    "特定臨床研究",
    "観察研究・レジストリ",
    "介入研究（特定臨床研究以外）",
    "先進",
  ];
}
/**
 * Quotation Request の値に応じて ItemsMap/List が正しく生成されるかをテストする
 * （Setup / Closing 共通）
 *
 * @param {Array<Array>} targetQuotationRequestValueAndExpectedValues
 *        [[quotation_request_item_value, expectedValue], ...]
 * @param {string} quotation_request_itemName Quotation Request側の項目名
 * @param {string} fy_itemName Setup / Closing シート側の項目名
 * @param {string} colName Quotation Requestの列名
 * @param {Function} createItemsFunc Items生成関数（例: createSetupItemsList_ / createClosingItemsMap_）
 * @param {boolean|number|string} clinical_trials_office
 */
function test_createItemsByQuotationRequest_(
  targetQuotationRequestValueAndExpectedValues,
  quotation_request_itemName,
  fy_itemName,
  colName,
  createItemsFunc,
  clinical_trials_office = 0,
) {
  targetQuotationRequestValueAndExpectedValues.forEach(
    ([quotation_request_item_value, expectedValue]) => {
      const array_quotation_request =
        createTestQuotationRequestArrayWithColumn_(
          null,
          colName,
          quotation_request_itemName,
          quotation_request_item_value,
        );

      const actualItems = createItemsFunc(
        array_quotation_request,
        clinical_trials_office,
      );

      const actualValue =
        actualItems instanceof Map
          ? actualItems.get(fy_itemName)
          : actualItems.find(([name]) => name === fy_itemName)?.[1];

      if (actualValue !== expectedValue) {
        throw new Error(
          `${createItemsFunc.name} ${quotation_request_itemName}:${quotation_request_item_value} ` +
            `expected ${expectedValue}, but got ${actualValue}`,
        );
      }
    },
  );

  console.log(
    `[PASS] ${createItemsFunc.name} for ${quotation_request_itemName}`,
  );
}
/**
 * 固定値項目が正しく設定されているかを検証する共通テスト関数
 *
 * @param {string} testTargetName テスト対象名（ログ・エラー用）
 * @param {Array<[string, number|string]>} fixedValueTestArray
 *        [FY項目名, 期待値] の配列
 * @param {Function} createItemsListFunc
 *        createSetupItemsList_ / createClosingItemsList_ など
 * @param {number|boolean|string} clinical_trials_office
 */
function test_fixedValueItems_(
  testTargetName,
  fixedValueTestArray,
  createItemsListFunc,
  clinical_trials_office = 0,
) {
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "A",
    "タイムスタンプ",
    "2000/01/01",
  );

  const items = createItemsListFunc(
    array_quotation_request,
    clinical_trials_office,
  );

  fixedValueTestArray.forEach(([fy_itemName, expectedValue]) => {
    const actualValue = items.get(fy_itemName);
    if (actualValue !== expectedValue) {
      throw new Error(
        `${testTargetName} fixed value test ${fy_itemName} expected ${expectedValue}, but got ${actualValue}`,
      );
    }
  });

  console.log(`[PASS] ${testTargetName} fixed value test`);
}
/**
 * 試験種別ごとの設定取得関数をテストする共通関数
 *
 * @param {string} testName テスト名（ログ用）
 * @param {Function} getActualConfigFn 実処理の設定取得関数
 * @param {Function} getExpectedConfigFn 試験種別から期待値を返す関数
 */
function test_trialTypeConfigCommon_(
  testName,
  getActualConfigFn,
  getExpectedConfigFn,
  expectedOptions = {},
  actualOptions = {},
) {
  const sp = PropertiesService.getScriptProperties();
  const originalTrialType = sp.getProperty("trial_type_value");

  const trialTypes = getTrialTypeListForTest_();

  try {
    trialTypes.forEach((trialType) => {
      sp.setProperty("trial_type_value", trialType);

      const actual = getActualConfigFn(actualOptions);
      const expected = getExpectedConfigFn(trialType, expectedOptions);

      assertEquals_(actual, expected, `${testName} (${trialType})`);
    });
  } finally {
    // ScriptProperties を元に戻す
    if (originalTrialType === null) {
      sp.deleteProperty("trial_type_value");
    } else {
      sp.setProperty("trial_type_value", originalTrialType);
    }
  }
}
/**
 * 2つの配列の全組み合わせを生成する
 * @param {Array} array1
 * @param {Array} array2
 * @return {Array<Array>} 全組み合わせの配列
 */
function createAllCombinations_(array1, array2) {
  return array1.flatMap((v1) => array2.map((v2) => [v1, v2]));
}
/**
 * 事務局関連条件の全組み合わせ（テスト用）
 *
 * @returns {Array<Object>}
 */
function getClinicalTrialsOfficeTestArray_() {
  const fundSources = [
    "営利企業原資（製薬企業等）",
    "公的資金（税金由来）",
    "",
  ];

  const officeFlags = ["あり", "なし", ""];

  return createAllCombinations_(fundSources, officeFlags).map(
    ([fundSource, officeFlag]) => ({
      funding_source: fundSource,
      office_value: officeFlag,
    }),
  );
}

function test_get_clinical_trials_office_flg_(obj) {
  const trialType =
    PropertiesService.getScriptProperties().getProperty("trial_type_value");
  const office_value = obj.office_value;
  const cofficient_value = obj.funding_source;
  if (trialType === "医師主導治験") {
    return 1;
  } else if (office_value === "あり") {
    return 1;
  } else if (cofficient_value === "営利企業原資（製薬企業等）") {
    return 1;
  } else {
    return 0;
  }
}
