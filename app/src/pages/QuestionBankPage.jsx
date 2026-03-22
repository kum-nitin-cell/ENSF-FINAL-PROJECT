import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const mockQuestions = [
  { id: 1, title: 'Describe a time you solved a difficult bug.', category: 'Behavioral', difficulty: 'Medium', role: 'Software Engineer' },
  { id: 2, title: 'How does React Virtual DOM work?', category: 'Technical', difficulty: 'Hard', role: 'Frontend Developer' },
  { id: 3, title: 'Tell me about yourself.', category: 'Behavioral', difficulty: 'Easy', role: 'Any' },
  { id: 4, title: 'Design a URL shortener system.', category: 'System Design', difficulty: 'Hard', role: 'Backend Engineer' },
  { id: 5, title: 'What is your greatest weakness?', category: 'Behavioral', difficulty: 'Medium', role: 'Any' },
  { id: 6, title: 'Explain the difference between a process and a thread.', category: 'Technical', difficulty: 'Medium', role: 'Software Engineer' }
];

export default function QuestionBankPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Categories');
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePracticeClick = async (q) => {
     setLoadingId(q.id);
     try {
       // 1. Create a minimal 1-question session specifically for this practice run
       const { data: sessionData, error: sessionError } = await supabase.from('interview_sessions').insert({
         user_id: user.id,
         interview_type: q.category.toLowerCase(),
         difficulty: q.difficulty.toLowerCase(),
         num_questions: 1,
         follow_up_enabled: false,
         status: 'in_progress',
         role_title: q.role,
         industry: 'Tech' // Default
       }).select().single();

       if (sessionError) throw sessionError;

       // 2. Pre-inject the chosen question directly from the bank into the session
       const { error: questionError } = await supabase.from('session_questions').insert({
          session_id: sessionData.id,
          question_number: 1,
          question_text: q.title
       });

       if (questionError) throw questionError;

       // 3. Navigate straight to the active interview! 
       navigate(`/session/${sessionData.id}`);

     } catch (err) {
       console.error("Failed to start practice", err);
       alert("Failed to start the practice session. Please try again.");
     } finally {
       setLoadingId(null);
     }
  };

  const filtered = mockQuestions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filter === 'All Categories' || q.category === filter;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div className="dashboard-header mb-4">
        <h2>Practice Question Bank</h2>
        <p className="text-muted">Targeted preparation isolated by specific job roles and topics.</p>
      </div>

      <div className="card mb-4" style={{ display: 'flex', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Search for a question topic..." 
          className="flex-1"
          style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select 
          style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: '200px' }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option>All Categories</option>
          <option>Behavioral</option>
          <option>Technical</option>
          <option>System Design</option>
        </select>
      </div>

      <div className="session-list">
        {filtered.map(q => (
          <div key={q.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
             <div>
                <h3 className="mb-2" style={{ fontSize: '1.1rem' }}>{q.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <span className="status-badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{q.category}</span>
                   <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>{q.difficulty}</span>
                   <span className="status-badge text-muted" style={{ background: 'transparent', border: '1px solid #e2e8f0' }}>Target: {q.role}</span>
                </div>
             </div>
             <button className="btn secondary" onClick={() => handlePracticeClick(q)} disabled={loadingId === q.id}>
                 {loadingId === q.id ? 'Loading...' : 'Practice'}
             </button>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="p-8 center text-muted border-color" style={{ border: '1px dashed #ccc', borderRadius: '8px' }}>
              No questions matched your search criteria.
           </div>
        )}
      </div>
    </div>
  );
}
