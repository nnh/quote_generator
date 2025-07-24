/**
* 試験種別からSetup、Closing期間の判定を行いスクリプトプロパティに格納する
* @param {string} temp_str 試験種別 
* @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
* @return none
* @example 
*   get_setup_closing_term_(temp_str, array_quotation_request);
*/
function get_setup_closing_term_(temp_str, array_quotation_request){
  // Setup期間は医師主導治験、特定臨床研究が6ヶ月、それ以外が3ヶ月
  // Closing期間は医師主導治験、特定臨床研究、研究結果報告書作成支援ありの試験が6ヶ月、それ以外が3ヶ月
  const cache = new ConfigCache();
  if (!cache.isValid) {
    console.error('Failed to initialize ConfigCache in get_setup_closing_term_');
    return;
  }
  
  var setup_term = QuoteScriptConstants.SETUP_TERM_SHORT;
  var closing_term = QuoteScriptConstants.CLOSING_TERM_SHORT;
  
  if (temp_str == cache.investigatorInitiatedTrial || temp_str == cache.specifiedClinicalTrial){
    setup_term = QuoteScriptConstants.SETUP_TERM_LONG;
    closing_term = QuoteScriptConstants.CLOSING_TERM_LONG;
  }
  
  if (get_quotation_request_value(array_quotation_request, QuoteScriptConstants.RESEARCH_REPORT_SUPPORT) == QuoteScriptConstants.RESPONSE_YES){
    closing_term = QuoteScriptConstants.CLOSING_TERM_LONG;
  }
  
  cache.scriptProperties.setProperty('setup_term', setup_term);
  cache.scriptProperties.setProperty('closing_term', closing_term);
}
/**
* 各シートの開始日、終了日を設定する
* @param {number} input_trial_start_date　試験開始日のセルの値
* @param {number} input_trial_end_date　試験終了日のセルの値
* @return 二次元配列（各シートの開始日、終了日）
* @example 
*   var array_trial_date_ = get_trial_start_end_date(trial_start_date, trial_end_date);
*/
function get_trial_start_end_date_(input_trial_start_date, input_trial_end_date){
  const cache = new ConfigCache();
  if (!cache.isValid) {
    console.error('Failed to initialize ConfigCache in get_trial_start_end_date_');
    return;
  }
  
  const normalizedDates = normalizeTrialDates_(input_trial_start_date, input_trial_end_date, cache);
  const setupClosingDates = calculateSetupClosingDates_(normalizedDates.trial_start_date, normalizedDates.trial_end_date, cache);
  const registrationDates = calculateRegistrationPeriods_(setupClosingDates, normalizedDates.trial_start_date, normalizedDates.trial_end_date);
  
  storeRegistrationYears_(registrationDates, normalizedDates, cache);
  
  return buildTrialDateArray_(setupClosingDates, registrationDates);
}

/**
* 入力された試験日付を正規化し、スクリプトプロパティに保存する
* @param {Date} input_trial_start_date 試験開始日
* @param {Date} input_trial_end_date 試験終了日
* @param {ConfigCache} cache 設定キャッシュ
* @return {Object} 正規化された試験開始日・終了日
*/
function normalizeTrialDates_(input_trial_start_date, input_trial_end_date, cache) {
  const trial_start_date = Moment.moment(input_trial_start_date).startOf('month');
  cache.scriptProperties.setProperty('trial_start_date', trial_start_date.format());
  
  const trial_end_date = Moment.moment(input_trial_end_date).endOf('month');
  cache.scriptProperties.setProperty('trial_end_date', trial_end_date.format());
  
  return { trial_start_date, trial_end_date };
}

/**
* Setup・Closingシートの開始日・終了日を計算する
* @param {Moment} trial_start_date 試験開始日
* @param {Moment} trial_end_date 試験終了日
* @param {ConfigCache} cache 設定キャッシュ
* @return {Object} Setup・Closingの日付情報
*/
function calculateSetupClosingDates_(trial_start_date, trial_end_date, cache) {
  const setup_start_date = trial_start_date.clone().subtract(parseInt(cache.setupTerm), 'months');
  const setup_end_date = Moment.moment([setup_start_date.clone().subtract(3, 'months').year() + 1, 2, 31]);
  
  const closing_end_date = trial_end_date.clone().add(1, 'days').add(parseInt(cache.closingTerm), 'months').subtract(1, 'days');
  const closing_start_date = Moment.moment([closing_end_date.clone().subtract(3, 'months').year(), 3, 1]);
  
  return {
    setup_start_date,
    setup_end_date,
    closing_start_date,
    closing_end_date
  };
}

/**
* Registration・Observationの期間を計算する
* @param {Object} setupClosingDates Setup・Closingの日付情報
* @param {Moment} trial_start_date 試験開始日
* @param {Moment} trial_end_date 試験終了日
* @return {Object} Registration・Observationの日付情報
*/
function calculateRegistrationPeriods_(setupClosingDates, trial_start_date, trial_end_date) {
  const { setup_end_date, closing_start_date } = setupClosingDates;
  
  const diff_from_setup_end_to_closing_start = closing_start_date.diff(setup_end_date, 'months');
  
  const registration_1_dates = calculateRegistration1Period_(setup_end_date, diff_from_setup_end_to_closing_start);
  const observation_2_dates = calculateObservation2Period_(closing_start_date, registration_1_dates, diff_from_setup_end_to_closing_start);
  const registration_2_dates = calculateRegistration2Period_(registration_1_dates, observation_2_dates);
  
  return {
    registration_1_start_date: registration_1_dates.start,
    registration_1_end_date: registration_1_dates.end,
    registration_2_start_date: registration_2_dates.start,
    registration_2_end_date: registration_2_dates.end,
    observation_2_start_date: observation_2_dates.start,
    observation_2_end_date: observation_2_dates.end
  };
}

