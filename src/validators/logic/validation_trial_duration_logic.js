/**
 * 試験月数から、関連する期間情報（合計月数、満年数、切り上げ年数）を計算して返す
 * @param {number} trialMonths - 試験月数
 * @param {number} setupClosingMonths - SetupとClosingの合計月数
 * @return {Object} 計算結果のオブジェクト
 */
function validationCalculateTrialDurationDetails_(
  trialMonths,
  setupClosingMonths,
) {
  return {
    totalMonths: trialMonths + setupClosingMonths,
    fullYears: trialMonths > 12 ? Math.trunc(trialMonths / 12) : "", // 満何年か
    ceilYears: Math.ceil(trialMonths / 12), // 切り上げ年数
  };
}
