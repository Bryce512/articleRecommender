interface Recommendation {
  itemId: string;
  score: number;
  title?: string;
  description?: string;
}

export default Recommendation;