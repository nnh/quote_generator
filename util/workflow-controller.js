/**
 * Workflow Controller Module (workflow-controller.gs)
 *
 * This module provides the main workflow functions and their helper methods for
 * orchestrating column reorganization processes. It coordinates between all other
 * modules to execute the complete workflow.
 *
 * Functions:
 * - initializeColumnReorganization_(): Initializes the reorganization process
 * - setupColumnReorganization_(): Sets up configuration and target sheets
 * - initializeTargetSheetColumns_(): Initializes columns for all target sheets
 * - getValidTrialTermInfo_(): Gets and validates trial term information
 * - addTrialTermColumns_(): Adds columns based on trial term data
 * - finalizeColumnReorganization_(): Finalizes the reorganization process
 * - total2_3_add_del_cols(): Main entry point for column reorganization
 *
 * Dependencies:
 * - ConfigCache (from config-cache.gs)
 * - Add_del_columns (from column-operations.gs)
 * - extract_target_sheet() (from sheet-utilities.gs)
 * - total2_3_show_hidden_cols() (from sheet-utilities.gs)
 * - initial_process(), filtervisible(), filterhidden(), getTrialTermInfo_() (from common.gs)
 */

/**
 * Initialize the column reorganization process
 * @return {void}
 */
function initializeColumnReorganization_() {
  try {
    initial_process();

    filtervisible();
  } catch (error) {
    console.error(
      "Error in initializeColumnReorganization_:",
      error.toString()
    );
    throw error;
  }
}

/**
 * Setup configuration cache and get target sheets
 * @return {Object} Object containing cache and target_sheets
 */
function setupColumnReorganization_() {
  try {
    const cache = new ConfigCache();
    const target_sheets = extract_target_sheet(cache);
    if (!target_sheets || target_sheets.length === 0) {
      throw new Error("No target sheets found for column operations");
    }
    return { cache, target_sheets };
  } catch (error) {
    console.error("Error in setupColumnReorganization_:", error.toString());
    throw error;
  }
}

/**
 * Initialize columns for all target sheets
 * @param {Array} target_sheets Array of sheet objects
 * @param {ConfigCache} cache Configuration cache instance
 * @return {void}
 */
function initializeTargetSheetColumns_(target_sheets, cache) {
  try {
    target_sheets.forEach((x) => {
      if (x) {
        new Add_del_columns(x, cache).init_cols();
      }
    });
  } catch (error) {
    console.error("Error in initializeTargetSheetColumns_:", error.toString());
    throw error;
  }
}

/**
 * Get and validate trial term information
 * @return {Array} Filtered trial term info for column addition
 */
function getValidTrialTermInfo_() {
  try {
    const trial_term_info = getTrialTermInfo_();
    if (!trial_term_info || !Array.isArray(trial_term_info)) {
      throw new Error("Failed to get trial term info");
    }

    const add_columns = trial_term_info.filter(
      (x) => x && Array.isArray(x) && x.length > 2 && x[2] > 1
    );
    return add_columns;
  } catch (error) {
    console.error("Error in getValidTrialTermInfo_:", error.toString());
    throw error;
  }
}

/**
 * Add columns based on trial term information
 * @param {Array} target_sheets Array of sheet objects
 * @param {Array} add_columns Filtered trial term info for addition
 * @param {ConfigCache} cache Configuration cache instance
 * @return {void}
 */
function addTrialTermColumns_(target_sheets, add_columns, cache) {
  try {
    if (add_columns.length > 0) {
      target_sheets.forEach((x) => {
        if (x) {
          const add_del = new Add_del_columns(x, cache);
          add_columns.forEach((y) => {
            if (y && Array.isArray(y)) {
              add_del.add_target = y;
              add_del.add_cols();
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Error in addTrialTermColumns_:", error.toString());
    throw error;
  }
}

/**
 * Finalize column reorganization by hiding columns and setting filters
 * @return {void}
 */
function finalizeColumnReorganization_() {
  try {
    total2_3_show_hidden_cols();

    filterhidden();
  } catch (error) {
    console.error("Error in finalizeColumnReorganization_:", error.toString());
    throw error;
  }
}

/**
 * Trialシートの試験期間年数から列の追加削除を行う
 * @param none
 * @return none
 */
function total2_3_add_del_cols() {
  try {
    initializeColumnReorganization_();

    const { cache, target_sheets } = setupColumnReorganization_();

    initializeTargetSheetColumns_(target_sheets, cache);

    const add_columns = getValidTrialTermInfo_();

    addTrialTermColumns_(target_sheets, add_columns, cache);

    finalizeColumnReorganization_();
  } catch (error) {
    console.error("Error in total2_3_add_del_cols:", error.toString());
  }
}
