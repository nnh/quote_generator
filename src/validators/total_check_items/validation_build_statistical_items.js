/**
 * 統計解析ドキュメントセット数をカウントする。
 *
 * 以下の条件で加算する：
 * ・中間解析業務の依頼 が あり の場合 +1
 * ・最終解析業務の依頼 が あり の場合 +1
 *
 * 戻り値は 0 / 1 / 2 のいずれかとなる。
 *
 * @param {string} interimRequest 中間解析業務の依頼の値
 * @param {string} finalRequest 最終解析業務の依頼の値
 * @return {number} 必要な統計解析ドキュメントセット数
 */
function countStatisticalDocumentSets_(interimRequest, finalRequest) {
  return (
    Number(interimRequest === COMMON_EXISTENCE_LABELS.YES) +
    Number(finalRequest === COMMON_EXISTENCE_LABELS.YES)
  );
}
/**
 * 統計関連作業項目一覧を構築する。
 *
 * 試験種別および各種解析実施有無に応じて、
 * 見積用の統計作業項目リストを生成する。
 *
 * 生成される項目は以下を含む：
 * ・統計解析計画書関連一式
 * ・中間解析プログラム
 * ・中間解析報告書
 * ・最終解析プログラム
 * ・最終解析報告書
 * ・CSR作成支援 または 研究結果報告書作成
 *
 * 医師主導治験かどうかにより、
 * プログラム作成種別（ダブル／シングル）および
 * 最終報告関連項目の内容が変わる。
 *
 * @param {Object} params パラメータオブジェクト
 *
 * @return {Array<Object>} 統計関連作業項目の配列
 * @return {string} return[].itemname 作業項目名
 * @return {number} return[].value 作業量（数量）
 */

function buildStatisticalItems_(params) {
  const trialType = params.quotationRequestValidationContext.trialType;
  const interimAnalysisRequest =
    params.quotationRequestValidationContext.interimAnalysisRequest;
  const finalAnalysisRequest =
    params.quotationRequestValidationContext.finalAnalysisRequest;
  const finalAnalysisTableCount =
    params.quotationRequestValidationContext.finalAnalysisTableCount;
  const studyReportSupport =
    params.quotationRequestValidationContext.studyReportSupport;

  const isInvestigatorInitiated =
    trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED;

  const adjustedFinalAnalysisTableCount = isInvestigatorInitiated
    ? finalAnalysisTableCount >= 1 && finalAnalysisTableCount <= 49
      ? 50
      : finalAnalysisTableCount
    : finalAnalysisTableCount;

  const items = [];

  // 統計解析計画書関連
  items.push({
    itemname:
      "統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成",
    value: countStatisticalDocumentSets_(
      interimAnalysisRequest,
      finalAnalysisRequest,
    ),
  });
  // 中間解析プログラム
  items.push({
    itemname: isInvestigatorInitiated
      ? "中間解析プログラム作成、解析実施（ダブル）"
      : "中間解析プログラム作成、解析実施（シングル）",
    value:
      interimAnalysisRequest === COMMON_EXISTENCE_LABELS.YES
        ? "回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認"
        : 0,
  });

  // 中間解析報告書
  items.push({
    itemname: "中間解析報告書作成（出力結果＋表紙）",
    value: interimAnalysisRequest === COMMON_EXISTENCE_LABELS.YES ? 1 : 0,
  });

  // 最終解析プログラム
  items.push({
    itemname: isInvestigatorInitiated
      ? "最終解析プログラム作成、解析実施（ダブル）"
      : "最終解析プログラム作成、解析実施（シングル）",
    value:
      finalAnalysisRequest === COMMON_EXISTENCE_LABELS.YES
        ? adjustedFinalAnalysisTableCount
        : 0,
  });

  // 最終解析報告書
  items.push({
    itemname: "最終解析報告書作成（出力結果＋表紙）",
    value: finalAnalysisRequest === COMMON_EXISTENCE_LABELS.YES ? 1 : 0,
  });

  // CSR / 研究結果報告書
  if (isInvestigatorInitiated) {
    items.push({
      itemname: "CSRの作成支援",
      value: 1,
    });
  } else {
    items.push({
      itemname: "研究結果報告書の作成",
      value: studyReportSupport === COMMON_EXISTENCE_LABELS.YES ? 1 : 0,
    });
  }

  return items;
}
