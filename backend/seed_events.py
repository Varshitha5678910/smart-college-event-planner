from main import supabase

sample_events = [
    {
        "title": "AI & Future Tech Summit",
        "description": "Hands-on machine learning workshop, neural networks demo, and LLM fine-tuning sessions by industry leaders.",
        "category": "Technical",
        "event_date": "2026-09-25",
        "start_time": "10:00:00",
        "end_time": "13:30:00",
        "capacity": 150
    },
    {
        "title": "Inter-College Code Sprint 2026",
        "description": "24-hour non-stop competitive programming challenge with real-time leaderboard and cash prizes.",
        "category": "Coding",
        "event_date": "2026-10-02",
        "start_time": "09:00:00",
        "end_time": "18:00:00",
        "capacity": 300
    },
    {
        "title": "Annual Music Festival & Rock Show",
        "description": "Live musical acts, battle of the bands, and DJ night performance under the open campus ground.",
        "category": "Cultural",
        "event_date": "2026-10-10",
        "start_time": "17:30:00",
        "end_time": "22:00:00",
        "capacity": 600
    },
    {
        "title": "Campus Placement Resume Workshop",
        "description": "1-on-1 resume reviews, mock interviews, and LinkedIn optimization guidance by HR recruiters.",
        "category": "Career",
        "event_date": "2026-10-15",
        "start_time": "11:00:00",
        "end_time": "14:00:00",
        "capacity": 100
    },
    {
        "title": "Valorant & FC26 E-Sports League",
        "description": "Inter-department LAN tournament. Squad registration open for Valorant 5v5 and EA FC single bracket.",
        "category": "Gaming",
        "event_date": "2026-10-20",
        "start_time": "14:00:00",
        "end_time": "20:00:00",
        "capacity": 80
    },
    {
        "title": "Web3 & Blockchain Developer Meetup",
        "description": "Building smart contracts with Solidity, decentralization basics, and decentralized application architecture.",
        "category": "Technical",
        "event_date": "2026-10-25",
        "start_time": "10:30:00",
        "end_time": "13:00:00",
        "capacity": 90
    },
    {
        "title": "Annual Campus Photography Contest",
        "description": "Capture campus life, nature, and street moments. Live gallery exhibition and jury scoring.",
        "category": "Art",
        "event_date": "2026-11-01",
        "start_time": "09:30:00",
        "end_time": "16:00:00",
        "capacity": 120
    },
    {
        "title": "Inter-Department Basketball Championship",
        "description": "Knockout round matches for men's and women's campus basketball teams.",
        "category": "Sports",
        "event_date": "2026-11-05",
        "start_time": "15:00:00",
        "end_time": "19:00:00",
        "capacity": 200
    },
    {
        "title": "Startup Pitch & Angel Funding Fest",
        "description": "Student entrepreneurs present 5-minute business pitches to seed investors and campus incubators.",
        "category": "Career",
        "event_date": "2026-11-12",
        "start_time": "10:00:00",
        "end_time": "15:30:00",
        "capacity": 180
    },
    {
        "title": "Open Mic & Stand-Up Comedy Night",
        "description": "An evening of stand-up comedy, poetry, and storytelling performed by talented campus students.",
        "category": "Cultural",
        "event_date": "2026-11-18",
        "start_time": "18:00:00",
        "end_time": "21:00:00",
        "capacity": 250
    }
]

# Push array to Supabase
response = supabase.table("events").insert(sample_events).execute()
print("Successfully inserted 10 new events into database!")