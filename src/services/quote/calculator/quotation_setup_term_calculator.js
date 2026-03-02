/**
 * setup_term から target_term を差し引いた結果を計算する
 * @param {number} setupTerm
 * @param {number} trialTargetTerms
 * @return {{
 *   consumed: number,
 *   remaining: number
 * }}
 */
function calculateSetupTermResult_(setupTerm, trialTargetTerms) {
  const targetTerm = setupTerm - trialTargetTerms;

  if (targetTerm > 0) {
    return {
      consumed: trialTargetTerms,
      remaining: targetTerm,
    };
  }

  return {
    consumed: setupTerm,
    remaining: 0,
  };
}
