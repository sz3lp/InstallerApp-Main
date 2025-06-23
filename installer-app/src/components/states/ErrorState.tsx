export function ErrorState({ error }: { error: Error | string }) {
  return <div className="error-message">{error.toString()}</div>;
}

export default ErrorState;
