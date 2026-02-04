function test_calcClinicalTrialsOfficeValues() {
  const registration1_sheetName = "Registration_1";
  // case1
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "3",
    {
      clinicalTrialsOfficeFlg: false,
      registrationMonth: 12,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 0,
      registrationOffice: 0,
    },
    "事務局運営なしの場合は、Setup / Registration 共に 0 になること",
  );
  // case2
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "4",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 12,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 4,
      registrationOffice: 12,
    },
    "事務局運営ありの場合、Setupシートにregistration期間が存在する場合はその期間がsetupOfficeにセットされること",
  );
  // case3
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "0",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 12,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 0,
      registrationOffice: 12,
    },
    "事務局運営ありの場合、Setupシートのregistration期間が不明であればsetupOfficeは0になること",
  );
  // case4
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "6",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 12,
      sheetname: "Registration_2",
    },
    {
      setupOffice: 0,
      registrationOffice: 12,
    },
    "事務局運営ありの場合、Setupシート以外ではsetupOfficeは0になること",
  );
  // case5
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "6",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 0,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 6,
      registrationOffice: 0,
    },
    "事務局運営ありの場合、registration期間が0であってもsetupOfficeはプロパティの値がセットされること",
  );
  // case6
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "abc",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 12,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 0,
      registrationOffice: 12,
    },
    "事務局運営ありの場合、Setupのregistration期間のプロパティの値が数値に変換できない場合はsetupOfficeは0になること",
  );
  // case7
  test_calcClinicalTrialsOfficeValues_withProperty_(
    "0",
    {
      clinicalTrialsOfficeFlg: true,
      registrationMonth: 9,
      sheetname: registration1_sheetName,
    },
    {
      setupOffice: 0,
      registrationOffice: 9,
    },
    "registration期間が12以下の場合も正しくセットされること",
  );
}

function test_calcClinicalTrialsOfficeValues_withProperty_(
  propertySetValue = "0",
  params,
  expected,
  testname,
) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const PROPERTY_KEY = "reg1_setup_clinical_trials_office";

  const originalValue = scriptProperties.getProperty(PROPERTY_KEY);

  try {
    // --- テスト用プロパティをセット ---
    scriptProperties.setProperty(PROPERTY_KEY, propertySetValue);

    const clinicalTrialsOfficeFlg = params.clinicalTrialsOfficeFlg;
    const registrationMonth = params.registrationMonth;
    const sheetname = params.sheetname;

    const actual = calcClinicalTrialsOfficeValues_({
      clinicalTrialsOfficeFlg: clinicalTrialsOfficeFlg,
      registrationMonth: registrationMonth,
      sheetname: sheetname,
    });

    assertEquals_(actual, expected, testname);
  } finally {
    // --- プロパティを必ず元に戻す ---
    if (originalValue === null) {
      scriptProperties.deleteProperty(PROPERTY_KEY);
    } else {
      scriptProperties.setProperty(PROPERTY_KEY, originalValue);
    }
  }
}