/**
* Registration_1期間を計算する
* @param {Moment} setup_end_date Setup終了日
* @param {number} diff_from_setup_end_to_closing_start Setup終了からClosing開始までの月数
* @return {Object} Registration_1の開始日・終了日
*/
function calculateRegistration1Period_(setup_end_date, diff_from_setup_end_to_closing_start) {
  const start = diff_from_setup_end_to_closing_start > 0 ? setup_end_date.clone().add(1, 'days') : '';
  const end = start !== '' ? start.clone().add(1, 'years').subtract(1, 'days') : '';
  
  return { start, end };
}

/**
* Observation_2期間を計算する
* @param {Moment} closing_start_date Closing開始日
* @param {Object} registration_1_dates Registration_1の日付情報
* @param {number} diff_from_setup_end_to_closing_start Setup終了からClosing開始までの月数
* @return {Object} Observation_2の開始日・終了日
*/
function calculateObservation2Period_(closing_start_date, registration_1_dates, diff_from_setup_end_to_closing_start) {
  const diff_from_reg1_end_to_closing_start = registration_1_dates.end !== '' ? closing_start_date.diff(registration_1_dates.end, 'months') : 0;
  
  const end = diff_from_reg1_end_to_closing_start > 0 ? closing_start_date.clone().subtract(1, 'days') : '';
  const start = end !== '' ? closing_start_date.clone().subtract(1, 'years') : '';
  
  return { start, end };
}

/**
* Registration_2期間を計算する
* @param {Object} registration_1_dates Registration_1の日付情報
* @param {Object} observation_2_dates Observation_2の日付情報
* @return {Object} Registration_2の開始日・終了日
*/
function calculateRegistration2Period_(registration_1_dates, observation_2_dates) {
  const diff_from_reg1_end_to_obs2_start = observation_2_dates.start !== '' ? observation_2_dates.start.diff(registration_1_dates.end, 'months') : 0;
  
  const end = diff_from_reg1_end_to_obs2_start > 0 ? observation_2_dates.start.clone().subtract(1, 'days') : '';
  const start = end !== '' ? registration_1_dates.end.clone().add(1, 'days') : '';
  
  return { start, end };
}

/**
* Registration年数を計算してスクリプトプロパティに保存する
* @param {Object} registrationDates Registration・Observationの日付情報
* @param {Object} normalizedDates 正規化された試験日付
* @param {ConfigCache} cache 設定キャッシュ
*/
function storeRegistrationYears_(registrationDates, normalizedDates, cache) {
  const registration_start_date = determineRegistrationStartDate_(registrationDates, normalizedDates.trial_start_date);
  const registration_end_date = determineRegistrationEndDate_(registrationDates, normalizedDates.trial_end_date);
  
  cache.scriptProperties.setProperty('registration_years', get_years(registration_start_date, registration_end_date));
}

/**
* Registration開始日を決定する（複雑な条件分岐を簡素化）
* @param {Object} registrationDates Registration・Observationの日付情報
* @param {Moment} trial_start_date 試験開始日
* @return {Moment} Registration開始日
*/
function determineRegistrationStartDate_(registrationDates, trial_start_date) {
  if (registrationDates.registration_1_start_date !== '') {
    return registrationDates.registration_1_start_date.clone();
  }
  return trial_start_date.clone();
}

/**
* Registration終了日を決定する（複雑な条件分岐を簡素化）
* @param {Object} registrationDates Registration・Observationの日付情報
* @param {Moment} trial_end_date 試験終了日
* @return {Moment} Registration終了日
*/
function determineRegistrationEndDate_(registrationDates, trial_end_date) {
  if (registrationDates.observation_2_end_date !== '') {
    return registrationDates.observation_2_end_date.clone();
  }
  if (registrationDates.registration_2_end_date !== '') {
    return registrationDates.registration_2_end_date.clone();
  }
  if (registrationDates.registration_1_end_date !== '') {
    return registrationDates.registration_1_end_date.clone();
  }
  return trial_end_date.clone();
}

/**
* 最終的な試験日付配列を構築する
* @param {Object} setupClosingDates Setup・Closingの日付情報
* @param {Object} registrationDates Registration・Observationの日付情報
* @return {Array} 二次元配列（各シートの開始日、終了日）
*/
function buildTrialDateArray_(setupClosingDates, registrationDates) {
  return [
    [setupClosingDates.setup_start_date, setupClosingDates.setup_end_date],
    [registrationDates.registration_1_start_date, registrationDates.registration_1_end_date],
    [registrationDates.registration_2_start_date, registrationDates.registration_2_end_date],
    ['', ''],
    ['', ''],
    ['', ''],
    [registrationDates.observation_2_start_date, registrationDates.observation_2_end_date],
    [setupClosingDates.closing_start_date, setupClosingDates.closing_end_date],
    [setupClosingDates.setup_start_date, setupClosingDates.closing_end_date]
  ];
}
