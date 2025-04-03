import { useState, useEffect, FormEvent } from "react";
import "./App.css";

interface Recommendation {
  itemId: string;
  score: number;
  title?: string;
  description?: string;
}

function App() {
  const [userId, setUserId] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available userIDs and itemIDs for selection
  const [availableUserIds, setAvailableUserIds] = useState<string[]>([]);
  const [availableItemIds, setAvailableItemIds] = useState<string[]>([]);

  // Results from different models
  const [contentBasedResults, setContentBasedResults] = useState<
    Recommendation[]
  >([]);
  const [collaborativeResults, setCollaborativeResults] = useState<
    Recommendation[]
  >([]);
  const [WaDResults, setWaDResults] = useState<Recommendation[]>([]);

  // Fetch available userIDs and itemIDs when component mounts
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch available userIDs and itemIDs
        const userResponse = await fetch("/api/users");
        const itemResponse = await fetch("/api/items");

        if (!userResponse.ok || !itemResponse.ok) {
          throw new Error("Failed to fetch options");
        }

        const userData = await userResponse.json();
        const itemData = await itemResponse.json();

        setAvailableUserIds(userData);
        setAvailableItemIds(itemData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load options");
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId && !itemId) {
      setError("Please select either a User ID or an Item ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create query params based on which fields are selected
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (itemId) params.append("itemId", itemId);

      // Fetch recommendations from all three models
      const contentResponse = await fetch(
        `/api/recommendations/content-based?${params}`
      );
      const collaborativeResponse = await fetch(
        `/api/recommendations/collaborative?${params}`
      );
      const WaDResponse = await fetch(
        `/api/recommendations/hybrid?${params}`
      );

      if (
        !contentResponse.ok ||
        !collaborativeResponse.ok ||
        !WaDResponse.ok
      ) {
        throw new Error("Failed to fetch recommendations");
      }

      const contentData = await contentResponse.json();
      const collaborativeData = await collaborativeResponse.json();
      const WaDData = await WaDResponse.json();

      setContentBasedResults(contentData);
      setCollaborativeResults(collaborativeData);
      setWaDResults(WaDData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const ResultsTable = ({
    title,
    results,
  }: {
    title: string;
    results: Recommendation[];
  }) => (
    <div className="model-results">
      <h2>{title}</h2>
      {results.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Score</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item) => (
              <tr key={item.itemId}>
                <td>{item.itemId}</td>
                <td>{item.score.toFixed(4)}</td>
                <td>{item.title || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No recommendations found </p>
      )}
    </div>
  );

  return (
    <div className="recommendation-app">
      <h1>Article Recommendation System</h1>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <label htmlFor="userId">User ID: </label>
          <select
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">Select a User ID</option>
            {availableUserIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="itemId">Item ID: </label>
          <select
            id="itemId"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          >
            <option value="">Select an Item ID</option>
            {availableItemIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Recommendations"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading recommendations...</div>
      ) : (
        <div className="results-container">
          <ResultsTable
            title="Content-Based Recommendations"
            results={contentBasedResults}
          />
          <ResultsTable
            title="Collaborative Filtering Recommendations"
            results={collaborativeResults}
          />
          <ResultsTable
            title="Wide and De Recommendations"
            results={WaDResults}
          />
        </div>
      )}
    </div>
  );
}

export default App;
