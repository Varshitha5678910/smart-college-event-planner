"use client";

import { useEffect, useState } from "react";

type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  event_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
};

const generateMockStudents = () => {
  const students: Record<string, { name: string; attendancePct: number }> = {};
  const basePrefix = "3231032110";

  for (let i = 1; i <= 70; i++) {
    const rollSuffix = i < 10 ? `0${i}` : `${i}`;
    const rollNo = `${basePrefix}${rollSuffix}`;
    const attendancePct = Math.floor(55 + (i * 7) % 41);
    students[rollNo] = {
      name: `Student ${rollSuffix}`,
      attendancePct,
    };
  }
  return students;
};

const MOCK_STUDENTS = generateMockStudents();

function formatDate(date: string) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  const formattedDate = new Date(Number(year), Number(month) - 1, Number(day));
  return formattedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "";
  const [hour, minute] = time.split(":");
  const formattedTime = new Date();
  formattedTime.setHours(Number(hour), Number(minute));
  return formattedTime.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Home() {
  const [activeRole, setActiveRole] = useState<"Student" | "Publisher" | null>(null);

  // Student Authentication
  const [rollNumberInput, setRollNumberInput] = useState("");
  const [currentStudent, setCurrentStudent] = useState<{
    rollNo: string;
    name: string;
    attendancePct: number;
  } | null>(null);

  // Publisher Authentication
  const [publisherKeyInput, setPublisherKeyInput] = useState("");
  const [isPublisherLoggedIn, setIsPublisherLoggedIn] = useState(false);

  // Event Data & Feed Controls
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Gamification & Passcode Matrix
  const [userPoints, setUserPoints] = useState(0);
  const [registeredEvents, setRegisteredEvents] = useState<
    Record<
      string,
      {
        studentRoll: string;
        studentName: string;
        code: string;
        verified: boolean;
      }
    >
  >({});
  const [enteredCodeInput, setEnteredCodeInput] = useState<Record<string, string>>({});

  // Registration Modal State
  const [activeRegistrationEvent, setActiveRegistrationEvent] = useState<Event | null>(null);
  const [entryType, setEntryType] = useState<"Individual" | "Team">("Individual");
  const [regForm, setRegForm] = useState({
    fullName: "",
    teamName: "",
    teamMembers: "",
    phone: "",
    email: "",
  });

  // Publisher Event Creation Form State
  const [publisherFormData, setPublisherFormData] = useState({
    title: "",
    description: "",
    category: "Technical",
    event_date: "",
    start_time: "",
    end_time: "",
    capacity: 50,
  });

  const MIN_ATTENDANCE_REQUIRED = 75;

  const fetchEvents = () => { fetch("https://smart-college-event-planner.onrender.com/events") .then((res) => res.json()) .then((data) => setEvents(data)) .catch((err) => console.error(err)); };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoll = rollNumberInput.trim();
    const foundStudent = MOCK_STUDENTS[cleanRoll];

    if (foundStudent) {
      setCurrentStudent({ rollNo: cleanRoll, ...foundStudent });
    } else {
      setCurrentStudent({
        rollNo: cleanRoll,
        name: `Student (${cleanRoll})`,
        attendancePct: 78,
      });
    }
  };

  const handlePublisherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (publisherKeyInput === "admin123" || publisherKeyInput === "publisher") {
      setIsPublisherLoggedIn(true);
    } else {
      alert("Invalid Access Key! (Use: admin123)");
    }
  };

  const handlePublisherPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:8000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...publisherFormData,
        capacity: Number(publisherFormData.capacity),
      }),
    });

    setPublisherFormData({
      title: "",
      description: "",
      category: "Technical",
      event_date: "",
      start_time: "",
      end_time: "",
      capacity: 50,
    });
    fetchEvents();
  };

  const getBadgeTier = (points: number) => {
    if (points >= 100) return { title: "🥇 Tech Legend", color: "#eab308" };
    if (points >= 40) return { title: "🥈 Active Scholar", color: "#94a3b8" };
    return { title: "🥉 Campus Novice", color: "#b45309" };
  };

  const currentBadge = getBadgeTier(userPoints);

  const openRegistrationModal = (event: Event) => {
    if (!currentStudent || currentStudent.attendancePct < MIN_ATTENDANCE_REQUIRED) return;
    setActiveRegistrationEvent(event);
    setRegForm({
      fullName: currentStudent.name,
      teamName: "",
      teamMembers: "",
      phone: "",
      email: "",
    });
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegistrationEvent || !currentStudent) return;

    // 4-digit confidential passcode algorithm
    const generatedPasscode = Math.floor(1000 + Math.random() * 9000).toString();

    setRegisteredEvents((prev) => ({
      ...prev,
      [activeRegistrationEvent.id]: {
        studentRoll: currentStudent.rollNo,
        studentName: currentStudent.name,
        code: generatedPasscode,
        verified: false,
      },
    }));

    setActiveRegistrationEvent(null);
  };

  const handleVerifyPasscode = (eventId: string) => {
    const regInfo = registeredEvents[eventId];
    const userEnteredCode = enteredCodeInput[eventId];

    if (!regInfo) return;

    if (userEnteredCode === regInfo.code) {
      setUserPoints((prev) => prev + 10);
      setRegisteredEvents((prev) => ({
        ...prev,
        [eventId]: { ...regInfo, verified: true },
      }));
    } else {
      alert("Incorrect passcode! Please check with event publisher at venue.");
    }
  };

  const categories = ["All", ...Array.from(new Set(events.map((e) => e.category)))];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 1. Initial Role Selection View
  if (!activeRole) {
    return (
      <main className="container" style={{ maxWidth: "500px", marginTop: "80px" }}>
        <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", marginBottom: "8px" }}>Smart College Portal</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>Choose login role to proceed:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button onClick={() => setActiveRole("Student")} style={{ padding: "16px", borderRadius: "12px", border: "1px solid #2563eb", background: "#eff6ff", color: "#1d4ed8", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
              🎓 Login as Student
            </button>
            <button onClick={() => setActiveRole("Publisher")} style={{ padding: "16px", borderRadius: "12px", border: "1px solid #475569", background: "#0f172a", color: "#fff", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
              📢 Login as Event Publisher
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 2. Student Gate Login
  if (activeRole === "Student" && !currentStudent) {
    return (
      <main className="container" style={{ maxWidth: "450px", marginTop: "60px" }}>
        <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <button onClick={() => setActiveRole(null)} style={{ background: "none", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer", marginBottom: "12px" }}>← Back</button>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "8px" }}>Student Portal Login</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Enter Roll Number (e.g., 323103211005)</p>
          <form onSubmit={handleStudentLogin}>
            <input type="text" placeholder="Roll Number" required value={rollNumberInput} onChange={(e) => setRollNumberInput(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "16px", fontSize: "14px" }} />
            <button type="submit" className="submit-btn" style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: "bold" }}>Check Eligibility & Enter →</button>
          </form>
        </div>
      </main>
    );
  }

  // 3. Publisher Dashboard Workspace
  if (activeRole === "Publisher") {
    if (!isPublisherLoggedIn) {
      return (
        <main className="container" style={{ maxWidth: "450px", marginTop: "60px" }}>
          <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
            <button onClick={() => setActiveRole(null)} style={{ background: "none", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer", marginBottom: "12px" }}>← Back</button>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "8px" }}>Publisher Portal Login</h2>
            <form onSubmit={handlePublisherLogin}>
              <input type="password" placeholder="Access Key (admin123)" required value={publisherKeyInput} onChange={(e) => setPublisherKeyInput(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "16px", fontSize: "14px" }} />
              <button type="submit" className="submit-btn" style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: "bold", backgroundColor: "#0f172a" }}>Login to Publisher Dashboard →</button>
            </form>
          </div>
        </main>
      );
    }

    return (
      <main className="container">
        <div style={{ background: "#0f172a", color: "#fff", padding: "24px", borderRadius: "16px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "bold" }}>📢 Organizer / Publisher Workspace</h2>
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>Manage Events & Secret Passcodes Matrix</p>
          </div>
          <button onClick={() => { setIsPublisherLoggedIn(false); setActiveRole(null); }} style={{ padding: "8px 12px", background: "#334155", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Logout</button>
        </div>

        {/* Confidential Passcode View for Publishers */}
        <div style={{ background: "#1e293b", color: "#fff", padding: "24px", borderRadius: "16px", marginBottom: "32px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "8px", color: "#38bdf8" }}>🔒 Venue Passcodes Matrix (Publisher Eyes Only)</h3>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>Announce these secret 4-digit codes to students physically at venue during attendance verify.</p>
          
          {Object.keys(registeredEvents).length === 0 ? (
            <p style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic" }}>No active student registrations yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                    <th style={{ padding: "10px" }}>Student Roll</th>
                    <th style={{ padding: "10px" }}>Student Name</th>
                    <th style={{ padding: "10px" }}>Event Target ID</th>
                    <th style={{ padding: "10px" }}>Secret Passcode</th>
                    <th style={{ padding: "10px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(registeredEvents).map(([eventId, reg]) => (
                    <tr key={eventId} style={{ borderBottom: "1px solid #334155" }}>
                      <td style={{ padding: "10px", fontWeight: "600" }}>{reg.studentRoll}</td>
                      <td style={{ padding: "10px" }}>{reg.studentName}</td>
                      <td style={{ padding: "10px", color: "#94a3b8" }}>{eventId}</td>
                      <td style={{ padding: "10px", fontWeight: "bold", fontSize: "16px", color: "#eab308" }}>{reg.code}</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "12px", fontSize: "11px", backgroundColor: reg.verified ? "#14532d" : "#713f12", color: reg.verified ? "#4ade80" : "#fde047" }}>
                          {reg.verified ? "✅ Verified (+10 PTS)" : "⏳ Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Publisher Form */}
        <form onSubmit={handlePublisherPublish} className="event-form">
          <h3>+ Create New Campus Event</h3>
          <div className="form-grid">
            <input type="text" placeholder="Event Title" required value={publisherFormData.title} onChange={(e) => setPublisherFormData({ ...publisherFormData, title: e.target.value })} />
            <input type="text" placeholder="Category" required value={publisherFormData.category} onChange={(e) => setPublisherFormData({ ...publisherFormData, category: e.target.value })} />
            <input type="date" required value={publisherFormData.event_date} onChange={(e) => setPublisherFormData({ ...publisherFormData, event_date: e.target.value })} />
            <input type="time" required value={publisherFormData.start_time} onChange={(e) => setPublisherFormData({ ...publisherFormData, start_time: e.target.value })} />
            <input type="time" required value={publisherFormData.end_time} onChange={(e) => setPublisherFormData({ ...publisherFormData, end_time: e.target.value })} />
            <input type="number" placeholder="Capacity" required value={publisherFormData.capacity} onChange={(e) => setPublisherFormData({ ...publisherFormData, capacity: Number(e.target.value) })} />
          </div>
          <textarea placeholder="Description..." required rows={3} value={publisherFormData.description} onChange={(e) => setPublisherFormData({ ...publisherFormData, description: e.target.value })} />
          <button type="submit" className="submit-btn" style={{ backgroundColor: "#16a34a" }}>+ Publish Event</button>
        </form>
      </main>
    );
  }

  // 4. Student View (Event Feed + Passcode Submission)
  const isEligible = currentStudent?.attendancePct ? currentStudent.attendancePct >= MIN_ATTENDANCE_REQUIRED : false;

  return (
    <main className="container">
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#fff", padding: "24px", borderRadius: "16px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{currentStudent?.name} ({currentStudent?.rollNo})</h2>
          <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "20px", backgroundColor: isEligible ? "#15803d" : "#b91c1c", fontWeight: 600, display: "inline-block", marginTop: "6px" }}>
            Class Attendance: {currentStudent?.attendancePct}% {isEligible ? "(Eligible)" : "(Ineligible <75%)"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "11px", color: "#94a3b8" }}>Rank Badge</p>
            <p style={{ fontWeight: "bold", fontSize: "1rem", color: currentBadge.color }}>{currentBadge.title}</p>
          </div>
          <div style={{ background: "#334155", padding: "10px 16px", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "#94a3b8" }}>Total Points</p>
            <p style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#38bdf8" }}>{userPoints} PTS</p>
          </div>
          <button onClick={() => { setCurrentStudent(null); setActiveRole(null); }} style={{ padding: "8px 12px", background: "#475569", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Logout</button>
        </div>
      </div>

      <h1>Smart College Event Feed</h1>

      <div className="filter-controls">
        <input type="text" placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
        <div className="category-filters">
          {categories.map((cat) => (
            <button key={cat} className={`filter-btn ${selectedCategory === cat ? "active" : ""}`} onClick={() => setSelectedCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <h2>Events ({filteredEvents.length})</h2>

      <div className="events-container">
        {filteredEvents.map((event) => {
          const regInfo = registeredEvents[event.id];

          return (
            <div className="event-card" key={event.id}>
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className="category-badge">{event.category}</span>
              </div>
              <p className="event-description">{event.description}</p>
              <div className="event-details">
                <p>📅 {formatDate(event.event_date)}</p>
                <p>⏰ {formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                <p>👥 Capacity: {event.capacity}</p>
              </div>

              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                {!isEligible ? (
                  <button disabled style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#991b1b", fontWeight: 600, fontSize: "12px" }}>
                    🔒 Ineligible (Attendance &lt; 75%)
                  </button>
                ) : !regInfo ? (
                  <button onClick={() => openRegistrationModal(event)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                    Register for Event
                  </button>
                ) : regInfo.verified ? (
                  <button disabled style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#dcfce7", color: "#166534", fontWeight: 600, fontSize: "13px" }}>
                    ✓ Passcode Verified (+10 PTS Earned)
                  </button>
                ) : (
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <p style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600, marginBottom: "4px" }}>
                      ✓ Registration Successful!
                    </p>
                    <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>Enter 4-digit code announced by Publisher at venue:</p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        placeholder="4-digit Passcode"
                        value={enteredCodeInput[event.id] || ""}
                        onChange={(e) => setEnteredCodeInput({ ...enteredCodeInput, [event.id]: e.target.value })}
                        style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                      />
                      <button onClick={() => handleVerifyPasscode(event.id)} style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: "#16a34a", color: "#fff", border: "none", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                        Verify (+10 PTS)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup for Student Form */}
      {activeRegistrationEvent && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e293b", color: "#fff", width: "100%", maxWidth: "500px", padding: "28px", borderRadius: "16px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>Register: {activeRegistrationEvent.title}</h3>
              <button onClick={() => setActiveRegistrationEvent(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button type="button" onClick={() => setEntryType("Individual")} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", backgroundColor: entryType === "Individual" ? "#2563eb" : "#334155", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Individual</button>
              <button type="button" onClick={() => setEntryType("Team")} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", backgroundColor: entryType === "Team" ? "#2563eb" : "#334155", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Team</button>
            </div>
            <form onSubmit={handleModalSubmit}>
              {entryType === "Individual" ? (
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>Full Name</label>
                  <input type="text" required value={regForm.fullName} onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "#fff", marginBottom: "12px", fontSize: "13px" }} />
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>Team Name</label>
                  <input type="text" placeholder="e.g., Code Warriors" required value={regForm.teamName} onChange={(e) => setRegForm({ ...regForm, teamName: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "#fff", marginBottom: "12px", fontSize: "13px" }} />
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>Team Members</label>
                  <textarea rows={2} placeholder="Names..." required value={regForm.teamMembers} onChange={(e) => setRegForm({ ...regForm, teamMembers: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "#fff", marginBottom: "12px", fontSize: "13px" }} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>Mobile</label>
                  <input type="tel" required value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "#fff", marginBottom: "12px", fontSize: "13px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>Email</label>
                  <input type="email" required value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "#fff", marginBottom: "12px", fontSize: "13px" }} />
                </div>
              </div>
              <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#16a34a", color: "#fff", fontWeight: 600, fontSize: "14px", marginTop: "8px", cursor: "pointer" }}>
                Confirm Event Registration →
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}