"use client"; 

import { useEffect } from "react";

export default function Error({ error, reset }: {error: any, reset: any}) {
  useEffect(() => {
    console.error("Caught an error:", error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Something went wrong.</h2>
      <p>We're having trouble loading this part of the page. Please try again.</p>
      <button onClick={() => reset()} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        Retry
      </button>
    </div>
  );
}