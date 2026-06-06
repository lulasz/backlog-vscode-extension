import * as vscode from "vscode";
import { BacklogTask } from "../types";
import { MESSAGES } from "../constants/messages";

export class TaskItem extends vscode.TreeItem {
  readonly contextValue = "task";

  constructor(public readonly task: BacklogTask) {
    const label = task.completed ? `${task.name} ✓` : task.name;
    super(label, vscode.TreeItemCollapsibleState.Expanded);

    this.id = task.id;
    this.tooltip = task.name;
    this.description = TaskItem.buildDescription(this.task);
  }

  private static buildDescription(task: BacklogTask): string {
    if (task.completed) return MESSAGES.TREE.TASK_COMPLETED;
    if (task.files.length === 0) return MESSAGES.TREE.TASK_NO_FILES;
    return MESSAGES.TREE.TASK_FILES_COUNT(task.files.length);
  }
}
