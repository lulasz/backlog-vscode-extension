import * as vscode from "vscode";
import * as path from "path";

export function toRelativePath(workspaceRoot: string, uri: vscode.Uri): string {
  return path.relative(workspaceRoot, uri.fsPath).replace(/\\/g, "/");
}

export function isInsideWorkspace(
  workspaceRoot: string,
  uri: vscode.Uri,
): boolean {
  return uri.fsPath.startsWith(workspaceRoot);
}

export function getOpenTextTabUris(): vscode.Uri[] {
  const seen = new Map<string, vscode.Uri>();
  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      if (tab.input instanceof vscode.TabInputText) {
        seen.set(tab.input.uri.fsPath, tab.input.uri);
      }
    }
  }
  return [...seen.values()];
}
