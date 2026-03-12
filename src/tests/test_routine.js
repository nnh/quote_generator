/**
 * routine test
 */

const ROUTINE_TEST_EXPECTED = {
  11: {
    messageOk: "*** testResults match expected for idx 11. ***",
    messageNg: "!!! testResults do not match expected for idx 11. !!!",
    falseRowNumbers: [27], // モニタリング関連
  },

  12: {
    messageOk: "*** testResults match expected for idx 12. ***",
    messageNg: "!!! testResults do not match expected for idx 12. !!!",
    falseRowNumbers: [27], // モニタリング関連
  },

  13: {
    messageOk: "***  研究協力費金額の比較をスキップ idx 13. ***",
    messageNg: "!!! testResults do not match expected for idx 13. !!!",
    falseRowNumbers: [70], // 研究協力費金額
  },

  18: {
    messageOk: "***  研究協力費金額の比較をスキップ idx 18. ***",
    messageNg: "!!! testResults do not match expected for idx 18. !!!",
    falseRowNumbers: [70], // 研究協力費金額
  },

  24: {
    messageOk: "***  研究協力費金額の比較をスキップ idx 24. ***",
    messageNg: "!!! testResults do not match expected for idx 24. !!!",
    falseRowNumbers: [70], // 研究協力費金額
  },

  29: {
    messageOk:
      "***  研究協力費金額の比較をスキップ, 治験薬運搬は別途issueにあげる idx 29. ***",
    messageNg: "!!! testResults do not match expected for idx 29. !!!",
    falseRowNumbers: [65, 70], // 治験薬運搬, 研究協力費金額
  },

  20: {
    messageOk: "*** testResults match expected for idx 20. ***",
    messageNg: "!!! testResults do not match expected for idx 20. !!!",
    falseRowNumbers: [27], // モニタリング関連
  },

  26: {
    messageOk: "*** testResults match expected for idx 26. ***",
    messageNg: "!!! testResults do not match expected for idx 26. !!!",
    falseRowNumbers: [27], // モニタリング関連
  },
};

