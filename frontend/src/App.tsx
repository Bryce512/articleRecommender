import { useState, useEffect, FormEvent } from "react";
import Papa from "papaparse";
import "./App.css";
import ResultsTable from "./ResultsTable";
import { User, Item, Rating, Recommendation } from "./types";


function App() {
  const [userId, setUserId] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Store data from CSV files
  const [userData, setUserData] = useState<User[]>([]);
  const [itemData, setItemData] = useState<Item[]>([]);
  const [ratingData, setRatingData] = useState<Rating[]>([]);

  // Available userIDs and itemIDs for selection
  const [availableUserIds, setAvailableUserIds] = useState<string[]>([]);
  const [availableItemIds, setAvailableItemIds] = useState<string[][]>([]);

  // Results from different models
  const [contentBasedResults, setContentBasedResults] = useState<
    Recommendation[]>([]);
  const [collaborativeResults, setCollaborativeResults] = useState<
    Recommendation[]>([]);
  const [WaDResults, setWaDResults] = useState<Recommendation[]>([]);

  // Load CSV files from public folder
  useEffect(() => {
    const loadCsvFiles = async () => {
      setLoading(true);
      try {
        // Load users, items, and ratings CSV files
        const usersCsvData = await loadCsv("/users_interactions.csv");
        const itemsCsvData = await loadCsv("/shared_articles.csv");
        const ratingsCsvData = await loadCsv("/ratings.csv");

        // Parse CSV data
        const users = Papa.parse<User>(usersCsvData, { header: true }).data;
        const items = Papa.parse<Item>(itemsCsvData, { header: true }).data;
        const ratings = Papa.parse<Rating>(ratingsCsvData, {
          header: true,
        }).data;

        // Store data
        setUserData(users.filter((user) => user.personId)); // Filter out rows with missing userId
        setItemData(items.filter((item) => item.contentId)); // Filter out rows with missing itemId
        setRatingData(
          ratings.filter((rating) => rating.userId && rating.itemId)
        ); // Filter out rows with missing IDs

        // Extract unique IDs for select dropdowns
        setAvailableUserIds(
          [...new Set(users.map((user) => user.personId))].filter(Boolean)
        );
        setAvailableItemIds(
          [...new Set(items.map((item) => [item.contentId, item.title]))].filter(Boolean)
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load CSV data"
        );
        console.error("Failed to load CSV data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCsvFiles();
  }, []);

  // Function to load CSV file as text
  const loadCsv = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.statusText}`);
    }
    return await response.text();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId && !itemId) {
      setError("Please select either a User ID or an Item ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate recommendations based on the CSV data
      // Content-based recommendations
      const contentBasedRecs = generateContentBasedRecommendations(
        userId,
        itemId
      );
      setContentBasedResults(contentBasedRecs);

      // Collaborative filtering recommendations
      const collaborativeRecs = generateCollaborativeRecommendations(
        userId,
        itemId
      );
      setCollaborativeResults(collaborativeRecs);

      // Wide and Deep recommendations (hybrid)
      const hybridRecs = generateHybridRecommendations(userId, itemId);
      setWaDResults(hybridRecs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Simple content-based recommendation implementation
  const generateContentBasedRecommendations = (
    userIdParam?: string,
    itemIdParam?: string
  ): Recommendation[] => {
    // This is a simplified implementation
    // In a real system, you'd compare item features or user preferences

    if (itemIdParam) {
      // Item-based: find similar items
      const selectedItem = itemData.find((item) => item.contentId === itemIdParam);
      if (!selectedItem) return [];

      // Dummy implementation - in reality, you'd compare item features
      return itemData
        .filter((item) => item.contentId !== itemIdParam)
        .slice(0, 5)
        .map((item, index) => ({
          itemId: item.contentId,
          score: 0.9 - index * 0.1,
          title: item.title,
        }));
    } else if (userIdParam) {
      // User-based: find items the user might like
      const userRatings = ratingData.filter(
        (rating) => rating.userId === userIdParam
      );

      // Get items the user hasn't rated
      const unratedItems = itemData.filter(
        (item) => !userRatings.some((rating) => rating.itemId === item.contentId)
      );

      // Return top 5 unrated items (dummy implementation)
      return unratedItems.slice(0, 5).map((item, index) => ({
        itemId: item.contentId,
        score: 0.85 - index * 0.08,
        title: item.title,
      }));
    }

    return [];
  };

  // Simple collaborative filtering implementation
  const generateCollaborativeRecommendations = (
    userIdParam?: string,
    itemIdParam?: string
  ): Recommendation[] => {
    if (userIdParam) {
      // User-based collaborative filtering
      // Find users with similar ratings and recommend items they liked

      // Dummy implementation - in reality, you'd calculate user similarities
      return itemData.slice(5, 10).map((item, index) => ({
        itemId: item.contentId,
        score: 0.8 - index * 0.07,
        title: item.title,
      }));
    } else if (itemIdParam) {
      // Item-based collaborative filtering
      // Find items that are often rated similarly to this item

      // Dummy implementation
      return itemData.slice(10, 15).map((item, index) => ({
        itemId: item.contentId,
        score: 0.75 - index * 0.06,
        title: item.title,
      }));
    }

    return [];
  };

  // Hybrid recommendations implementation
  const generateHybridRecommendations = (
    userIdParam?: string,
    itemIdParam?: string
  ): Recommendation[] => {
    // Combine results from both methods
    const contentBased = generateContentBasedRecommendations(
      userIdParam,
      itemIdParam
    );
    const collaborative = generateCollaborativeRecommendations(
      userIdParam,
      itemIdParam
    );

    // Simple hybridization: alternate between the two methods
    const hybrid: Recommendation[] = [];
    const maxLength = Math.max(contentBased.length, collaborative.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < contentBased.length) hybrid.push(contentBased[i]);
      if (i < collaborative.length) hybrid.push(collaborative[i]);
    }

    // Return top 5 hybrid recommendations
    return hybrid.slice(0, 5);
  };


  return (
    <div className="recommendation-app">
      <h1>Article Recommendation System</h1>

      {loading && !availableUserIds.length ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="search-form">
            <div className="input-group">
              <label htmlFor="userId">User ID: </label>
              <select
                id="userId"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  if (e.target.value) setItemId("");
                }}
              >
                <option value="">Select a User ID</option>
                {availableUserIds.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="itemId">Item ID: </label>
              <select
                id="itemId"
                value={itemId}
                style={{ width: "170px" }}
                onChange={(e) => {
                  setItemId(e.target.value);
                  if (e.target.value) setUserId("");
                }}
              >
                <option value="">Select an Item ID</option>
                {availableItemIds.map((item) => (
                  <option key={item[0]} value={item[0]}>
                    {item[1]}
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
            <div className="loading">Generating recommendations...</div>
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
                title="Wide and Deep Recommendations"
                results={WaDResults}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
