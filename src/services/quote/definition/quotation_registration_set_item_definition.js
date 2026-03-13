/**
 * Registration関連の設定項目を生成する
 * @param {Object} params
 * @param {string} params.sheetName
 * @returns {Array<Array>}
 */
function buildRegistrationItems_({ sheetName }) {
  const registrationItemsList = createRegistrationItemsList_(sheetName);
  return convertItemsMapToList_(registrationItemsList);
}
/**
 * Registrationシートの年度設定を取得する
 * @param {string} sheetName
 * @return {{ isFirstYear: boolean }}
 */
function getRegistrationYearConfig_(sheetName) {
  return {
    isFirstYear: sheetName === QUOTATION_SHEET_NAMES.REGISTRATION_1,
  };
}
/**
 * Registrationシート用の項目Mapを生成する
 * @param {string} sheetName
 * @return {Map<string, any>}
 */
function createRegistrationItemsList_(sheetName) {
  const { isFirstYear } = getRegistrationYearConfig_(sheetName);

  const crbValue = returnIfEquals_(
    get_quotation_request_value_(
      QUOTATION_REQUEST_SHEET.ITEMNAMES.CRB_APPLICATION,
    ),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  const crbFirstYear = isFirstYear ? crbValue : "";
  const crbAfterSecondYear = isFirstYear ? "" : crbValue;

  const essentialDocumentsCount = get_quotation_request_value_(
    QUOTATION_REQUEST_SHEET.ITEMNAMES
      .ESSENTIAL_DOCUMENTS_MONITORING_COUNT_PER_FACILITY,
  );

  const essentialDocuments = Number.isInteger(essentialDocumentsCount)
    ? FUNCTION_FORMULAS.FACILITIES + " * " + essentialDocumentsCount
    : "";

  return new Map([
    [ITEMS_SHEET.ITEMNAMES.CRB_APPLICATION_FIRST_YEAR, crbFirstYear],
    [
      ITEMS_SHEET.ITEMNAMES.CRB_APPLICATION_AFTER_SECOND_YEAR,
      crbAfterSecondYear,
    ],
    [
      ITEMS_SHEET.ITEMNAMES.DRUG_TRANSPORTATION,
      returnIfEquals_(
        get_quotation_request_value_(
          QUOTATION_REQUEST_SHEET.ITEMNAMES.DRUG_TRANSPORTATION,
        ),
        COMMON_EXISTENCE_LABELS.YES,
        FUNCTION_FORMULAS.FACILITIES,
      ),
    ],
    [ITEMS_SHEET.ITEMNAMES.ESSENTIAL_DOCUMENTS_MONITORING, essentialDocuments],
  ]);
}
