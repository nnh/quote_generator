function testItem_price_applier() {
  testInsuranceFee_case1_();
  testInsuranceFee_case2_();
  testInsuranceFee_case3_();
}
function testInsuranceFee_(quotationRequestValue, expectedValue, testName) {
  const insuranceFeeRow = ITEMS_SHEET.ROWS.INSURANCE_FEE;
  const insuranceFeePriceCell = `${ITEMS_SHEET.COLUMNS.PRICE}${insuranceFeeRow}`;
  const insuranceFeeBasePriceCell = `${ITEMS_SHEET.COLUMNS.BASE_UNIT_PRICE}${insuranceFeeRow}`;
  const itemSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    ITEMS_SHEET.NAME,
  );
  itemSheet.getRange(insuranceFeeBasePriceCell).setValue(9999999); // ダミー値セット
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "R",
    "保険料",
    quotationRequestValue,
  );
  processInsuranceFee_(array_quotation_request, itemSheet);
  SpreadsheetApp.flush();
  const actualItemValue = itemSheet.getRange(insuranceFeePriceCell).getValue();
  if (actualItemValue !== expectedValue) {
    throw new Error(
      `Expected insurance fee item value: ${expectedValue}, but got: ${actualItemValue}`,
    );
  }
  console.log(`Test passed: ${testName}`);
}
function testInsuranceFee_case1_() {
  // 保険料ありの場合itemsシートの該当行に正しい金額が設定されていることを確認する
  testInsuranceFee_(3450000, 3450000, "Insurance Fee Case 1: あり");
}
function testInsuranceFee_case2_() {
  // 保険料なしの場合itemsシートの該当行に0が設定されていることを確認する
  testInsuranceFee_(0, 0, "Insurance Fee Case 2: なし");
}
function testInsuranceFee_case3_() {
  // 保険料空欄の場合itemsシートの該当行に0が設定されていることを確認する
  testInsuranceFee_("", 0, "Insurance Fee Case 3: 空欄");
}
function testResearchSupportFee() {
  // 正常系
  // 前提：Quotation Requestシートの「研究協力費、負担軽減費」 > 0
  // 【RC-01】試験開始準備費用：なし、症例登録毎の支払：なし、症例最終報告書提出毎の支払：なし
  testResearchSupportFee_(
    3000000,
    new Map([
      ["prepareFee", "なし"],
      ["caseRegistrationFee", "なし"],
      ["finalReportFee", "なし"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 0],
      ["caseRegistrationFee", 0],
      ["finalReportFee", 0],
    ]),
    "RC-01 「研究協力費、負担軽減費」 > 0、その他すべて「なし」",
  );
  // 【RC-02】試験開始準備費用：あり、症例登録毎の支払：なし、症例最終報告書提出毎の支払：なし
  testResearchSupportFee_(
    3000000,
    new Map([
      ["prepareFee", "あり"],
      ["caseRegistrationFee", "なし"],
      ["finalReportFee", "なし"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 300000],
      ["caseRegistrationFee", 0],
      ["finalReportFee", 0],
    ]),
    "RC-02 「研究協力費、負担軽減費」 > 0、試験開始準備費用：あり、その他「なし」",
  );
  // 【RC-03】試験開始準備費用：なし、症例登録毎の支払：あり、症例最終報告書提出毎の支払：なし
  testResearchSupportFee_(
    3000000,
    new Map([
      ["prepareFee", "なし"],
      ["caseRegistrationFee", "あり"],
      ["finalReportFee", "なし"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 0],
      ["caseRegistrationFee", 300000],
      ["finalReportFee", 0],
    ]),
    "RC-03 「研究協力費、負担軽減費」 > 0、症例登録毎の支払：あり、その他「なし」",
  );
  // 【RC-04】試験開始準備費用：なし、症例登録毎の支払：なし、症例最終報告書提出毎の支払：あり
  testResearchSupportFee_(
    3000000,
    new Map([
      ["prepareFee", "なし"],
      ["caseRegistrationFee", "なし"],
      ["finalReportFee", "あり"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 0],
      ["caseRegistrationFee", 0],
      ["finalReportFee", 300000],
    ]),
    "RC-04 「研究協力費、負担軽減費」 > 0、症例最終報告書提出毎の支払：あり、その他「なし」",
  );
  // 【RC-05】試験開始準備費用：あり、症例登録毎の支払：なし、症例最終報告書提出毎の支払：あり
  testResearchSupportFee_(
    3000000,
    new Map([
      ["prepareFee", "あり"],
      ["caseRegistrationFee", "なし"],
      ["finalReportFee", "あり"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 150000],
      ["caseRegistrationFee", 0],
      ["finalReportFee", 150000],
    ]),
    "RC-05 「研究協力費、負担軽減費」 > 0、試験開始準備費用：あり、症例最終報告書提出毎の支払：あり、その他「なし」",
  );
  // 【RC-06】試験開始準備費用：なし、症例登録毎の支払：あり、症例最終報告書提出毎の支払：あり
  testResearchSupportFee_(
    3000000,
    new Map([
      ["prepareFee", "なし"],
      ["caseRegistrationFee", "あり"],
      ["finalReportFee", "あり"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 0],
      ["caseRegistrationFee", 150000],
      ["finalReportFee", 150000],
    ]),
    "RC-06 「研究協力費、負担軽減費」 > 0、症例登録毎の支払：あり、症例最終報告書提出毎の支払：あり、その他「なし」",
  );
  // 【RC-07】試験開始準備費用：あり、症例登録毎の支払：あり、症例最終報告書提出毎の支払：あり
  testResearchSupportFee_(
    3000000,
    new Map([
      ["prepareFee", "あり"],
      ["caseRegistrationFee", "あり"],
      ["finalReportFee", "あり"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 100000],
      ["caseRegistrationFee", 100000],
      ["finalReportFee", 100000],
    ]),
    "RC-07 「研究協力費、負担軽減費」 > 0、すべて「あり」",
  );
  // 異常系
  // 【RC-08】Quotation Requestシートの「研究協力費、負担軽減費」＝0
  testResearchSupportFee_(
    0,
    new Map([
      ["prepareFee", "あり"],
      ["caseRegistrationFee", "あり"],
      ["finalReportFee", "あり"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 0],
      ["caseRegistrationFee", 0],
      ["finalReportFee", 0],
    ]),
    "RC-08 「研究協力費、負担軽減費」＝0、その他すべて「あり」",
  );
  // 【RC-09】Quotation Requestシートの「研究協力費、負担軽減費」空欄
  testResearchSupportFee_(
    "",
    new Map([
      ["prepareFee", "あり"],
      ["caseRegistrationFee", "あり"],
      ["finalReportFee", "あり"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 0],
      ["caseRegistrationFee", 0],
      ["finalReportFee", 0],
    ]),
    "RC-09 「研究協力費、負担軽減費」空欄、その他すべて「あり」",
  );
  // 正常系
  //  "RC-10 「研究協力費、負担軽減費」＝0、その他すべて「なし」",
  testResearchSupportFee_(
    0,
    new Map([
      ["prepareFee", "なし"],
      ["caseRegistrationFee", "なし"],
      ["finalReportFee", "なし"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 0],
      ["caseRegistrationFee", 0],
      ["finalReportFee", 0],
    ]),
    "RC-10 「研究協力費、負担軽減費」＝0、その他すべて「なし」",
  );
  //  "RC-11 「研究協力費、負担軽減費」＝""、その他すべて「なし」",
  testResearchSupportFee_(
    "",
    new Map([
      ["prepareFee", "なし"],
      ["caseRegistrationFee", "なし"],
      ["finalReportFee", "なし"],
      ["targetCases", 10],
      ["facilities", 10],
    ]),
    new Map([
      ["prepareFee", 0],
      ["caseRegistrationFee", 0],
      ["finalReportFee", 0],
    ]),
    'RC-11 「研究協力費、負担軽減費」＝""、その他すべて「なし」',
  );

  console.log("Research Support Fee tests completed.");
}
function testResearchSupportFee_(
  researchSupportFeeValue,
  targetValueMap,
  expectedValueMap,
  testName,
) {
  const itemSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    ITEMS_SHEET.NAME,
  );
  itemSheet
    .getRange(
      `${ITEMS_SHEET.COLUMNS.BASE_UNIT_PRICE}${ITEMS_SHEET.ROWS.PREPARE_FEE}:${ITEMS_SHEET.COLUMNS.BASE_UNIT_PRICE}${ITEMS_SHEET.ROWS.REPORT_FEE}`,
    )
    .setValues([[9999999], [9999999], [9999999]]); // ダミー値セット
  const temp_1_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      null,
      "AG",
      "研究協力費、負担軽減費",
      researchSupportFeeValue,
    );
  const temp_2_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      temp_1_array_quotation_request,
      "AH",
      "試験開始準備費用",
      targetValueMap.get("prepareFee"),
    );
  const temp_3_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      temp_2_array_quotation_request,
      "AI",
      "症例登録毎の支払",
      targetValueMap.get("caseRegistrationFee"),
    );
  const temp_4_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      temp_3_array_quotation_request,
      "AJ",
      "症例最終報告書提出毎の支払",
      targetValueMap.get("finalReportFee"),
    );
  const temp_5_array_quotation_request =
    createTestQuotationRequestArrayWithColumn_(
      temp_4_array_quotation_request,
      "W",
      "実施施設数",
      targetValueMap.get("facilities"),
    );
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    temp_5_array_quotation_request,
    "V",
    "目標症例数",
    targetValueMap.get("targetCases"),
  );
  PropertiesService.getScriptProperties().setProperty(
    "number_of_cases",
    String(targetValueMap.get("targetCases")),
  );
  PropertiesService.getScriptProperties().setProperty(
    "facilities_value",
    String(targetValueMap.get("facilities")),
  );

  processResearchSupportFee_(array_quotation_request, itemSheet);
  SpreadsheetApp.flush();
  const prepareFeePriceCell = `${ITEMS_SHEET.COLUMNS.PRICE}${ITEMS_SHEET.ROWS.PREPARE_FEE}`;
  const caseRegistrationFeePriceCell = `${ITEMS_SHEET.COLUMNS.PRICE}${ITEMS_SHEET.ROWS.REGISTRATION_FEE}`;
  const finalReportFeePriceCell = `${ITEMS_SHEET.COLUMNS.PRICE}${ITEMS_SHEET.ROWS.REPORT_FEE}`;
  const actualPrepareFeeValue = itemSheet
    .getRange(prepareFeePriceCell)
    .getValue();
  const actualCaseRegistrationFeeValue = itemSheet
    .getRange(caseRegistrationFeePriceCell)
    .getValue();
  const actualFinalReportFeeValue = itemSheet
    .getRange(finalReportFeePriceCell)
    .getValue();
  if (actualPrepareFeeValue !== expectedValueMap.get("prepareFee")) {
    throw new Error(
      `Expected prepare fee item value: ${expectedValueMap.get(
        "prepareFee",
      )}, but got: ${actualPrepareFeeValue}`,
    );
  }
  if (
    actualCaseRegistrationFeeValue !==
    expectedValueMap.get("caseRegistrationFee")
  ) {
    throw new Error(
      `Expected case registration fee item value: ${expectedValueMap.get(
        "caseRegistrationFee",
      )}, but got: ${actualCaseRegistrationFeeValue}`,
    );
  }
  if (actualFinalReportFeeValue !== expectedValueMap.get("finalReportFee")) {
    throw new Error(
      `Expected final report fee item value: ${expectedValueMap.get(
        "finalReportFee",
      )}, but got: ${actualFinalReportFeeValue}`,
    );
  }
  console.log(`Test passed: ${testName}`);
  return true;
}
