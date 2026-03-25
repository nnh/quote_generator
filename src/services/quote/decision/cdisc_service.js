/**
 * CDISC対応の有無を判定する
 *
 * quotation_requestシートの値を参照して判定する
 *
 * @return {boolean} CDISC対応ありの場合は true
 */
function isCdiscEnabled_() {
  return (
    getQuotationRequestValue_(
      QUOTATION_REQUEST_SHEET.ITEMNAMES.CDISC_SUPPORT,
    ) === COMMON_EXISTENCE_LABELS.YES
  );
}

/**
 * CDISC対応コメントをtrialシートに適用する（副作用あり）
 *
 * - 既存のCRFコメントを削除
 * - CDISC対応コメントを追加
 *
 * @param {boolean} isCdiscEnabled CDISC対応フラグ
 * @return {void}
 */
function applyCdiscComment_(isCdiscEnabled) {
  if (!isCdiscEnabled) return;
  const CRF_COMMENT_DEFAULT = `="CRFのべ項目数を一症例あたり"&$${TRIAL_SHEET.COLUMN_LETTERS.VALUE}$${TRIAL_SHEET.ROWS.CRF}&"項目と想定しております。"`;
  const CRF_COMMENT_CDISC = `="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$${TRIAL_SHEET.COLUMN_LETTERS.VALUE}$${TRIAL_SHEET.ROWS.CRF}&"項目と想定しております。"`;

  deleteTrialComment_(CRF_COMMENT_DEFAULT);

  setTrialComment_(CRF_COMMENT_CDISC);
}
