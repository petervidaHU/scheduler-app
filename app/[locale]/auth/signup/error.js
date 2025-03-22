'use client';

export default function Error({ error, reset }) {
    console.log('in erorr', error)
  const errorMessages = JSON.parse(error.message);

  return (
    <div>
      <h2 style={{ color: 'red' }}>An error occurred:</h2>
      {Object.values(errorMessages).map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
      <button onClick={() => reset()}>Try Again</button>
    </div>
  );
}
