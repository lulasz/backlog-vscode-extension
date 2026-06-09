import * as vscode from "vscode";
import { BacklogTask, BacklogData, TaskStatus } from "../types";
import { loadData, saveData } from "../utils/storage";

export class BacklogService {
  private data: BacklogData = { tasks: [] };
  private workspaceRoot: string;
  private filename: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.filename =
      vscode.workspace.getConfiguration("backlog").get<string>("filename") ??
      "backlog.json";
    this.load();
  }

  load(): void {
    this.data = loadData(this.workspaceRoot, this.filename);
  }

  private save(): void {
    saveData(this.workspaceRoot, this.data, this.filename);
  }

  getTasks(): BacklogTask[] {
    const statusPriority: Record<string, number> = {
      wip: 1,
      todo: 2,
      blocked: 3,
      done: 4,
    };

    return [...this.data.tasks].sort((a, b) => {
      if (a.status !== b.status) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      return b.timestamp - a.timestamp;
    });
  }

  getTasksContainingFile(relPath: string): BacklogTask[] {
    return this.data.tasks.filter((t) =>
      t.files.some((f) => f.path === relPath),
    );
  }

  addTask(name: string): void {
    this.data.tasks.push({
      id: this.generateId(),
      name,
      files: [],
      status: "todo",
      timestamp: Date.now(),
    });
    this.save();
  }

  setStatus(taskId: string, status: TaskStatus): void {
    this.updateTask(taskId, (task) => {
      task.status = status;
    });
  }

  renameTask(taskId: string, newName: string): void {
    this.updateTask(taskId, (task) => {
      task.name = newName;
    });
  }

  deleteTask(taskId: string): void {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
    this.save();
  }

  addFileToTask(taskId: string, file: { path: string; line: number }): boolean {
    let success = false;
    this.updateTask(taskId, (task) => {
      if (!task.files.some((f) => f.path === file.path)) {
        task.files.push(file);
        success = true;
      }
    });
    return success;
  }

  removeFileFromTask(taskId: string, filePath: string): void {
    this.updateTask(taskId, (task) => {
      task.files = task.files.filter((f) => f.path !== filePath);
    });
  }

  private updateTask(
    taskId: string,
    updater: (task: BacklogTask) => void,
  ): void {
    const task = this.findTask(taskId);
    if (task) {
      updater(task);
      task.timestamp = Date.now();
      this.save();
    }
  }

  private findTask(taskId: string): BacklogTask | undefined {
    return this.data.tasks.find((t) => t.id === taskId);
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
