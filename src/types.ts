export interface BacklogTask {
  id: string;
  name: string;
  files: BacklogFile[];
  completed: boolean;
  timestamp: number;
}

export interface BacklogFile {
  path: string;
  line: number;
}

export interface BacklogData {
  tasks: BacklogTask[];
}
