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
      colLabel: VALIDATION_LABELS.AMOUNT,
      discountOffset: 2,
    },
    {
      sheet: _cachedSheets.total,
      rowHeaderIndex: 1, // 2行目
      rowLabel: VALIDATION_LABELS.SUM,
      colHeaderIndex: 3, // 4行目
      colLabel: VALIDATION_LABELS.AMOUNT,
      discountOffset: 1,
    },
    {
      sheet: _cachedSheets.total2,
      rowHeaderIndex: 1,
      rowLabel: VALIDATION_LABELS.SUM,
      colHeaderIndex: 3,
      colLabel: VALIDATION_LABELS.SUM,
      discountOffset: 1,
    },
    {
      sheet: _cachedSheets.total3,
      rowHeaderIndex: 1,
      rowLabel: VALIDATION_LABELS.SUM,
      colHeaderIndex: 2, // 3行目
      colLabel: VALIDATION_LABELS.SUM,
      discountOffset: 1,
    },
  ];

  const amountValues = [];
  const discountValues = [];

  sheetConfigs.forEach((config) => {
    const targetValues = validationGetSheetValues_(
      config.sheet,
      config.sheet.getLastColumn(),
    );
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
  const values = validationGetSheetValues_(sheet, sheet.getLastColumn());
  const targetRowIndex = 3;

  // 金額の列のインデックスを取得する
  const amountColumnIndex = validationFindColIndex_(
    values,
    targetRowIndex,
    VALIDATION_LABELS.AMOUNT,
  );

  // 合計金額の列のインデックスを取得する
  const TOTAL_LABEL = VALIDATION_LABELS.TOTAL_AMOUNT;
  const totalColumnIndex = validationFindColIndex_(
    values,
    targetRowIndex,
    TOTAL_LABEL,
  );

  const totalRow = values.find((row) => row[1] === VALIDATION_LABELS.SUM);

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
class Total2Total3Validator {
  constructor() {
    /** 全体の割引率（TrialシートB47） */
    this.discountRate = _cachedSheets.trial.getRange("B47").getValue();

    const SETUP_START_COL_INDEX = 3;

    this.targets = [
      { sheet: _cachedSheets.total2, termRowIndex: 3 },
      { sheet: _cachedSheets.total3, termRowIndex: 2 },
    ].map((info) => ({
      ...info,
      setupStartColIdx: SETUP_START_COL_INDEX,
      totalValues: validationGetSheetValues_(
        info.sheet,
        info.sheet.getLastColumn(),
      ),
    }));
  }

  /**
   * 指定セル範囲の縦計または横計を計算
   * @param {Object} targetData チェック対象シート情報
   * @param {number} rowIndex 対象行インデックス（0-based）
   * @param {number} colIndex 対象列インデックス（0-based）
   * @param {"horizontal"|"vertical"} direction 計算方向
   * @returns {number} 合計値
   */
  sumUntilCell(
    targetData,
    rowIndex,
    colIndex,
    direction = VALIDATION_SUM_DIRECTION.HORIZONTAL,
  ) {
    const values = targetData.totalValues;

    if (direction === VALIDATION_SUM_DIRECTION.HORIZONTAL) {
      return values[rowIndex]
        .slice(targetData.setupStartColIdx, colIndex)
        .filter((v) => v > 0)
        .reduce((sum, v) => sum + v, 0);
    }

    return values
      .slice(0, rowIndex)
      .map((row) => row[colIndex])
      .filter((v) => v > 0)
      .reduce((sum, v) => sum + v, 0);
  }

  /**
   * 行番号・列番号を取得
   * @param {Object} targetData チェック対象シート情報
   * @param {string} rowLabel 行ラベル
   * @param {string} colLabel 列ラベル
   * @returns {{rowIndex:number, colIndex:number}} 行インデックス・列インデックス
   */
  findRowColIndex(targetData, rowLabel, colLabel) {
    const targetValues = targetData.totalValues;
    return {
      rowIndex: validationFindRowIndex_(targetValues, 1, rowLabel),
      colIndex: validationFindColIndex_(
        targetValues,
        targetData.termRowIndex,
        colLabel,
      ),
    };
  }

  compareSheetTotalsExact(target, rowLabel, colLabel) {
    const { rowIndex, colIndex } = this.findRowColIndex(
      target,
      rowLabel,
      colLabel,
    );

    const horizontalTotal = this.sumUntilCell(
      target,
      rowIndex,
      colIndex,
      VALIDATION_SUM_DIRECTION.HORIZONTAL,
    );

    const verticalTotal = this.sumUntilCell(
      target,
      rowIndex,
      colIndex,
      VALIDATION_SUM_DIRECTION.VERTICAL,
    );

    return horizontalTotal === verticalTotal;
  }
  validateTotalsExact(rowLabel = ITEM_LABELS.SUM, colLabel = ITEM_LABELS.SUM) {
    const results = this.targets.map((target) =>
      this.compareSheetTotalsExact(target, rowLabel, colLabel),
    );

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
  validateTotalsWithDiscount() {
    return this.targets.map((target) => {
      const sumRowCol = this.findRowColIndex(
        target,
        VALIDATION_LABELS.SUM,
        VALIDATION_LABELS.SUM,
      );
      const discountRowCol = this.findRowColIndex(
        target,
        VALIDATION_LABELS.DISCOUNT_TOTAL,
        VALIDATION_LABELS.SUM,
      );

      const verticalTotal =
        this.sumUntilCell(
          target,
          sumRowCol.rowIndex,
          sumRowCol.colIndex,
          VALIDATION_SUM_DIRECTION.VERTICAL,
        ) *
        (1 - this.discountRate);
      const horizontalTotal = this.sumUntilCell(
        target,
        discountRowCol.rowIndex,
        discountRowCol.colIndex,
        VALIDATION_SUM_DIRECTION.HORIZONTAL,
      );

      return Math.abs(verticalTotal - horizontalTotal) <= 1;
    });
  }
}

/**
 * Total2, Total3の縦計と横計をチェック（誤差なし）
 * @returns {Array} ["OK"/"NG", チェック説明]
 */
function total2Total3ValidatorVerticalTotalToHorizontalTotal_() {
  const comparator = new Total2Total3Validator();
  return comparator.validateTotalsExact();
}

/**
 * Total2, Total3の縦計×特別値引率と特別値引後横計をチェック（誤差±1円）
 * @returns {Array} ["OK"/"NG", チェック説明]
 */
function total2Total3ValidatorVerticalTotalToHorizontalDiscountTotal_() {
  const comparator = new Total2Total3Validator();
  const discountResults = comparator.validateTotalsWithDiscount();
  return toStatusFromBooleanArray_(
    discountResults,
    VALIDATION_MESSAGES.TOTAL_MISMATCH,
    "Total2, Total3の縦計*特別値引率と特別値引後合計の横計のチェック",
  );
}
