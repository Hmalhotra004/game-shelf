export type ClientToServerEvents = {
  start_sync: () => void;
  mark_notification_read: (id: string) => void;
};

export type ServerToClientEvents = {
  sync_status: (message: string) => void;
  error_message: (message: string) => void;
};
