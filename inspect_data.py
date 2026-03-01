
import pandas as pd
try:
    df = pd.read_csv('C:/Users/Harshith/WebstormProjects/untitled2/ipl/ball_by_ball_data.csv', nrows=5)
    with open('inspect_cols.txt', 'w') as f:
        f.write(str(df.columns.tolist()) + '\n')
        f.write(str(df.head().to_string()))
except Exception as e:
    with open('inspect_cols.txt', 'w') as f:
        f.write(str(e))

