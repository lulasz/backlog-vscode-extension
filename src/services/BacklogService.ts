import * as vscode from "vscode";
import { BacklogTask, BacklogData } from "../types";
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
    return this.data.tasks;
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
      completed: false,
      timestamp: Date.now(),
    });
    this.save();
  }

  toggleComplete(taskId: string): void {
    const task = this.findTask(taskId);
    if (task) {
      task.completed = !task.completed;
      task.timestamp = Date.now();
      this.save();
    }
  }

  renameTask(taskId: string, newName: string): void {
    const task = this.findTask(taskId);
    if (task) {
      task.name = newName;
      task.timestamp = Date.now();
      this.save();
    }
  }

  deleteTask(taskId: string): void {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
    this.save();
  }

  addFileToTask(taskId: string, file: { path: string; line: number }): boolean {
    const task = this.findTask(taskId);
    if (!task || task.files.some((f) => f.path === file.path)) return false;
    task.files.push(file);
    task.timestamp = Date.now();
    this.save();
    return true;
  }

  removeFileFromTask(taskId: string, filePath: string): void {
    const task = this.findTask(taskId);
    if (task) {
      task.files = task.files.filter((f) => f.path !== filePath);
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
