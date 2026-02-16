function test_initTargetColumn() {
  const acutualValue = initTargetColumn_();
  const expectedValue = "F";
  assertEquals_(
    expectedValue,
    acutualValue,
    "initTargetColumn should return 'F'",
  );
}
function test_isClinicalTrialsOfficeRequired() {
  const trialTypeList = getTrialTypeListForTest_();
  trialTypeList.forEach((trialTypePropertyValue) =>
    test_isClinicalTrialsOfficeRequired_withProperty_(trialTypePropertyValue),
  );
}
/**
 * isClinicalTrialsOfficeRequired_ のテスト用共通関数
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
function test_isClinicalTrialsOfficeRequired_withProperty_(
  trialTypePropertyValue,
) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const PROPERTY_KEY = SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE;
  if (!PROPERTY_KEY) {
    throw new Error("SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE is not defined");
  }
  if (!QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL) {
    throw new Error("QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL is not defined");
  }

  const originalValue = scriptProperties.getProperty(PROPERTY_KEY);
  const value_yes = requireTestYesExistenceLabel_();
  const value_no = requireTestNoExistenceLabel_();
  const quotation_request_funding_source =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.FUNDING_SOURCE;
  if (!quotation_request_funding_source) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMES.FUNDING_SOURCE is not defined",
    );
  }
  const quotation_request_adjustment_office_existence =
    QUOTATION_REQUEST_SHEET.ITEMNAMES.ADJUSTMENT_OFFICE_EXISTENCE;
  if (!quotation_request_adjustment_office_existence) {
    throw new Error(
      "QUOTATION_REQUEST_SHEET.ITEMNAMES.ADJUSTMENT_OFFICE_EXISTENCE is not defined",
    );
  }
  const investigatorInitiatedTrialType =
    requireTestInvestigatorInitiatedTrialType_();

  try {
    // --- テスト用プロパティを設定 ---
    if (trialTypePropertyValue === null) {
      scriptProperties.deleteProperty(PROPERTY_KEY);
    } else {
      scriptProperties.setProperty(PROPERTY_KEY, trialTypePropertyValue);
    }
    [
      "公的資金（税金由来）",
      QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL,
      "",
    ].forEach((fundingSource) => {
      const temp_array_quotation_request =
        createTestQuotationRequestArrayWithColumn_(
          null,
          "AN",
          quotation_request_funding_source,
          fundingSource,
        );
      [value_yes, value_no, ""].forEach((officeExistence) => {
        const array_quotation_request =
          createTestQuotationRequestArrayWithColumn_(
            temp_array_quotation_request,
            "AQ",
            quotation_request_adjustment_office_existence,
            officeExistence,
          );
        let expectedValue = false;
        if (trialTypePropertyValue === investigatorInitiatedTrialType) {
          expectedValue = true;
        }
        if (fundingSource === QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL) {
          expectedValue = true;
        }
        if (officeExistence === value_yes) {
          expectedValue = true;
        }
        const actualValue = isClinicalTrialsOfficeRequired_(
          array_quotation_request,
        );
        assertEquals_(
          expectedValue,
          actualValue,
          `initClinicalTrialsOfficeFlg should return ${expectedValue} for trialType: ${trialTypePropertyValue}, fundingSource: ${fundingSource}, officeExistence: ${officeExistence}`,
        );
      });
    });
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
  const trialSheetName = TRIAL_SHEET.NAME;
  if (!trialSheetName) {
    throw new Error("TRIAL_SHEET.NAME is not defined");
  }
  const targetRange = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(trialSheetName)
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
      `test_buildTrialDatesPure_ should return correct dates for case: ${c.name}`,
    );
  });
}
