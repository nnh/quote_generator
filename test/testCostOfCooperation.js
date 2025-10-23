class GetCostOfCooperationTest {
  constructor() {
    this.newMap = getQuotationRequestTemplateMap_();
    this.newMap.set("研究協力費、負担軽減費配分管理", "あり");
    this.newMap.set("試験開始準備費用", "あり");
    this.newMap.set("症例登録毎の支払", "あり");
    this.newMap.set("症例最終報告書提出毎の支払", "あり");
    this.sheet = get_sheets();
  }
  execTest1() {
    // パターン1: 研究協力費、負担軽減費配分管理あり、研究協力費、負担軽減費300000円
    this.newMap.set("研究協力費、負担軽減費", 300000);
    this.newMap.set("目標症例数", "10");
    this.newMap.set("実施施設数", "2");
    const testValueArray1 = [50000, 10000, 10000];
    this.testCostOfCooperation_(this.newMap, testValueArray1, 1);
  }
  testCostOfCooperation_(newMap, testValueArray, testCaseNo) {
    const sheet = this.sheet;
    const itemRangeAddress = "C64:C66";
    const arr = mapTo2DArrayQuotationRequest_(newMap);
    const valueArr = [[...arr[1]]];
    setQuotationRequestTestData_(sheet, valueArr);
    execTestSetTrialSheet_(sheet);
    const actualValues = sheet.items
      .getRange(itemRangeAddress)
      .getValues()
      .flat();
    testValueArray.forEach((expectedValue, index) => {
      if (actualValues[index] !== expectedValue) {
        throw new Error(
          `試験協力費の値が異なります。行番号:${
            index + 64
          } 期待値:"${expectedValue}" 実際の値:"${actualValues[index]}"`
        );
      }
    });
    console.log(
      `✅ 試験協力費の値が正しいことを確認しました。itemsシートの該当セルを初期化します。: パターン${testCaseNo} / x`
    );
  }
}
function testCostOfCooperation() {
  console.log("試験協力費のテストを開始します");
  initial_process();
  const test = new GetCostOfCooperationTest();
  test.execTest1();
  console.log("試験協力費のテストが完了しました");
}
