import * as vscode from "vscode";
import { BacklogProvider } from "./provider/BacklogProvider";
import { registerAllCommands } from "./commands";
import { VIEW_ID } from "./constants";
import { BacklogService } from "./services/BacklogService";
import { TaskDecorationProvider } from "./provider/TaskDecorationProvider";

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!workspaceRoot) {
    registerStubProvider();
    return;
  }

  const service = new BacklogService(workspaceRoot);
  const provider = new BacklogProvider(
    service,
    workspaceRoot,
    context.extensionUri,
  );

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(VIEW_ID, provider),
    vscode.window.registerFileDecorationProvider(new TaskDecorationProvider()),
  );

  registerAllCommands(context, provider, workspaceRoot);
}

export function deactivate(): void {}

// Private helpers
function registerStubProvider(): void {
  vscode.window.registerTreeDataProvider(VIEW_ID, {
    onDidChangeTreeData: new vscode.EventEmitter<void>().event,
    getTreeItem: (e: vscode.TreeItem) => e,
    getChildren: () => [],
  });
}
