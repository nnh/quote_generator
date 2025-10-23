function testSheetShowHidden_() {
  console.log("シートの表示・非表示切替テストを開始します");
  const sheet = get_sheets();
  const trialTermRange = sheet.trial.getRange("D32:E40");
  const testValueArray = [];
  // パターン1:　全て表示
  const pattern1 = [
    ["2000/04/01", "2001/03/31"],
    ["2001/04/01", "2002/03/31"],
    ["2002/04/01", "2003/03/31"],
    ["2003/04/01", "2004/03/31"],
    ["2004/04/01", "2005/03/31"],
    ["2005/04/01", "2006/03/31"],
    ["2006/04/01", "2007/03/31"],
    ["2007/04/01", "2008/03/31"],
    ["2000/04/01", "2008/03/31"],
  ];
  testValueArray.push(pattern1);
  // パターン2:　Setupだけ表示
  const pattern2 = [
    ["2000/04/01", "2001/03/31"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2000/04/01", "2001/03/31"],
  ];
  testValueArray.push(pattern2);
  // パターン3:　Closingだけ表示
  const pattern3 = [
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2000/04/01", "2001/03/31"],
    ["2000/04/01", "2001/03/31"],
  ];
  testValueArray.push(pattern3);
  // パターン4:　Registration_1とObservation_2だけ表示
  const pattern4 = [
    ["", ""],
    ["2000/04/01", "2001/03/31"],
    ["", ""],
    ["", ""],
    ["2001/04/01", "2002/03/31"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2000/04/01", "2002/03/31"],
  ];
  testValueArray.push(pattern4);
  for (let i = 0; i < testValueArray.length; i++) {
    trialTermRange.setValues(testValueArray[i]);
    quote_toggle_trial_phase_sheets_();
    if (i === 0) {
      if (
        sheet.setup.isSheetHidden() ||
        sheet.registration_1.isSheetHidden() ||
        sheet.registration_2.isSheetHidden() ||
        sheet.interim_1.isSheetHidden() ||
        sheet.observation_1.isSheetHidden() ||
        sheet.interim_2.isSheetHidden() ||
        sheet.observation_2.isSheetHidden() ||
        sheet.closing.isSheetHidden()
      ) {
        throw new Error("パターン1の表示状態が正しくありません");
      }
    }
    if (i === 1) {
      if (
        sheet.setup.isSheetHidden() ||
        !sheet.registration_1.isSheetHidden() ||
        !sheet.registration_2.isSheetHidden() ||
        !sheet.interim_1.isSheetHidden() ||
        !sheet.observation_1.isSheetHidden() ||
        !sheet.interim_2.isSheetHidden() ||
        !sheet.observation_2.isSheetHidden() ||
        !sheet.closing.isSheetHidden()
      ) {
        throw new Error("パターン2の表示状態が正しくありません");
      }
    }
    if (i === 2) {
      if (
        !sheet.setup.isSheetHidden() ||
        !sheet.registration_1.isSheetHidden() ||
        !sheet.registration_2.isSheetHidden() ||
        !sheet.interim_1.isSheetHidden() ||
        !sheet.observation_1.isSheetHidden() ||
        !sheet.interim_2.isSheetHidden() ||
        !sheet.observation_2.isSheetHidden() ||
        sheet.closing.isSheetHidden()
      ) {
        throw new Error("パターン3の表示状態が正しくありません");
      }
    }
    if (i === 3) {
      if (
        !sheet.setup.isSheetHidden() ||
        sheet.registration_1.isSheetHidden() ||
        !sheet.registration_2.isSheetHidden() ||
        !sheet.interim_1.isSheetHidden() ||
        sheet.observation_1.isSheetHidden() ||
        !sheet.interim_2.isSheetHidden() ||
        !sheet.observation_2.isSheetHidden() ||
        !sheet.closing.isSheetHidden()
      ) {
        throw new Error("パターン4の表示状態が正しくありません");
      }
    }
  }
  console.log("✅ シートの表示・非表示切替が正しいことを確認しました");
}
