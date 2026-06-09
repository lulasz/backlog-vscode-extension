export const MESSAGES = {
  // Storage errors
  STORAGE: {
    DIR_NOT_DIR: "Backlog: .vscode exists but is not a directory.",
    FILE_IS_DIR: "Backlog: .vscode/backlog.json is a directory, not a file.",
    ERROR: (err: string) => `Backlog storage error: ${err}`,
    SAVE_ERROR: (err: string) => `Could not save backlog: ${err}`,
  },

  // Task commands
  TASK: {
    ADD_PROMPT: "Task name",
    ADD_PLACEHOLDER: "e.g. Refactor auth module",
    REQUIRED_NAME: "Name cannot be empty",
    EDIT_PROMPT: "Rename task",
    DELETE_CONFIRM: (name: string) => `Delete task "${name}"?`,
    DELETE_BUTTON: "Delete",
    NO_FILES: "No files in this task.",
    OPEN_FILES_ERROR: "Could not open any files in this task.",
    TOGGLE_COMPLETE: "Toggle Complete",
  },

  // File commands
  FILE: {
    NO_OPEN_FILES: "No files are currently open.",
    ADDED_COUNT: (count: number) =>
      `Added ${count} file${count !== 1 ? "s" : ""} to task.`,
    ALREADY_IN_TASK: "All open files are already in this task.",
    NO_SELECTED_FILE: "No file selected or open.",
    OUTSIDE_WORKSPACE: "File is outside the workspace.",
    PICK_TASK_ADD: "Add to task…",
    PICK_TASK_REMOVE: "Remove file from task…",
    REMOVED_FILE: (fileName: string, taskName: string) =>
      `Removed "${fileName}" from "${taskName}".`,
    NO_OPEN_FILE: "No file open.",
    OPEN_ERROR: (path: string) => `Could not open file: ${path}`,
    NO_TASKS_WARN: "No tasks yet — create one first.",
    ALREADY_ADDED: (fileName: string) =>
      `"${fileName}" is already in this task.`,
  },

  // QuickPick
  QUICKPICK: {
    FILE_NO_WORKSPACE: "No workspace folder open.",
    FILE_NO_FOUND: "No files found in workspace.",
    FILE_PICK_PLACEHOLDER: "Select a file to add…",
  },

  // Tree items
  TREE: {
    TASK_NO_FILES: "no files",
    TASK_FILES_COUNT: (count: number) =>
      `${count} file${count !== 1 ? "s" : ""}`,
  },
} as const;
