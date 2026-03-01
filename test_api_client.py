import requests
import json

# Define the URL of the API
url = 'http://127.0.0.1:5000/predict'

# Define the input data for the prediction
# Ensure these values match exactly with the labels in your dataset
sample_data = {
    'team1': 'Mumbai Indians',
    'team2': 'Chennai Super Kings',
    'venue': 'Wankhede Stadium',
    'toss_winner': 'Mumbai Indians',
    'toss_decision': 'field'
}

# Send a POST request to the API
try:
    response = requests.post(url, json=sample_data)

    # Check if the request was successful
    if response.status_code == 200:
        result = response.json()
        print("Prediction Result:")
        print(json.dumps(result, indent=4))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

except requests.exceptions.ConnectionError:
    print("Error: Could not connect to the API. Make sure 'app.py' is running.")

