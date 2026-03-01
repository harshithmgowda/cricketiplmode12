import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix

# 1) DATA LOADING
print("Loading data...")
matches = pd.read_csv('ipl/ipl_matches_data.csv')
teams = pd.read_csv('ipl/teams_data.csv')

# Create a dictionary to map team_id to team_name
team_id_map = dict(zip(teams['team_id'], teams['team_name']))

# Map IDs to names for readability and API usage
matches['team1'] = matches['team1'].map(team_id_map)
matches['team2'] = matches['team2'].map(team_id_map)
matches['toss_winner'] = matches['toss_winner'].map(team_id_map)
matches['match_winner'] = matches['match_winner'].map(team_id_map)

# Handle cases where mapping might have failed (though ideally shouldn't if data is complete) or NaNs
matches.dropna(subset=['team1', 'team2', 'match_winner', 'toss_winner', 'venue', 'toss_decision'], inplace=True)

# Filter out matches with no result or ties for simpler binary/multiclass classification
matches = matches[matches['result'] == 'win']

print(f"Data loaded. Rows: {len(matches)}")
print(matches[['team1', 'team2', 'match_winner']].head())

# 2) FEATURE SELECTION
features = ['team1', 'team2', 'venue', 'toss_winner', 'toss_decision']
target = 'match_winner'

X = matches[features]
y = matches[target]

# 3) DATA PREPROCESSING
print("Preprocessing data...")

# We need to encode categorical variables into numbers
# Important: team1, team2, toss_winner, and match_winner should share the same encoder
# because they all represent "Teams". This ensures consistent mapping.

team_encoder = LabelEncoder()

# Fit on all possible teams to ensure the encoder knows all of them
all_teams = pd.concat([matches['team1'], matches['team2']]).unique()
team_encoder.fit(all_teams)

# Apply encoding using the fitted encoder
X = X.copy() # Avoid SettingWithCopyWarning
X['team1'] = team_encoder.transform(X['team1'])
X['team2'] = team_encoder.transform(X['team2'])
X['toss_winner'] = team_encoder.transform(X['toss_winner'])

# Target variable also needs to be encoded
y = team_encoder.transform(y)

# Encode venue
venue_encoder = LabelEncoder()
X['venue'] = venue_encoder.fit_transform(X['venue'])

# Encode toss_decision
toss_decision_encoder = LabelEncoder()
X['toss_decision'] = toss_decision_encoder.fit_transform(X['toss_decision'])

# Explanation:
# - Encoding is needed because Machine Learning models (like Random Forest) work with numbers, not strings.
# - LabelEncoder assigns a unique number to each category.

# 4) TRAIN-TEST SPLIT
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# Explanation:
# - We split into training (80%) and testing (20%) sets.
# - This allows us to evaluate the model on unseen data (test set) to check if it generalizes well.

# 5) MODEL TRAINING
print("Training Random Forest model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
# Explanation:
# - Random Forest is suitable because it handles categorical data well, captures non-linear relationships,
#   and is less prone to overfitting than a single decision tree.

# 6) MODEL EVALUATION
print("Evaluating model...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
conf_matrix = confusion_matrix(y_test, y_pred)

print(f"Model Accuracy: {accuracy:.4f}")
print("Confusion Matrix:")
print(conf_matrix)

# 7) WIN PROBABILITY (Demonstration)
# To get probability, we use predict_proba
# sample_prob = model.predict_proba(X_test[:1])
# print(f"Sample prediction probabilities: {sample_prob}")

# 8) SAVE MODEL
print("Saving model and encoders...")
model_data = {
    "model": model,
    "team_encoder": team_encoder,
    "venue_encoder": venue_encoder,
    "toss_decision_encoder": toss_decision_encoder
}
joblib.dump(model_data, 'cricket_model.pkl')
print("Model saved to 'cricket_model.pkl'")

