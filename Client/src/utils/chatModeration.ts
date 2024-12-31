const API_KEY = import.meta.env.VITE_PERSPECTIVE_API_KEY;

const analyzeText = async (text: string) => {
  try {
    console.log(API_KEY);
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: { text },
          languages: ["en"],
          requestedAttributes: { TOXICITY: {} },
        }),
      }
    );
    const data = await response.json();
    return { score: data.attributeScores.TOXICITY.summaryScore.value };
  } catch (error) {
    console.log(error);
  }
};
export default analyzeText;
