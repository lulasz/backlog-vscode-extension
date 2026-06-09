export type TaskStatus = "todo" | "wip" | "done" | "blocked";

export interface BacklogTask {
  id: string;
  name: string;
  files: BacklogFile[];
  status: TaskStatus;
  timestamp: number;
}

export interface BacklogFile {
  path: string;
  line: number;
}

export interface BacklogData {
  tasks: BacklogTask[];
}
