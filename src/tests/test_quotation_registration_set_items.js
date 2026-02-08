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
  ["あり", "なし", ""].forEach((value) => {
    // 治験薬運搬のテスト
    const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
      null,
      "K",
      "治験薬運搬",
      value,
    );
    const expectedValue = value === "あり" ? `=trial!B29` : "";
    const itemsMap = createRegistrationItemsList_(
      targetSheetName,
      array_quotation_request,
    );
    const actualValue = itemsMap.get("治験薬運搬");
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
  // 必須文書確認・開始前モニタリングのテスト
  [100, 0, ""].forEach((value) => {
    const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
      null,
      "P",
      "年間1施設あたりの必須文書実地モニタリング回数",
      value,
    );
    const expectedValue = value === "" ? "" : `=trial!B29 * ${value}`;
    const itemsMap = createRegistrationItemsList_(
      targetSheetName,
      array_quotation_request,
    );
    const actualValue = itemsMap.get("開始前モニタリング・必須文書確認");
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
  const registration1_sheetName = getRegistration1SheetNameForTest_();
  ["あり", "なし", ""].forEach((crbApplicationValue) => {
    const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
      null,
      "L",
      "CRB申請",
      crbApplicationValue,
    );
    targetSheetsName.forEach((sheetname) => {
      const targetItemName =
        sheetname === registration1_sheetName
          ? "名古屋医療センターCRB申請費用(初年度)"
          : "名古屋医療センターCRB申請費用(2年目以降)";
      const itemsMap = createRegistrationItemsList_(
        sheetname,
        array_quotation_request,
      );
      const actualValue = itemsMap.get(targetItemName);
      const expectedValue = crbApplicationValue === "あり" ? 1 : "";
      assertEquals_(
        actualValue,
        expectedValue,
        `test_createRegistrationItemsList_crbApplication_ : シート[${sheetname}]、CRB申請[${crbApplicationValue}]の場合、${targetItemName}の値は[${expectedValue}]であること。 actual=[${actualValue}]`,
      );
    });
  });
}
