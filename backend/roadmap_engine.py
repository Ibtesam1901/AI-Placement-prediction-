def generate_roadmap(target_track, missing_skills):
    roadmap = []
    
    # Track-specific introduction
    roadmap.append(f"Target Career Track: {target_track}")
    roadmap.append(f"Timeline: Configured for {target_track} role requirements.")
    
    # Base templates
    skill_courses = {
        'sql': "Week 1-2: Master SQL & Databases. Take an introductory SQL course. Build 1 CRUD app with PostgreSQL or SQLite.",
        'python': "Week 1-2: Core Python & Algorithms. Focus on data structures (Lists, Dicts) and basic Leetcode problems.",
        'react': "Week 3-4: Frontend framework basics. Build a small single-page application using React and TailwindCSS.",
        'devops': "Week 3-4: Containerization & CI/CD. Learn Docker basics and set up a Github Actions pipeline."
    }
    
    for skill in missing_skills:
        if skill in skill_courses:
            roadmap.append(skill_courses[skill])
            
    if len(roadmap) <= 2: # Only the header exists
        roadmap.append(f"Week 1-2: Core fundamentals look good for {target_track}! Focus on advanced system design and mock interviews.")
        
    roadmap.append("Week 3-4 (General): Boost Communication & Interview Prep. Do 3 mock interviews using the STAR method.")
    return roadmap
