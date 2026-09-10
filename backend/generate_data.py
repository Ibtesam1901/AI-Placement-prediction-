import pandas as pd
import numpy as np
import random
import os

def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    random.seed(42)
    
    branches = ['CSE', 'ISE', 'ECE', 'MECH']
    tracks = ['Full-Stack', 'Data Analyst', 'Cloud/DevOps', 'QA']
    
    first_names = [
        "Aarav", "Aditi", "Arjun", "Ananya", "Rohan", "Priya", "Vikram", "Neha", 
        "Karthik", "Kavya", "Rahul", "Sneha", "Siddharth", "Pooja", "Abhishek",
        "Shruti", "Varun", "Anjali", "Nikhil", "Megha", "Rishabh", "Tanvi",
        "Pranav", "Divya", "Ishaan", "Riya", "Kunal", "Swati", "Yash", "Nandini",
        "Sameer", "Simran", "Dhruv", "Ishita", "Tushar", "Srishti", "Aman", "Rachna",
        "Vivek", "Pallavi", "Mohit", "Anushka", "Nitin", "Meera", "Ravi", "Asha"
    ]
    last_names = [
        "Sharma", "Patel", "Singh", "Gupta", "Kumar", "Reddy", "Desai", "Joshi",
        "Iyer", "Menon", "Verma", "Rao", "Nair", "Bose", "Das", "Thakur", "Mehta",
        "Raj", "Kapoor", "Chopra", "Chauhan", "Bhat", "Gowda", "Hegde", "Shetty",
        "Bansal", "Mishra", "Pandey", "Dixit", "Agarwal", "Bhattacharya", "Sinha"
    ]
    
    data = []
    for i in range(num_samples):
        student_id = f"STU{i+1:04d}"
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        student_name = f"{first_name} {last_name}"
        email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1,99)}@college.edu"
        
        branch = random.choice(branches)
        target_track = random.choice(tracks)
        cgpa = round(np.random.normal(7.5, 1.2), 2)
        cgpa = max(4.0, min(10.0, cgpa))
        tenth_percent = max(40, min(100, int(np.random.normal(80, 10))))
        twelfth_percent = max(40, min(100, int(np.random.normal(75, 12))))
        backlogs = max(0, int(np.random.normal(0, 1.5)))
        
        python = np.random.choice([0, 1], p=[0.4, 0.6])
        sql = np.random.choice([0, 1], p=[0.5, 0.5])
        react = np.random.choice([0, 1], p=[0.7, 0.3])
        devops = np.random.choice([0, 1], p=[0.8, 0.2])
        
        internships = np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1])
        projects = np.random.choice([0, 1, 2, 3, 4], p=[0.1, 0.3, 0.3, 0.2, 0.1])
        comm_score = random.randint(3, 10)
        
        certifications = np.random.choice([0, 1, 2, 3], p=[0.5, 0.3, 0.15, 0.05])
        open_source_commits = max(0, int(np.random.normal(15, 20)))
        aptitude_score = min(100, max(20, int(np.random.normal(70, 15))))
        extracurriculars = np.random.choice([0, 1, 2, 3, 4, 5], p=[0.2, 0.3, 0.2, 0.15, 0.1, 0.05])
        
        # Simple heuristic to determine "is_placed" (our label)
        score = (cgpa * 0.4) + (tenth_percent * 0.02) + (twelfth_percent * 0.02) + (projects * 2) + (internships * 3) - (backlogs * 2) + (comm_score * 0.5)
        score += (certifications * 1.5) + (open_source_commits * 0.05) + (aptitude_score * 0.1) + (extracurriculars * 0.5)
        
        if python: score += 1
        if sql: score += 1
        if react and target_track == 'Full-Stack': score += 2
        if devops and target_track == 'Cloud/DevOps': score += 2
        
        is_placed = 1 if score > 24.0 else 0
        
        data.append({
            'student_id': student_id,
            'name': student_name,
            'email': email,
            'branch': branch,
            'target_track': target_track,
            'cgpa': cgpa,
            'tenth_percent': tenth_percent,
            'twelfth_percent': twelfth_percent,
            'backlogs': backlogs,
            'python': python,
            'sql': sql,
            'react': react,
            'devops': devops,
            'internships': internships,
            'projects': projects,
            'comm_score': comm_score,
            'certifications': certifications,
            'open_source_commits': open_source_commits,
            'aptitude_score': aptitude_score,
            'extracurriculars': extracurriculars,
            'is_placed': is_placed
        })
        
    df = pd.DataFrame(data)
    os.makedirs('data', exist_ok=True)
    
    import sqlite3
    
    # Save to SQLite database
    conn = sqlite3.connect('data/students.db')
    df.to_sql('students', conn, if_exists='replace', index=False)
    conn.close()
    
    # Also save to CSV for fallback/inspection
    df.to_csv('data/students.csv', index=False)
    print(f"Generated data/students.db (SQLite) and data/students.csv with {num_samples} samples.")

if __name__ == "__main__":
    generate_synthetic_data()
