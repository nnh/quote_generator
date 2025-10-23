// ユニットテスト
function testExecTest4() {
  const unitTest = new UnitTest();
  unitTest.execTest(3);
}
function testExecTest3() {
  const unitTest = new UnitTest();
  unitTest.execTest(2);
}
function testExecTest2() {
  const unitTest = new UnitTest();
  unitTest.execTest(1);
}
function testExecTest1() {
  const unitTest = new UnitTest();
  unitTest.execTest(0);
}
// 見積作成処理単体のテスト
function testQuoteScript() {
  console.log("quote_script_mainのテストを開始します");
  initial_process();
  const sheet = get_sheets();
  testQuoteScript_(sheet);
}
// 列再構成単体のテスト
function testReorganizeColumns() {
  testReorganizeColumns_();
}
// 試験協力費の按分計算が正しいことを確認するテスト
function testCostOfCooperation() {
  console.log("試験協力費のテストを開始します");
  initial_process();
  const test = new GetCostOfCooperationTest();
  let idx = 1;
  test.execTest1(idx);
  idx++;
  test.execTest2(idx);
  idx++;
  test.execTest3(idx);
  idx++;
  test.execTest4(idx);
  idx++;
  test.execTest5(idx);
  idx++;
  test.execTest6(idx);
  idx++;
  test.execTest7(idx);
  idx++;
  test.execTest8(idx);
  console.log("試験協力費のテストが完了しました");
}

// 試験種別毎に変動するitemsシートの項目名が正しいことを確認するテスト
function testSetItemSheet() {
  testSetItemSheet_();
}
// itemsシートの試験項目の単価が正しいことを確認するテスト(2015年版の単価表で確認)
function testCheckItemPrices() {
  console.log("itemsシートの単価チェックを開始します");
  const sheet = get_sheets();
  sheet.quotation_request.getRange("A2").setValue("test");
  sheet.trial.getRange("B44").setValue(1);
  testCheckItemPrices_(sheet, rowNumberItemNamePriceArray_cofficients10);
  console.log("✅ 試験項目の価格が正しいことを確認しました：係数1.0の場合");
  sheet.trial.getRange("B44").setValue(1.5);
  testCheckItemPrices_(sheet, rowNumberItemNamePriceArray_cofficients15);
  console.log("✅ 試験項目の価格が正しいことを確認しました：係数1.5の場合");
  console.log(
    "他のテストを実施する前に、ファイルの変更履歴からファイルを一つ前のバージョンに戻してください"
  );
}
// trialシートの各値が正しいことを確認するテスト
function testSetTrialSheet() {
  testSetTrialSheetCommon_();
}
// 試験期間の自動計算が正しいことを確認するテスト
function testWriteTrialDatesFromQuotation() {
  initial_process();
  testTrialDateFunction_();
  testGetSetupClosingTermFunction_();
}
