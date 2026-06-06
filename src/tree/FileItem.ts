import * as vscode from "vscode";
import * as path from "path";
import { COMMANDS } from "../constants";
import { BacklogFile } from "../types";

export class FileItem extends vscode.TreeItem {
  readonly contextValue = "taskFile";

  constructor(
    public readonly file: BacklogFile,
    public readonly taskId: string,
    workspaceRoot: string,
  ) {
    super(path.basename(file.path), vscode.TreeItemCollapsibleState.None);

    const absPath = path.join(workspaceRoot, file.path);
    this.resourceUri = vscode.Uri.file(absPath);
    this.tooltip = file.path;

    this.description = `line ${file.line}, ${file.path}`;

    this.command = {
      command: COMMANDS.OPEN_FILE,
      title: "Open File",
      arguments: [
        {
          uri: this.resourceUri,
          selection: new vscode.Range(file.line - 1, 0, file.line - 1, 0),
        },
      ],
    };
  }
}
