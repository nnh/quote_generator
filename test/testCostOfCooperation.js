function execTestCostOfCooperation_() {
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

class GetCostOfCooperationTest {
  constructor() {
    this.newMap = getQuotationRequestTemplateMap_();
    this.sheet = get_sheets();
  }
  execTest1(idx) {
    // パターン1: 研究協力費、負担軽減費配分管理あり、研究協力費、負担軽減費300000円
    this.newMap.set("研究協力費、負担軽減費配分管理", "あり");
    this.newMap.set("試験開始準備費用", "あり");
    this.newMap.set("症例登録毎の支払", "あり");
    this.newMap.set("症例最終報告書提出毎の支払", "あり");
    this.newMap.set("研究協力費、負担軽減費", 300000);
    this.newMap.set("目標症例数", "10");
    this.newMap.set("実施施設数", "2");
    const testValueArray = [50000, 10000, 10000];
    this.testCostOfCooperation_(this.newMap, testValueArray, idx);
  }
  execTest2(idx) {
    // パターン2: 研究協力費、負担軽減費配分管理あり、"試験開始準備費用"のみあり
    this.newMap.set("研究協力費、負担軽減費配分管理", "あり");
    this.newMap.set("試験開始準備費用", "あり");
    this.newMap.set("症例登録毎の支払", "なし");
    this.newMap.set("症例最終報告書提出毎の支払", "なし");
    this.newMap.set("研究協力費、負担軽減費", 300000);
    this.newMap.set("目標症例数", "10");
    this.newMap.set("実施施設数", "2");
    const testValueArray = [150000, 0, 0];
    this.testCostOfCooperation_(this.newMap, testValueArray, idx);
  }
  execTest3(idx) {
    // パターン3: 研究協力費、負担軽減費配分管理あり、"症例登録毎の支払"のみあり
    this.newMap.set("研究協力費、負担軽減費配分管理", "あり");
    this.newMap.set("試験開始準備費用", "なし");
    this.newMap.set("症例登録毎の支払", "あり");
    this.newMap.set("症例最終報告書提出毎の支払", "なし");
    this.newMap.set("研究協力費、負担軽減費", 300000);
    this.newMap.set("目標症例数", "10");
    this.newMap.set("実施施設数", "2");
    const testValueArray = [0, 30000, 0];
    this.testCostOfCooperation_(this.newMap, testValueArray, idx);
  }
  execTest4(idx) {
    // パターン4: 研究協力費、負担軽減費配分管理あり、"症例最終報告書提出毎の支払"のみあり
    this.newMap.set("研究協力費、負担軽減費配分管理", "あり");
    this.newMap.set("試験開始準備費用", "なし");
    this.newMap.set("症例登録毎の支払", "なし");
    this.newMap.set("症例最終報告書提出毎の支払", "あり");
    this.newMap.set("研究協力費、負担軽減費", 600000);
    this.newMap.set("目標症例数", "10");
    this.newMap.set("実施施設数", "2");
    const testValueArray = [0, 0, 60000];
    this.testCostOfCooperation_(this.newMap, testValueArray, idx);
  }
  execTest5(idx) {
    // パターン5: 研究協力費、負担軽減費配分管理あり、"試験開始準備費用""症例最終報告書提出毎の支払"あり
    this.newMap.set("研究協力費、負担軽減費配分管理", "あり");
    this.newMap.set("試験開始準備費用", "あり");
    this.newMap.set("症例登録毎の支払", "なし");
    this.newMap.set("症例最終報告書提出毎の支払", "あり");
    this.newMap.set("研究協力費、負担軽減費", 600000);
    this.newMap.set("目標症例数", "10");
    this.newMap.set("実施施設数", "2");
    const testValueArray = [150000, 0, 30000];
    this.testCostOfCooperation_(this.newMap, testValueArray, idx);
  }
  execTest6(idx) {
    // パターン6: 研究協力費、負担軽減費配分管理あり、"試験開始準備費用""症例登録毎の支払"あり
    this.newMap.set("研究協力費、負担軽減費配分管理", "あり");
    this.newMap.set("試験開始準備費用", "あり");
    this.newMap.set("症例登録毎の支払", "あり");
    this.newMap.set("症例最終報告書提出毎の支払", "なし");
    this.newMap.set("研究協力費、負担軽減費", 400000);
    this.newMap.set("目標症例数", "10");
    this.newMap.set("実施施設数", "2");
    const testValueArray = [100000, 20000, 0];
    this.testCostOfCooperation_(this.newMap, testValueArray, idx);
  }
  execTest7(idx) {
    // パターン7: 研究協力費、負担軽減費配分管理あり、"症例最終報告書提出毎の支払""症例登録毎の支払"あり
    this.newMap.set("研究協力費、負担軽減費配分管理", "あり");
    this.newMap.set("試験開始準備費用", "なし");
    this.newMap.set("症例登録毎の支払", "あり");
    this.newMap.set("症例最終報告書提出毎の支払", "あり");
    this.newMap.set("研究協力費、負担軽減費", 400000);
    this.newMap.set("目標症例数", "10");
    this.newMap.set("実施施設数", "2");
    const testValueArray = [0, 20000, 20000];
    this.testCostOfCooperation_(this.newMap, testValueArray, idx);
  }
  execTest8(idx) {
    // パターン8: 研究協力費、負担軽減費配分管理なし、
    this.newMap.set("研究協力費、負担軽減費配分管理", "なし");
    this.newMap.set("試験開始準備費用", "");
    this.newMap.set("症例登録毎の支払", "");
    this.newMap.set("症例最終報告書提出毎の支払", "");
    this.newMap.set("研究協力費、負担軽減費", 400000);
    this.newMap.set("目標症例数", "10");
    this.newMap.set("実施施設数", "2");
    const testValueArray = [0, 0, 0];
    this.testCostOfCooperation_(this.newMap, testValueArray, idx);
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
      `✅ 試験協力費の値が正しいことを確認しました。itemsシートの該当セルを初期化します。: パターン${testCaseNo} / 8`
    );
    sheet.items.getRange("S64:U66").clearContent();
  }
}
