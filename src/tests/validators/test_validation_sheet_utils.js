/**
 * validationGetTargetColIndex_ のテスト
 */
function test_validationGetTargetColIndex_() {
  // case1: 中央に存在
  let values = ["A", "B", "C"];
  let result = validationGetTargetColIndex_(values, "B");
  console.assert(result === 1, "case1 failed");

  // case2: 先頭
  values = ["X", "Y", "Z"];
  result = validationGetTargetColIndex_(values, "X");
  console.assert(result === 0, "case2 failed");

  // case3: 末尾
  values = ["A", "B", "C"];
  result = validationGetTargetColIndex_(values, "C");
  console.assert(result === 2, "case3 failed");

  // case4: 存在しない
  values = ["A", "B", "C"];
  result = validationGetTargetColIndex_(values, "D");
  console.assert(result === -1, "case4 failed");

  // case5: 重複値（最初の位置が返る）
  values = ["A", "B", "B", "C"];
  result = validationGetTargetColIndex_(values, "B");
  console.assert(result === 1, "case5 failed");

  Logger.log("validationGetTargetColIndex_ test completed");
}
