function testItem_price_applier() {
  testInsuranceFee_case1_();
  testInsuranceFee_case2_();
  testInsuranceFee_case3_();
  testResearchSupportFee();
  console.log("[PASS] testItem_price_applier");
}
function testInsuranceFee_(quotationRequestValue, expectedValue, testName) {
  const insuranceFeeItemName = QUOTATION_REQUEST_SHEET.ITEMNAMES.INSURANCE_FEE;
  if (!insuranceFeeItemName) {
    throw new Error("保険料の項目名が定義されていません");
  }
  const insuranceFeeRow = ITEMS_SHEET.ROWS.INSURANCE_FEE;
  if (!insuranceFeeRow) {
    throw new Error("itemsシートの保険料行が定義されていません");
  }
  const itemSheetColumnsPrice = ITEMS_SHEET.COLUMNS.PRICE;
  if (!itemSheetColumnsPrice) {
    throw new Error("itemsシートの単価列が定義されていません");
  }
  const insuranceFeePriceCell = `${itemSheetColumnsPrice}${insuranceFeeRow}`;
  const itemSheetColumnsBaseUnitPrice = ITEMS_SHEET.COLUMNS.BASE_UNIT_PRICE;
  if (!itemSheetColumnsBaseUnitPrice) {
    throw new Error("itemsシートの基準単価列が定義されていません");
  }
  const insuranceFeeBasePriceCell = `${itemSheetColumnsBaseUnitPrice}${insuranceFeeRow}`;
  const itemSheetName = ITEMS_SHEET.NAME;
  if (!itemSheetName) {
    throw new Error("itemsシート名が定義されていません");
  }

  const itemSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(itemSheetName);

  // ダミー値セット
  itemSheet.getRange(insuranceFeeBasePriceCell).setValue(9999999);

  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "R",
    insuranceFeeItemName,
    quotationRequestValue,
  );

  processInsuranceFee_(array_quotation_request, itemSheet);
  SpreadsheetApp.flush();

  const actual = {
    insuranceFee: itemSheet.getRange(insuranceFeePriceCell).getValue(),
  };

  const expected = {
    insuranceFee: expectedValue,
  };

  assertEquals_(actual, expected, testName);
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
  const common_no = COMMON_EXISTENCE_LABELS.NO;
  const common_yes = COMMON_EXISTENCE_LABELS.YES;
  if (!common_no || !common_yes) {
    throw new Error("COMMON_EXISTENCE_LABELS が正しく定義されていません");
  }
  // 正常系
  // 前提：Quotation Requestシートの「研究協力費、負担軽減費」 > 0
  // 【RC-01】試験開始準備費用：なし、症例登録毎の支払：なし、症例最終報告書提出毎の支払：なし
  testResearchSupportFee_(
    3000000,
    new Map([
      ["prepareFee", common_no],
      ["caseRegistrationFee", common_no],
      ["finalReportFee", common_no],
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
      ["prepareFee", common_yes],
      ["caseRegistrationFee", common_no],
      ["finalReportFee", common_no],
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
      ["prepareFee", common_no],
      ["caseRegistrationFee", common_yes],
      ["finalReportFee", common_no],
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
      ["prepareFee", common_no],
      ["caseRegistrationFee", common_no],
      ["finalReportFee", common_yes],
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
      ["prepareFee", common_yes],
      ["caseRegistrationFee", common_no],
      ["finalReportFee", common_yes],
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
      ["prepareFee", common_no],
      ["caseRegistrationFee", common_yes],
      ["finalReportFee", common_yes],
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
      ["prepareFee", common_yes],
      ["caseRegistrationFee", common_yes],
      ["finalReportFee", common_yes],
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
      ["prepareFee", common_yes],
      ["caseRegistrationFee", common_yes],
      ["finalReportFee", common_yes],
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
      ["prepareFee", common_yes],
      ["caseRegistrationFee", common_yes],
      ["finalReportFee", common_yes],
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
      ["prepareFee", common_no],
      ["caseRegistrationFee", common_no],
      ["finalReportFee", common_no],
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
      ["prepareFee", common_no],
      ["caseRegistrationFee", common_no],
      ["finalReportFee", common_no],
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
  const itemSheetName = ITEMS_SHEET.NAME;
  if (!itemSheetName) {
    throw new Error("itemsシート名が定義されていません");
  }
  const itemSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(itemSheetName);
  const itemSheetColumnsBaseUnitPrice = ITEMS_SHEET.COLUMNS.BASE_UNIT_PRICE;
  if (!itemSheetColumnsBaseUnitPrice) {
    throw new Error("itemsシートの基準単価列が定義されていません");
  }
  const itemSheetRowsPrepareFee = ITEMS_SHEET.ROWS.PREPARE_FEE;
  if (!itemSheetRowsPrepareFee) {
    throw new Error("itemsシートの試験開始準備費用行が定義されていません");
  }
  const itemSheetRowsReportFee = ITEMS_SHEET.ROWS.REPORT_FEE;
  if (!itemSheetRowsReportFee) {
    throw new Error(
      "itemsシートの症例最終報告書提出毎の支払行が定義されていません",
    );
  }

  // ダミー単価セット
  itemSheet
    .getRange(
      `${itemSheetColumnsBaseUnitPrice}${itemSheetRowsPrepareFee}:${itemSheetColumnsBaseUnitPrice}${itemSheetRowsReportFee}`,
    )
    .setValues([[9999999], [9999999], [9999999]]);

  // --- Quotation Request 配列作成 ---
  const quotationRequestSheetItemNameResearchSupportFee =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.RESEARCH_SUPPORT_FEE;
  if (!quotationRequestSheetItemNameResearchSupportFee) {
    throw new Error(
      "Quotation Requestシートの研究協力費、負担軽減費項目名が定義されていません",
    );
  }
  let array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "AG",
    quotationRequestSheetItemNameResearchSupportFee,
    researchSupportFeeValue,
  );
  const quotationRequestSheetItemNamePrepareFee =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.PREPARE_FEE;
  if (!quotationRequestSheetItemNamePrepareFee) {
    throw new Error(
      "Quotation Requestシートの試験開始準備費用項目名が定義されていません",
    );
  }

  array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    array_quotation_request,
    "AH",
    quotationRequestSheetItemNamePrepareFee,
    targetValueMap.get("prepareFee"),
  );
  const quotationRequestSheetItemNameCaseRegistrationFee =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.REGISTRATION_FEE;
  if (!quotationRequestSheetItemNameCaseRegistrationFee) {
    throw new Error(
      "Quotation Requestシートの症例登録毎の支払項目名が定義されていません",
    );
  }
  array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    array_quotation_request,
    "AI",
    quotationRequestSheetItemNameCaseRegistrationFee,
    targetValueMap.get("caseRegistrationFee"),
  );
  const quotationRequestSheetItemNameFinalReportFee =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.REPORT_FEE;
  if (!quotationRequestSheetItemNameFinalReportFee) {
    throw new Error(
      "Quotation Requestシートの症例最終報告書提出毎の支払項目名が定義されていません",
    );
  }
  array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    array_quotation_request,
    "AJ",
    quotationRequestSheetItemNameFinalReportFee,
    targetValueMap.get("finalReportFee"),
  );
  const quotationRequestSheetItemNameFacilities =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.FACILITIES;
  if (!quotationRequestSheetItemNameFacilities) {
    throw new Error(
      "Quotation Requestシートの実施施設数項目名が定義されていません",
    );
  }
  array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    array_quotation_request,
    "W",
    quotationRequestSheetItemNameFacilities,
    targetValueMap.get("facilities"),
  );
  const quotationRequestSheetItemNameTargetCases =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.NUMBER_OF_CASES;
  if (!quotationRequestSheetItemNameTargetCases) {
    throw new Error(
      "Quotation Requestシートの目標症例数項目名が定義されていません",
    );
  }
  array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    array_quotation_request,
    "V",
    quotationRequestSheetItemNameTargetCases,
    targetValueMap.get("targetCases"),
  );

  // プロパティ設定
  PropertiesService.getScriptProperties().setProperty(
    "number_of_cases",
    String(targetValueMap.get("targetCases")),
  );
  PropertiesService.getScriptProperties().setProperty(
    "facilities_value",
    String(targetValueMap.get("facilities")),
  );

  // 実行
  processResearchSupportFee_(array_quotation_request, itemSheet);
  SpreadsheetApp.flush();

  // --- actual / expected をまとめる ---
  const actual = new Map([
    [
      "prepareFee",
      itemSheet
        .getRange(`${ITEMS_SHEET.COLUMNS.PRICE}${itemSheetRowsPrepareFee}`)
        .getValue(),
    ],
    [
      "caseRegistrationFee",
      itemSheet
        .getRange(
          `${ITEMS_SHEET.COLUMNS.PRICE}${ITEMS_SHEET.ROWS.REGISTRATION_FEE}`,
        )
        .getValue(),
    ],
    [
      "finalReportFee",
      itemSheet
        .getRange(`${ITEMS_SHEET.COLUMNS.PRICE}${ITEMS_SHEET.ROWS.REPORT_FEE}`)
        .getValue(),
    ],
  ]);

  assertEquals_(actual, expectedValueMap, testName);
}
