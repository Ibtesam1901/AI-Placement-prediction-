# AI Placement Predictor — API Contract

Single source of truth for both frontend and backend. Do not deviate from field
names or types without updating this file and telling the other person.

## Conventions
- All percentages/scores: integers, 0–100 (not floats, not 0–1)
- All IDs: strings
- Readiness thresholds: `Ready` >= 75, `Near-Ready` 60–74, `Needs Training` < 60
- Dates/estimates: plain strings like `"2 weeks"` — no date objects needed for MVP

---

## POST /predict

Submits one student's profile, returns their prediction + explainability.

**Request body**
```json
{
  "student_id": "s101",
  "cgpa": 8.2,
  "tenth_pct": 88,
  "twelfth_pct": 84,
  "backlogs": 0,
  "languages": ["Java", "React", "SQL"],
  "certifications": ["AWS Cloud Practitioner"],
  "projects_count": 3,
  "internships_count": 1,
  "aptitude_score": 72,
  "comm_score": 68,
  "hackathons_count": 2,
  "target_track": "Full-Stack Developer"
}
```

**Response body**
```json
{
  "student_id": "s101",
  "probability": 78,
  "readiness": "Ready",
  "track_confidence": {
    "Full-Stack Developer": 78,
    "Data Analyst": 45,
    "Cloud/DevOps Engineer": 52,
    "QA Specialist": 40
  },
  "shap_factors": [
    { "feature": "Internships", "impact": 18, "direction": "positive" },
    { "feature": "Projects completed", "impact": 12, "direction": "positive" },
    { "feature": "Communication score", "impact": -6, "direction": "negative" },
    { "feature": "Certifications", "impact": -14, "direction": "negative" },
    { "feature": "CGPA", "impact": 8, "direction": "positive" }
  ]
}
```

- `track_confidence`: always includes all 4 tracks, values sum however the model produces them (no fixed total)
- `shap_factors`: top 4–5 by absolute impact, sorted descending by `abs(impact)`
- `impact`: signed integer, positive = boosts probability, negative = hurts it

---

## GET /roadmap?student_id={id}&target_track={track}

**Response body**
```json
{
  "student_id": "s101",
  "target_track": "Full-Stack Developer",
  "missing_skills": ["Database certification", "System design basics"],
  "plan": [
    {
      "skill": "Database certification",
      "action": "Complete an SQL/database certification course",
      "est_weeks": 2
    },
    {
      "skill": "System design basics",
      "action": "Build one project demonstrating basic system design (e.g. a REST API with caching)",
      "est_weeks": 3
    }
  ]
}
```

- `plan` is always sorted in the order the student should tackle it (shortest/foundational first)

---

## GET /tpo/summary

No params — returns institution-wide snapshot.

**Response body**
```json
{
  "overall_readiness_pct": 68,
  "by_branch": {
    "CSE": 72,
    "ISE": 65,
    "ECE": 61,
    "Mech": 54
  }
}
```

- `overall_readiness_pct`: average readiness across all students, all branches
- `by_branch`: branch code → average readiness %, only include branches present in the dataset

---

## GET /tpo/heatmap

No params — returns skill-gap breakdown across branches.

**Response body**
```json
{
  "skill_gaps": [
    { "skill": "SQL", "branch": "CSE", "pct_lacking": 64 },
    { "skill": "SQL", "branch": "ISE", "pct_lacking": 58 },
    { "skill": "Cloud basics", "branch": "CSE", "pct_lacking": 71 },
    { "skill": "System design", "branch": "ECE", "pct_lacking": 80 }
  ]
}
```

- `pct_lacking`: % of students in that branch who don't have that skill
- Frontend pivots this flat list into a skill × branch grid for the heatmap — backend doesn't need to pre-pivot it

---

## Error shape (all endpoints)

```json
{ "error": "student_id not found" }
```

Non-200 status code + this shape, always. Frontend checks for the `error` key before trying to read prediction fields.

---

## Sync checkpoint

Both sides swap mocks for real calls at **hour 6–7**. Before then:
- Person B (frontend) codes 100% against the example JSON above
- Person A (backend) makes sure every response matches this shape exactly, field-for-field, before the sync