class RoutineTest {
  constructor() {
    initial_process();
    this.checkSheet = _cachedSheets.check;
    this.setupSheet = _cachedSheets.setup;
    this.trialSheet = _cachedSheets.trial;
    this.quotationRequestSheet =
      _cachedSheets[normalizeSheetName_(QUOTATION_REQUEST_SHEET.NAME)];
  }
  setQuote() {
    this.routineTestInit("");
    quote_script_main();
    const trialName = get_quotation_request_value_(ITEM_LABELS.ACRONYM);
    console.log(`Trial Name: ${trialName}`);
    const interimCount =
      get_quotation_request_value_(
        QUOTATION_REQUEST_SHEET.ITEMNAMES.INTERIM_ANALYSIS_REQUEST,
      ) == COMMON_EXISTENCE_LABELS.YES
        ? 1
        : "";
    this.setTestInterimValues(this.setupSheet, interimCount);
    total2_3_add_del_cols();
  }
  execRoutineTest(targetRow = null, falseRowNumbers = []) {
    if (!targetRow) {
      return;
    }
    setQuotationRequestValuesForTest(targetRow);
    this.setQuote();
    check_output_values();
    return this.getCheckResult_(falseRowNumbers);
  }
  execTestMain(idx, targetRow = null) {
    if (!targetRow) {
      return;
    }

    const {
      falseRowNumbers,
      messageOk = "*** test ok. ***",
      messageNg,
    } = ROUTINE_TEST_EXPECTED[idx] ?? {};

    const testResults = this.execRoutineTest(targetRow, falseRowNumbers);

    const messageOK = messageOk;
    const messageNG = messageNg ?? `!!! execTestMain ng. ${testResults} !!!`;

    console.log(testResults ? messageOK : messageNG);
    return testResults;
  }
  routineTestDiscountInit(discountValue) {
    const setVal = new SetTestValues();
    this.trialSheet
      .getRange(setVal.constDiscountAllPeriodRangeAddr)
      .setValue(discountValue);

    const targetSheetsName = setVal.getTrialYearsItemsName();
    targetSheetsName.forEach((_, idx) => {
      setVal.delDiscountByYear(idx);
    });
    const res = { targetSheetsName: targetSheetsName, setVal: setVal };
    return res;
  }
  routineTestInit(discountValue) {
    resetFilterVisibility();
    const temp_init = this.routineTestDiscountInit(discountValue);
    const targetSheetsName = temp_init.targetSheetsName;
    const setVal = temp_init.setVal;
    // Initial processing
    targetSheetsName.forEach((x, idx) => {
      setVal.delTrialYears(idx);
      setVal.delTestValue(
        SpreadsheetApp.getActiveSpreadsheet()
          .getSheetByName(x)
          .getRange("F5:F89"),
      );
    });
    const res = { targetSheetsName: targetSheetsName, setVal: setVal };
    return res;
  }
  /**
   * テスト用に中間解析の値をシートへ設定する。
   *
   * interimValue が指定されている場合、「中間解析に必要な図表数」を
   * Quotation Request シートから取得し、対象シートの以下のセルに値を設定する。
   *
   * F46 : 中間解析回数
   * F54 : 中間解析回数
   * F55 : 中間解析に必要な図表数
   * F56 : 中間解析回数
   *
   * 図表数が空文字、または数値に変換できない場合は何もせず終了する。
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} targetSheet 値を書き込む対象シート
   * @param {string|number} interimValue テスト用の中間解析回数
   * @return {void}
   */
  setTestInterimValues(targetSheet, interimValue) {
    const tableCount =
      interimValue !== ""
        ? get_quotation_request_value_(
            QUOTATION_REQUEST_SHEET.ITEMNAMES
              .INTERIM_ANALYSIS_REQUIRED_TABLE_FIGURE_COUNT,
          )
        : "";

    const tableCountNum = Number(tableCount);

    if (tableCount === "" || Number.isNaN(tableCountNum)) {
      return;
    }

    const ranges = ["F46", "F54", "F56"];
    ranges.forEach((r) => targetSheet.getRange(r).setValue(interimValue));

    targetSheet.getRange("F55").setValue(tableCount);
  }
  /**
   * Checkシートの検証結果を確認し、全てのステータスが OK か判定する。
   *
   * A列: 検証ステータス（OK / NG）
   * B列: チェック内容
   *
   * 以下の行は判定対象から除外する。
   * - B列が特定の文言で始まる行（中間解析プログラム作成のチェック）
   * - falseRowNumbers で指定された行
   *
   * 判定対象行について、A列が空でなく VALIDATION_STATUS.OK 以外の値が
   * 含まれている場合は NG とする。
   *
   * @param {number[]} [falseRowNumbers=[]] 判定対象から除外する行番号（1始まり）
   * @return {boolean|boolean[]} すべて OK の場合 true、それ以外の場合は各行の判定結果配列
   */
  getCheckResult_(falseRowNumbers = []) {
    const rows = this.checkSheet
      .getRange(1, 1, this.checkSheet.getLastRow(), 2)
      .getValues();

    const exclusion1Text = `シート名:${QUOTATION_SHEET_NAMES.TOTAL},項目名:${ITEMS_SHEET.ITEMNAMES.INTERIM_ANALYSIS_PROGRAM_SINGLE},想定値:回数が${QUOTATION_SHEET_NAMES.QUOTATION_REQUEST}シートの${QUOTATION_REQUEST_SHEET.ITEMNAMES.INTERIM_ANALYSIS_REQUIRED_TABLE_FIGURE_COUNT}*${QUOTATION_SHEET_NAMES.QUOTATION_REQUEST}シートの${QUOTATION_REQUEST_SHEET.ITEMNAMES.INTERIM_ANALYSIS_FREQUENCY}であることを確認`;

    const exclusion1RowIndex = rows.findIndex((row) =>
      row[1]?.startsWith(exclusion1Text),
    );

    const exclusion2RowIndex = falseRowNumbers.map((num) => num - 1); // 行番号をインデックスに変換

    const checkValues = rows
      .filter(
        (row, idx) =>
          idx > 0 &&
          row[0] !== "" &&
          idx !== exclusion1RowIndex &&
          !exclusion2RowIndex.includes(idx),
      )
      .map((row) => row[0] === VALIDATION_STATUS.OK);
    const allOk = checkValues.every((x) => x);
    return allOk ? true : checkValues;
  }
}
/**
 * If all test results are True, output OK. Otherwise, it will output the test results.
 * @param none.
 * @return none.
 */
function routineTest() {
  const routineTest = new RoutineTest();
  const targetValues = getQuotationRequestValues_();
  const header = targetValues[0];

  const testResults = targetValues.map((row, idx) => {
    if (idx === 0) {
      return true;
    }

    if (idx === 9 || idx === 10) {
      // test9は終了日がエラー、test10はcrf項目数がエラーのデータ、テスト対象から除外
      return true;
    }

    console.log(`test${idx}`);

    const targetRow = [header, row];
    return routineTest.execTestMain(idx, targetRow);
  });

  const allOk = testResults.every((x) => x === true);

  console.log(
    allOk ? "*** All tests OK. ***" : `NG tests: ${testResults.join(", ")}`,
  );
}

function clearSheetsForTest() {
  const targetSheetsName = getTargetSheetNameForTest_();
  targetSheetsName.forEach((x) => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(x);
    sheet.getRange("F6:F94").clearContent();
  });
}
