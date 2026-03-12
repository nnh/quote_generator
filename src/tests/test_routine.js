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

class QuoteRoutineTestRunner {
  constructor() {
    initial_process();
    this.checkSheet = _cachedSheets.check;
    this.setupSheet = _cachedSheets.setup;
    this.trialSheet = _cachedSheets.trial;
    this.quotationRequestSheet =
      _cachedSheets[normalizeSheetName_(QUOTATION_REQUEST_SHEET.NAME)];
    this.setVal = new SetTestValues();
    const targetSheetsName = this.setVal.getTrialYearsItemsName();
    this.targetSheets = targetSheetsName.map(
      (name) => _cachedSheets[normalizeSheetName_(name)],
    );
  }
  /**
   * ルーチンテスト用に見積作成処理を実行する。
   *
   * 以下の処理を順に実行する。
   * 1. ルーチンテスト用の初期化処理を行う（必要なシート値をクリア）。
   * 2. 見積作成メイン処理（quote_script_main）を実行する。
   * 3. Quotation Request シートの試験名（Acronym）をログ出力する。
   * 4. 中間解析の実施有無を確認し、実施する場合は Setup シートに
   *    テスト用の中間解析回数を設定する。
   * 5. Total2 / Total3 シートの列構成を必要に応じて更新する。
   *
   * @return {void}
   */
  setQuote() {
    this.routineTestInit();
    quote_script_main();
    const trialName = get_quotation_request_value_(ITEM_LABELS.ACRONYM);
    console.log(`Trial Name: ${trialName}`);
    const interimCount =
      get_quotation_request_value_(
        QUOTATION_REQUEST_SHEET.ITEMNAMES.INTERIM_ANALYSIS_REQUEST,
      ) === COMMON_EXISTENCE_LABELS.YES
        ? 1
        : "";
    this.setTestInterimValues(this.setupSheet, interimCount);
    total2_3_add_del_cols();
  }
  /**
   * ルーチンテストを1ケース実行する。
   *
   * 指定された Quotation Request の行データをテスト用にシートへ設定し、
   * 見積作成処理および出力値チェックを実行した後、Check シートの検証結果を取得する。
   *
   * 処理の流れ:
   * 1. Quotation Request シートへテストデータを設定する。
   * 2. 見積作成処理（setQuote）を実行する。
   * 3. 出力値チェック処理（check_output_values）を実行する。
   * 4. Check シートの検証結果を取得し、判定結果を返す。
   *
   * @param {Array|null} targetRow テスト用に設定する Quotation Request の行データ（ヘッダー + 対象行）
   * @param {number[]} [falseRowNumbers=[]] 判定対象から除外する Check シートの行番号（1始まり）
   * @return {boolean|boolean[]} すべて OK の場合 true、それ以外の場合は各行の判定結果配列
   */
  execRoutineTest(targetRow = null, falseRowNumbers = []) {
    if (!targetRow) {
      return false;
    }
    setQuotationRequestValuesForTest(targetRow);
    this.setQuote();
    check_output_values();
    return this.getCheckResult_(falseRowNumbers);
  }
  /**
   * ルーチンテストの1ケースを実行し、結果をログ出力する。
   *
   * 指定されたテスト番号（idx）に対応する期待設定（ROUTINE_TEST_EXPECTED）を取得し、
   * 以下の処理を実行する。
   *
   * 処理の流れ:
   * 1. テスト番号に対応する期待設定（除外行・メッセージ等）を取得する。
   * 2. execRoutineTest を呼び出し、テスト処理を実行する。
   * 3. テスト結果に応じて OK / NG のメッセージをログ出力する。
   * 4. テスト結果を呼び出し元へ返す。
   *
   * @param {number} idx 実行するテストケースの番号
   * @param {Array|null} targetRow テスト用に設定する Quotation Request の行データ（ヘッダー + 対象行）
   * @return {boolean|boolean[]} すべて OK の場合 true、それ以外の場合は各行の判定結果配列
   */
  execTestMain(idx, targetRow = null) {
    if (!targetRow) {
      return false;
    }

    const {
      falseRowNumbers,
      messageOk = "*** test ok. ***",
      messageNg,
    } = ROUTINE_TEST_EXPECTED[idx] ?? {};

    const testResults = this.execRoutineTest(targetRow, falseRowNumbers);

    const messageNG = messageNg ?? `!!! execTestMain ng. ${testResults} !!!`;

    console.log(testResults ? messageOk : messageNG);
    return testResults;
  }
  /**
   * ルーチンテスト実行前の初期化処理を行う。
   *
   * テスト実行時に影響を与える可能性のあるシートの値をクリアし、
   * ルーチンテストを実行できる状態にリセットする。
   *
   * 処理の流れ:
   * 1. フィルターの表示状態をリセットする。
   * 2. Trial シートの試験期間を初期化する。
   * 3. Trial シートの特別値引後金額をクリアする。
   * 4. Setup ～ Closing シートの F 列（指定行範囲）のテスト用値をクリアする。
   *
   * ※ 本メソッドはシート全体を初期状態に戻すものではなく、
   *    ルーチンテストに必要な範囲のみ初期化する。
   *
   * @return {void}
   */
  routineTestInit() {
    resetFilterVisibility();
    // Trialシートの試験期間を初期化
    const trialDatesEdit = new TrialDatesEditForTest_();
    trialDatesEdit.clearSheet();
    // Trialシートの特別値引後金額を初期化
    this.trialSheet
      .getRange(this.setVal.constDiscountAllPeriodRangeAddr)
      .clearContent();
    // Setup ~ ClosingシートのF列を初期化
    const startRow = 5;
    const endRow = this.targetSheets[0].getLastRow();
    this.targetSheets.forEach((sheet) => {
      this.setVal.delTestValue(sheet.getRange(`F${startRow}:F${endRow}`));
    });
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

    if (!Number.isFinite(Number(tableCount))) {
      return;
    }

    targetSheet.getRangeList(["F46", "F54", "F56"]).setValue(interimValue);
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

    // 行番号をインデックスに変換してSetに格納（1始まり → 0始まり）
    const exclusionSet = new Set(falseRowNumbers.map((n) => n - 1));
    const checkValues = rows
      .filter(
        (row, idx) =>
          idx > 0 &&
          row[0] !== "" &&
          idx !== exclusion1RowIndex &&
          !exclusionSet.has(idx),
      )
      .map((row) => row[0] === VALIDATION_STATUS.OK);
    const allOk = checkValues.every((x) => x);
    return allOk ? true : checkValues;
  }
}

