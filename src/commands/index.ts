import * as vscode from "vscode";
import { BacklogProvider } from "../provider/BacklogProvider";
import { registerTaskCommands } from "./taskCommands";
import { registerFileCommands } from "./fileCommands";
import { COMMANDS } from "../constants";

export function registerAllCommands(
  context: vscode.ExtensionContext,
  provider: BacklogProvider,
  workspaceRoot: string,
): void {
  registerTaskCommands(context, provider, workspaceRoot);
  registerFileCommands(context, provider, workspaceRoot);

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.REFRESH, () => {
      provider.service.load();
      provider.notifyChanged();
    }),
  );
}
