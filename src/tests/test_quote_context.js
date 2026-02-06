function test_initTargetColumn() {
  const acutualValue = initTargetColumn_();
  const expectedValue = "F";
  assertEquals_(
    expectedValue,
    acutualValue,
    "initTargetColumn should return 'F'",
  );
}
function test_initClinicalTrialsOfficeFlg() {
  const trialTypeList = getTrialTypeListForTest_();
  trialTypeList.forEach((trialTypePropertyValue) =>
    test_initClinicalTrialsOfficeFlg_withProperty_(trialTypePropertyValue),
  );
}
/**
 * initClinicalTrialsOfficeFlg_ のテスト用共通関数
 *
 * @param {string|null} trialTypePropertyValue
 *   Script Properties に設定する trial_type_value（null の場合は未設定）
 * @param {Array} array_quotation_request
 *   Quotation Request シートのダミー配列
 * @param {boolean} expected
 *   期待される戻り値
 * @param {string} testname
 *   テスト名
 */
function test_initClinicalTrialsOfficeFlg_withProperty_(
  trialTypePropertyValue,
) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const PROPERTY_KEY = "trial_type_value";

  const originalValue = scriptProperties.getProperty(PROPERTY_KEY);

  try {
    // --- テスト用プロパティを設定 ---
    if (trialTypePropertyValue === null) {
      scriptProperties.deleteProperty(PROPERTY_KEY);
    } else {
      scriptProperties.setProperty(PROPERTY_KEY, trialTypePropertyValue);
    }
    ["公的資金（税金由来）", "営利企業原資（製薬企業等）", ""].forEach(
      (fundingSource) => {
        const temp_array_quotation_request =
          createTestQuotationRequestArrayWithColumn_(
            null,
            "AN",
            "原資",
            fundingSource,
          );
        ["あり", "なし", ""].forEach((officeExistence) => {
          const array_quotation_request =
            createTestQuotationRequestArrayWithColumn_(
              temp_array_quotation_request,
              "AQ",
              "調整事務局設置の有無",
              officeExistence,
            );
          let expectedValue = false;
          if (trialTypePropertyValue === "医師主導治験") {
            expectedValue = true;
          }
          if (fundingSource === "営利企業原資（製薬企業等）") {
            expectedValue = true;
          }
          if (officeExistence === "あり") {
            expectedValue = true;
          }
          const actualValue = initClinicalTrialsOfficeFlg_(
            array_quotation_request,
          );
          assertEquals_(
            expectedValue,
            actualValue,
            `initClinicalTrialsOfficeFlg should return ${expectedValue} for trialType: ${trialTypePropertyValue}, fundingSource: ${fundingSource}, officeExistence: ${officeExistence}`,
          );
        });
      },
    );
  } finally {
    // --- プロパティを必ず元に戻す ---
    if (originalValue === null) {
      scriptProperties.deleteProperty(PROPERTY_KEY);
    } else {
      scriptProperties.setProperty(PROPERTY_KEY, originalValue);
    }
  }
}
function test_getTrialValues_forTestQuoteContext_() {
  const targetRange = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Trial")
    .getRange("A32:H39");
  return targetRange.getValues();
}
function test_buildTrialTermResult() {
  const targetSheetsName = [...getTargetSheetNameForTest_(), "dummy_sheet"];
  const targetValues = test_getTrialValues_forTestQuoteContext_();
  // dummy_sheetならばundefinedが返ることを確認
  targetSheetsName.forEach((sheetname, idx) => {
    const actualValues = buildTrialTermResult_(
      getTrialTermSheetValues_(),
      sheetname,
    );
    if (sheetname === "dummy_sheet") {
      assertEquals_(
        { trial_target_terms: undefined, trial_term_values: undefined },
        actualValues,
        `buildTrialTermResult_ should return undefined for unknown sheetname: ${sheetname}`,
      );
    } else {
      const expectedValues = {
        trial_target_terms: targetValues[idx][5],
        trial_term_values: targetValues[idx],
      };
      assertEquals_(
        actualValues,
        expectedValues,
        `buildTrialTermResult_ should return correct trial_target_terms for sheetname: ${sheetname}`,
      );
    }
  });
}
function test_getTrialTermSheetValues() {
  const expectedValues = test_getTrialValues_forTestQuoteContext_();
  const actualValues = getTrialTermSheetValues_();
  assertEquals_(
    expectedValues,
    actualValues,
    "getTrialTermSheetValues should return correct values from Trial sheet",
  );
}
/**
 * buildTrialDates_ の統合テスト
 */
function test_buildTrialDates() {
  const cases = [
    {
      name: "すべて有効な日付",
      trial_term_values: (() => {
        const values = [];
        values[TRIAL_SHEET.COLUMNS.TRIAL_START - 1] = "2023-04-01";
        values[TRIAL_SHEET.COLUMNS.TRIAL_END - 1] = "2024-03-31";
        return values;
      })(),
      props: {
        trial_start_date: "2022-01-01",
        trial_end_date: "2025-12-31",
      },
      expect: {
        trial_target_start_date: Moment.moment("2023-04-01"),
        trial_target_end_date: Moment.moment("2024-03-31"),
        trial_start_date: Moment.moment("2022-01-01"),
        trial_end_date: Moment.moment("2025-12-31"),
      },
    },
    {
      name: "trial_term_values が undefined",
      trial_term_values: undefined,
      props: {
        trial_start_date: "2022-01-01",
        trial_end_date: "2024-12-31",
      },
      expect: {
        trial_target_start_date: Moment.moment(undefined),
        trial_target_end_date: Moment.moment(undefined),
        trial_start_date: Moment.moment("2022-01-01"),
        trial_end_date: Moment.moment("2024-12-31"),
      },
    },
  ];

  cases.forEach((c) => {
    const actualValue = buildTrialDates_(c.trial_term_values, c.props);
    const expectedValue = c.expect;
    assertEquals_(
      actualValue,
      expectedValue,
      `buildTrialDates_ should return correct dates for case: ${c.name}`,
    );
  });
}
function test_buildTrialDatesPure() {
  const cases = [
    {
      name: "すべて有効な日付",
      trial_term_values: (() => {
        const values = [];
        values[TRIAL_SHEET.COLUMNS.TRIAL_START - 1] = "2023-04-01";
        values[TRIAL_SHEET.COLUMNS.TRIAL_END - 1] = "2024-03-31";
        return values;
      })(),
      props: {
        trial_start_date: "2022-01-01",
        trial_end_date: "2025-12-31",
      },
      expect: {
        trial_target_start_date: new Date("2023-04-01"),
        trial_target_end_date: new Date("2024-03-31"),
        trial_start_date: new Date("2022-01-01"),
        trial_end_date: new Date("2025-12-31"),
      },
    },
    {
      name: "trial_term_values が undefined",
      trial_term_values: undefined,
      props: {
        trial_start_date: "2022-01-01",
        trial_end_date: "2024-12-31",
      },
      expect: {
        trial_target_start_date: null,
        trial_target_end_date: null,
        trial_start_date: new Date("2022-01-01"),
        trial_end_date: new Date("2024-12-31"),
      },
    },
  ];

  cases.forEach((c) => {
    const actualValue = buildTrialDatesPure_(c.trial_term_values, c.props);
    const expectedValue = c.expect;
    assertEquals_(
      actualValue,
      expectedValue,
      `buildTrialDates_ should return correct dates for case: ${c.name}`,
    );
  });
}