/**
 * Quotation Request のテストデータを用いてルーチンテストを実行する。
 *
 * Quotation Request シートから取得した各行のデータを順にテストケースとして実行し、
 * 見積作成処理および検証処理の結果を確認する。
 *
 * 処理の流れ:
 * 1. Quotation Request シートのテストデータを取得する。
 * 2. 各行をテストケースとして execTestMain を実行する。
 * 3. 特定のテストケース（idx=9,10）はエラーデータのためスキップする。
 * 4. すべてのテスト結果を集計し、最終結果をログ出力する。
 *
 * ログ出力:
 * - 各テスト開始時に `Running test {idx}` を出力
 * - すべて成功した場合は "*** All tests OK. ***"
 * - 失敗がある場合は NG のテスト結果を出力
 *
 * @return {void}
 */
function routineTest() {
  const routineTest = new QuoteRoutineTestRunner();
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

    console.log(`Running test ${idx}`);

    const targetRow = [header, row];
    return routineTest.execTestMain(idx, targetRow);
  });

  const allOk = testResults.every((x) => x === true);

  console.log(
    allOk ? "*** All tests OK. ***" : `NG tests: ${testResults.join(", ")}`,
  );
}

/**
 * ルーチンテスト実行前のシート初期化処理を単独で実行する。
 *
 * QuoteRoutineTestRunner を生成し、routineTestInit を呼び出して
 * ルーチンテストで使用するシートの値を初期化する。
 *
 * 主に以下の用途で使用する。
 * - テスト実行前にシート状態をリセットしたい場合
 * - ルーチンテスト実行後にテスト用の値をクリアしたい場合
 *
 * @return {void}
 */
function clearSheetsForTest() {
  const routineTest = new QuoteRoutineTestRunner();
  routineTest.routineTestInit();
}
