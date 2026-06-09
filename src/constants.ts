export const VIEW_ID = "backlog";

export const COMMANDS = {
  ADD_TASK: "backlog.addTask",
  EDIT_TASK: "backlog.editTask",
  DELETE_TASK: "backlog.deleteTask",
  SET_STATUS_TODO: "backlog.setStatusTodo",
  SET_STATUS_WIP: "backlog.setStatusWip",
  SET_STATUS_DONE: "backlog.setStatusDone",
  SET_STATUS_BLOCKED: "backlog.setStatusBlocked",
  OPEN_ALL_TASK_FILES: "backlog.openAllTaskFiles",

  ADD_FILE: "backlog.addFile",
  ADD_ALL_OPEN_FILES: "backlog.addAllOpenFiles",
  ADD_FILE_TO_TASK: "backlog.addFileToTask",
  QUICK_ADD_FILE_TO_TASK: "backlog.quickAddFileToTask",
  REMOVE_FILE: "backlog.removeFile",
  OPEN_FILE: "backlog.openFile",

  REFRESH: "backlog.refresh",
} as const;

export const STORAGE = {
  DIR: ".vscode",
  FILE: "backlog.json",
} as const;
