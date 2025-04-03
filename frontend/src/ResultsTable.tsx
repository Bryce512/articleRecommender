import Recommendation from "./Recommendation";


function ResultsTable ({title, results}: {title: string, results: Recommendation[]}) {
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
                <td>{item.title || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No recommendations found</p>
      )}
    </div>  
}
export default ResultsTable;