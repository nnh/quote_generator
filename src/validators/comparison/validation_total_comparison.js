/**
 * Quote / Total / Total2 / Total3 シートの
 * 「合計」と「特別値引後合計」が一致しているかを確認する。
 *
 * @returns {boolean[]}
 * [0] 合計が全シートで一致しているか
 * [1] 特別値引後合計が全シートで一致しているか
 */
function validationCheckQuoteSum_() {
  const sheetConfigs = [
    {
      sheet: _cachedSheets.quote,
      rowHeaderIndex: 2, // 3行目
      rowLabel: "小計",
      colHeaderIndex: 10, // 11行目
      colLabel: ITEM_LABELS.AMOUNT,
      discountOffset: 2,
    },
    {
      sheet: _cachedSheets.total,
      rowHeaderIndex: 1, // 2行目
      rowLabel: ITEM_LABELS.SUM,
      colHeaderIndex: 3, // 4行目
      colLabel: ITEM_LABELS.AMOUNT,
      discountOffset: 1,
    },
    {
      sheet: _cachedSheets.total2,
      rowHeaderIndex: 1,
      rowLabel: ITEM_LABELS.SUM,
      colHeaderIndex: 3,
      colLabel: ITEM_LABELS.SUM,
      discountOffset: 1,
    },
    {
      sheet: _cachedSheets.total3,
      rowHeaderIndex: 1,
      rowLabel: ITEM_LABELS.SUM,
      colHeaderIndex: 2, // 3行目
      colLabel: ITEM_LABELS.SUM,
      discountOffset: 1,
    },
  ];

  const amountValues = [];
  const discountValues = [];

  sheetConfigs.forEach((config) => {
    const targetValues = config.sheet.getDataRange().getValues();
    const rowIndex = validationFindRowIndex_(
      targetValues,
      config.rowHeaderIndex,
      config.rowLabel,
    );
    const colIndex = validationFindColIndex_(
      targetValues,
      config.colHeaderIndex,
      config.colLabel,
    );
    const amountCellValue = targetValues[rowIndex][colIndex];
    const discountCellValue =
      targetValues[rowIndex + config.discountOffset][colIndex];
    amountValues.push(validationGetNormalizedValue_(amountCellValue));
    discountValues.push(validationGetNormalizedValue_(discountCellValue));
  });

  return [
    validationAreAllValuesEqual_(amountValues),
    validationAreAllValuesEqual_(discountValues),
  ];
}

/**
 * 指定セルの値を取得し、空文字を0として丸めた数値を返す
 *
 * @param {string|number} value セルの値
 * @returns {number}
 */
function validationGetNormalizedValue_(value) {
  return value === "" ? 0 : Math.round(value);
}

/**
 * 年度シート（Setup〜Closing）の「合計」と「特別値引後合計」が
 * 正しく計算されているかを検証する。
 *
 * 検証内容:
 * - discountRate >= 0 または Trialフラグが空の場合
 *   → 合計 × (1 - 割引率) と特別値引後合計が一致するかを確認
 * - 上記以外の場合
 *   → 特別値引後合計が空であることを確認
 *
 * @param {string} sheetName 対象シート名
 * @param {number} discountRate 割引率
 * @returns {boolean} 検証OKの場合 true、それ以外は false
 */
function validationCheckAmountByYearSheet_(sheetName, discountRate) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  const { sumValue, discountValue } = validationGetYearSheetTotals_(sheet);

  const expectedDiscountTotal = Math.trunc(sumValue * (1 - discountRate));
  const actualDiscountTotal = Math.trunc(discountValue);

  const trialFlag = sheet.getRange("B2").getValue();

  const shouldValidateDiscount = discountRate >= 0 || trialFlag === "";

  if (shouldValidateDiscount) {
    return expectedDiscountTotal === actualDiscountTotal;
  }

  return discountValue === "";
}

/**
 * Totalシートの合計金額と縦計の値を比較する。
 *
 * TotalシートのAMOUNT列の縦計と、合計行の金額を比較する。
 *
 * @returns {[string, string]}
 *   [ステータス, メッセージ]
 */
function validationCompareTotalSheetTotalToVerticalTotal_() {
  const sheet = _cachedSheets.total;
  const targetValues = sheet.getDataRange().getValues();
  const targetRowIndex = 3;

  // 金額の列のインデックスを取得する
  const amountColumnIndex = validationFindColIndex_(
    targetValues,
    targetRowIndex,
    ITEM_LABELS.AMOUNT,
  );

  // 合計金額の列のインデックスを取得する
  const TOTAL_LABEL = "　合計金額";
  const totalColumnIndex = validationFindColIndex_(
    targetValues,
    targetRowIndex,
    TOTAL_LABEL,
  );

  const values = validationGetSheetValues_(sheet, sheet.getLastColumn());

  const totalRow = values.find((row) => row[1] === ITEM_LABELS.SUM);

  if (!totalRow) {
    return [
      buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH),
      "合計金額行が見つかりません",
    ];
  }

  const totalAmount = validationNormalizeValue_(totalRow[amountColumnIndex]);

  const verticalTotal = validationCalculateVerticalTotal_(
    values,
    totalColumnIndex,
    TOTAL_LABEL,
  );

  const isValid = totalAmount === verticalTotal;

  return [
    isValid
      ? VALIDATION_STATUS.OK
      : buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH),
    `Totalシートの縦計と合計金額のチェック, 縦計: ${verticalTotal}, 合計金額: ${totalAmount}`,
  ];
}

