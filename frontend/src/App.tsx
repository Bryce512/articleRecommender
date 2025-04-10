import { useState, useEffect, FormEvent } from "react";
import Papa from "papaparse"; 
import "./App.css";
import ResultsTable from "./ResultsTable";
import { User, Recommendation } from "./types";


function App() {
  const [userId, setUserId] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // Available userIDs and itemIDs for selection
  const [availableUserIds, setAvailableUserIds] = useState<string[]>([]);
  const [availableItemIds, setAvailableItemIds] = useState<string[][]>([]);

  // Results from different models
  const [contentBasedResults, setContentBasedResults] = useState<Recommendation[]>([]);
  const [collaborativeResults, setCollaborativeResults] = useState<Recommendation[]>([]);
  // const [WaDResults, setWaDResults] = useState<Recommendation[]>([]);

  // individual recommendation
  const [contentBasedResult, setContentBasedResult] = useState<Recommendation | null>(null);
  const [collaborativeResult, setCollaborativeResult] = useState<Recommendation | null>(null);
  // const [hybridResult, setHybridResult] = useState<Recommendation | null>(null);

  // Load CSV files from public folder
  useEffect(() => {
    const loadCsvFiles = async () => {
      setLoading(true);
      try {
        // Load users, items, and ratings CSV files
        const usersCsvData = await loadCsv("/users_interactions.csv");
        const collabResults = await loadCsv("/collaborative_filtering.csv");
        const contentResults = await loadCsv("/content_filtering.csv");

        // Parse CSV data
        const users = Papa.parse<User>(usersCsvData, { header: true }).data;
        const collabRecs = Papa.parse<Recommendation>(collabResults, {
          header: true,
        }).data;
        const contentRecs = Papa.parse<Recommendation>(contentResults, {
          header: true,
        }).data;

        // Store data
        collabRecs.filter((item) => item.contentId); // Filter out rows with missing itemId
        users.filter((user) => user.personId); // Filter out rows with missing personId
        setCollaborativeResults(collabRecs.filter((item) => item.contentId)); // Filter out rows with missing itemId
        setContentBasedResults(contentRecs.filter((item) => item.contentId)); // Filter out rows with missing itemId
        // Extract unique IDs for select dropdowns
        setAvailableUserIds(
          [
            ...new Set(users.filter(Boolean).map((user) => user.personId)),
          ].filter(Boolean)
        );

        // Create a Set of contentIds from contentRecs for quick lookup
        const contentRecsIds = new Set(
          contentRecs
            .filter((item) => item.contentId)
            .map((item) => item.contentId)
        );

        // Create a Set of contentIds from collabRecs for quick lookup
        const collabRecsIds = new Set(
          collabRecs
            .filter((item) => item.contentId)
            .map((item) => item.contentId)
        );

        // Use a Map to store unique contentIds that exist in both datasets
        const uniqueItemsMap = new Map();

        // Only add items that exist in both datasets
        collabRecs.forEach((item) => {
          if (
            item.contentId &&
            item.title &&
            contentRecsIds.has(item.contentId) &&
            collabRecsIds.has(item.contentId)
          ) {
            uniqueItemsMap.set(item.contentId, [item.contentId, item.title]);
          }
        });

        // Log the count of items in each dataset and the overlap
        console.log(`Content recommendations: ${contentRecsIds.size} items`);
        console.log(
          `Collaborative recommendations: ${collabRecsIds.size} items`
        );
        console.log(`Items in both datasets: ${uniqueItemsMap.size} items`);

        // Convert to array for the dropdown
        setAvailableItemIds(Array.from(uniqueItemsMap.values()));
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
      const contentBasedRec = generateContentBasedRecommendations(
        userId,
        itemId
      );
      setContentBasedResult(contentBasedRec);
      console.log("contentBasedRec", contentBasedRec);

      // Collaborative filtering recommendations
      const collaborativeRec = generateCollaborativeRecommendations(
        userId,
        itemId
      );
      setCollaborativeResult(collaborativeRec);
      console.log("collaborativeRec", collaborativeRec);

      // Wide and Deep recommendations (hybrid)
      // const hybridRecs = generateHybridRecommendations(userId, itemId);
      // setWaDResults(hybridRecs);
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
  ): Recommendation | null => {
    console.log("id: ", itemIdParam, userIdParam);

    if (itemIdParam) {
      // Item-based: find similar items
      const selectedItem = contentBasedResults.find((item) => item.contentId === itemIdParam);
      if (!selectedItem) return null;


      // Dummy implementation - in reality, you'd compare item features
      return selectedItem;
    } else {
      return null;
    }

  };

  // Simple collaborative filtering implementation
  const generateCollaborativeRecommendations = (
    userIdParam?: string,
    itemIdParam?: string
  ): Recommendation | null => {
    if (userIdParam) {
      // User-based collaborative filtering
      // Find users with similar ratings and recommend items they liked
      const selectedRecommendation = collaborativeResults.find(
        (item) => item.contentId === userIdParam
      );
      if (!selectedRecommendation) return null;

      return selectedRecommendation;
    } else if (itemIdParam) {
      const selectedItem = collaborativeResults.find(
        (x) => x.contentId === itemIdParam
      );
      if (!selectedItem) return null;
      return selectedItem; 
    }
    return null;
  };



  return (
    <div className="recommendation-app">
      <h1>Article Recommendation System</h1>

      {loading && !availableUserIds.length ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="search-form">
            {/* <div className="input-group">
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
            </div> */}

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
                result={contentBasedResult}
              />
              <ResultsTable
                title="Collaborative Filtering Recommendations"
                result={collaborativeResult}
              />
              {/* <ResultsTable
                title="Wide and Deep Recommendations"
                // result={WaDResult}
              /> */}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
