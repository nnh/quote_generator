function test_createRegistrationItemsList() {
  // 現在のところSetupとClosingは前段階で除外されているので対象から除外する
  console.log(
    "test_createRegistrationItemsList_ : Setup, Closingシートは対象外",
  );
  const targetSheetsName = getTargetSheetNameForTest_().filter((sheetname) => {
    return (
      sheetname !== getSetupSheetNameForTest_() &&
      sheetname !== getClosingSheetNameForTest_()
    );
  });
  test_createRegistrationItemsList_crbApplication_(targetSheetsName);
  const registration1_sheetName = getRegistration1SheetNameForTest_();
  test_createItemsByQuotationRequest_essentialDocuments_(
    registration1_sheetName,
  );
  test_createItemsByQuotationRequest_drug_transportation_(
    registration1_sheetName,
  );
}
function test_createItemsByQuotationRequest_drug_transportation_(
  targetSheetName,
) {
  // 治験薬運搬のテスト
  const value_yes = requireTestYesExistenceLabel_();
  const value_no = requireTestNoExistenceLabel_();
  const quotation_request_itemName =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.DRUG_TRANSPORTATION;
  if (!quotation_request_itemName) {
    throw new Error(
      "test_createRegistrationItemsList_drugTransportation : QUOTATION_REQUEST_SHEET.ITEMNAMES.DRUG_TRANSPORTATION is undefined",
    );
  }
  const item_itemName = ITEMS_SHEET.ITEMNAMES.DRUG_TRANSPORTATION;
  if (!item_itemName) {
    throw new Error(
      "test_createRegistrationItemsList_drugTransportation : ITEMS_SHEET.ITEMNAMES.DRUG_TRANSPORTATION is undefined",
    );
  }
  [value_yes, value_no, ""].forEach((value) => {
    const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
      null,
      "K",
      quotation_request_itemName,
      value,
    );
    const expectedValue = value === value_yes ? `=trial!B29` : "";
    const itemsMap = createRegistrationItemsList_(
      targetSheetName,
      array_quotation_request,
    );
    const actualValue = itemsMap.get(item_itemName);
    assertEquals_(
      actualValue,
      expectedValue,
      `test_createRegistrationItemsList_drugTransportation : シート[${targetSheetName}]、治験薬運搬の場合、値は[${expectedValue}]であること。 actual=[${actualValue}]`,
    );
  });
}
function test_createItemsByQuotationRequest_essentialDocuments_(
  targetSheetName,
) {
  const quotation_request_itemName =
    QUOTATION_REQUEST_SHEET.ITEMNAMES
      .ESSENTIAL_DOCUMENTS_MONITORING_COUNT_PER_FACILITY;
  if (!quotation_request_itemName) {
    throw new Error(
      "test_createRegistrationItemsList_essentialDocuments : QUOTATION_REQUEST_SHEET.ITEMNAMES.ESSENTIAL_DOCUMENTS_MONITORING_COUNT_PER_FACILITY is undefined",
    );
  }
  const item_itemName = ITEMS_SHEET.ITEMNAMES.ESSENTIAL_DOCUMENTS_MONITORING;
  if (!item_itemName) {
    throw new Error(
      "test_createRegistrationItemsList_essentialDocuments : ITEMS_SHEET.ITEMNAMES.ESSENTIAL_DOCUMENTS_MONITORING is undefined",
    );
  }
  // 必須文書確認・開始前モニタリングのテスト
  [100, 0, ""].forEach((value) => {
    const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
      null,
      "P",
      quotation_request_itemName,
      value,
    );
    const expectedValue = value === "" ? "" : `=trial!B29 * ${value}`;
    const itemsMap = createRegistrationItemsList_(
      targetSheetName,
      array_quotation_request,
    );
    const actualValue = itemsMap.get(item_itemName);
    assertEquals_(
      actualValue,
      expectedValue,
      `test_createRegistrationItemsList_essentialDocuments : シート[${targetSheetName}]、必須文書確認・開始前モニタリングの場合、値は[${expectedValue}]であること。 actual=[${actualValue}]`,
    );
  });
}

function test_createRegistrationItemsList_crbApplication_(targetSheetsName) {
  // CRB申請のテスト
  // sheetnameがRegistration_1の場合名古屋医療センターCRB申請費用(初年度)が対象
  // sheetnameが上記以外の場合名古屋医療センターCRB申請費用(2年目以降)が対象
  // CRB申請が"あり"の場合1、それ以外は空文字
  const value_yes = requireTestYesExistenceLabel_();
  const value_no = requireTestNoExistenceLabel_();
  const quotation_request_itemName =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.CRB_APPLICATION;
  if (!quotation_request_itemName) {
    throw new Error(
      "test_createRegistrationItemsList_crbApplication_ : QUOTATION_REQUEST_SHEET.ITEMNAMES.CRB_APPLICATION is undefined",
    );
  }
  const item_itemName_firstyear =
    ITEMS_SHEET.ITEMNAMES.CRB_APPLICATION_FIRST_YEAR;
  if (!item_itemName_firstyear) {
    throw new Error(
      "test_createRegistrationItemsList_crbApplication_ : ITEMS_SHEET.ITEMNAMES.CRB_APPLICATION_FIRST_YEAR is undefined",
    );
  }
  const item_itemName_lateryear =
    ITEMS_SHEET.ITEMNAMES.CRB_APPLICATION_AFTER_SECOND_YEAR;
  if (!item_itemName_lateryear) {
    throw new Error(
      "test_createRegistrationItemsList_crbApplication_ : ITEMS_SHEET.ITEMNAMES.CRB_APPLICATION_AFTER_SECOND_YEAR is undefined",
    );
  }
  const registration1_sheetName = getRegistration1SheetNameForTest_();
  [value_yes, value_no, ""].forEach((crbApplicationValue) => {
    const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
      null,
      "L",
      quotation_request_itemName,
      crbApplicationValue,
    );
    targetSheetsName.forEach((sheetname) => {
      const targetItemName =
        sheetname === registration1_sheetName
          ? ITEMS_SHEET.ITEMNAMES.CRB_APPLICATION_FIRST_YEAR
          : ITEMS_SHEET.ITEMNAMES.CRB_APPLICATION_AFTER_SECOND_YEAR;
      const itemsMap = createRegistrationItemsList_(
        sheetname,
        array_quotation_request,
      );
      const actualValue = itemsMap.get(targetItemName);
      const expectedValue = crbApplicationValue === value_yes ? 1 : "";
      assertEquals_(
        actualValue,
        expectedValue,
        `test_createRegistrationItemsList_crbApplication_ : シート[${sheetname}]、CRB申請[${crbApplicationValue}]の場合、${targetItemName}の値は[${expectedValue}]であること。 actual=[${actualValue}]`,
      );
    });
  });
}
