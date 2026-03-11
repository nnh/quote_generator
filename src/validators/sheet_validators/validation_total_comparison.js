/**
 * Quote / Total / Total2 / Total3 シートの
 * 「合計」と「特別値引後合計」が一致しているかを確認する。
 *
 * @returns {boolean[]}
 * [0] 合計が全シートで一致しているか
 * [1] 特別値引後合計が全シートで一致しているか
 */
function validationCheckQuoteSum_(
  quoteTotalAmountValue,
  totalTotalAmountValue,
  total2TotalAmountValue,
  total3TotalAmountValue,
  quoteDiscountTotalValue,
  totalDiscountTotalValue,
  total2DiscountTotalValue,
  total3DiscountTotalValue,
) {
  const amountCheckFlag =
    quoteTotalAmountValue === totalTotalAmountValue &&
    quoteTotalAmountValue === total2TotalAmountValue &&
    quoteTotalAmountValue === total3TotalAmountValue;

  const discountTotalCheckFlag =
    quoteDiscountTotalValue === totalDiscountTotalValue &&
    quoteDiscountTotalValue === total2DiscountTotalValue &&
    quoteDiscountTotalValue === total3DiscountTotalValue;

  return [amountCheckFlag, discountTotalCheckFlag];
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
function validationCompareTotalSheetTotalToVerticalTotal_(
  totalSheetValues,
  totalSheetInfo,
  totalTotalAmountValue,
) {
  const TOTAL_LABEL = VALIDATION_LABELS.TOTAL_AMOUNT;
  const verticalTotal = validationCalculateVerticalTotal_(
    totalSheetValues,
    totalSheetInfo.totalAmountColIndex,
    TOTAL_LABEL,
  );

  const isValid = totalTotalAmountValue === verticalTotal;
  return [
    isValid
      ? VALIDATION_STATUS.OK
      : validationBuildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH),
    `Totalシートの縦計と合計金額のチェック, 縦計: ${verticalTotal}, 合計金額: ${totalTotalAmountValue}`,
  ];
}

/**
 * Total2 / Total3 シートの縦計と横計の整合性を検証するクラス
 *
 * 以下のチェックを行う。
 * - 縦計と横計が完全一致しているか
 * - 割引適用後の金額が縦計 × (1 - 割引率) と一致しているか（±1円許容）
 *
 * @class
 */
class ValidationTotal2Total3Validator {
  constructor(
    total2SheetInfo,
    total3SheetInfo,
    total2SheetValues,
    total3SheetValues,
  ) {
    /** 全体の割引率（TrialシートB47） */
    this.discountRate = _cachedSheets.trial.getRange("B47").getValue();

    const SETUP_START_COL_INDEX = 3;

    /** @type {Array<Object>} 検証対象シート情報 */
    this.targets = [
      {
        sheet: total2SheetInfo.sheet,
        termRowIndex: 3,
        setupStartColIdx: SETUP_START_COL_INDEX,
        totalValues: total2SheetValues,
      },
      {
        sheet: total3SheetInfo.sheet,
        termRowIndex: 2,
        setupStartColIdx: SETUP_START_COL_INDEX,
        totalValues: total3SheetValues,
      },
    ];
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
  /**
   * 縦計と横計が完全一致するかを検証する
   *
   * @param {Object} target 対象シート
   * @param {string} rowLabel
   * @param {string} colLabel
   * @returns {boolean}
   */
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
  /**
   * Total2 / Total3 の縦計と横計を検証する
   *
   * @param {string} [rowLabel]
   * @param {string} [colLabel]
   * @returns {boolean[]}
   */
  validateTotalsExact(
    rowLabel = VALIDATION_LABELS.SUM,
    colLabel = VALIDATION_LABELS.SUM,
  ) {
    const results = this.targets.map((target) =>
      this.compareSheetTotalsExact(target, rowLabel, colLabel),
    );
    return results;
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
function validationTotal2Total3ValidatorVerticalTotalToHorizontalTotal_(
  comparator,
) {
  const validateTotals = () => comparator.validateTotalsExact();
  return validationBuildMessage_(
    validateTotals,
    "Total2, Total3の縦計と横計のチェック",
  );
}

/**
 * Total2, Total3の縦計×特別値引率と特別値引後横計をチェック（誤差±1円）
 * @returns {Array} ["OK"/"NG", チェック説明]
 */
function validationTotal2Total3ValidatorVerticalTotalToHorizontalDiscountTotal_(
  comparator,
) {
  const discountResults = () => comparator.validateTotalsWithDiscount();
  return validationBuildMessage_(
    discountResults,
    "Total2, Total3の縦計*特別値引率と特別値引後合計の横計のチェック",
  );
}