/**
 * Total2/Total3シートの縦計と横計を比較するクラス
 */
class CompareTotal2Total3Sheet {
  constructor() {
    /** 全体の割引率（TrialシートB47） */
    this.discountRate = _cachedSheets.trial.getRange("B47").getValue();

    /** チェック対象シート情報 */
    this.targetSheets = [
      { sheet: _cachedSheets.total2, termRowNumber: 4 },
      { sheet: _cachedSheets.total3, termRowNumber: 3 },
    ];

    /** シートデータを加工したオブジェクト */
    this.targets = this.targetSheets.map((info) => ({
      sheet: info.sheet,
      termRowNumber: info.termRowNumber,
      setupStartColIdx: 3,
      totalValues: info.sheet.getDataRange().getValues(),
    }));
  }

  /**
   * 指定セル範囲の縦計または横計を計算
   * @param {Object} targetData チェック対象シート情報
   * @param {number} rowIndex 対象行番号
   * @param {number} colIndex 対象列番号
   * @param {"horizontal"|"vertical"} direction 計算方向
   * @returns {number} 合計値
   */
  getSum(targetData, rowIndex, colIndex, direction = "horizontal") {
    if (direction === "horizontal") {
      return targetData.totalValues[rowIndex]
        .slice(targetData.setupStartColIdx, colIndex)
        .filter((v) => v > 0)
        .reduce((sum, v) => sum + v, 0);
    } else {
      return targetData.totalValues
        .filter((row, idx) => row[colIndex] > 0 && idx < rowIndex)
        .map((row) => row[colIndex])
        .reduce((sum, v) => sum + v, 0);
    }
  }

  /**
   * 行番号・列番号を取得
   * @param {Object} targetData チェック対象シート情報
   * @param {string} rowLabel 行ラベル
   * @param {string} colLabel 列ラベル
   * @returns {{rowIndex:number, colIndex:number}} 行インデックス・列インデックス
   */
  getRowCol(targetData, rowLabel, colLabel) {
    const targetValues = targetData.sheet.getDataRange().getValues();
    return {
      rowIndex: validationFindRowIndex_(targetValues, 1, rowLabel),
      colIndex: validationFindColIndex_(
        targetValues,
        targetData.termRowNumber - 1,
        colLabel,
      ),
    };
  }

  /**
   * 縦計と横計を誤差なしで比較
   * @param {string} rowLabel 行ラベル
   * @param {string} colLabel 列ラベル
   * @returns {Array} ["OK"/"NG", チェック説明]
   */
  compareTotalsExact(rowLabel = ITEM_LABELS.SUM, colLabel = ITEM_LABELS.SUM) {
    const results = this.targets.map((target) => {
      const { rowIndex, colIndex } = this.getRowCol(target, rowLabel, colLabel);
      const horizontalTotal = this.getSum(
        target,
        rowIndex,
        colIndex,
        "horizontal",
      );
      const verticalTotal = this.getSum(target, rowIndex, colIndex, "vertical");
      return horizontalTotal === verticalTotal;
    });

    return toStatusFromBooleanArray_(
      results,
      VALIDATION_MESSAGES.VALUE_MISMATCH,
      "Total2, Total3の縦計と横計のチェック",
    );
  }

  /**
   * 割引後の横計と縦計×(1-割引率)を比較（誤差±1円）
   * @returns {boolean[]} 比較結果（true: 許容範囲内）
   */
  compareTotalsWithDiscount() {
    return this.targets.map((target) => {
      const sumRowCol = this.getRowCol(
        target,
        ITEM_LABELS.SUM,
        ITEM_LABELS.SUM,
      );
      const discountRowCol = this.getRowCol(
        target,
        "特別値引後合計",
        ITEM_LABELS.SUM,
      );

      const verticalTotal =
        this.getSum(
          target,
          sumRowCol.rowIndex,
          sumRowCol.colIndex,
          "vertical",
        ) *
        (1 - this.discountRate);
      const horizontalTotal = this.getSum(
        target,
        discountRowCol.rowIndex,
        discountRowCol.colIndex,
        "horizontal",
      );

      return Math.abs(verticalTotal - horizontalTotal) <= 1;
    });
  }
}

/**
 * Total2, Total3の縦計と横計をチェック（誤差なし）
 * @returns {Array} ["OK"/"NG", チェック説明]
 */
function compareTotal2Total3SheetVerticalTotalToHorizontalTotal_() {
  const comparator = new CompareTotal2Total3Sheet();
  return comparator.compareTotalsExact();
}

/**
 * Total2, Total3の縦計×特別値引率と特別値引後横計をチェック（誤差±1円）
 * @returns {Array} ["OK"/"NG", チェック説明]
 */
function compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_() {
  const comparator = new CompareTotal2Total3Sheet();
  const discountResults = comparator.compareTotalsWithDiscount();
  return toStatusFromBooleanArray_(
    discountResults,
    VALIDATION_MESSAGES.TOTAL_MISMATCH,
    "Total2, Total3の縦計*特別値引率と特別値引後合計の横計のチェック",
  );
}
