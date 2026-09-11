<div align="center">
  
# 🚀 AI Placement Predictor & TPO Dashboard
**An intelligent, data-driven ecosystem for university placement cells.**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103.1-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.3.0-F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

</div>

---

## 🌟 Overview

The **AI Placement Predictor** is a state-of-the-art predictive engine and dashboard designed for Training & Placement Officers (TPOs) and students. It goes beyond simple binary prediction (placed/unplaced) by providing **transparent AI explainability**, **target company eligibility**, and **personalized remediation roadmaps** to bridge the gap between academia and industry.

---

## ✨ Key Features

### 🎓 1. Student Portal (What-If Simulator)
- **Real-Time Readiness Score:** Instantly calculates the probability of placement.
- **SHAP Explainability (XAI):** Unboxes the "black box" machine learning model to show exactly *why* a student got their score (e.g., "High CGPA boosted your score by 12%, but missing React dragged it down by 5%").
- **Dynamic Company Eligibility:** Evaluates the student's profile against historical hiring criteria for top-tier companies (Google, AWS, Atlassian, TCS). 
- **Downloadable PDF Reports:** Students can export their full personalized evaluation using the built-in PDF generator.

### 🏢 2. TPO Administrator Dashboard
- **Institutional Analytics:** Real-time metrics on overall placement readiness, at-risk student counts, and Tier-1 eligible candidates.
- **Departmental Heatmaps:** Instantly spot skill deficits across different branches (CSE, ECE, MECH, etc.).
- **Recent Candidate Roster:** View recently evaluated students along with their specific deficit priority (e.g., Missing SQL) and Company Eligibility status.
- **One-Click Automated Interventions:** Trigger automated Python SMTP emails directly to candidates delivering their personalized upskilling roadmaps.

---

## 🛠️ Technology Stack

| Domain | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Recharts (Data Viz), Lucide React (Icons), html2pdf.js |
| **Backend** | Python, FastAPI, Uvicorn, SQLite |
| **Machine Learning** | Scikit-Learn (RandomForestClassifier), Pandas, NumPy, SHAP |
| **Integrations** | `smtplib` (Real-time Email Dispatch), `python-dotenv` |

---

## 🧠 The AI Engine

The predictive engine runs on a **Random Forest Classifier** trained on simulated historical placement data. 

- **Features Analyzed:** CGPA, 10th/12th Marks, Backlogs, Technical Skills (Python, SQL, React, DevOps), Projects, Internships, Communication Score, and Certifications.
- **Target Variable:** `is_placed` (Binary classification).
- **Explainability:** We utilize SHapley Additive exPlanations (SHAP) on the backend to extract feature importance for every individual prediction, feeding it to a dynamic radar chart on the frontend.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Clone the Repository
```bash
git clone https://github.com/Ibtesam1901/AI-Placement-prediction-.git
cd AI-Placement-prediction-
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Retrain the model and generate mock data
python generate_data.py
python train_model.py

# Start the FastAPI Server
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Email Configuration (Optional)
To enable real email dispatch from the TPO Dashboard:
1. Create a `.env` file in the `backend/` directory.
2. Add your Gmail credentials using a [Google App Password](https://myaccount.google.com/apppasswords):
```env
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

---

## 📸 Screenshots

*(Add your awesome screenshots here before the final presentation!)*
- **Student Simulator View**
- **SHAP Radar Chart**
- **Target Company Tags**
- **TPO Analytical Heatmap**

---

<div align="center">
  <b>Built with ❤️ for bridging the gap between talent and opportunity.</b>
</div>
