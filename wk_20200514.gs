// これを実行
function addNmcOscrSheet_main(){
  const get_s_p = PropertiesService.getScriptProperties();
  addNmcOscrToItemsSheet();
  addPrimaryItemsSheet();
  addNmcOscrSheet(get_s_p.getProperty('name_nmc'));
  addNmcOscrSheet(get_s_p.getProperty('name_oscr'));
  sortSheets();
}

// Itemsシートへの追加作業
function addNmcOscrToItemsSheet(){
  // itemsシートのU列の右側に2列追加する
  const get_s_p = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const items_sheet = ss.getSheetByName(get_s_p.getProperty('items_sheet_name'));
  const insert_col_idx = getColumnNumber('U');
  items_sheet.insertColumnAfter(insert_col_idx);
  items_sheet.insertColumnAfter(insert_col_idx);
  items_sheet.setColumnWidth(insert_col_idx + 1, 52);
  items_sheet.setColumnWidth(insert_col_idx + 2, 52);
  items_sheet.getRange('V:V').clearFormat();
  items_sheet.getRange('W:W').clearFormat();
  items_sheet.getRange('V:V').setNumberFormat('@');
  items_sheet.getRange('W:W').setNumberFormat('@');
  var i = 1;
  // 1行目に「業務割合」
  items_sheet.getRange(i, insert_col_idx + 1).setValue('業務割合');
  items_sheet.getRange('V1:W1').merge();
  items_sheet.getRange('V1:W1').setHorizontalAlignment('center');
  // 2行目に「nmc(%)」「oscr(%)」
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue('nmc(%)');
  items_sheet.getRange(i, insert_col_idx + 2).setValue('oscr(%)');  
  //プロトコル等作成支援	9：1デフォルト
  i++;
  //	プロトコルレビュー・作成支援（図表案、統計解析計画書案を含む）
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(90);
  //	検討会実施（TV会議等）
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(90);
  //薬事戦略相談支援	１：０デフォルト
  i++;
  //	PMDA相談資料作成支援
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //競争的資金獲得支援	１：０デフォルト
  i++;
  //	AMED申請資料作成支援
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  i++;
  i++;
  //システム開発	１：３デフォルト
  i++;
  //	システム開発
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(30);
  //プロジェクト管理　１：１デフォルト
  i++;
  //	プロジェクト管理
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //試験事務局業務	　１：１デフォルト
  i++;
  //	事務局運営
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	医師主導治験対応
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	ミーティング準備・実行
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	SOP一式、CTR登録案、TMF雛形
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	IRB準備・承認確認
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	特定臨床研究法申請資料作成支援
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	契約・支払手続、実施計画提出支援
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //モニタリング業務	１：０デフォルト
  i++;
  //	モニタリング準備業務（関連資料作成、キックオフ参加）
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	開始前モニタリング・必須文書確認
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	症例モニタリング・SAE対応
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //データベース管理	１：３デフォルト
  i++;
  //	問い合わせ対応
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(30);
  //	EDCライセンス・データベースセットアップ
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(30);
  //	データベース管理料
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(30);
  //データマネジメント業務	１：１デフォルト
  i++;
  //　準備作業	
  i++;
  //	業務分析・DM計画書の作成・CTR登録案の作成
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //　	紙CRFのEDC代理入力（含む問合せ）
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //　EDC構築	
  i++;
  //	DB作成・eCRF作成・バリデーション
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	バリデーション報告書
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	初期アカウント設定（施設・ユーザー）、IRB承認確認
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	入力の手引作成
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //　中央モニタリング	
  i++;
  //	中央モニタリング、定期モニタリングレポート作成
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	データクリーニング
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //　データセット作成	
  i++;
  //	データベース固定作業、クロージング
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //	症例検討会資料作成
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(50);
  //安全性管理業務	　１：０デフォルト
  i++;
  //	安全性管理事務局業務
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	効果安全性評価委員会事務局業務
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //統計解析業務	１：９デフォルト
  i++;
  //	統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(10);
  //	中間解析プログラム作成、解析実施（シングル）
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(10);
  //	中間解析報告書作成（出力結果＋表紙）
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(10);
  //	最終解析プログラム作成、解析実施（シングル）
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(10);
  //	最終解析報告書作成（出力結果＋表紙）
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(10);
  //研究結果報告書業務	１：０デフォルト
  i++;
  //	研究結果報告書の作成
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //監査業務	１：０デフォルト
  i++;
  //	監査計画書作成
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	施設監査
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	監査報告書作成
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //研究協力費	１：０デフォルト
  i++;
  //	試験開始準備費用
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	症例登録
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	症例報告
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //研究結果発表	１：０デフォルト
  i++;
  //	国内学会発表
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	国際学会発表
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	論文作成
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //CRB申請費用	１：０デフォルト
  i++;
  //	CRB申請費用(初年度)
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	CRB申請費用(2年目以降)
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //外部監査費用	１：０デフォルト
  i++;
  //	外部監査費用
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	施設監査費用
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //保険料	　１：０デフォルト
  i++;
  //	保険料
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //その他	　１：０デフォルト
  i++;
  //	QOL調査
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	治験薬運搬
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	治験薬管理（中央）
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	翻訳
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	CDISC対応費
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  //	中央診断謝金
  i++;
  items_sheet.getRange(i, insert_col_idx + 1).setValue(100);
  // oscr側
  var j, temp_val;
  for (j = i; j > 3; j--){
    if(items_sheet.getRange(j, insert_col_idx + 1).getValue() != ''){
      temp_val = 100 - items_sheet.getRange(j, insert_col_idx + 1).getValue();
      items_sheet.getRange(j, insert_col_idx + 2).setValue(temp_val);
    }
  }
}
// Quoteシートとかの追加作業
function addNmcOscrSheet(str_foot){
  const get_s_p = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetname_head = [get_s_p.getProperty('total_sheet_name'), get_s_p.getProperty('total2_sheet_name'), 
                          get_s_p.getProperty('quote_sheet_name')];
  sheetname_head.map(function(x, idx, array){
    // ”*_nmc", "*_oscr"シートが存在したら削除する
    // Quote, total, total2シートをコピー
    var sheetname = x + '_' + str_foot;
    var temp_sheet = ss.getSheetByName(sheetname);
    if (temp_sheet != null){
      ss.deleteSheet(temp_sheet);
    } 
    var new_sheet = ss.getSheetByName(x).copyTo(ss);
    new_sheet.setName(sheetname);
    new_sheet.activate();
    // 数式の変更
    switch(array[idx]){
    // Quote
      // B7発行元
      case get_s_p.getProperty('quote_sheet_name'):
        if (str_foot == get_s_p.getProperty('name_nmc')){
          new_sheet.getRange(7, 2).setFormula('=Trial!C5');
        } else {
          new_sheet.getRange(7, 2).setFormula('=Trial!D5');
        }
        //12〜31行目
        for (var i = 12; i <= 31; i++){
          var temp_str = new_sheet.getRange(i, 4).getFormula();
          temp_str = temp_str.replace('Total', 'Total_' + str_foot);
          new_sheet.getRange(i, 4).setFormula(temp_str);
        }
        break;
    // total
    // D列 5~89行目まで
    // total2
    // D~K列　5〜90行目まで
      case get_s_p.getProperty('total_sheet_name'):
      case get_s_p.getProperty('total2_sheet_name'):
        var sheet_list = {
          start_col : 4,
          end_col : 4,
          start_row : 5,
          end_row : 89,
          reduce_num : 2,
          str_foot : str_foot
        };
        if (array[idx] == get_s_p.getProperty('total2_sheet_name')){
          sheet_list.end_col = 11;
          sheet_list.end_row = 91;
        }        
        setRangeTotal_Total2(new_sheet, sheet_list);
        break;
      default:
        break;
    }
  }, str_foot, ss);
}

