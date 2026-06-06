import * as vscode from "vscode";
import * as path from "path";
import { BacklogTask } from "../types";
import { MESSAGES } from "../constants/messages";

export type TaskPick = vscode.QuickPickItem & { id: string };
export type FilePick = vscode.QuickPickItem & { uri: vscode.Uri };

export function toTaskPick(task: BacklogTask): TaskPick {
  return { label: task.name, id: task.id };
}

export async function pickTask(
  tasks: BacklogTask[],
  placeHolder: string,
): Promise<TaskPick | undefined> {
  return vscode.window.showQuickPick(tasks.map(toTaskPick), { placeHolder });
}

export async function pickWorkspaceFile(): Promise<FilePick | undefined> {
  const workspaceFolderUri = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (!workspaceFolderUri) {
    vscode.window.showErrorMessage(MESSAGES.QUICKPICK.FILE_NO_WORKSPACE);
    return undefined;
  }

  const files = await vscode.workspace.findFiles(
    "**/*",
    "**/{node_modules,.git,.vscode}/**",
  );

  if (files.length === 0) {
    vscode.window.showInformationMessage(MESSAGES.QUICKPICK.FILE_NO_FOUND);
    return undefined;
  }

  const picks: FilePick[] = files
    .map((uri) => ({
      label: path.basename(uri.fsPath),
      description: path.relative(workspaceFolderUri.fsPath, uri.fsPath),
      uri,
    }))
    .sort((a, b) => (a.description ?? "").localeCompare(b.description ?? ""));

  return vscode.window.showQuickPick(picks, {
    placeHolder: MESSAGES.QUICKPICK.FILE_PICK_PLACEHOLDER,
    matchOnDescription: true,
  });
}
