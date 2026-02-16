function test_trialSheetWriter() {
  test_handleQuotationType_();
  test_normalizeCoefficient_();
  test_buildCdiscCrfFormula_();
}
function test_handleQuotationType_() {
  const actualFormal = handleQuotationType_("正式見積");
  const expectedFormal = "御見積書";

  assertEquals_(actualFormal, expectedFormal, "正式見積なら御見積書になること");

  const actualOther = handleQuotationType_("あああ");
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
