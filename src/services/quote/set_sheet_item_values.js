/**
 * 年度別シート値設定クラス
 * - class SetSheetItemValues
 */
class SetSheetItemValues {
  constructor(sheetname, array_quotation_request) {
    this.context = buildSheetContext_(sheetname, array_quotation_request);
  }
  set_registration_term_items_(input_values) {
    const scriptProperties = PropertiesService.getScriptProperties();
    const setupTermLimit = Number(
      scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
    );
    const closingTermLimit = Number(
      scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.CLOSING_TERM),
    );

    if (
      shouldSkipRegistrationTermItems_(
        this.context.sheetname,
        this.context.trial_target_terms,
        setupTermLimit,
        closingTermLimit,
      )
    ) {
      return input_values;
    }

    const date_list = {
      trial_target_terms: this.context.trial_target_terms,
      trial_start_date: this.context.trial_start_date,
      trial_end_date: this.context.trial_end_date,
      trial_target_start_date: this.context.trial_target_start_date,
      trial_target_end_date: this.context.trial_target_end_date,
    };
    const context = {
      date_list: date_list,
      sheetname: this.context.sheetname,
      clinical_trials_office_flg: this.context.clinical_trials_office_flg,
      array_quotation_request: this.context.array_quotation_request,
    };
    const target_items = buildRegistrationTermItems_(context);
    return this.getSetValues(target_items, input_values);
  }
  getSetValues(target_items, input_values) {
    return getSetValues_(this.context, target_items, input_values);
  }
  getTargetRange() {
    return getTargetRange_(this.context);
  }
  getSheetValues() {
    return getSheetValues_(this.context);
  }
  setSheetValues(sheetname, target_values) {
    setTargetCountValues_(sheetname, this.context.target_col, target_values);
  }
  set_nonSetup_term_items_(input_values) {
    const scriptProperties = PropertiesService.getScriptProperties();

    if (this.context.sheetname === QUOTATION_SHEET_NAMES.SETUP) {
      this.set_setup_term_(SCRIPT_PROPERTY_KEYS.REG1_SETUP_DATABASE_MANAGEMENT);
    }

    const setupTerm = Number(
      scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
    );
    if (
      shouldSkipDatabaseManagement_(
        this.context.sheetname,
        this.context.trial_target_terms,
        setupTerm,
      )
    ) {
      return input_values;
    }

    const databaseManagementTerm = calculateDatabaseManagementTerm_(
      this.context.sheetname,
      this.context.trial_target_terms,
      scriptProperties,
    );

    const setItemsList = [
      [ITEMS_SHEET.ITEMNAMES.DATABASE_MANAGEMENT_FEE, databaseManagementTerm],
    ];

    return this.getSetValues(setItemsList, input_values);
  }

  set_all_sheet_common_items_(input_values) {
    const setItemsList = buildCommonSetItems_(this.context.trial_target_terms);
    return this.getSetValues(setItemsList, input_values);
  }

  /**
   * SETUP期間の消費量を計算し、残期間を次年度へ繰り越すための処理
   *
   * - Script Properties に保存されている setup_term（SETUPの残期間）を取得する
   * - trial_target_terms（当年度で消費可能な期間）分だけ SETUP期間を消費する
   * - 消費後に残った SETUP期間は、指定したプロパティ名で保存し、
   *   次年度以降に繰り越される
   * - 実際の消費量と残量の計算ロジックは calculateSetupTermResult_ に委譲する
   *
   * @param {string} property_name
   *   消費後の SETUP期間（残期間）を保存する Script Properties のキー
   *
   * @return {number}
   *   当年度で消費された SETUP期間
   */
  set_setup_term_(property_name) {
    const properties = PropertiesService.getScriptProperties();

    const setupTerm =
      parseInt(properties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM), 10) ||
      0;

    const { consumed, remaining } = calculateSetupTermResult_(
      setupTerm,
      this.context.trial_target_terms,
    );
    // 残った SETUP期間は次年度に繰り越す
    properties.setProperty(property_name, remaining);

    return consumed;
  }

  set_setup_clinical_trials_office() {
    if (!this.context.clinical_trials_office_flg) {
      return "";
    }
    return this.set_setup_term_(
      SCRIPT_PROPERTY_KEYS.REG1_SETUP_CLINICAL_TRIALS_OFFICE,
    );
  }
  set_setup_items_(input_values) {
    if (this.context.sheetname != QUOTATION_SHEET_NAMES.SETUP) {
      return input_values;
    }
    // 事務局運営
    const clinical_trials_office = this.set_setup_clinical_trials_office();

    const set_items_list = buildSetupSetItems_(
      this.context.array_quotation_request,
      clinical_trials_office,
    );

    return this.getSetValues(set_items_list, input_values);
  }
  set_closing_items_(input_values) {
    if (this.context.sheetname !== QUOTATION_SHEET_NAMES.CLOSING) {
      return input_values;
    }
    // 事務局運営
    const clinical_trials_office = this.context.clinical_trials_office_flg
      ? 1
      : "";
    const set_items_list = buildClosingSetItems_(
      this.context.array_quotation_request,
      clinical_trials_office,
    );
    return this.getSetValues(set_items_list, input_values);
  }

  set_registration_items_(input_values) {
    if (
      this.context.sheetname === QUOTATION_SHEET_NAMES.SETUP ||
      this.context.sheetname === QUOTATION_SHEET_NAMES.CLOSING
    ) {
      return input_values;
    }

    const setItemsList = buildRegistrationSetItems_(
      this.context.array_quotation_request,
      this.context.sheetname,
    );

    return this.getSetValues(setItemsList, input_values);
  }

  setInterimAnalysis() {
    const scriptProperties = PropertiesService.getScriptProperties();

    const trialType = scriptProperties.getProperty(
      SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE,
    );

    const interimTableCount = get_quotation_request_value_(
      this.context.array_quotation_request,
      "中間解析に必要な図表数",
    );

    const dataCleaningBefore = this.getTargetItemCount(
      ITEMS_SHEET.ITEMNAMES.DATA_CLEANING,
    );

    const setItems = buildInterimAnalysisItems_({
      trialType,
      interimTableCount,
      dataCleaningBefore,
    });

    const values = this.getSetValues(setItems, null);
    this.setSheetValues(this.context.sheetname, values);
  }

  /**
   * itemnameの「回数」を取得する。
   * @param {string} 対象の項目名
   * @return {number} 回数
   */
  getTargetItemCount(itemname) {
    return getItemCountFromContext_(this.context, itemname);
  }
}
function getSetValues_(context, target_items, input_values) {
  return buildSheetValuesWithTargetItems_(
    context.sheetname,
    target_items,
    input_values,
  );
}
function getTargetRange_(context) {
  return getTargetCountRange_(context.sheetname, context.target_col);
}
function getSheetValues_(context) {
  return getTargetCountValues_(context.sheetname, context.target_col);
}
function getItemCountFromContext_(context, itemname) {
  return getTargetItemCount_(context.sheetname, itemname);
}