// 見出し項目リストシートの作成
function addPrimaryItemsSheet(){
  const str_formula = '=QUERY(Items!A:A, "where A <> ' + "'' and A <> '準備作業' and A <>'EDC構築' and A <> '中央モニタリング' and A <> '中央モニタリング' and A <> 'データセット作成' and A <> '合計'" + '")';
  const insert_sheetname = 'PrimaryItems';
  const get_s_p = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const items_sheet = ss.getSheetByName(get_s_p.getProperty('items_sheet_name'));
  const sheet_idx = items_sheet.getIndex();
  const quote_sheet = ss.getSheetByName(get_s_p.getProperty('quote_sheet_name'));
  const start_row = 11;
  var temp_sheet = ss.getSheetByName(insert_sheetname);
  if (temp_sheet != null){
    ss.deleteSheet(temp_sheet);
  }
  ss.insertSheet(insert_sheetname, parseInt(sheet_idx));  
  ss.getSheetByName(insert_sheetname).getRange(1, 1).setFormula(str_formula);
  // QuoteシートC列更新
  for (var i = 1; i <= 20; i++){
    var temp = "=" + insert_sheetname + '!' + 'A' + i;
    var target_row = parseInt(start_row + i);
    quote_sheet.getRange(target_row, 3).setFormula(temp);
  }
}
// シートの並べ替え
function sortSheets(){
  const sheetnames = ['Quote', 'Total', 'Total2',
                      'Quote_nmc', 'Total_nmc', 'Total2_nmc',
                      'Quote_oscr', 'Total_oscr', 'Total2_oscr',
                      'Total3'];
  sheetnames.map(function(x, idx){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.getSheetByName(x).activate();
    ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.moveActiveSheet(parseInt(idx + 1));
  });
}

