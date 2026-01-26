/**
 * Show/hide filters.
 */
class FilterVisibleHidden {
  constructor() {
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    // Price, PriceLogic, and PriceLogicCompany sheets are excluded.
    const targetSheetNames = ["Price", "PriceLogicCompany", "PriceLogic"];
    this.sheets = this.ss
      .getSheets()
      .filter((x) => !targetSheetNames.some((v) => x.getName() === v));
  }
  getFilters() {
    return this.sheets.map((sheet) => sheet.getFilter()).filter((x) => x);
  }
  removeFilterCriteria(targetFilter) {
    const col = targetFilter.getRange().getColumn();
    targetFilter.removeColumnFilterCriteria(col);
  }
  createFilterCriteria() {
    const filterCriteria = SpreadsheetApp.newFilterCriteria();
    filterCriteria.setHiddenValues(["0"]);
    return filterCriteria;
  }
  setFilterCriteria(targetFilter, criteria) {
    const col = targetFilter.getRange().getColumn();
    targetFilter.setColumnFilterCriteria(col, criteria);
  }
  filterVisible() {
    this.getFilters().forEach((filter) => this.removeFilterCriteria(filter));
  }
  filterHidden() {
    this.getFilters().forEach((filter) => {
      this.removeFilterCriteria(filter);
      const criteria = this.createFilterCriteria();
      this.setFilterCriteria(filter, criteria);
    });
  }
}
