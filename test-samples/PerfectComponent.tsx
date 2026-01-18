import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  userId: number;
}

/**
 * A well-crafted TodoList component following all React best practices
 */
export const TodoList: React.FC<TodoListProps> = ({ userId }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data in parallel to avoid async waterfall
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parallel fetching - best practice!
        const [userResponse, todosResponse] = await Promise.all([
          fetch(`https://api.example.com/users/${userId}`),
          fetch(`https://api.example.com/users/${userId}/todos`)
        ]);

        if (!userResponse.ok || !todosResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [userData, todosData] = await Promise.all([
          userResponse.json(),
          todosResponse.json()
        ]);

        // Only update state if component is still mounted
        if (isMounted) {
          setUser(userData);
          setTodos(todosData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [userId]); // Correct dependencies

  // Memoized computation - avoid recalculating on every render
  const completedCount = useMemo(() => {
    return todos.filter(todo => todo.completed).length;
  }, [todos]);

  // Stable callback reference with useCallback
  const handleToggleTodo = useCallback((todoId: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === todoId
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  }, []); // No external dependencies, stable forever

  // Another stable callback with functional state update
  const handleDeleteTodo = useCallback((todoId: number) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
  }, []);

  if (loading) {
    return <div>Loading todos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h2>{user.name}'s Todo List</h2>
      <p>Email: {user.email}</p>
      <p>
        Completed: {completedCount} / {todos.length}
      </p>

      <ul>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

// Extracted child component for better performance
interface TodoItemProps {
  todo: TodoItem;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = React.memo(({ todo, onToggle, onDelete }) => {
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.title}
      </span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
});

TodoItem.displayName = 'TodoItem';
