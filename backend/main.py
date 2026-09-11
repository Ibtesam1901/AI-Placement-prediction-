from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import sqlite3
import shap
import numpy as np 
from roadmap_engine import generate_roadmap
import uuid
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Campus Guardian API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models safely
try:
    model = joblib.load('models/rf_model.pkl')
    le_branch = joblib.load('models/le_branch.pkl')
    le_track = joblib.load('models/le_track.pkl')
    features = joblib.load('models/features.pkl')
    explainer = shap.TreeExplainer(model)
except Exception as e:
    print("Warning: Models not loaded. Please run train_model.py first.")
    model = None

class StudentData(BaseModel):
    branch: str
    target_track: str
    cgpa: float
    tenth_percent: float
    twelfth_percent: float
    backlogs: int
    python: int
    sql: int
    react: int
    devops: int
    internships: int
    projects: int
    comm_score: int
    certifications: int
    open_source_commits: int
    aptitude_score: int
    extracurriculars: int
    user_name: Optional[str] = ""
    user_email: Optional[str] = ""

COMPANIES = {
    "Google (SWE)": {"cgpa": 8.5, "backlogs": 0, "projects": 3, "python": 1},
    "TCS Digital": {"cgpa": 7.0, "projects": 1, "aptitude_score": 75},
    "Atlassian (SDE)": {"cgpa": 8.0, "react": 1, "sql": 1, "internships": 1},
    "AWS (Cloud)": {"cgpa": 7.5, "devops": 1, "certifications": 1},
}

def evaluate_companies(data: StudentData):
    results = []
    for comp, reqs in COMPANIES.items():
        missing = []
        if data.cgpa < reqs.get("cgpa", 0):
            missing.append(f"Needs CGPA >= {reqs['cgpa']} (Current: {data.cgpa})")
        if data.backlogs > reqs.get("backlogs", 10):
            missing.append(f"Needs <= {reqs['backlogs']} backlogs (Current: {data.backlogs})")
        if data.projects < reqs.get("projects", 0):
            missing.append(f"Needs {reqs['projects']}+ projects (Current: {data.projects})")
        if data.aptitude_score < reqs.get("aptitude_score", 0):
            missing.append(f"Needs Aptitude >= {reqs['aptitude_score']} (Current: {data.aptitude_score})")
        if data.internships < reqs.get("internships", 0):
            missing.append(f"Needs {reqs['internships']}+ internships")
        if data.certifications < reqs.get("certifications", 0):
            missing.append(f"Needs {reqs['certifications']}+ certifications")
        
        # Skill requirements
        if reqs.get("python", 0) and not data.python: missing.append("Needs Python skill")
        if reqs.get("sql", 0) and not data.sql: missing.append("Needs SQL skill")
        if reqs.get("react", 0) and not data.react: missing.append("Needs React skill")
        if reqs.get("devops", 0) and not data.devops: missing.append("Needs DevOps/Cloud skill")
        
        results.append({
            "name": comp,
            "eligible": len(missing) == 0,
            "missing": missing
        })
    return results

