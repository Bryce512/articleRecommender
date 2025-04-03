import { Recommendation } from "./types";
import "bootstrap/dist/css/bootstrap.min.css";

function ResultTable({
  title,
  result,
}: {
  title: string;
  result: Recommendation | null;
}) {
  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-primary text-white">
        <h3 className="mb-0">{title}</h3>
      </div>
      <div className="card-body">
        {result ? (
          <div>
            <h5 className="fw-bold mb-3">
              {result.title ||
                `Item ID: ${result.contentId}` ||
                "Recommendations"}
            </h5>

            <p className="text-muted small mb-3">
              Content ID: {result.contentId || "N/A"}
            </p>

            <h6 className="mb-2">Top Recommendations:</h6>
            <ul className="list-group">
                <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span>1. {result["Recommendation 1"]}</span>
                </li>
                <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span>2. {result["Recommendation 2"]}</span>
                </li>
                <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span>3. {result["Recommendation 3"]}</span>
                </li>
                <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span>4. {result["Recommendation 4"]}</span>
                </li>

                <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span>5. {result["Recommendation 5"]}</span>
                </li>
            </ul>

            {/* If no recommendation items are present */}
            {!result["Recommendation 1"] &&
              !result["Recommendation 2"] &&
              !result["Recommendation 3"] &&
              !result["Recommendation 4"] &&
              !result["Recommendation 5"] && (
                <div className="alert alert-warning" role="alert">
                  No specific recommendations available for this item.
                </div>
              )}
          </div>
        ) : (
          <div className="alert alert-info" role="alert">
            No recommendations found
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultTable;
