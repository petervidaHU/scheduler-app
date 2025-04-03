export type ToastType = 'success' | 'error' | 'warning';

export interface Toast {
    title: string;
    message: string;
    type: ToastType;
    autoClose: boolean;
    id: string;
}