@app.post("/predict")
def predict(data: StudentData):
    if not model:
        return {"error": "Model not loaded"}
        
    try:
        branch_enc = le_branch.transform([data.branch])[0]
        track_enc = le_track.transform([data.target_track])[0]
    except ValueError:
        branch_enc = 0
        track_enc = 0
        
    input_data = pd.DataFrame([{
        'cgpa': data.cgpa,
        'tenth_percent': data.tenth_percent,
        'twelfth_percent': data.twelfth_percent,
        'backlogs': data.backlogs,
        'python': data.python,
        'sql': data.sql,
        'react': data.react,
        'devops': data.devops,
        'internships': data.internships,
        'projects': data.projects,
        'comm_score': data.comm_score,
        'certifications': data.certifications,
        'open_source_commits': data.open_source_commits,
        'aptitude_score': data.aptitude_score,
        'extracurriculars': data.extracurriculars,
        'branch_encoded': branch_enc,
        'track_encoded': track_enc
    }])[features]
    
    prob = model.predict_proba(input_data)[0][1]
    readiness_score = int(prob * 100)
    
    if readiness_score > 70:
        status = "Ready"
    elif readiness_score > 40:
        status = "Near-Ready"
    else:
        status = "Needs Training"
        
    shap_values = explainer.shap_values(input_data)
    if isinstance(shap_values, list):
        sv = shap_values[1][0]
    else:
        sv = shap_values[0, :, 1] if len(shap_values.shape) > 2 else shap_values[0]

    impacts = []
    for i, feat in enumerate(features):
        impacts.append({
            "feature": feat,
            "value": float(input_data.iloc[0][feat]),
            "impact": float(sv[i]) * 100
        })
        
    impacts = sorted(impacts, key=lambda x: abs(x['impact']), reverse=True)[:5]
    
    missing_skills = []
    if data.python == 0: missing_skills.append("python")
    if data.sql == 0: missing_skills.append("sql")
    if data.react == 0 and data.target_track == "Full-Stack": missing_skills.append("react")
    if data.devops == 0 and data.target_track == "Cloud/DevOps": missing_skills.append("devops")

    roadmap = generate_roadmap(data.target_track, missing_skills)

    track_confidence = {}
    for t in ["Full-Stack", "Data Analyst", "Cloud/DevOps", "QA"]:
        try:
            t_enc = le_track.transform([t])[0]
        except ValueError:
            t_enc = 0
        t_input = input_data.copy()
        t_input['track_encoded'] = t_enc
        t_prob = model.predict_proba(t_input)[0][1]
        track_confidence[t] = int(t_prob * 100)

    company_eligibility = evaluate_companies(data)

    return {
        "student_id": "simulated",
        "probability": readiness_score,
        "readiness": status,
        "track_confidence": track_confidence,
        "shap_factors": impacts,
        "roadmap": roadmap,
        "company_eligibility": company_eligibility
    }


