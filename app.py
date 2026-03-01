from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# 9) LOAD MODEL
print("Loading model and encoders...")
model_data = joblib.load('cricket_model.pkl')
model = model_data['model']
team_encoder = model_data['team_encoder']
venue_encoder = model_data['venue_encoder']
toss_decision_encoder = model_data['toss_decision_encoder']

# Load data for history lookup
print("Loading match data for history...")
matches = pd.read_csv('ipl/ipl_matches_data.csv')
teams = pd.read_csv('ipl/teams_data.csv')

# Load ball-by-ball data for detailed stats
print("Loading ball-by-ball data...")
ball_data = pd.read_csv('ipl/ball_by_ball_data.csv')

# Create a dictionary to map team_id to team_name
team_id_map = dict(zip(teams['team_id'], teams['team_name']))

# Map IDs to names for readability and API usage
matches['team1'] = matches['team1'].map(team_id_map)
matches['team2'] = matches['team2'].map(team_id_map)
matches['toss_winner'] = matches['toss_winner'].map(team_id_map)
matches['match_winner'] = matches['match_winner'].map(team_id_map)

# 10) PREDICTION FUNCTION
def predict_match(team1, team2, venue, toss_winner, toss_decision):
    """
    Predicts the winner of a cricket match.
    Input strings must match the training data labels exactly.
    """
    try:
        # Encode inputs using the saved encoders
        team1_encoded = team_encoder.transform([team1])[0]
        team2_encoded = team_encoder.transform([team2])[0]
        venue_encoded = venue_encoder.transform([venue])[0]
        toss_winner_encoded = team_encoder.transform([toss_winner])[0]
        toss_decision_encoded = toss_decision_encoder.transform([toss_decision])[0]

        # Prepare input array for the model
        # Features: ['team1', 'team2', 'venue', 'toss_winner', 'toss_decision']
        input_data = np.array([[team1_encoded, team2_encoded, venue_encoded, toss_winner_encoded, toss_decision_encoded]])

        # Predict
        prediction_probs = model.predict_proba(input_data)[0]
        predicted_winner_encoded = model.predict(input_data)[0]

        # Decode the predicted winner
        predicted_winner = team_encoder.inverse_transform([predicted_winner_encoded])[0]

        # Get probability of the predicted winner
        # Note: model.classes_ stores the classes in order.
        # We need to find the index of the predicted winnner in model.classes_
        winner_index = np.where(model.classes_ == predicted_winner_encoded)[0][0]
        win_probability = prediction_probs[winner_index]

        return {
            "predicted_winner": predicted_winner,
            "win_probability": float(win_probability)
        }

    except Exception as e:
        return {"error": str(e)}

# 11) BACKEND API
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        team1 = data.get('team1')
        team2 = data.get('team2')
        venue = data.get('venue')
        toss_winner = data.get('toss_winner')
        toss_decision = data.get('toss_decision')

        if not all([team1, team2, venue, toss_winner, toss_decision]):
            return jsonify({"error": "Missing input fields"}), 400

        result = predict_match(team1, team2, venue, toss_winner, toss_decision)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def history():
    team1 = request.args.get('team1')
    team2 = request.args.get('team2')

    if not team1 or not team2:
        return jsonify({"error": "Missing team1 or team2"}), 400

    # Filter matches between team1 and team2
    mask = ((matches['team1'] == team1) & (matches['team2'] == team2)) | \
           ((matches['team1'] == team2) & (matches['team2'] == team1))

    # Return all matches instead of head(10)
    past_matches = matches[mask].sort_values(by='match_date', ascending=False)

    results = []
    for _, row in past_matches.iterrows():
        results.append({
            "match_id": int(row['match_id']),
            "date": row['match_date'],
            "venue": row['venue'],
            "winner": str(row['match_winner']), # Handle potential non-string
            "toss_winner": str(row['toss_winner']),
            "toss_decision": row['toss_decision']
        })

    return jsonify(results)

@app.route('/match_details/<int:match_id>', methods=['GET'])
def match_details(match_id):
    try:
        # Filter ball data for the match
        match_balls = ball_data[ball_data['match_id'] == match_id]

        if match_balls.empty:
            return jsonify({"error": "Match data not found"}), 404

        # Group by innings
        innings_data = []
        for innings in sorted(match_balls['innings'].unique()):
            inn_df = match_balls[match_balls['innings'] == innings]
            team_batting_id = inn_df.iloc[0]['team_batting']
            team_batting = team_id_map.get(team_batting_id, str(team_batting_id))

            total_runs = inn_df['total_runs'].sum()
            wickets = inn_df['is_wicket'].sum()
            overs = inn_df['over_number'].max() + 1 # simplistic over count

            # Batting Stats
            batter_stats = inn_df.groupby('batter').agg(
                runs=('batter_runs', 'sum'),
                balls=('ball_number', 'count'),
                fours=('batter_runs', lambda x: (x==4).sum()),
                sixes=('batter_runs', lambda x: (x==6).sum())
            ).reset_index().sort_values('runs', ascending=False)

            # Bowling Stats
            bowler_stats = inn_df.groupby('bowler').agg(
                overs=('over_number', 'nunique'),
                runs=('total_runs', 'sum'), # this includes extras, which goes to bowler usually except byes/legbyes but for simplicity
                wickets=('is_wicket', 'sum')
            ).reset_index()

            innings_data.append({
                "innings": int(innings),
                "team": team_batting,
                "total_runs": int(total_runs),
                "wickets": int(wickets),
                "overs": float(overs),
                "batting": batter_stats.to_dict(orient='records'),
                "bowling": bowler_stats.to_dict(orient='records')
            })

        # Chart Data Preparation (Run Progression)
        # We need cumulative runs per over for each innings
        chart_data = []

        # Get unique overs across all innings to align the chart
        max_overs = match_balls['over_number'].max()

        inn1_data = match_balls[match_balls['innings'] == 1].groupby('over_number')['total_runs'].sum().cumsum()
        inn2_data = match_balls[match_balls['innings'] == 2].groupby('over_number')['total_runs'].sum().cumsum()

        # Determine team names
        team1_name = "Innings 1"
        team2_name = "Innings 2"
        if len(innings_data) > 0: team1_name = innings_data[0]['team']
        if len(innings_data) > 1: team2_name = innings_data[1]['team']

        for i in range(max_overs + 1):
            point = {"over": i + 1}
            # Innings 1
            if i in inn1_data.index:
                point[team1_name] = int(inn1_data[i])

            # Innings 2
            if i in inn2_data.index:
                point[team2_name] = int(inn2_data[i])

            chart_data.append(point)

        return jsonify({
            "match_id": match_id,
            "innings": innings_data,
            "chart_data": chart_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Flask server on port {port}...")
    app.run(debug=False, host='0.0.0.0', port=port)

