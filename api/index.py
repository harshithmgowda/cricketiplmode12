from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Get the root directory (one level up from api/)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load model and data using absolute paths
model_data = joblib.load(os.path.join(ROOT_DIR, 'cricket_model.pkl'))
model = model_data['model']
team_encoder = model_data['team_encoder']
venue_encoder = model_data['venue_encoder']
toss_decision_encoder = model_data['toss_decision_encoder']

matches = pd.read_csv(os.path.join(ROOT_DIR, 'ipl', 'ipl_matches_data.csv'))
teams = pd.read_csv(os.path.join(ROOT_DIR, 'ipl', 'teams_data.csv'))
ball_data = pd.read_csv(os.path.join(ROOT_DIR, 'ipl', 'ball_by_ball_data.csv'))

team_id_map = dict(zip(teams['team_id'], teams['team_name']))
matches['team1'] = matches['team1'].map(team_id_map)
matches['team2'] = matches['team2'].map(team_id_map)
matches['toss_winner'] = matches['toss_winner'].map(team_id_map)
matches['match_winner'] = matches['match_winner'].map(team_id_map)


def predict_match(team1, team2, venue, toss_winner, toss_decision):
    try:
        team1_encoded = team_encoder.transform([team1])[0]
        team2_encoded = team_encoder.transform([team2])[0]
        venue_encoded = venue_encoder.transform([venue])[0]
        toss_winner_encoded = team_encoder.transform([toss_winner])[0]
        toss_decision_encoded_val = toss_decision_encoder.transform([toss_decision])[0]
        input_data = np.array([[team1_encoded, team2_encoded, venue_encoded, toss_winner_encoded, toss_decision_encoded_val]])
        prediction_probs = model.predict_proba(input_data)[0]
        predicted_winner_encoded = model.predict(input_data)[0]
        predicted_winner = team_encoder.inverse_transform([predicted_winner_encoded])[0]
        winner_index = np.where(model.classes_ == predicted_winner_encoded)[0][0]
        win_probability = prediction_probs[winner_index]
        return {"predicted_winner": predicted_winner, "win_probability": float(win_probability)}
    except Exception as e:
        return {"error": str(e)}


@app.route('/api/predict', methods=['POST'])
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


@app.route('/api/history', methods=['GET'])
def history():
    team1 = request.args.get('team1')
    team2 = request.args.get('team2')
    if not team1 or not team2:
        return jsonify({"error": "Missing team1 or team2"}), 400
    mask = ((matches['team1'] == team1) & (matches['team2'] == team2)) | \
           ((matches['team1'] == team2) & (matches['team2'] == team1))
    past_matches = matches[mask].sort_values(by='match_date', ascending=False)
    results = []
    for _, row in past_matches.iterrows():
        results.append({
            "match_id": int(row['match_id']),
            "date": row['match_date'],
            "venue": row['venue'],
            "winner": str(row['match_winner']),
            "toss_winner": str(row['toss_winner']),
            "toss_decision": row['toss_decision']
        })
    return jsonify(results)


@app.route('/api/match_details/<int:match_id>', methods=['GET'])
def match_details(match_id):
    try:
        match_balls = ball_data[ball_data['match_id'] == match_id]
        if match_balls.empty:
            return jsonify({"error": "Match data not found"}), 404

        innings_data = []
        for innings in sorted(match_balls['innings'].unique()):
            inn_df = match_balls[match_balls['innings'] == innings]
            team_batting_id = inn_df.iloc[0]['team_batting']
            team_batting = team_id_map.get(team_batting_id, str(team_batting_id))
            total_runs = inn_df['total_runs'].sum()
            wickets = inn_df['is_wicket'].sum()
            overs = inn_df['over_number'].max() + 1

            batter_stats = inn_df.groupby('batter').agg(
                runs=('batter_runs', 'sum'),
                balls=('ball_number', 'count'),
                fours=('batter_runs', lambda x: (x == 4).sum()),
                sixes=('batter_runs', lambda x: (x == 6).sum())
            ).reset_index().sort_values('runs', ascending=False)

            bowler_stats = inn_df.groupby('bowler').agg(
                overs=('over_number', 'nunique'),
                runs=('total_runs', 'sum'),
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

        chart_data = []
        max_overs = match_balls['over_number'].max()
        inn1_data = match_balls[match_balls['innings'] == 1].groupby('over_number')['total_runs'].sum().cumsum()
        inn2_data = match_balls[match_balls['innings'] == 2].groupby('over_number')['total_runs'].sum().cumsum()
        team1_name = innings_data[0]['team'] if len(innings_data) > 0 else "Innings 1"
        team2_name = innings_data[1]['team'] if len(innings_data) > 1 else "Innings 2"

        for i in range(max_overs + 1):
            point = {"over": i + 1}
            if i in inn1_data.index:
                point[team1_name] = int(inn1_data[i])
            if i in inn2_data.index:
                point[team2_name] = int(inn2_data[i])
            chart_data.append(point)

        return jsonify({"match_id": match_id, "innings": innings_data, "chart_data": chart_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

