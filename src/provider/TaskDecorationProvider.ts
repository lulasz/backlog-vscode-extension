import * as vscode from "vscode";

export class TaskDecorationProvider implements vscode.FileDecorationProvider {
  provideFileDecoration(
    uri: vscode.Uri,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.FileDecoration> {
    if (uri.scheme !== "backlog-task") {
      return undefined;
    }

    const status = uri.authority;

    switch (status) {
      case "done":
        return {
          color: new vscode.ThemeColor("gitDecoration.addedResourceForeground"),
        };
      case "blocked":
        return {
          color: new vscode.ThemeColor(
            "gitDecoration.deletedResourceForeground",
          ),
        };
      case "wip":
        return {
          color: new vscode.ThemeColor(
            "gitDecoration.modifiedResourceForeground",
          ),
        };
      case "todo":
      default:
        return {
          color: new vscode.ThemeColor("editor.foreground"),
        };
    }
  }
}
