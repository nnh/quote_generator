/**
 * COMPATIBILITY LAYER - reorganize_columns.gs
 * 
 * This file has been split into modular components for better maintainability:
 * - config-cache.gs: ConfigCache class for configuration management
 * - column-operations.gs: Add_del_columns class for column manipulations
 * - sheet-utilities.gs: Utility functions for sheet operations
 * - workflow-controller.gs: Main workflow orchestration functions
 * 
 * This compatibility layer ensures all existing code continues to work unchanged.
 * All classes and functions are now defined in their respective modular files.
 */

// Note: In Google Apps Script, all .gs files are automatically loaded
// into the global scope, so no explicit imports are needed.
// The following classes and functions are available from the modular files:

// From config-cache.gs:
// - class ConfigCache

// From column-operations.gs:
// - class Add_del_columns

// From sheet-utilities.gs:
// - function show_hidden_cols()
// - function total2_3_show_hidden_cols()
// - function get_years_target_col()
// - function get_goukei_row()
// - function extract_target_sheet()

// From workflow-controller.gs:
// - function initializeColumnReorganization_()
// - function setupColumnReorganization_()
// - function initializeTargetSheetColumns_()
// - function getValidTrialTermInfo_()
// - function addTrialTermColumns_()
// - function finalizeColumnReorganization_()
// - function total2_3_add_del_cols()

// Dependencies from common.gs (automatically available):
// - get_sheets(), getTrialTermInfo_(), initial_process(), filtervisible(), filterhidden()
