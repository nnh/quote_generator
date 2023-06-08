function issue82() {
  // 入力規則は手修正する
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const priceLogicCompanySheet = spreadsheet.getSheetByName('PriceLogicCompany');
  priceLogicCompanySheet.getRange('C99').setValue('医師主導治験・先進');
  const itemsSheet = spreadsheet.getSheetByName('Items');
  itemsSheet.getRange('B16').setFormula(`if(and('Quotation Request'!$A$2<>"", or(Trial!$B$27="医師主導治験", Trial!$B$27="先進")),"IRB承認確認、施設管理","IRB準備・承認確認")`);
  itemsSheet.getRange('B19').setFormula(`if(and('Quotation Request'!$A$2<>"", or(Trial!$B$27="医師主導治験", Trial!$B$27="先進")),"初期アカウント設定（施設・ユーザー）","初期アカウント設定（施設・ユーザー）、IRB承認確認")`);
  itemsSheet.getRange('B52').setFormula(`if(and('Quotation Request'!$A$2<>"", or(Trial!$B$27="医師主導治験", Trial!$B$27="先進")),"中間解析プログラム作成、解析実施（ダブル）","中間解析プログラム作成、解析実施（シングル）")`);
  itemsSheet.getRange('B54').setFormula(`if(and('Quotation Request'!$A$2<>"", or(Trial!$B$27="医師主導治験", Trial!$B$27="先進")),"最終解析プログラム作成、解析実施（ダブル）","最終解析プログラム作成、解析実施（シングル）")`);
  itemsSheet.getRange('B57').setFormula(`if(and('Quotation Request'!$A$2<>"", or(Trial!$B$27="医師主導治験", Trial!$B$27="先進")),"CSRの作成支援","研究結果報告書の作成")`);  
}
function test20230608(){
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const trialSheet = spreadsheet.getSheetByName('Trial');
  const itemsSheet = spreadsheet.getSheetByName('Items');
  const trialTypeList = ['観察研究・レジストリ', '医師主導治験', '介入研究（特定臨床研究以外）', '特定臨床研究', '先進'];
  const res = trialTypeList.map(trialType => {
    trialSheet.getRange('B27').setValue(trialType);
    Utilities.sleep(100);
    SpreadsheetApp.flush();
    if (trialType === '医師主導治験' || trialType === '先進'){
      return itemsSheet.getRange('B16').getValue() === 'IRB承認確認、施設管理' &&
             itemsSheet.getRange('B19').getValue() === '初期アカウント設定（施設・ユーザー）' &&
             itemsSheet.getRange('B52').getValue() === '中間解析プログラム作成、解析実施（ダブル）' &&
             itemsSheet.getRange('B54').getValue() === '最終解析プログラム作成、解析実施（ダブル）' &&
             itemsSheet.getRange('B57').getValue() === 'CSRの作成支援';
    } else {
      return itemsSheet.getRange('B16').getValue() === 'IRB準備・承認確認' &&
             itemsSheet.getRange('B19').getValue() === '初期アカウント設定（施設・ユーザー）、IRB承認確認' &&
             itemsSheet.getRange('B52').getValue() === '中間解析プログラム作成、解析実施（シングル）' &&
             itemsSheet.getRange('B54').getValue() === '最終解析プログラム作成、解析実施（シングル）' &&
             itemsSheet.getRange('B57').getValue() === '研究結果報告書の作成';
    } 
  });
  console.log(res);
}
