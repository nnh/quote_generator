/**
 * routine test
 */

const ROUTINE_TEST_EXPECTED = {
  11: {
    messageOk: "*** testResults match expected for idx 11. ***",
    messageNg: "!!! testResults do not match expected for idx 11. !!!",
    values: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },

  12: {
    messageOk: "*** testResults match expected for idx 12. ***",
    messageNg: "!!! testResults do not match expected for idx 12. !!!",
    values: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },

  13: {
    messageOk: "***  研究協力費金額の比較をスキップ idx 13. ***",
    messageNg: "!!! testResults do not match expected for idx 13. !!!",
    values: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },

  18: {
    messageOk: "***  研究協力費金額の比較をスキップ idx 18. ***",
    messageNg: "!!! testResults do not match expected for idx 18. !!!",
    values: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },

  24: {
    messageOk: "***  研究協力費金額の比較をスキップ idx 24. ***",
    messageNg: "!!! testResults do not match expected for idx 24. !!!",
    values: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },

  29: {
    messageOk:
      "***  研究協力費金額の比較をスキップ, 治験薬運搬は別途issueにあげる idx 29. ***",
    messageNg: "!!! testResults do not match expected for idx 29. !!!",
    values: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
    ],
  },

  20: {
    messageOk: "*** testResults match expected for idx 20. ***",
    messageNg: "!!! testResults do not match expected for idx 20. !!!",
    values: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
  },

  26: {
    messageOk: "*** testResults match expected for idx 26. ***",
    messageNg: "!!! testResults do not match expected for idx 26. !!!",
    values: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
    ],
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
    this.routineTestInit();
    quote_script_main();
    const trialName = get_quotation_request_value_("試験実施番号");
    console.log(`Trial Name: ${trialName}`);
    const interimCount =
      get_quotation_request_value_("中間解析業務の依頼") ==
      COMMON_EXISTENCE_LABELS.YES
        ? 1
        : "";
    this.setTestInterimValues(this.setupSheet, interimCount);
    total2_3_add_del_cols();
  }
  execRoutineTest(targetRow = null) {
    if (!targetRow) {
      return;
    }
    setQuotationRequestValuesForTest(targetRow);
    this.setQuote();
    check_output_values();
    return this.getCheckResult_();
  }
  execTestMain(idx, targetRow = null) {
    if (!targetRow) {
      return;
    }
    const testResults = this.execRoutineTest(targetRow);
    const expected = ROUTINE_TEST_EXPECTED[idx];

    if (expected) {
      const isMatch = routineTestArrayEqual_(testResults, expected.values);
      console.log(isMatch ? expected.messageOk : expected.messageNg);
      return isMatch;
    }

    console.log(
      testResults ? "*** test ok. ***" : `!!! execTestMain ng. ${results} !!!`,
    );
    return testResults;
  }
  routineTestDiscountInit() {
    const setVal = new SetTestValues();
    const targetSheetsName = setVal.getTrialYearsItemsName();
    targetSheetsName.forEach((_, idx) => {
      setVal.delDiscountByYear(idx);
    });
    const res = { targetSheetsName: targetSheetsName, setVal: setVal };
    return res;
  }
  routineTestInit() {
    resetFilterVisibility();
    const temp_init = this.routineTestDiscountInit();
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
  setTestInterimValues(targetSheet, interimValue) {
    const tableCount =
      interimValue != ""
        ? get_quotation_request_value_("中間解析に必要な図表数")
        : interimValue;
    // tableCountが "空文字" または "数値ではない" 場合は終了
    if (tableCount === "" || Number.isNaN(Number(tableCount))) {
      return;
    }
    targetSheet.getRange("F46").setValue(interimValue);
    targetSheet.getRange("F54").setValue(interimValue);
    targetSheet.getRange("F55").setValue(tableCount);
    targetSheet.getRange("F56").setValue(interimValue);
  }
  /**
   * Checkシートの検証結果を確認し、全てのステータスが OK か判定する。
   *
   * A列: 検証ステータス（OK / NG）
   * B列: チェック内容
   *
   * B列が特定の文言で始まる行（中間解析プログラム作成のチェック）は
   * テスト対象外のため判定から除外する。
   *
   * 判定対象行で、空でないステータスが VALIDATION_STATUS.OK 以外の場合は
   * false を返す。すべて OK の場合は true を返す。
   *
   * @return {boolean|string[]} すべての検証ステータスが OK の場合 true、それ以外は NG のステータスの配列
   */
  getCheckResult_() {
    const rows = this.checkSheet
      .getRange(1, 1, this.checkSheet.getLastRow(), 2)
      .getValues();

    const exclusionText =
      "シート名:Total,項目名:中間解析プログラム作成、解析実施（シングル）,想定値:回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認";

    const exclusionIdx = rows.findIndex((row) =>
      row[1]?.startsWith(exclusionText),
    );

    const checkValues = rows
      .filter((row, idx) => idx > 0 && row[0] !== "" && idx !== exclusionIdx)
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
  const discountValue = "";
  routineTest.trialSheet.getRange("B46").setValue(discountValue);

  const header = targetValues[0];

  const testResults = targetValues.map((row, idx) => {
    if (idx === 0) {
      return VALIDATION_STATUS.OK;
    }

    if (idx === 9 || idx === 10) {
      // test9は終了日がエラー、test10はcrf項目数がエラーのデータ、テスト対象から除外
      return VALIDATION_STATUS.OK;
    }

    console.log(`test${idx}`);

    const targetRow = [header, row];
    return routineTest.execTestMain(idx, targetRow);
  });

  const allOk = testResults.every((x) => x === VALIDATION_STATUS.OK);

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

/**
 * 2つの配列が同じ内容かを比較する
 *
 * @param {Array<any>} a
 * @param {Array<any>} b
 * @returns {boolean}
 */
function routineTestArrayEqual_(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
