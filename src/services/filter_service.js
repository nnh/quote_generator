/**
 * Show/hide filters.
 */
class FilterVisibleHidden {
  constructor(
    excludeSheets = [
      QUOTATION_SHEET_NAMES.PRICE,
      QUOTATION_SHEET_NAMES.PRICE_LOGIC_COMPANY,
      QUOTATION_SHEET_NAMES.PRICE_LOGIC,
    ],
  ) {
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.sheets = this.ss
      .getSheets()
      .filter((sheet) => !excludeSheets.includes(sheet.getName()));
  }
  getFilters() {
    return this.sheets.reduce((acc, sheet) => {
      const filter = sheet.getFilter();
      if (filter) acc.push(filter);
      return acc;
    }, []);
  }
  removeFilterCriteria(filter) {
    const column = filter.getRange().getColumn();
    filter.removeColumnFilterCriteria(column);
  }
  createFilterCriteria(hiddenValues = ["0"]) {
    return SpreadsheetApp.newFilterCriteria().setHiddenValues(hiddenValues);
  }
  setFilterCriteria(filter, criteria) {
    const column = filter.getRange().getColumn();
    filter.setColumnFilterCriteria(column, criteria);
  }
  applyFilter(criteria = null) {
    this.getFilters().forEach((filter) => {
      this.removeFilterCriteria(filter);
      if (criteria) this.setFilterCriteria(filter, criteria);
    });
  }
  resetFilterVisibility() {
    this.applyFilter();
  }
  hideFilterVisibility() {
    this.applyFilter(this.createFilterCriteria());
  }
}
