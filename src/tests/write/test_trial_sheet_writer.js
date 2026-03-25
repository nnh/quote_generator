function test_trialSheetWriter() {
  test_convertQuotationTypeLabel_();
  test_normalizeCoefficient_();
  test_convertCrfValueForCdisc_();
  test_buildCdiscCrfFormula_();
  test_resolveTrialFieldValue_();
}
function test_convertQuotationTypeLabel_() {
  const actualFormal = convertQuotationTypeLabel_("正式見積");
  const expectedFormal = "御見積書";

  assertEquals_(actualFormal, expectedFormal, "正式見積なら御見積書になること");

  const actualOther = convertQuotationTypeLabel_("あああ");
  const expectedOther = "御参考見積書";

  assertEquals_(
    actualOther,
    expectedOther,
    "正式見積以外なら御参考見積書になること",
  );
}
function test_normalizeCoefficient_() {
  const commercial = QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL;
  if (commercial === undefined) {
    throw new Error(
      "QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABELが定義されていません。trial_sheet_writer.jsの定数を確認してください。",
    );
  }

  // --- CASE 1 : 商用企業 ---
  const actualCommercial = normalizeCoefficient_(commercial);
  const expectedCommercial = 1.5;

  assertEquals_(
    actualCommercial,
    expectedCommercial,
    "商用企業の場合は1.5になること",
  );

  // --- CASE 2 : それ以外 ---
  const actualOther = normalizeCoefficient_("あああ");
  const expectedOther = 1;

  assertEquals_(actualOther, expectedOther, "商用企業以外は1になること");

  // --- CASE 3 : 空 ---
  const actualEmpty = normalizeCoefficient_("");
  const expectedEmpty = 1;

  assertEquals_(actualEmpty, expectedEmpty, "空の場合は1になること");
}
function test_buildCdiscCrfFormula_() {
  // --- number ---
  const actualNumber = buildCdiscCrfFormula_(10);
  const expectedNumber = `=10*${CDISC_ADDITION}`;

  assertEquals_(actualNumber, expectedNumber, "数値はそのまま式になること");

  // --- string ---
  const actualString = buildCdiscCrfFormula_("10");
  const expectedString = `="10"*${CDISC_ADDITION}`;

  assertEquals_(
    actualString,
    expectedString,
    "文字列はクォート付きで式になること",
  );
}
function test_resolveTrialFieldValue_() {
  test_resolveTrialFieldValue_null();
  test_resolveTrialFieldValue_quotationType();
  test_resolveTrialFieldValue_fundingSource();
  test_resolveTrialFieldValue_crf();
  test_resolveTrialFieldValue_default();
}
function test_resolveTrialFieldValue_null() {
  const actual = resolveTrialFieldValue_("何でもいい", null);
  const expected = null;

  assertEquals_(actual, expected, "nullの場合はnullが返ること");
}
function test_resolveTrialFieldValue_quotationType() {
  const key = TRIAL_SHEET.ITEMNAMES.QUOTATION_TYPE;

  const actual = resolveTrialFieldValue_(key, "正式見積");
  const expected = "御見積書";

  assertEquals_(
    actual,
    expected,
    "QUOTATION_TYPEはconvertQuotationTypeLabel_が適用されること",
  );
}
function test_resolveTrialFieldValue_fundingSource() {
  const key = ITEM_LABELS.FUNDING_SOURCE_LABEL;
  const commercial = QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL;

  const actual = resolveTrialFieldValue_(key, commercial);
  const expected = 1.5;

  assertEquals_(
    actual,
    expected,
    "FUNDING_SOURCEはnormalizeCoefficient_が適用されること",
  );
}
function test_resolveTrialFieldValue_crf() {
  const key = TRIAL_SHEET.ITEMNAMES.CRF;

  const actual = resolveTrialFieldValue_(key, 10, {
    isCdiscEnabled: true,
  });

  const expected = `=10*${CDISC_ADDITION}`;

  assertEquals_(actual, expected, "CDISCありの場合は式になる");
}
function test_resolveTrialFieldValue_default() {
  const actual = resolveTrialFieldValue_("未知キー", "そのまま値");
  const expected = "そのまま値";

  assertEquals_(actual, expected, "対象外キーはそのまま返ること");
}

function test_convertCrfValueForCdisc_() {
  // CDISCあり
  const actualEnabled = convertCrfValueForCdisc_(10, true);
  const expectedEnabled = `=10*${CDISC_ADDITION}`;

  assertEquals_(actualEnabled, expectedEnabled, "CDISCありの場合は式になる");

  // CDISCなし
  const actualDisabled = convertCrfValueForCdisc_(10, false);

  assertEquals_(actualDisabled, 10, "CDISCなしの場合はそのまま");
}
