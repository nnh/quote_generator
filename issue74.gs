const startRowNumber = 5;
const endRowNumber = 94;
const colLNumber = 12;
function test20230424_2(targetSheet='Closing'){
  const targetRange = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(targetSheet).getRange(startRowNumber, colLNumber, endRowNumber - startRowNumber + 1, 1);
  const target = targetRange.getFormulas();
  const check = target.map(x => {
  const res1 = x[0].replace(/AND\((F[0-9]+)=""\)/, '$1=""');
  const res2 = res1.replace(/(F[0-9]+)=""/g, 'or($1="", $1=0)');
  const res3 = res2.replace('=if(AND(H15="",H16="",H17="",H18="",H19="",H20="",H21="",H22="",H23="",H24="",H25=""),0,2)', '=if(AND(or(H15="", H15=0),or(H16="", H16=0),or(H17="",H17=0),or(H18="",H18=0),or(H19="",H19=0),or(H20="",H20=0),or(H21="",H21=0),or(H22="",H22=0),or(H23="",H23=0),or(H24="", H24=0),or(H25="",H25=0)),0,2)');
  const res4 = res3.replace('=if(AND(L35=0,L38=0,L43=0,L46=0),0,2)', '=if(AND(or(L35=0,L35=""),or(L38=0,L38=""),or(L43=0,L43=""),or(L46=0,L46="")),0,2)');
  const res5 = res4.replace('=if(I80 > 0, 2, 0)', '=if(and(I80 > 0, I80 <> ""), 2, 0)');
    return [res5];
  });
  targetRange.setFormulas(check);
}
function test20230424_1_(){
  //const test = SpreadsheetApp.getActiveSpreadsheet().getSheets().map(x => [x.getName()]);
  //SpreadsheetApp.getActiveSpreadsheet().getSheetByName('シート21').getRange(1, 1, test.length, 1).setValues(test);
  const targetSheetName = ['Setup', 
'Registration_1', 
'Registration_2', 
'Interim_1', 
'Observation_1', 
'Interim_2', 
'Observation_2', 
'Closing'];
  const sheetName = targetSheetName[0];
  const targetFormulas = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).getRange(startRowNumber, colLNumber, endRowNumber - startRowNumber + 1, 1).getFormulas();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('シート21').getRange(1, 1, targetFormulas.length, 1).setFormulas(targetFormulas);

}
