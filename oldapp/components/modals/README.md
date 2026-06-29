# Modal System

This folder contains the application's modal system, which is built on top of Mantine UI components.

## Usage

### Basic Modal

To use a modal anywhere in your application:

```tsx
import { useModal } from "@/components/modals/ModalManager";

function YourComponent() {
  const { openModal, closeModal } = useModal();
  
  const handleOpenModal = () => {
    openModal(
      <div>
        <h2>Your Modal Content</h2>
        <p>This is the content of your modal.</p>
        <button onClick={closeModal}>Close Modal</button>
      </div>,
      {
        title: "Your Modal Title",
        size: "md",
        centered: true
      }
    );
  };
  
  return <button onClick={handleOpenModal}>Open Modal</button>;
}
```

### Confirmation Modal

For confirmation dialogs:

```tsx
import { useModal } from "@/components/modals/ModalManager";

function YourComponent() {
  const { openConfirmModal } = useModal();
  
  const handleConfirmation = () => {
    openConfirmModal({
      title: "Confirm Action",
      children: <p>Are you sure you want to perform this action?</p>,
      labels: { confirm: "Yes, Continue", cancel: "No, Cancel" },
      onConfirm: () => {
        // Action to perform when confirmed
        console.log("Action confirmed!");
      },
      onCancel: () => {
        // Optional: Action to perform when cancelled
        console.log("Action cancelled");
      }
    });
  };
  
  return <button onClick={handleConfirmation}>Perform Action</button>;
}
```

## Modal Options

The `openModal` function accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| title | string | "" | The title displayed in the modal header |
| size | string \| number | "md" | Modal size (xs, sm, md, lg, xl, or number value) |
| fullScreen | boolean | false | Whether the modal should take up the full screen |
| centered | boolean | true | Whether the modal should be centered on the screen |
| withCloseButton | boolean | true | Whether to show a close button in the modal header |
| closeOnClickOutside | boolean | true | Whether clicking outside the modal should close it |
| closeOnEscape | boolean | true | Whether pressing the Escape key should close it |
| overlayProps | object | {} | Props to pass to the modal overlay |
| onClose | function | null | Function to call when the modal is closed |

## Creating Modal Components

Create reusable modal components in the `components/modals/` directory. For example, see `CreateLessonModal.tsx`.

When creating a modal component:

1. Export a React component that takes a `closeModal` prop
2. Structure your modal content using Mantine components
3. Call the `closeModal` function when the modal should be closed 