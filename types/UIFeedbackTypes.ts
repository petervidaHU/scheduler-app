export type UIFeedbackType = 'success' | 'error' | 'warning';

export interface Toast {
    title: string;
    message: string;
    type: UIFeedbackType;
    autoClose?: boolean; // If true, auto-close after 3s (default: true)
    closable?: boolean;  // If true, show X icon to close (default: true)
    id: string;
}