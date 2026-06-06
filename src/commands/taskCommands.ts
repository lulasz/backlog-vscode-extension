import * as vscode from "vscode";
import * as path from "path";
import { BacklogProvider } from "../provider/BacklogProvider";
import { TaskItem } from "../tree/TaskItem";
import { COMMANDS } from "../constants";
import { MESSAGES } from "../constants/messages";

export function registerTaskCommands(
  context: vscode.ExtensionContext,
  provider: BacklogProvider,
  workspaceRoot: string,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.ADD_TASK, handleAddTask(provider)),
    vscode.commands.registerCommand(
      COMMANDS.EDIT_TASK,
      handleEditTask(provider),
    ),
    vscode.commands.registerCommand(
      COMMANDS.DELETE_TASK,
      handleDeleteTask(provider),
    ),
    vscode.commands.registerCommand(
      COMMANDS.TOGGLE_COMPLETE,
      handleToggleComplete(provider),
    ),
    vscode.commands.registerCommand(
      COMMANDS.OPEN_ALL_TASK_FILES,
      handleOpenAllTaskFiles(workspaceRoot),
    ),
  );
}

function handleAddTask(provider: BacklogProvider) {
  return async () => {
    const name = await vscode.window.showInputBox({
      prompt: MESSAGES.TASK.ADD_PROMPT,
      placeHolder: MESSAGES.TASK.ADD_PLACEHOLDER,
      validateInput: (v) => (v.trim() ? null : MESSAGES.TASK.REQUIRED_NAME),
    });
    if (name?.trim()) {
      provider.service.addTask(name.trim());
      provider.notifyChanged();
    }
  };
}

function handleEditTask(provider: BacklogProvider) {
  return async (item: TaskItem) => {
    const name = await vscode.window.showInputBox({
      prompt: MESSAGES.TASK.EDIT_PROMPT,
      value: item.task.name,
      validateInput: (v) => (v.trim() ? null : MESSAGES.TASK.REQUIRED_NAME),
    });
    if (name?.trim()) {
      provider.service.renameTask(item.task.id, name.trim());
      provider.notifyChanged();
    }
  };
}

function handleDeleteTask(provider: BacklogProvider) {
  return async (item: TaskItem) => {
    const confirmed = await vscode.window.showWarningMessage(
      MESSAGES.TASK.DELETE_CONFIRM(item.task.name),
      { modal: true },
      MESSAGES.TASK.DELETE_BUTTON,
    );
    if (confirmed === MESSAGES.TASK.DELETE_BUTTON) {
      provider.service.deleteTask(item.task.id);
      provider.notifyChanged();
    }
  };
}

function handleToggleComplete(provider: BacklogProvider) {
  return async (item: TaskItem) => {
    provider.service.toggleComplete(item.task.id);
    provider.notifyChanged();
  };
}

function handleOpenAllTaskFiles(workspaceRoot: string) {
  return async (item: TaskItem) => {
    if (item.task.files.length === 0) {
      vscode.window.showInformationMessage(MESSAGES.TASK.NO_FILES);
      return;
    }

    const results = await Promise.all(
      item.task.files.map((file) =>
        vscode.window
          .showTextDocument(
            vscode.Uri.file(path.join(workspaceRoot, file.path)),
            {
              selection: new vscode.Range(file.line - 1, 0, file.line - 1, 0),
              preview: false,
            },
          )
          .then(
            () => true,
            (err) => {
              console.error(`Failed to open: ${file.path}`, err);
              return null;
            },
          ),
      ),
    );

    const successCount = results.filter((r) => r === true).length;

    if (successCount === 0) {
      vscode.window.showErrorMessage(MESSAGES.TASK.OPEN_FILES_ERROR);
      return;
    }
  };
}
