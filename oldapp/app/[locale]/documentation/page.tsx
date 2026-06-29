import styles from "./documentation.module.css";

export default function DocumentationPage() {
  return (
    <div className={styles.docContainer}>
      <h1>Documentation</h1>
      <p>
        Welcome to the School Scheduler documentation. Here you'll find guides and information about using the app.
      </p>
      <h2>Getting Started</h2>
      <ul>
        <li>Navigate using the menu above to access different features.</li>
        <li>Use the Admin section to manage classes, teachers, and more.</li>
        <li>Schedules and timeslots can be managed from their respective sections.</li>
      </ul>
      <h2>Support</h2>
      <p>
        For help, contact your administrator or visit our support page.
      </p>
    </div>
  );
}
