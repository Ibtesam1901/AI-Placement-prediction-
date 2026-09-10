import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
import joblib
import os

def train():
    if not os.path.exists('data/students.csv'):
        print("Error: data/students.csv not found. Run generate_data.py first.")
        return
    import sqlite3
    
    # Load dataset from SQLite
    try:
        conn = sqlite3.connect('data/students.db')
        df = pd.read_sql('SELECT * FROM students', conn)
        conn.close()
    except Exception as e:
        print(f"Error reading SQLite db: {e}")
        print("Fallback to CSV...")
        df = pd.read_csv('data/students.csv')
    
    le_branch = LabelEncoder()
    df['branch_encoded'] = le_branch.fit_transform(df['branch'])
    
    le_track = LabelEncoder()
    df['track_encoded'] = le_track.fit_transform(df['target_track'])
    
    features = [
        'cgpa', 'tenth_percent', 'twelfth_percent', 'backlogs', 
        'python', 'sql', 'react', 'devops', 
        'internships', 'projects', 'comm_score', 'certifications',
        'open_source_commits', 'aptitude_score', 'extracurriculars',
        'branch_encoded', 'track_encoded'
    ]
    X = df[features]
    y = df['is_placed']
    
    # Validation split for metrics
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    # Calculate performance metrics
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    
    print("\n" + "="*40)
    print("MODEL PERFORMANCE METRICS")
    print("="*40)
    print(f"Accuracy:  {acc:.4f} ({(acc*100):.1f}%)")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print("="*40 + "\n")
    
    # Train on full dataset for final model
    clf.fit(X, y)
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(clf, 'models/rf_model.pkl')
    joblib.dump(le_branch, 'models/le_branch.pkl')
    joblib.dump(le_track, 'models/le_track.pkl')
    joblib.dump(features, 'models/features.pkl')
    
    print("[OK] Model and encoders saved to models/")

if __name__ == "__main__":
    train()