@app.post("/send_roadmap/{student_id}")
def send_roadmap(student_id: str, data: dict = {}):
    """Generate roadmap for student and send via email (placeholder)."""
    try:
        conn = sqlite3.connect('data/students.db')
        cur = conn.cursor()
        cur.execute("SELECT email, target_track, python, sql, react, devops FROM students WHERE student_id = ?", (student_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"error": "Student not found"}
        email, target_track, python, sql, react, devops = row
        missing = []
        if not python: missing.append('python')
        if not sql: missing.append('sql')
        if not react and target_track == 'Full-Stack': missing.append('react')
        if not devops and target_track == 'Cloud/DevOps': missing.append('devops')
        roadmap = generate_roadmap(target_track, missing)
        # Build simple email message
        from email.message import EmailMessage
        msg = EmailMessage()
        msg['Subject'] = f"Your Personalized Placement Roadmap"
        
        smtp_email = os.getenv('SMTP_EMAIL')
        smtp_password = os.getenv('SMTP_PASSWORD')
        
        msg['From'] = smtp_email if smtp_email else "no-reply@campusguardian.edu"
        msg['To'] = email
        body = f"Hi {student_id},\n\nHere is your personalized roadmap for the {target_track} track:\n\n" + "\n".join(roadmap) + "\n\nBest regards,\nPlacement Team"
        msg.set_content(body)
        
        import smtplib
        if smtp_email and smtp_password:
            try:
                print(f"Attempting to send email via Gmail SMTP to {email}...")
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                    server.login(smtp_email, smtp_password)
                    server.send_message(msg)
                print("Email sent successfully!")
            except Exception as e:
                print(f"SMTP SSL Email send failed: {e}")
        else:
            print("SMTP_EMAIL or SMTP_PASSWORD not set in .env, falling back to local mock server.")
            # Attempt to send via localhost SMTP (dev), ignore failures
            try:
                with smtplib.SMTP('localhost') as s:
                    s.send_message(msg)
            except Exception as e:
                print(f"Email send failed (dev mode): {e}")
                
        return {"status": "roadmap_sent", "roadmap": roadmap}
    except Exception as e:
        print(f"Error in send_roadmap: {e}")
        return {"error": "failed to send roadmap"}

@app.get("/tpo/summary")
def tpo_summary():
    try:
        conn = sqlite3.connect('data/students.db')
        df = pd.read_sql('SELECT * FROM students', conn)
        conn.close()
        total = len(df)
        avg_readiness = int(df['is_placed'].mean() * 100)
        at_risk = len(df[df['is_placed'] == 0])
        tier1_eligible = len(df[df['is_placed'] == 1])
        
        branch_readiness = []
        for branch, group in df.groupby('branch'):
            branch_readiness.append({
                "branch": branch,
                "readiness": int(group['is_placed'].mean() * 100),
                "tier1Count": len(group[group['is_placed'] == 1]),
                "target": 75
            })
            
        return {
            "total_students": total,
            "avg_readiness": avg_readiness,
            "at_risk_count": at_risk,
            "at_risk_percent": int((at_risk/total)*100),
            "tier1_eligible": tier1_eligible,
            "top_missing_skill": "SQL",
            "branch_readiness": branch_readiness
        }
    except:
        return {}

@app.get("/tpo/heatmap")
def tpo_heatmap():
    try:
        conn = sqlite3.connect('data/students.db')
        df = pd.read_sql('SELECT * FROM students', conn)
        conn.close()
        heatmap_data = []
        branches = df['branch'].unique()
        for b in branches:
            subset = df[df['branch'] == b]
            heatmap_data.append({
                "name": str(b),
                "sql": int((1 - subset['sql'].mean()) * 100),
                "python": int((1 - subset['python'].mean()) * 100),
                "react": int((1 - subset['react'].mean()) * 100),
                "devops": int((1 - subset['devops'].mean()) * 100),
            })
        return {"heatmap": heatmap_data}
    except:
        return {}

@app.get("/tpo/at_risk")
def tpo_at_risk():
    try:
        conn = sqlite3.connect('data/students.db')
        # Fetch the most recent students (limit 50) for candidate roster
        df = pd.read_sql('SELECT * FROM students ORDER BY rowid DESC LIMIT 50', conn)
        conn.close()
        at_risk_list = []
        for i, row in df.iterrows():
            # Compute a provisional readiness score similar to previous logic
            score = int((row['cgpa'] * 0.4 + row['projects'] * 2 + row['internships'] * 3 - row['backlogs'] * 2 + row['comm_score'] * 0.5) / 15 * 100)
            score = min(59, max(10, score))
            missing_skills = []
            if row['sql'] == 0:
                missing_skills.append("SQL")
            if row['python'] == 0:
                missing_skills.append("Python")
            if row['react'] == 0:
                missing_skills.append("React")
            if row['devops'] == 0:
                missing_skills.append("DevOps")
            top_missing = missing_skills[0] if missing_skills else "Communication"
            
            # Evaluate company eligibility
            sd = StudentData(
                branch=row['branch'],
                target_track=row['target_track'],
                cgpa=row['cgpa'],
                tenth_percent=row['tenth_percent'],
                twelfth_percent=row['twelfth_percent'],
                backlogs=row['backlogs'],
                python=row['python'],
                sql=row['sql'],
                react=row['react'],
                devops=row['devops'],
                internships=row['internships'],
                projects=row['projects'],
                comm_score=row['comm_score'],
                certifications=row['certifications'],
                open_source_commits=row['open_source_commits'],
                aptitude_score=row['aptitude_score'],
                extracurriculars=row['extracurriculars']
            )
            comps = evaluate_companies(sd)
            eligibles = [c['name'] for c in comps if c['eligible']]
            if not eligibles:
                eligibles = ["None"]
                
            at_risk_list.append({
                "id": row.get('student_id', f"STU{i:04d}"),
                "name": row.get('name', 'Unknown'),
                "email": row.get('email', ''),
                "branch": row['branch'],
                "track": row['target_track'],
                "score": score,
                "missing_skill": top_missing,
                "eligible_companies": eligibles
            })
        return {"at_risk_students": at_risk_list}
    except Exception as e:
        print(f"Error in at_risk: {e}")
        return {"at_risk_students": []}
