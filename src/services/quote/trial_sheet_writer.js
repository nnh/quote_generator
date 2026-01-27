/**
 * Trial / Items シート生成・価格設定・コメント操作
 * - set_trial_sheet_
 * - set_items_price_
 * - Set_trial_comments クラス
 */
/**
 * quotation_requestシートの内容からtrialシート, itemsシートを設定する
 * @param {associative array} sheet 当スプレッドシート内のシートオブジェクト
 * @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
 * @return none
 * @example
 *   set_trial_sheet_(sheet, array_quotation_request);
 */
function set_trial_sheet_(sheet, array_quotation_request) {
  const get_s_p = PropertiesService.getScriptProperties();
  const const_quotation_type = "見積種別";
  const const_trial_type = "試験種別";
  const const_trial_start = "症例登録開始日";
  const const_registration_end = "症例登録終了日";
  const const_trial_end = "試験終了日";
  const const_crf = "CRF項目数";
  const const_acronym = "試験実施番号";
  const const_facilities = get_s_p.getProperty("facilities_itemname");
  const const_number_of_cases = get_s_p.getProperty("number_of_cases_itemname");
  const const_coefficient = get_s_p.getProperty("coefficient");
  const const_trial_start_col = parseInt(
    get_s_p.getProperty("trial_start_col"),
  );
  const const_trial_end_col = parseInt(get_s_p.getProperty("trial_end_col"));
  const const_trial_setup_row = parseInt(
    get_s_p.getProperty("trial_setup_row"),
  );
  const const_trial_closing_row = parseInt(
    get_s_p.getProperty("trial_closing_row"),
  );
  const const_trial_years_col = parseInt(
    get_s_p.getProperty("trial_years_col"),
  );
  const const_total_month_col = 6;
  const trial_list = [
    [const_quotation_type, 2],
    ["見積発行先", 4],
    ["研究代表者名", 8],
    ["試験課題名", 9],
    [const_acronym, 10],
    [const_trial_type, 27],
    [const_number_of_cases, get_s_p.getProperty("trial_number_of_cases_row")],
    [const_facilities, get_s_p.getProperty("trial_const_facilities_row")],
    [const_crf, 30],
    [const_coefficient, 44],
  ];
  const cost_of_cooperation = "研究協力費、負担軽減費";
  const items_list = [
    ["保険料", "保険料"],
    [cost_of_cooperation, null],
  ];
  const cost_of_cooperation_item_name = [
    [
      get_s_p.getProperty("cost_of_prepare_quotation_request"),
      get_s_p.getProperty("cost_of_prepare_item"),
    ],
    [
      get_s_p.getProperty("cost_of_registration_quotation_request"),
      get_s_p.getProperty("cost_of_registration_item"),
    ],
    [
      get_s_p.getProperty("cost_of_report_quotation_request"),
      get_s_p.getProperty("cost_of_report_item"),
    ],
  ];
  const cdisc_addition = 3;
  var temp_str,
    temp_str_2,
    temp_start,
    temp_end,
    temp_start_addr,
    temp_end_addr,
    save_row,
    temp_total,
    date_of_issue;
  for (var i = 0; i < trial_list.length; i++) {
    temp_str = get_quotation_request_value_(
      array_quotation_request,
      trial_list[i][0],
    );
    if (temp_str != null) {
      switch (trial_list[i][0]) {
        case const_quotation_type:
          if (temp_str == "正式見積") {
            temp_str = "御見積書";
          } else {
            temp_str = "御参考見積書";
          }
          break;
        case const_number_of_cases:
          get_s_p.setProperty("number_of_cases", temp_str);
          break;
        case const_facilities:
          get_s_p.setProperty("facilities_value", temp_str);
          break;
        case const_trial_type:
          get_s_p.setProperty("trial_type_value", temp_str);
          // 試験期間を取得する
          const trial_start_date = get_quotation_request_value_(
            array_quotation_request,
            const_trial_start,
          );
          const registration_end_date = get_quotation_request_value_(
            array_quotation_request,
            const_registration_end,
          );
          const trial_end_date = get_quotation_request_value_(
            array_quotation_request,
            const_trial_end,
          );
          if (
            trial_start_date == null ||
            registration_end_date == null ||
            trial_end_date == null
          ) {
            return;
          }
          get_setup_closing_term_(temp_str, array_quotation_request);
          const array_trial_date = get_trial_start_end_date_(
            trial_start_date,
            trial_end_date,
          );
          sheet.trial
            .getRange(
              const_trial_setup_row,
              const_trial_start_col,
              array_trial_date.length,
              2,
            )
            .clear();
          for (var j = 0; j < array_trial_date.length; j++) {
            temp_start = sheet.trial.getRange(
              const_trial_setup_row + j,
              const_trial_start_col,
            );
            temp_end = sheet.trial.getRange(
              const_trial_setup_row + j,
              const_trial_end_col,
            );
            if (array_trial_date[j][0] != "") {
              temp_start.setValue(array_trial_date[j][0].format("YYYY/MM/DD"));
            }
            if (array_trial_date[j][1] != "") {
              temp_end.setValue(array_trial_date[j][1].format("YYYY/MM/DD"));
            }
            temp_start_addr = temp_start.getA1Notation();
            temp_end_addr = temp_end.getA1Notation();
            sheet.trial
              .getRange(const_trial_setup_row + j, const_trial_years_col)
              .setFormula(
                "=if(and($" +
                  temp_start_addr +
                  '<>"",$' +
                  temp_end_addr +
                  '<>""),datedif($' +
                  temp_start_addr +
                  ",$" +
                  temp_end_addr +
                  ',"y")+1,"")',
              );
            save_row = const_trial_setup_row + j;
          }
          // totalはx年xヶ月と月数を出力
          temp_total = sheet.trial.getRange(save_row, const_total_month_col);
          sheet.trial
            .getRange(save_row, const_total_month_col)
            .setFormula(
              "=datedif(" +
                sheet.trial
                  .getRange(save_row, const_trial_start_col)
                  .getA1Notation() +
                ",(" +
                sheet.trial
                  .getRange(save_row, const_trial_end_col)
                  .getA1Notation() +
                '+1),"m")',
            );
          sheet.trial
            .getRange(save_row, const_trial_years_col)
            .setFormula(
              "=trunc(" +
                temp_total.getA1Notation() +
                '/12) & "年" & if(mod(' +
                temp_total.getA1Notation() +
                ",12)<>0,mod(" +
                temp_total.getA1Notation() +
                ',12) & "ヶ月","")',
            );
          break;
        case const_coefficient:
          if (
            temp_str == get_s_p.getProperty("commercial_company_coefficient")
          ) {
            temp_str = 1.5;
          } else {
            temp_str = 1;
          }
          break;
        case const_crf:
          temp_str_2 = get_quotation_request_value_(
            array_quotation_request,
            "CDISC対応",
          );
          if (temp_str_2 == "あり") {
            delete_trial_comment_(
              '="CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"',
            );
            temp_str = "=" + temp_str + " * " + cdisc_addition;
            set_trial_comment_(
              '="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"',
            );
          } else {
            temp_str = temp_str;
          }
          break;
        case const_acronym:
          SpreadsheetApp.getActiveSpreadsheet().rename(
            `Quote ${temp_str} ${Utilities.formatDate(new Date(), "JST", "yyyyMMdd")}`,
          );
          break;
        default:
          break;
      }
      sheet.trial.getRange(parseInt(trial_list[i][1]), 2).setValue(temp_str);
    }
  }
  // 発行年月日
  date_of_issue = get_row_num_matched_value_(sheet.trial, 1, "発行年月日");
  if (date_of_issue > 0) {
    sheet.trial
      .getRange(date_of_issue, 2)
      .setValue(Moment.moment().format("YYYY/MM/DD"));
  }
  // 単価の設定
  items_list.forEach((x) => {
    const quotation_request_header = x[0];
    const totalPrice = get_quotation_request_value_(
      array_quotation_request,
      quotation_request_header,
    );
    if (quotation_request_header == cost_of_cooperation) {
      // 試験開始準備費用、症例登録、症例報告
      const ari_count = cost_of_cooperation_item_name.filter(
        (y) =>
          get_quotation_request_value_(array_quotation_request, y[0]) == "あり",
      ).length;
      const temp_price =
        ari_count > 0 ? parseInt(totalPrice / ari_count) : null;
      cost_of_cooperation_item_name.forEach((target) => {
        const items_row = get_row_num_matched_value_(sheet.items, 2, target[1]);
        if (
          get_quotation_request_value_(array_quotation_request, target[0]) ==
          "あり"
        ) {
          const unit = sheet.items.getRange(items_row, 4).getValue();
          const price =
            unit == "症例"
              ? temp_price / get_s_p.getProperty("number_of_cases")
              : unit == "施設"
                ? temp_price / get_s_p.getProperty("facilities_value")
                : temp_price;
          set_items_price_(sheet.items, price, items_row);
        } else {
          set_items_price_(sheet.items, 0, items_row);
        }
      });
    } else {
      // 保険料
      const items_header = x[1];
      const items_row = get_row_num_matched_value_(
        sheet.items,
        2,
        items_header,
      );
      set_items_price_(sheet.items, totalPrice, items_row);
    }
  });
}
/**
 * itemsシートに単価を設定する
 */
