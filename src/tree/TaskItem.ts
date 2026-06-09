import * as vscode from "vscode";
import { BacklogTask } from "../types";
import { MESSAGES } from "../constants/messages";

export class TaskItem extends vscode.TreeItem {
  readonly contextValue = "task";

  constructor(public readonly task: BacklogTask) {
    super(task.name, vscode.TreeItemCollapsibleState.Expanded);

    this.id = task.id;
    this.tooltip = task.name;
    this.description = TaskItem.buildDescription(this.task);

    this.iconPath = TaskItem.getStatusIcon(task.status);

    this.resourceUri = vscode.Uri.from({
      scheme: "backlog-task",
      authority: task.status,
      path: `/${task.id}`,
    });
  }

  private static getStatusIcon(
    status: BacklogTask["status"],
  ): vscode.ThemeIcon {
    switch (status) {
      case "done":
        return new vscode.ThemeIcon(
          "pass",
          new vscode.ThemeColor("gitDecoration.addedResourceForeground"),
        );
      case "blocked":
        return new vscode.ThemeIcon(
          "error",
          new vscode.ThemeColor("gitDecoration.deletedResourceForeground"),
        );
      case "wip":
        return new vscode.ThemeIcon(
          "record",
          new vscode.ThemeColor("gitDecoration.modifiedResourceForeground"),
        );
      case "todo":
      default:
        return new vscode.ThemeIcon(
          "remote-explorer-review-issues",
          new vscode.ThemeColor("editor.foreground"),
        );
    }
  }

  private static buildDescription(task: BacklogTask): string {
    if (task.files.length === 0) return MESSAGES.TREE.TASK_NO_FILES;
    return MESSAGES.TREE.TASK_FILES_COUNT(task.files.length);
  }
}
