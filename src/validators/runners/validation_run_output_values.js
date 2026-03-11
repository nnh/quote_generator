/**
 * 出力値のvalidationを実行し、Checkシートに結果を書き込むエントリーポイント
 *
 * validationInitContext_ で検証用コンテキストを生成し、
 * validationRunOutputValidationPipeline_ で各種検証処理を実行する。
 * 生成された結果を Check シートへ書き込む。
 */
function check_output_values() {
  const params = validationInitContext_();

  const { results, updatedRow } =
    validationRunOutputValidationPipeline_(params);

  validationWriteRowsToCheckSheet_(updatedRow, results);
}

/**
 * 出力値validationのパイプライン処理を実行する
 *
 * 以下の処理を順に実行する。
 * 1. 試験期間情報の取得
 * 2. Quote / Total / Total2 / Total3 シートの情報取得
 * 3. シート間整合性チェック
 * 4. Totalシートの検証項目生成
 * 5. 検証結果をCheckシート出力用データとして生成
 *
 * @param {Object} params validationInitContext_ が返す検証用コンテキスト
 * @param {number} params.facilities_value 施設数
 * @param {number} params.number_of_cases_value 症例数
 * @param {Object} params.targetTotal Totalシート件数検証対象
 * @param {Object} params.targetTotalAmount Totalシート金額検証対象
 * @param {Array<Array<string>>} params.trial_start_end Checkシートの初期行
 * @param {Object} params.quotationRequestValidationContext 見積依頼の検証コンテキスト
 *
 * @returns {Object}
 * @returns {Array<Array<any>>} returns.results Checkシートに書き込む検証結果行
 * @returns {number} returns.updatedRow 書き込み開始行
 */
function validationRunOutputValidationPipeline_(params) {
  const {
    facilities_value,
    number_of_cases_value,
    targetTotal,
    targetTotalAmount,
    trial_start_end,
    quotationRequestValidationContext,
  } = params;
  const rowOutput = trial_start_end.length;
  const colOutput = trial_start_end[0].length + 1;

  const trialContext = validationBuildTrialContext_(
    rowOutput,
    colOutput,
    quotationRequestValidationContext,
  );

  const quoteSheetInfo = validationGetQuoteSheetInfo_();
  const totals = validationCollectTotalSheetValues_();

  const results = [];

  const totalAmountRow = validationCompareTotalAmounts_(
    totals.totalTotalAmountValue,
    totals.total2TotalAmountValue,
    totals.total3TotalAmountValue,
  );
  results.push(totalAmountRow);

  const crossSheetMessages = validationRunCrossSheetValidations_(
    totals,
    quoteSheetInfo,
  );
  results.push(...crossSheetMessages);

  const { interimCount, closingCount } = validationGetTargetCounts_(
    targetTotal,
    totals.totalSheetValues,
  );

  const { sortedTotalCheckItems, totalAmountCheckItems } =
    validationBuildSortedCheckItems_({
      quotationRequestValidationContext,
      facilities_value,
      number_of_cases_value,
      trialContext,
      interimCount,
      closingCount,
    });

  const totalValidationRows = validationEvaluateValidationItems_(
    sortedTotalCheckItems,
    targetTotal,
  );

  const totalAmountValidationRows = validationEvaluateValidationItems_(
    totalAmountCheckItems,
    targetTotalAmount,
  );

  results.push(...totalValidationRows);
  results.push(...totalAmountValidationRows);

  const updatedRow = rowOutput + 1;

  return {
    results,
    updatedRow,
  };
}
