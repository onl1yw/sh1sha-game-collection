import styles from "./AppStatusBanner.module.css";

interface AppStatusBannerProps {
  messages: readonly string[];
}

export function AppStatusBanner({ messages }: AppStatusBannerProps) {
  const uniqueMessages = [...new Set(messages)];
  if (uniqueMessages.length === 0) return null;

  return (
    <aside className={styles.banner} role="status" aria-live="polite">
      {uniqueMessages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </aside>
  );
}