function set_items_price_(sheet, price, target_row) {
  if (target_row == 0) return;
  const target_col = getColumnNumber_("S");
  if (price > 0) {
    sheet.getRange(target_row, target_col).setValue(price);
    sheet.getRange(target_row, target_col).offset(0, 1).setValue(1);
    sheet.getRange(target_row, target_col).offset(0, 2).setValue(1);
  } else {
    sheet.getRange(target_row, target_col).setValue("");
    sheet.getRange(target_row, target_col).offset(0, 1).setValue("");
    sheet.getRange(target_row, target_col).offset(0, 2).setValue("");
  }
}
/**
 * trialシートのコメントを追加・削除する。
 */
class Set_trial_comments {
  constructor() {
    this.sheet = get_sheets();
    this.const_range = PropertiesService.getScriptProperties().getProperty(
      "trial_comment_range",
    );
  }
  clear_comments() {
    this.sheet.trial.getRange(this.const_range).clearContent();
  }
  set_range_values(array_comment) {
    const start_row = this.sheet.trial
      .getRange(this.const_range)
      .getCell(1, 1)
      .getRow();
    const start_col = this.sheet.trial
      .getRange(this.const_range)
      .getCell(1, 1)
      .getColumn();
    const comment_length = array_comment.length;
    this.clear_comments();
    if (comment_length <= 0) {
      return;
    }
    this.sheet.trial
      .getRange(start_row, start_col, comment_length, 1)
      .setValues(array_comment);
  }
  set set_delete_comment(target) {
    this.delete_target = target;
  }
  delete_comment() {
    const comment_formulas = this.sheet.trial
      .getRange(this.const_range)
      .getFormulas();
    const comment_values = this.sheet.trial
      .getRange(this.const_range)
      .getValues();
    let before_delete_comments = [];
    for (let i = 0; i < comment_formulas.length; i++) {
      before_delete_comments[i] =
        comment_formulas[i] != "" ? comment_formulas[i] : comment_values[i];
    }
    const del_comment = before_delete_comments.filter(
      (x) => x != this.delete_target && x != "",
    );
    return del_comment;
  }
}
/**
 * trialシートのコメントを追加する。
 * @param {string} str_comment コメント文字列
 * @return none
 */
function set_trial_comment_(str_comment) {
  const setComment = new Set_trial_comments();
  setComment.set_delete_comment = str_comment;
  const comments = setComment.delete_comment();
  comments.push([str_comment]);
  setComment.set_range_values(comments);
}
/**
 * trialシートのコメントを削除する。
 * @param {string} str_comment コメント文字列
 * @return none
 */
function delete_trial_comment_(str_comment) {
  const setComment = new Set_trial_comments();
  setComment.set_delete_comment = str_comment;
  const comments = setComment.delete_comment();
  setComment.set_range_values(comments);
}
