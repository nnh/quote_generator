function testSetTrialSheetCommon_() {
  console.log("trialシートの値設定テストを開始します");
  initial_process();
  const sheet = get_sheets();
  // 見積種別が本見積か参考見積か
  const quotetypeArray = ["正式見積", "参考見積"];
  // 原資が公的資金（税金由来）か営利企業原資（製薬企業等）か
  const fundsourceArray = [
    "公的資金（税金由来）",
    "営利企業原資（製薬企業等）",
  ];
  // CDISC対応がありかなしか
  const cdiscSupportArray = ["あり", "なし"];
  const testMapArray = [];
  for (let i = 0; i < 2; i++) {
    const newMap = getQuotationRequestTemplateMap_();
    newMap.set("見積種別", quotetypeArray[i]);
    newMap.set("原資", fundsourceArray[i]);
    newMap.set("CDISC対応", cdiscSupportArray[i]);
    testMapArray.push(newMap);
    const arr = mapTo2DArrayQuotationRequest_(newMap);
    const valueArr = [[...arr[1]]];
    setQuotationRequestTestData_(sheet, valueArr);
    execTestSetTrialSheet_(sheet);
    getTestTrialSheetValues_(sheet, testMapArray[i]);
    console.log(
      `✅ trialシートの値が正しいことを確認しました。Trialシートを初期化します。：パターン${
        i + 1
      } / 2`
    );
  }
}
function getTestTrialSheetValues_(sheet, testMap) {
  const commentValues = sheet.trial.getRange("B12:B26").getValues().flat();
  const quoteTypeValue =
    testMap.get("見積種別") === "正式見積" ? "御見積書" : "御参考見積書";
  if (sheet.trial.getRange("B2").getValue() !== quoteTypeValue) {
    throw new Error(
      `見積種別の値が異なります。期待値:${quoteTypeValue} 実際の値:${sheet.trial
        .getRange("B2")
        .getValue()}`
    );
  } else {
    sheet.trial.getRange("B2").clearContent();
  }
  if (sheet.trial.getRange("B4").getValue() !== testMap.get("見積発行先")) {
    throw new Error(
      `見積発行先の値が異なります。期待値:${testMap.get(
        "見積発行先"
      )} 実際の値:${sheet.trial.getRange("B4").getValue()}`
    );
  } else {
    sheet.trial.getRange("B4").clearContent();
  }
  if (sheet.trial.getRange("B8").getValue() !== testMap.get("研究代表者名")) {
    throw new Error(
      `研究代表者名の値が異なります。期待値:${testMap.get(
        "研究代表者名"
      )} 実際の値:${sheet.trial.getRange("B8").getValue()}`
    );
  } else {
    sheet.trial.getRange("B8").clearContent();
  }
  if (sheet.trial.getRange("B9").getValue() !== testMap.get("試験課題名")) {
    throw new Error(
      `試験課題名の値が異なります。期待値:${testMap.get(
        "試験課題名"
      )} 実際の値:${sheet.trial.getRange("B9").getValue()}`
    );
  } else {
    sheet.trial.getRange("B9").clearContent();
  }
  if (sheet.trial.getRange("B10").getValue() !== testMap.get("試験実施番号")) {
    throw new Error(
      `試験実施番号の値が異なります。期待値:${testMap.get(
        "試験実施番号"
      )} 実際の値:${sheet.trial.getRange("B10").getValue()}`
    );
  } else {
    sheet.trial.getRange("B10").clearContent();
  }
  if (
    String(sheet.trial.getRange("B28").getValue()) !==
    String(testMap.get("目標症例数"))
  ) {
    throw new Error(
      `目標症例数の値が異なります。期待値:${testMap.get(
        "目標症例数"
      )} 実際の値:${sheet.trial.getRange("B28").getValue()}`
    );
  } else {
    sheet.trial.getRange("B28").clearContent();
  }
  if (
    String(sheet.trial.getRange("B29").getValue()) !==
    String(testMap.get("実施施設数"))
  ) {
    throw new Error(
      `実施施設数の値が異なります。期待値:${testMap.get(
        "実施施設数"
      )} 実際の値:${sheet.trial.getRange("B29").getValue()}`
    );
  } else {
    sheet.trial.getRange("B29").clearContent();
  }
  const crfCount =
    testMap.get("CDISC対応") === "あり"
      ? Number(testMap.get("CRF項目数")) * 3
      : testMap.get("CRF項目数");
  if (String(sheet.trial.getRange("B30").getValue()) !== String(crfCount)) {
    throw new Error(
      `CRF項目数の値が異なります。期待値:${crfCount} 実際の値:${sheet.trial
        .getRange("B30")
        .getValue()}`
    );
  } else {
    sheet.trial.getRange("B30").clearContent();
  }
  // CDISCあり・なしでコメントが変わることを確認
  const cdiscComment =
    testMap.get("CDISC対応") === "あり"
      ? `CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり${crfCount}項目と想定しております。`
      : `CRFのべ項目数を一症例あたり${crfCount}項目と想定しております。`;
  if (!commentValues.includes(cdiscComment)) {
    throw new Error(`CDISC対応のコメントが異なります。期待値:${cdiscComment}`);
  }
  // 原資
  const fundsourceValue =
    testMap.get("原資") === "公的資金（税金由来）" ? 1 : 1.5;
  if (
    String(sheet.trial.getRange("B44").getValue()) !== String(fundsourceValue)
  ) {
    throw new Error(
      `原資の値が異なります。期待値:${fundsourceValue} 実際の値:${sheet.trial
        .getRange("B44")
        .getValue()}`
    );
  } else {
    sheet.trial.getRange("B44").clearContent();
  }
}

function execTestSetTrialSheet_(sheet) {
  const quotation_request_last_col = sheet.quotation_request
    .getDataRange()
    .getLastColumn();
  const array_quotation_request = sheet.quotation_request
    .getRange(1, 1, 2, quotation_request_last_col)
    .getValues();
  filtervisible();
  set_trial_sheet_(sheet, array_quotation_request);
  SpreadsheetApp.flush();
}
