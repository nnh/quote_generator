/**
 * calculateSetupTermResult_ のユニットテスト
 * setup_term と trial_target_terms の関係によって
 * consumed（消費量）と remaining（残り）が正しく計算されるかを検証する
 */
function testCalculateSetupTermResult() {
  // case1. 該当年がsetupのみで、次年度にsetupが継続する場合
  // setup_term の方が trial_target_terms より大きい
  // → trial_target_terms 分だけ消費され、残りが返る
  assertEquals_(
    calculateSetupTermResult_(10, 3),
    { consumed: 3, remaining: 7 },
    "setup_term > trial_target_terms の場合",
  );

  // case2. 該当年でsetupが終わり、該当年にregistration期間が始まる場合
  // setup_term の方が trial_target_terms 以下の場合
  // → setup_term 全量が消費され、残りは 0 になる
  assertEquals_(
    calculateSetupTermResult_(3, 5),
    { consumed: 3, remaining: 0 },
    "setup_term <= trial_target_terms の場合",
  );

  // case3. setup_term が 0 の場合
  // → 何も消費されず、残りも 0 のまま
  assertEquals_(
    calculateSetupTermResult_(0, 5),
    { consumed: 0, remaining: 0 },
    "setup_term が 0 の場合",
  );

  // case4.該当年でsetupが終わり、registration期間は始まらない場合
  // setup_term と trial_target_terms が同じ場合
  assertEquals_(
    calculateSetupTermResult_(5, 5),
    { consumed: 5, remaining: 0 },
    "setup_term == trial_target_terms の場合",
  );
  console.log("[PASS] testCalculateSetupTermResult");
}
