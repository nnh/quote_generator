function work_getproperty(){
  var get_s_p = PropertiesService.getScriptProperties();
  for(var key in get_s_p.getProperties()) {
    // get_s_p.setProperty('setup_term', setup_term);
    Logger.log('get_s_p.setProperty(' + "'" + key + "', " + get_s_p.getProperty(key) + ')');
  }
}
function work_setproperty(){
  var get_s_p = PropertiesService.getScriptProperties();
  get_s_p.setProperty('trial_years_col', 3);
  get_s_p.setProperty('trial_closing_row', 39);
  get_s_p.setProperty('quotation_request_sheet_name', 'Quotation Request');
  get_s_p.setProperty('setup_sheet_name', 'Setup');
  get_s_p.setProperty('registration_1_sheet_name', 'Registration_1');
  get_s_p.setProperty('flag_overflowing_setup', 0.0);
  get_s_p.setProperty('specified_clinical_trial', '特定臨床研究');
  get_s_p.setProperty('facilities_value', 30.0);
  get_s_p.setProperty('registration_years', 7.0);
  get_s_p.setProperty('setup_term', 6.0);
  get_s_p.setProperty('closing_sheet_name', 'Closing');
  get_s_p.setProperty('observation_1_sheet_name', 'Observation_1');
  get_s_p.setProperty('fy_sheet_items_col', 3);
  get_s_p.setProperty('trial_sheet_name', 'Trial');
  get_s_p.setProperty('interim_2_sheet_name', 'Interim_2');
  get_s_p.setProperty('central_monitoring_str', '中央モニタリング');
  get_s_p.setProperty('trial_start_col', 4);
  get_s_p.setProperty('trial_setup_row', 32);
  get_s_p.setProperty('trial_end_col', 5);
  get_s_p.setProperty('observation_2_sheet_name', 'Observation_2');
  get_s_p.setProperty('fy_sheet_count_col', 6);
  get_s_p.setProperty('interim_1_sheet_name', 'Interim_1');
  get_s_p.setProperty('closing_term', 6.0);
  get_s_p.setProperty('investigator_initiated_trial', '医師主導治験');
  get_s_p.setProperty('registration_2_sheet_name', 'Registration_2');
}
function work_addsheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var get_s_p = PropertiesService.getScriptProperties();
  var sheet = {trial:ss.getSheetByName(get_s_p.getProperty('trial_sheet_name')),
               quotation_request:ss.getSheetByName(get_s_p.getProperty('quotation_request_sheet_name')),
               setup:ss.getSheetByName(get_s_p.getProperty('setup_sheet_name')),
               closing:ss.getSheetByName(get_s_p.getProperty('closing_sheet_name'))}
  // シート作成
  var temp_sheet_t = [get_s_p.getProperty('registration_1_sheet_name'),
                      get_s_p.getProperty('registration_2_sheet_name'),
                      get_s_p.getProperty('interim_1_sheet_name'),
                      get_s_p.getProperty('interim_2_sheet_name'),
                      get_s_p.getProperty('observation_1_sheet_name'),
                      get_s_p.getProperty('observation_2_sheet_name')];
  for (var i = 0; i < temp_sheet_t.length; i++){
    if (ss.getSheetByName(temp_sheet_t[i]) == null){
      var ss_sheet_copy = sheet.setup.copyTo(ss);
      ss_sheet_copy.setName(temp_sheet_t[i]);
      ss.getSheetByName(temp_sheet_t[i]).activate();
      ss.moveActiveSheet(i + 7);
    }
  }
  // total足しこみ

  
  // シート削除
  var temp_sheet_t = ['Registration', 'Interim', 'observation'];
  for (var i = 0; i < temp_sheet_t.length; i++){
    if (ss.getSheetByName(temp_sheet_t[i]) != null){
      ss.deleteSheet(ss.getSheetByName(temp_sheet_t[i]));
    }
  }
}

function reconfigure_total(){
  
}