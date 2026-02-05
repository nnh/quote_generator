function test_calculateDatabaseManagementTermPure() {
  const targetSheetsName = getTargetSheetNameForTest_();
  const trialTargetTermsList = [15, 12, 6, 0];
  const setupTermList = [0, 3, 6, 12];
  const reg1SetupDatabaseManagementList = [0, 3, 6, 12];

  targetSheetsName.forEach((sheetName) => {
    trialTargetTermsList.forEach((trialTargetTerms) => {
      setupTermList.forEach((setupTerm) => {
        reg1SetupDatabaseManagementList.forEach(
          (reg1SetupDatabaseManagement) => {
            const expectedValue = getExpectedDatabaseManagementTerm_(
              sheetName,
              trialTargetTerms,
              setupTerm,
              reg1SetupDatabaseManagement,
            );
            if (expectedValue === null) {
              // sheetNameがSetupでtrialTargetTerms <= setupTermの場合のテストケースはスキップ
              // この条件は前処理で弾かれる前提のため
              console.log(
                `Skipped test case for sheetName[${sheetName}], trialTargetTerms[${trialTargetTerms}], setupTerm[${setupTerm}], reg1SetupDatabaseManagement[${reg1SetupDatabaseManagement}]`,
              );
              return;
            }

            const actualValue = calculateDatabaseManagementTermPure_(
              sheetName,
              trialTargetTerms,
              setupTerm,
              reg1SetupDatabaseManagement,
            );

            assertEquals_(
              actualValue,
              expectedValue,
              `test_calculateDatabaseManagementTermPure_ : シート[${sheetName}]、trialTargetTerms[${trialTargetTerms}]、setupTerm[${setupTerm}]、reg1SetupDatabaseManagement[${reg1SetupDatabaseManagement}]ならば[${expectedValue}]であること。 actual=[${actualValue}]`,
            );
          },
        );
      });
    });
  });
}

function getExpectedDatabaseManagementTerm_(
  sheetName,
  trialTargetTerms,
  setupTerm,
  reg1SetupDatabaseManagement,
) {
  const setupSheetName = getSetupSheetNameForTest_();
  const registration1_sheetName = getRegistration1SheetNameForTest_();
  // sheetNameがSetupでtrialTargetTerms <= setupTermの場合のテストケースはスキップ
  if (sheetName === setupSheetName && trialTargetTerms <= setupTerm) {
    return null;
  }
  let expected = Math.min(trialTargetTerms, 12);

  if (sheetName === setupSheetName) {
    expected -= setupTerm;
  }

  if (sheetName === registration1_sheetName) {
    expected -= reg1SetupDatabaseManagement;
  }

  return expected;
}

function test_calculateProjectManagementTerm() {
  assertEquals_(
    calculateProjectManagementTerm_(15),
    12,
    "プロジェクト管理料は最大12ヶ月",
  );
  assertEquals_(
    calculateProjectManagementTerm_(12),
    12,
    "プロジェクト管理料は最大12ヶ月",
  );
  assertEquals_(
    calculateProjectManagementTerm_(6),
    6,
    "プロジェクト管理料はtrialTargetTermsと同じ",
  );
  assertEquals_(
    calculateProjectManagementTerm_(0),
    0,
    "プロジェクト管理料はtrialTargetTermsと同じ",
  );
}
