function testQuoteScript() {
  console.log("quote_script_mainのテストを開始します");
  initial_process();
  const sheet = get_sheets();
  testQuoteScript_(sheet);
}
function testQuoteScript_(sheet) {
  // 1.医師主導治験
  // PMDA相談資料作成支援がありかなしか
  const pmda = ["あり", "なし"];
  // 症例検討会がありかなしか
  const caseStudy = ["あり", "なし"];
  // 治験薬管理がありかなしか
  const drugManage = ["あり", "なし"];
  // 治験薬運搬がありかなしか
  const drugTransport = ["あり", "なし"];
  const testMapArray = [];
  // ついでにキックオフミーティングを
  const kickoffMeeting = ["あり", "なし"];
  const monitaring = [2, 0];
  const document = [4, 0];
  const audit = [7, 0];
  // 保険料
  const insurance = [100000, 0];
  // 効果安全性管理事務局設置
  const safetyOffice = ["設置・委託する", "設置しない、または委託しない"];
  // 安全性管理事務局設置
  const efficiencyOffice = ["設置・委託する", "設置しない、または委託しない"];
  // 中間解析業務の依頼
  const interim = ["あり", "なし"];
  // 最終解析業務の依頼
  const final = ["あり", "なし"];
  const finalTables = [51, 49];
  // 研究協力費
  const researchSupport = ["あり", "なし"];
  const researchSupportAmount = [300000, 0];
  // 試験開始準備費用
  const startupCost = ["あり", "なし"];
  // 症例登録毎の支払
  const perCasePayment = ["あり", "なし"];
  // 症例最終報告書提出毎の支払
  const finalReportPayment = ["あり", "なし"];
  for (let i = 0; i < 2; i++) {
    const newMap = getQuotationRequestTemplateMap_();
    newMap.set("試験種別", "医師主導治験");
    newMap.set("PMDA相談資料作成支援", pmda[i]);
    newMap.set("症例検討会", caseStudy[i]);
    newMap.set("治験薬管理", drugManage[i]);
    newMap.set("治験薬運搬", drugTransport[i]);
    newMap.set("キックオフミーティング", kickoffMeeting[i]);
    newMap.set("1例あたりの実地モニタリング回数", monitaring[i]);
    newMap.set("年間1施設あたりの必須文書実地モニタリング回数", document[i]);
    newMap.set("監査対象施設数", audit[i]);
    newMap.set("保険料", insurance[i]);
    newMap.set("効安事務局設置", efficiencyOffice[i]);
    newMap.set("安全性管理事務局設置", safetyOffice[i]);
    newMap.set("中間解析業務の依頼", interim[i]);
    newMap.set("最終解析業務の依頼", final[i]);
    newMap.set("統計解析に必要な図表数", finalTables[i]);
    newMap.set("研究協力費、負担軽減費", researchSupport[i]);
    newMap.set("研究協力費、負担軽減費配分管理", researchSupportAmount[i]);
    newMap.set("試験開始準備費用", startupCost[i]);
    newMap.set("症例登録毎の支払", perCasePayment[i]);
    newMap.set("症例最終報告書提出毎の支払", finalReportPayment[i]);
    testMapArray.push(newMap);
    const arr = mapTo2DArrayQuotationRequest_(newMap);
    const valueArr = [[...arr[1]]];
    setQuotationRequestTestData_(sheet, valueArr);
    quote_script_main();
    console.log(
      `✅ quote_script_main test completed successfully: ${newMap.get(
        "試験種別"
      )} ${i + 1}`
    );
  }
  // 2.特定臨床研究
  // CRB申請がありかなしか
  const crb = ["あり", "なし"];
  // 研究結果報告書作成支援がありかなしか
  const res = ["あり", "なし"];
  // ついでに事務局運営を
  const office = ["あり", "なし"];
  // ついでにAMED申請資料作成支援を
  const amed = ["あり", "なし"];
  for (let i = 0; i < 2; i++) {
    const newMap = getQuotationRequestTemplateMap_();
    newMap.set("試験種別", "特定臨床研究");
    newMap.set("CRB申請", crb[i]);
    newMap.set("研究結果報告書作成支援", res[i]);
    newMap.set("事務局運営", office[i]);
    newMap.set("AMED申請資料作成支援", amed[i]);
    newMap.set("中間解析業務の依頼", interim[i]);
    newMap.set("最終解析業務の依頼", final[i]);
    newMap.set("統計解析に必要な図表数", finalTables[i]);
    newMap.set("研究協力費、負担軽減費", researchSupport[i]);
    newMap.set("研究協力費、負担軽減費配分管理", researchSupportAmount[i]);
    if (i === 0) {
      newMap.set("試験開始準備費用", "あり");
      newMap.set("症例登録毎の支払", "なし");
      newMap.set("症例最終報告書提出毎の支払", "");
    } else {
      newMap.set("試験開始準備費用", "なし");
      newMap.set("症例登録毎の支払", "あり");
      newMap.set("症例最終報告書提出毎の支払", "なし");
    }
    testMapArray.push(newMap);
    const arr = mapTo2DArrayQuotationRequest_(newMap);
    const valueArr = [[...arr[1]]];
    setQuotationRequestTestData_(sheet, valueArr);
    quote_script_main();
    console.log(
      `✅ quote_script_main test completed successfully: ${newMap.get(
        "試験種別"
      )} ${i + 1}`
    );
  }
}
function checkBlankTotalSheetCellValue_(rowNumber, sheet) {
  if (sheet.total.getRange(`F${rowNumber}`).getValue() !== "") {
    throw new Error(
      `TotalシートのF${rowNumber}が空白ではありません。 実際の値:${sheet.total
        .getRange(`F${rowNumber}`)
        .getValue()}`
    );
  }
}
function getTestTotalSheetValues_(sheet, testMap) {
  // 空白であるべきセルのチェック
  [
    1, 2, 3, 4, 5, 8, 10, 14, 27, 31, 35, 36, 39, 44, 47, 50, 53, 59, 61, 65,
    69, 73, 76, 79, 81, 96, 97, 98, 99,
  ].forEach((rowNumber) => checkBlankTotalSheetCellValue_(rowNumber, sheet));
  if (sheet.total.getRange("F6").getValue() !== 1) {
    throw new Error(
      `TotalシートのF6の値が異なります。期待値:1 実際の値:${sheet.total
        .getRange("F6")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F7").getValue() !== 4) {
    throw new Error(
      `TotalシートのF7の値が異なります。期待値:4 実際の値:${sheet.total
        .getRange("F7")
        .getValue()}`
    );
  }
  const pmdaSupport = testMap.get("PMDA相談資料作成支援") === "あり" ? 1 : 0;
  if (sheet.total.getRange("F9").getValue() !== pmdaSupport) {
    throw new Error(
      `TotalシートのF9の値が異なります。期待値:${pmdaSupport} 実際の値:${sheet.total
        .getRange("F9")
        .getValue()}`
    );
  }
  const amedSupport = testMap.get("AMED申請資料作成支援") === "あり" ? 1 : 0;
  if (sheet.total.getRange("F11").getValue() !== amedSupport) {
    throw new Error(
      `TotalシートのF11の値が異なります。期待値:${amedSupport} 実際の値:${sheet.total
        .getRange("F11")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F13").getValue() !== 48) {
    throw new Error(
      `TotalシートのF13の値が異なります。期待値:48 実際の値:${sheet.total
        .getRange("F13")
        .getValue()}`
    );
  }
  const office1 = testMap.get("試験種別") === "医師主導治験" ? 6 : 0;
  if (sheet.total.getRange("F15").getValue() !== office1) {
    throw new Error(
      `TotalシートのF15の値が異なります。期待値:${office1} 実際の値:${sheet.total
        .getRange("F15")
        .getValue()}`
    );
  }
  const kickoff = testMap.get("キックオフミーティング") === "あり" ? 1 : 0;
  if (sheet.total.getRange("F16").getValue() !== kickoff) {
    throw new Error(
      `TotalシートのF16の値が異なります。期待値:${kickoff} 実際の値:${sheet.total
        .getRange("F16")
        .getValue()}`
    );
  }
  const caseStudy = testMap.get("症例検討会") === "あり" ? 1 : 0;
  if (sheet.total.getRange("F17").getValue() !== caseStudy) {
    throw new Error(
      `TotalシートのF17の値が異なります。期待値:${caseStudy} 実際の値:${sheet.total
        .getRange("F17")
        .getValue()}`
    );
  }
  const sop = testMap.get("試験種別") === "医師主導治験" ? 1 : 0;
  if (sheet.total.getRange("F18").getValue() !== sop) {
    throw new Error(
      `TotalシートのF18の値が異なります。期待値:${sop} 実際の値:${sheet.total
        .getRange("F18")
        .getValue()}`
    );
  }
  const irb = testMap.get("試験種別") === "医師主導治験" ? 1 : 0;
  if (sheet.total.getRange("F19").getValue() !== irb) {
    throw new Error(
      `TotalシートのF19の値が異なります。期待値:${irb} 実際の値:${sheet.total
        .getRange("F19")
        .getValue()}`
    );
  }
  // 特定臨床研究法申請
  const irbApp = testMap.get("試験種別") === "特定臨床研究" ? 10 : 0;
  if (sheet.total.getRange("F20").getValue() !== irbApp) {
    throw new Error(
      `TotalシートのF20の値が異なります。期待値:${irbApp} 実際の値:${sheet.total
        .getRange("F20")
        .getValue()}`
    );
  }
  // 契約・支払手続、実施計画提出支援
  if (sheet.total.getRange("F21").getValue() !== 0) {
    throw new Error(
      `TotalシートのF21の値が異なります。期待値:0 実際の値:${sheet.total
        .getRange("F21")
        .getValue()}`
    );
  }
  const drug = testMap.get("試験種別") === "医師主導治験" ? 10 : 0;
  if (sheet.total.getRange("F22").getValue() !== drug) {
    throw new Error(
      `TotalシートのF22の値が異なります。期待値:${drug} 実際の値:${sheet.total
        .getRange("F22")
        .getValue()}`
    );
  }
  const office2 = testMap.get("試験種別") === "医師主導治験" ? 36 : 0;
  if (sheet.total.getRange("F23").getValue() !== office2) {
    throw new Error(
      `TotalシートのF23の値が異なります。期待値:${office2} 実際の値:${sheet.total
        .getRange("F23")
        .getValue()}`
    );
  }
  const office3 = testMap.get("試験種別") === "医師主導治験" ? 1 : 0;
  if (sheet.total.getRange("F24").getValue() !== office3) {
    throw new Error(
      `TotalシートのF24の値が異なります。期待値:${office3} 実際の値:${sheet.total
        .getRange("F24")
        .getValue()}`
    );
  }
  //PMDA対応、照会事項対応
  if (sheet.total.getRange("F25").getValue() !== 0) {
    throw new Error(
      `TotalシートのF25の値が異なります。期待値:0 実際の値:${sheet.total
        .getRange("F25")
        .getValue()}`
    );
  }
  const auditOffice = testMap.get("試験種別") === "医師主導治験" ? 1 : 0;
  if (sheet.total.getRange("F26").getValue() !== auditOffice) {
    throw new Error(
      `TotalシートのF26の値が異なります。期待値:${auditOffice} 実際の値:${sheet.total
        .getRange("F26")
        .getValue()}`
    );
  }
  const monitoringPre = monitoring > 0 ? 1 : 0;
  if (sheet.total.getRange("F28").getValue() !== monitoringPre) {
    throw new Error(
      `TotalシートのF28の値が異なります。期待値:${monitoringPre} 実際の値:${sheet.total
        .getRange("F28")
        .getValue()}`
    );
  }
  const documentNum = testMap.get(
    "年間1施設あたりの必須文書実地モニタリング回数"
  )
    ? 40
    : 0;
  if (sheet.total.getRange("F29").getValue() !== documentNum) {
    throw new Error(
      `TotalシートのF29の値が異なります。期待値:${documentNum} 実際の値:${sheet.total
        .getRange("F29")
        .getValue()}`
    );
  }
  const monitoring = testMap.get("1例あたりの実地モニタリング回数") ? 200 : 0;
  if (sheet.total.getRange("F30").getValue() !== monitoring) {
    throw new Error(
      `TotalシートのF30の値が異なります。期待値:${monitoring} 実際の値:${sheet.total
        .getRange("F30")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F32").getValue() !== 0) {
    throw new Error(
      `TotalシートのF32の値が異なります。期待値:0 実際の値:${sheet.total
        .getRange("F32")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F33").getValue() !== 1) {
    throw new Error(
      `TotalシートのF33の値が異なります。期待値:1 実際の値:${sheet.total
        .getRange("F33")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F34").getValue() !== 42) {
    throw new Error(
      `TotalシートのF34の値が異なります。期待値:42 実際の値:${sheet.total
        .getRange("F34")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F37").getValue() !== 1) {
    throw new Error(
      `TotalシートのF37の値が異なります。期待値:1 実際の値:${sheet.total
        .getRange("F37")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F38").getValue() !== 0) {
    throw new Error(
      `TotalシートのF38の値が異なります。期待値:0 実際の値:${sheet.total
        .getRange("F38")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F40").getValue() !== 1) {
    throw new Error(
      `TotalシートのF40の値が異なります。期待値:1 実際の値:${sheet.total
        .getRange("F40")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F41").getValue() !== 1) {
    throw new Error(
      `TotalシートのF41の値が異なります。期待値:1 実際の値:${sheet.total
        .getRange("F41")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F42").getValue() !== 10) {
    throw new Error(
      `TotalシートのF42の値が異なります。期待値:10 実際の値:${sheet.total
        .getRange("F42")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F43").getValue() !== 1) {
    throw new Error(
      `TotalシートのF43の値が異なります。期待値:1 実際の値:${sheet.total
        .getRange("F43")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F45").getValue() !== 36) {
    throw new Error(
      `TotalシートのF45の値が異なります。期待値:36 実際の値:${sheet.total
        .getRange("F45")
        .getValue()}`
    );
  }
  const dataCleaning = testMap.get("最終解析業務の依頼") === "あり" ? 3 : 1;
  if (sheet.total.getRange("F46").getValue() !== dataCleaning) {
    throw new Error(
      `TotalシートのF46の値が異なります。期待値:${dataCleaning} 実際の値:${sheet.total
        .getRange("F46")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F48").getValue() !== 1) {
    throw new Error(
      `TotalシートのF48の値が異なります。期待値:1 実際の値:${sheet.total
        .getRange("F48")
        .getValue()}`
    );
  }
  const caseStudyCount = testMap.get("症例検討会") === "あり" ? 1 : 0;
  if (sheet.total.getRange("F49").getValue() !== caseStudyCount) {
    throw new Error(
      `TotalシートのF49の値が異なります。期待値:${caseStudyCount} 実際の値:${sheet.total
        .getRange("F49")
        .getValue()}`
    );
  }
  const kouan =
    testMap.get("効果安全性管理事務局設置") === "設置・委託する" ? 36 : 0;
  if (sheet.total.getRange("F51").getValue() !== kouan) {
    throw new Error(
      `TotalシートのF51の値が異なります。期待値:${kouan} 実際の値:${sheet.total
        .getRange("F51")
        .getValue()}`
    );
  }
  const ankan =
    testMap.get("安全性管理事務局設置") === "設置・委託する" ? 36 : 0;
  if (sheet.total.getRange("F52").getValue() !== ankan) {
    throw new Error(
      `TotalシートのF52の値が異なります。期待値:${ankan} 実際の値:${sheet.total
        .getRange("F52")
        .getValue()}`
    );
  }
  const analysis = testMap.get("最終解析業務の依頼") === "あり" ? 2 : 0;
  if (sheet.total.getRange("F54").getValue() !== analysis) {
    throw new Error(
      `TotalシートのF54の値が異なります。期待値:${analysis} 実際の値:${sheet.total
        .getRange("F54")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F55").getValue() !== 0) {
    throw new Error(
      `TotalシートのF55の値が異なります。期待値:1 実際の値:${sheet.total
        .getRange("F55")
        .getValue()}`
    );
  }
  if (sheet.total.getRange("F56").getValue() !== 0) {
    throw new Error(
      `TotalシートのF56の値が異なります。期待値:0 実際の値:${sheet.total
        .getRange("F56")
        .getValue()}`
    );
  }
  const tables =
    testMap.get("統計解析に必要な図表数") > 0 &&
    testMap.get("統計解析に必要な図表数") < 50 &&
    testMap.get("試験種別") === "医師主導治験"
      ? 50
      : testMap.get("統計解析に必要な図表数");
  if (sheet.total.getRange("F57").getValue() !== tables) {
    throw new Error(
      `TotalシートのF57の値が異なります。期待値:${tables} 実際の値:${sheet.total
        .getRange("F57")
        .getValue()}`
    );
  }
  const analysisReport = tables > 0 ? 1 : 0;
  if (sheet.total.getRange("F58").getValue() !== analysisReport) {
    throw new Error(
      `TotalシートのF58の値が異なります。期待値:${analysisReport} 実際の値:${sheet.total
        .getRange("F58")
        .getValue()}`
    );
  }
  const csr = testMap.get("研究結果報告書作成支援") === "あり" ? 1 : 0;
  if (sheet.total.getRange("F60").getValue() !== csr) {
    throw new Error(
      `TotalシートのF60の値が異なります。期待値:${csr} 実際の値:${sheet.total
        .getRange("F60")
        .getValue()}`
    );
  }
  [62, 63, 64].forEach((rowNumber) => {
    if (sheet.total.getRange(`F${rowNumber}`).getValue() !== 0) {
      throw new Error(
        `TotalシートのF${rowNumber}の値が異なります。期待値:0 実際の値:${sheet.total
          .getRange(`F${rowNumber}`)
          .getValue()}`
      );
    }
  });
  const startup = testMap.get("試験開始準備費用") === "あり" ? 10 : 0;
  if (sheet.total.getRange("F66").getValue() !== startup) {
    throw new Error(
      `TotalシートのF66の値が異なります。期待値:${startup} 実際の値:${sheet.total
        .getRange("F66")
        .getValue()}`
    );
  }
  const perCase = testMap.get("症例登録毎の支払") === "あり" ? 100 : 0;
  if (sheet.total.getRange("F67").getValue() !== perCase) {
    throw new Error(
      `TotalシートのF67の値が異なります。期待値:${perCase} 実際の値:${sheet.total
        .getRange("F67")
        .getValue()}`
    );
  }
  const finalReport =
    testMap.get("症例最終報告書提出毎の支払") === "あり" ? 100 : 0;
  if (sheet.total.getRange("F68").getValue() !== finalReport) {
    throw new Error(
      `TotalシートのF68の値が異なります。期待値:${finalReport} 実際の値:${sheet.total
        .getRange("F68")
        .getValue()}`
    );
  }

  [70, 71, 72].forEach((rowNumber) => {
    if (sheet.total.getRange(`F${rowNumber}`).getValue() !== 0) {
      throw new Error(
        `TotalシートのF${rowNumber}の値が異なります。期待値:0 実際の値:${sheet.total
          .getRange(`F${rowNumber}`)
          .getValue()}`
      );
    }
  });
  const crb1st = testMap.get("CRB申請") === "あり" ? 1 : 0;
  if (sheet.total.getRange("F74").getValue() !== crb1st) {
    throw new Error(
      `TotalシートのF74の値が異なります。期待値:${crb1st} 実際の値:${sheet.total
        .getRange("F74")
        .getValue()}`
    );
  }
  const crb2nd = testMap.get("CRB申請") === "あり" ? 2 : 0;
  if (sheet.total.getRange("F75").getValue() !== crb2nd) {
    throw new Error(
      `TotalシートのF75の値が異なります。期待値:${crb2nd} 実際の値:${sheet.total
        .getRange("F75")
        .getValue()}`
    );
  }
  const auditNum = testMap.get("監査対象施設数") ? 2 : 0;
  if (sheet.total.getRange("F77").getValue() !== auditNum) {
    throw new Error(
      `TotalシートのF77の値が異なります。期待値:${auditNum} 実際の値:${sheet.total
        .getRange("F77")
        .getValue()}`
    );
  }
  if (
    String(sheet.total.getRange("F78").getValue()) !==
    String(testMap.get("監査対象施設数"))
  ) {
    throw new Error(
      `TotalシートのF78の値が異なります。期待値:${String(
        testMap.get("監査対象施設数")
      )} 実際の値:${String(sheet.total.getRange("F78").getValue())}`
    );
  }
  const insurance = testMap.get("保険料") > 0 ? 1 : 0;
  if (sheet.total.getRange("F80").getValue() !== insurance) {
    throw new Error(
      `TotalシートのF80の値が異なります。期待値:${insurance} 実際の値:${sheet.total
        .getRange("F80")
        .getValue()}`
    );
  }
  if (insurance > 0) {
    if (sheet.total.getRange("H80").getValue() !== 100000) {
      throw new Error(
        `TotalシートのH80の値が異なります。期待値:100000 実際の値:${sheet.total
          .getRange("H80")
          .getValue()}`
      );
    }
  }
  if (sheet.total.getRange("F82").getValue() !== 0) {
    throw new Error(
      `TotalシートのF82の値が異なります。期待値:0 実際の値:${sheet.total
        .getRange("F82")
        .getValue()}`
    );
  }
  const drugTransport = testMap.get("治験薬運搬") === "あり" ? 30 : 0;
  if (sheet.total.getRange("F83").getValue() !== drugTransport) {
    throw new Error(
      `TotalシートのF83の値が異なります。期待値:${drugTransport} 実際の値:${sheet.total
        .getRange("F83")
        .getValue()}`
    );
  }
  const drugManage = testMap.get("治験薬管理") === "あり" ? 1 : 0;
  if (sheet.total.getRange("F84").getValue() !== drugManage) {
    throw new Error(
      `TotalシートのF84の値が異なります。期待値:${drugManage} 実際の値:${sheet.total
        .getRange("F84")
        .getValue()}`
    );
  }
  [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95].forEach((rowNumber) => {
    if (sheet.total.getRange(`F${rowNumber}`).getValue() !== 0) {
      throw new Error(
        `TotalシートのF${rowNumber}の値が異なります。期待値:0 実際の値:${sheet.total
          .getRange(`F${rowNumber}`)
          .getValue()}`
      );
    }
  });
}
