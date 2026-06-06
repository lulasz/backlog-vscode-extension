import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { BacklogData } from "../types";
import { STORAGE } from "../constants";
import { MESSAGES } from "../constants/messages";

const EMPTY_DATA: BacklogData = { tasks: [] };

export function getBacklogPath(
  workspaceRoot: string,
  filename: string = STORAGE.FILE,
): string {
  return path.join(workspaceRoot, STORAGE.DIR, filename);
}

function assertReadable(
  workspaceRoot: string,
  filename: string = STORAGE.FILE,
): boolean {
  const vsDir = path.join(workspaceRoot, STORAGE.DIR);
  const backlogPath = getBacklogPath(workspaceRoot, filename);

  try {
    if (fs.existsSync(vsDir) && !fs.statSync(vsDir).isDirectory()) {
      vscode.window.showErrorMessage(MESSAGES.STORAGE.DIR_NOT_DIR);
      return false;
    }
    if (fs.existsSync(backlogPath) && fs.statSync(backlogPath).isDirectory()) {
      vscode.window.showErrorMessage(MESSAGES.STORAGE.FILE_IS_DIR);
      return false;
    }
    return true;
  } catch (err) {
    vscode.window.showErrorMessage(
      MESSAGES.STORAGE.ERROR(err instanceof Error ? err.message : String(err)),
    );
    return false;
  }
}

function assertWritable(
  workspaceRoot: string,
  filename: string = STORAGE.FILE,
): boolean {
  if (!assertReadable(workspaceRoot, filename)) return false;

  const vsDir = path.join(workspaceRoot, STORAGE.DIR);
  try {
    if (!fs.existsSync(vsDir)) {
      fs.mkdirSync(vsDir, { recursive: true });
    }
    return true;
  } catch (err) {
    vscode.window.showErrorMessage(
      MESSAGES.STORAGE.ERROR(err instanceof Error ? err.message : String(err)),
    );
    return false;
  }
}

export function loadData(
  workspaceRoot: string,
  filename: string = STORAGE.FILE,
): BacklogData {
  try {
    if (!assertReadable(workspaceRoot, filename)) return { ...EMPTY_DATA };

    const backlogPath = getBacklogPath(workspaceRoot, filename);
    if (!fs.existsSync(backlogPath)) return { ...EMPTY_DATA };

    const raw = fs.readFileSync(backlogPath, "utf-8");
    const parsed = JSON.parse(raw) as BacklogData;
    return Array.isArray(parsed.tasks) ? parsed : { ...EMPTY_DATA };
  } catch {
    return { ...EMPTY_DATA };
  }
}

export function saveData(
  workspaceRoot: string,
  data: BacklogData,
  filename: string = STORAGE.FILE,
): boolean {
  if (!assertWritable(workspaceRoot, filename)) return false;

  try {
    fs.writeFileSync(
      getBacklogPath(workspaceRoot, filename),
      JSON.stringify(data, null, 2),
    );
    return true;
  } catch (err) {
    vscode.window.showErrorMessage(
      MESSAGES.STORAGE.SAVE_ERROR(
        err instanceof Error ? err.message : String(err),
      ),
    );
    return false;
  }
}
