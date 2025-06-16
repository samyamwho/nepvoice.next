export interface CallLogDetail {
  callType: string;
  agent: string;
  transcript: string;
  notes: string;
  recordingUrl: string | null;
}

export interface CallLog {
  id: number;
  name: string;
  number: string;
  bank: string;
  schedule: string;
  status: "Completed" | "In Progress" | "Scheduled" | "Failed";
  timestamp: string;
  duration: string;
  details: CallLogDetail;
}