function setRangeTotal_Total2(target_sheet, sheet_list){
  const get_s_p = PropertiesService.getScriptProperties();
  const target_range = target_sheet.getRange(sheet_list.start_row, sheet_list.start_col, parseInt(sheet_list.end_row - sheet_list.start_row + 1), parseInt(sheet_list.end_col - sheet_list.start_col + 1));
  const format_template = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(get_s_p.getProperty('total_sheet_name')).getRange(6, 4).getNumberFormat();
  // 数式の設定
  var edit_formulas = target_range.getFormulas().map(function(x, row_idx){
    var temp = x.map(function(target_formulas, col_idx){
      return getEditedFormula(target_sheet, target_formulas, sheet_list, row_idx, col_idx);
    }, target_sheet, sheet_list, row_idx);
    return temp;
  }, target_sheet, sheet_list);
  target_range.setFormulas(edit_formulas);
  // 書式の設定
  var numericFormats = target_range.getNumberFormats().map(function(x){
    var temp = x.map(function(y){
      return '#,##0_);(#,##0)';
    }, format_template)
    return temp
  }, format_template);
  target_range.setNumberFormats(numericFormats);
  // totalシートでE列が’x’でなければD列の数式を削除する
  if (target_sheet.getName() == get_s_p.getProperty('total_sheet_name') + '_' + sheet_list.str_foot){
    for (var i = 0; i <= sheet_list.end_row; i++){
      if (target_range.offset(i, 1, 1, 1).getValue() != 'x'){
        target_range.offset(i, 0, 1, 1).setFormula('');
      }
    }
  }
}

function getEditedFormula(target_sheet, target_formula, sheet_list, row_idx, col_idx){
  // 数式を編集して返す
  const get_s_p = PropertiesService.getScriptProperties();
  var temp_col;
  var temp_foot = '';
  var set_str = '';
  if (target_formula.substr(0, 1) == '='){
    if (sheet_list.str_foot == get_s_p.getProperty('name_nmc')){
      temp_col = '$V';
    } else {
      temp_col = '$W';
    }
    if (target_sheet.getName() == get_s_p.getProperty('total2_sheet_name') + '_' + sheet_list.str_foot){
      // Total2シートの合計行はsumで取るように変更する
      if (row_idx != parseInt(sheet_list.end_row - sheet_list.start_row)){
        target_formula = target_formula.substr(0, target_formula.length - 1);
        temp_foot = ')';
      } else {
        temp_col = getColumnString(parseInt(col_idx + sheet_list.start_col));
        set_str = '=sum(' + temp_col + sheet_list.start_row + ':' + temp_col + parseInt(sheet_list.end_row - 1) + ')';
      }
    }
    if (set_str == ''){
      set_str = target_formula + '*(Items!' + temp_col + parseInt(row_idx + sheet_list.start_row - sheet_list.reduce_num) + ' / 100)' + temp_foot;
    }
  }
  return set_str;
}

