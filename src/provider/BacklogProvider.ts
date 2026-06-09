import * as vscode from "vscode";
import { TaskItem } from "../tree/TaskItem";
import { FileItem } from "../tree/FileItem";
import { BacklogService } from "../services/BacklogService";

export class BacklogProvider implements vscode.TreeDataProvider<
  TaskItem | FileItem
> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<
    TaskItem | FileItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private readonly _service: BacklogService,
    private readonly workspaceRoot: string,
    private readonly _extensionUri: vscode.Uri,
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  // TreeDataProvider
  getTreeItem(element: TaskItem | FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TaskItem | FileItem): (TaskItem | FileItem)[] {
    if (!element) {
      return this.service.getTasks().map((t) => new TaskItem(t));
    }
    if (element instanceof TaskItem) {
      return element.task.files.map(
        (f) => new FileItem(f, element.task.id, this.workspaceRoot),
      );
    }
    return [];
  }

  // Service Bridge
  get service(): BacklogService {
    return this._service;
  }

  // Notifies the provider that data has changed so the tree can refresh
  notifyChanged(): void {
    this.refresh();
  }
}
