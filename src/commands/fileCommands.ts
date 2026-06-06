import * as vscode from "vscode";
import * as path from "path";
import { BacklogProvider } from "../provider/BacklogProvider";
import { TaskItem } from "../tree/TaskItem";
import { FileItem } from "../tree/FileItem";
import { BacklogService } from "../services/BacklogService";
import {
  toRelativePath,
  isInsideWorkspace,
  getOpenTextTabUris,
} from "../utils/workspace";
import { pickTask, pickWorkspaceFile } from "../utils/quickPick";
import { COMMANDS } from "../constants";
import { MESSAGES } from "../constants/messages";

export function registerFileCommands(
  context: vscode.ExtensionContext,
  provider: BacklogProvider,
  workspaceRoot: string,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.ADD_FILE,
      handleAddFile(provider, workspaceRoot),
    ),
    vscode.commands.registerCommand(
      COMMANDS.ADD_ALL_OPEN_FILES,
      handleAddAllOpenFiles(provider, workspaceRoot),
    ),
    vscode.commands.registerCommand(
      COMMANDS.ADD_FILE_TO_TASK,
      handleAddFileToTask(provider, workspaceRoot),
    ),
    vscode.commands.registerCommand(
      COMMANDS.QUICK_ADD_FILE_TO_TASK,
      handleQuickAddFileToTask(provider, workspaceRoot),
    ),
    vscode.commands.registerCommand(
      COMMANDS.REMOVE_FILE,
      handleRemoveFile(provider),
    ),
    vscode.commands.registerCommand(COMMANDS.OPEN_FILE, handleOpenFile()),
  );
}

// Individual handlers
function handleAddFile(provider: BacklogProvider, workspaceRoot: string) {
  return async (item: TaskItem) => {
    const picked = await pickWorkspaceFile();
    if (!picked) return;

    const line = vscode.window.activeTextEditor?.selection.start.line ?? 0;
    addFileOrWarn(provider, item.task.id, {
      path: toRelativePath(workspaceRoot, picked.uri),
      line: line + 1,
    });
  };
}

function handleAddAllOpenFiles(
  provider: BacklogProvider,
  workspaceRoot: string,
) {
  return async (item: TaskItem) => {
    const openUris = getOpenTextTabUris();
    if (openUris.length === 0) {
      vscode.window.showInformationMessage(MESSAGES.FILE.NO_OPEN_FILES);
      return;
    }

    let addedCount = 0;
    for (const uri of openUris) {
      if (!isInsideWorkspace(workspaceRoot, uri)) continue;

      const doc = await vscode.workspace.openTextDocument(uri);
      // Use the document's current selection or first line if no editor is active for this doc
      const line =
        vscode.window.activeTextEditor?.document.uri.toString() ===
        uri.toString()
          ? vscode.window.activeTextEditor.selection.start.line
          : 0;

      if (
        provider.service.addFileToTask(item.task.id, {
          path: toRelativePath(workspaceRoot, uri),
          line: line + 1,
        })
      ) {
        addedCount++;
      }
    }

    if (addedCount > 0) {
      provider.notifyChanged();
    }

    vscode.window.showInformationMessage(
      addedCount > 0
        ? MESSAGES.FILE.ADDED_COUNT(addedCount)
        : MESSAGES.FILE.ALREADY_IN_TASK,
    );
  };
}

// Explorer context-menu
function handleAddFileToTask(provider: BacklogProvider, workspaceRoot: string) {
  return async (uriOrItem?: vscode.Uri) => {
    const tasks = requireTasksOrWarn(provider);
    if (!tasks) return;

    const fileUri = uriOrItem ?? vscode.window.activeTextEditor?.document.uri;
    if (!fileUri) {
      vscode.window.showWarningMessage(MESSAGES.FILE.NO_SELECTED_FILE);
      return;
    }
    if (!isInsideWorkspace(workspaceRoot, fileUri)) {
      vscode.window.showWarningMessage(MESSAGES.FILE.OUTSIDE_WORKSPACE);
      return;
    }

    const picked = await pickTask(tasks, MESSAGES.FILE.PICK_TASK_ADD);
    if (!picked) return;

    const line = vscode.window.activeTextEditor?.selection.start.line ?? 0;
    addFileOrWarn(provider, picked.id, {
      path: toRelativePath(workspaceRoot, fileUri),
      line: line + 1,
    });
  };
}

function handleQuickAddFileToTask(
  provider: BacklogProvider,
  workspaceRoot: string,
) {
  return async () => {
    const fileUri = vscode.window.activeTextEditor?.document.uri;
    if (!fileUri) {
      vscode.window.showWarningMessage(MESSAGES.FILE.NO_OPEN_FILE);
      return;
    }
    if (!isInsideWorkspace(workspaceRoot, fileUri)) {
      vscode.window.showWarningMessage(MESSAGES.FILE.OUTSIDE_WORKSPACE);
      return;
    }

    const relPath = toRelativePath(workspaceRoot, fileUri);
    const tasksWithFile = provider.service.getTasksContainingFile(relPath);

    if (tasksWithFile.length > 0) {
      const picked = await pickTask(
        tasksWithFile,
        MESSAGES.FILE.PICK_TASK_REMOVE,
      );
      if (!picked) return;
      provider.service.removeFileFromTask(picked.id, relPath);
      provider.notifyChanged();
      vscode.window.showInformationMessage(
        MESSAGES.FILE.REMOVED_FILE(path.basename(relPath), picked.label),
      );
      return;
    }

    const tasks = requireTasksOrWarn(provider);
    if (!tasks) return;

    const picked = await pickTask(tasks, MESSAGES.FILE.PICK_TASK_ADD);
    if (!picked) return;

    const line = vscode.window.activeTextEditor?.selection.start.line ?? 0;
    addFileOrWarn(provider, picked.id, {
      path: relPath,
      line: line + 1,
    });
  };
}

function handleRemoveFile(provider: BacklogProvider) {
  return (item: FileItem) => {
    provider.service.removeFileFromTask(item.taskId, item.file.path);
    provider.notifyChanged();
  };
}

function handleOpenFile() {
  return (arg: string | { uri: vscode.Uri; selection: vscode.Range }) => {
    if (typeof arg === "string") {
      vscode.window
        .showTextDocument(vscode.Uri.file(arg))
        .then(undefined, () =>
          vscode.window.showErrorMessage(MESSAGES.FILE.OPEN_ERROR(arg)),
        );
    } else {
      vscode.window
        .showTextDocument(arg.uri, { selection: arg.selection })
        .then(undefined, () =>
          vscode.window.showErrorMessage(
            MESSAGES.FILE.OPEN_ERROR(arg.uri.fsPath),
          ),
        );
    }
  };
}

// Shared helpers
function requireTasksOrWarn(
  provider: BacklogProvider,
): ReturnType<BacklogService["getTasks"]> | undefined {
  const tasks = provider.service.getTasks();
  if (tasks.length === 0) {
    vscode.window.showWarningMessage(MESSAGES.FILE.NO_TASKS_WARN);
    return undefined;
  }
  return tasks;
}

function addFileOrWarn(
  provider: BacklogProvider,
  taskId: string,
  file: { path: string; line: number },
): void {
  if (!provider.service.addFileToTask(taskId, file)) {
    vscode.window.showInformationMessage(
      MESSAGES.FILE.ALREADY_ADDED(path.basename(file.path)),
    );
  } else {
    provider.notifyChanged();
  }
}
