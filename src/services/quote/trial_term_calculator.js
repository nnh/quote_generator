/**
 * 試験開始日・終了日・期間計算
 * - get_trial_start_end_date_
 */
/**
 * 各シートの開始日、終了日を設定する
 * @param {number} input_trial_start_date　試験開始日のセルの値
 * @param {number} input_trial_end_date　試験終了日のセルの値
 * @return 二次元配列（各シートの開始日、終了日）
 * @example
 *   var array_trial_date_ = get_trial_start_end_date(trial_start_date, trial_end_date);
 */
function get_trial_start_end_date_(
  input_trial_start_date,
  input_trial_end_date,
) {
  const get_s_p = PropertiesService.getScriptProperties();
  // 試験開始日はその月の1日にする
  const trial_start_date = Moment.moment(input_trial_start_date).startOf(
    "month",
  );
  get_s_p.setProperty("trial_start_date", trial_start_date.format());
  // 試験終了日はその月の末日にする
  const trial_end_date = Moment.moment(input_trial_end_date).endOf("month");
  get_s_p.setProperty("trial_end_date", trial_end_date.format());
  // setup開始日
  const setup_start_date = trial_start_date
    .clone()
    .subtract(parseInt(get_s_p.getProperty("setup_term")), "months");
  // setupシートの最終日はsetup開始年度の3/31
  const setup_end_date = Moment.moment([
    setup_start_date.clone().subtract(3, "months").year() + 1,
    2,
    31,
  ]);
  // closing終了日
  const closing_end_date = trial_end_date
    .clone()
    .add(1, "days")
    .add(parseInt(get_s_p.getProperty("closing_term")), "months")
    .subtract(1, "days");
  // closingシートの開始日はclosing終了年度の4/1
  const closing_start_date = Moment.moment([
    closing_end_date.clone().subtract(3, "months").year(),
    3,
    1,
  ]);
  // setup終了日〜closing開始日までの月数を取得する
  const diff_from_setup_end_to_closing_start = closing_start_date.diff(
    setup_end_date,
    "months",
  );
  // registration_1：setup終了日の翌日から１年間セットする
  const registration_1_start_date =
    diff_from_setup_end_to_closing_start > 0
      ? setup_end_date.clone().add(1, "days")
      : "";
  const registration_1_end_date =
    registration_1_start_date != ""
      ? registration_1_start_date.clone().add(1, "years").subtract(1, "days")
      : "";
  const diff_from_reg1_end_to_closing_start =
    registration_1_end_date != ""
      ? closing_start_date.diff(registration_1_end_date, "months")
      : 0;
  // observation_2：closing開始日の前日から遡って１年間セットする
  const observation_2_end_date =
    diff_from_reg1_end_to_closing_start > 0
      ? closing_start_date.clone().subtract(1, "days")
      : "";
  const observation_2_start_date =
    observation_2_end_date != ""
      ? closing_start_date.clone().subtract(1, "years")
      : "";
  const diff_from_reg1_end_to_obs2_start =
    observation_2_start_date != ""
      ? observation_2_start_date.diff(registration_1_end_date, "months")
      : 0;
  // registration_2：残りの期間をセットする
  const registration_2_end_date =
    diff_from_reg1_end_to_obs2_start > 0
      ? observation_2_start_date.clone().subtract(1, "days")
      : "";
  const registration_2_start_date =
    registration_2_end_date != ""
      ? registration_1_end_date.clone().add(1, "days")
      : "";
  // registrationの年数を取得
  const temp_registration_start_date =
    registration_1_start_date != ""
      ? registration_1_start_date.clone()
      : trial_start_date.clone();
  const temp_registration_end_date =
    observation_2_end_date != ""
      ? observation_2_end_date.clone()
      : registration_2_end_date != ""
        ? registration_2_end_date.clone()
        : registration_1_end_date != ""
          ? registration_1_end_date.clone()
          : trial_end_date.clone();
  get_s_p.setProperty(
    "registration_years",
    get_years_(temp_registration_start_date, temp_registration_end_date),
  );
  const temp_array = [
    [setup_start_date, setup_end_date],
    [registration_1_start_date, registration_1_end_date],
    [registration_2_start_date, registration_2_end_date],
    ["", ""],
    ["", ""],
    ["", ""],
    [observation_2_start_date, observation_2_end_date],
    [closing_start_date, closing_end_date],
    [setup_start_date, closing_end_date],
  ];
  return temp_array;
}
