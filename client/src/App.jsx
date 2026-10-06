import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Loading...");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/db-test")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status); // "ok" or "error"
        setMessage(data.message); // "Database connected successfully"
        setUsers(data.users || []); // array of users
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error connecting to backend");
      });
  }, []);

  return (
    <div>
      <h1>CASH</h1>
      <p>Backend Status: {status}</p>
      <p>Message: {message}</p>

      <h2>Users</h2>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.email} (id: {user.id})
            </li>
          ))}
        </ul>
      ) : (
        <p>No users found</p>
      )}
    </div>
  );
}

export default App;
