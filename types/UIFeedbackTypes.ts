export type UIFeedbackType = 'success' | 'error' | 'warning';

export interface Toast {
    title: string;
    message: string;
    type: UIFeedbackType;
    autoClose: boolean;
    id: string;
}