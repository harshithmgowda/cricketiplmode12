// 12) WEB APP CONNECTION
// This is a sample JavaScript/React function to call the Flask API

async function getMatchPrediction() {
  // Define the API endpoint
  const apiUrl = "http://127.0.0.1:5000/predict";

  // Data to send to the backend
  // In a real app, you would get these values from a form
  const matchData = {
    team1: "Mumbai Indians",
    team2: "Chennai Super Kings",
    venue: "Wankhede Stadium",
    toss_winner: "Mumbai Indians",
    toss_decision: "field"
  };

  try {
    // Make a POST request using fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(matchData)
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    const result = await response.json();

    // Display the result
    console.log("Prediction Result:", result);
    alert(`Predicted Winner: ${result.predicted_winner}\nWin Probability: ${(result.win_probability * 100).toFixed(2)}%`);

  } catch (error) {
    console.error("Error fetching prediction:", error);
    alert("Failed to get prediction. Ensure the backend is running.");
  }
}

// 13) IMPORTANT DISCLAIMERS
console.warn("Disclaimer: This model provides a probability-based prediction based on historical data.");
console.warn("Cricket matches are highly unpredictable. This is NOT betting advice.");

// To trigger the function (for testing in browser console or Node with fetch polyfill):
// getMatchPrediction();

