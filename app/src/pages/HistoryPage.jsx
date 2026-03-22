import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [user]);

  async function loadHistory() {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('id, interview_type, difficulty, overall_score, status, created_at, num_questions')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
     if (!window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) return;
     
     try {
         const { error } = await supabase.from('interview_sessions').delete().eq('id', id);
         if (error) throw error;
         setSessions(sessions.filter(s => s.id !== id));
     } catch (err) {
         alert("Failed to delete session: " + err.message);
     }
  };

  if (loading) return <div className="p-8 center text-muted">Loading history...</div>;

  return (
    <div className="history-page fade-in">
      <div className="dashboard-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Interview History</h2>
          <Link to="/setup" className="btn primary">New Interview</Link>
      </div>

      <div className="card">
         {sessions.length === 0 ? (
            <div className="empty-state p-8 center">
               <p className="text-muted mb-4">You haven't completed any interviews yet.</p>
               <Link to="/setup" className="btn primary">Start Your First Interview</Link>
            </div>
         ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                 <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                       <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                       <th style={{ padding: '1rem 0.5rem' }}>Type</th>
                       <th style={{ padding: '1rem 0.5rem' }}>Difficulty</th>
                       <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                       <th style={{ padding: '1rem 0.5rem' }}>Score</th>
                       <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    {sessions.map(s => (
                       <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                           <td style={{ padding: '1rem 0.5rem' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                           <td style={{ padding: '1rem 0.5rem', textTransform: 'capitalize' }}>{s.interview_type}</td>
                           <td style={{ padding: '1rem 0.5rem', textTransform: 'capitalize' }}>{s.difficulty}</td>
                           <td style={{ padding: '1rem 0.5rem' }}>
                               <span className={s.status === 'completed' ? 'success' : 'text-muted'}>{s.status}</span>
                           </td>
                           <td style={{ padding: '1rem 0.5rem' }}>
                               {s.status === 'completed' ? <strong>{s.overall_score}%</strong> : '-'}
                           </td>
                           <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                               {s.status === 'completed' ? (
                                  <Link to={`/summary/${s.id}`} className="link-button mr-4" style={{ marginRight: '1rem' }}>Summary</Link>
                               ) : (
                                  <Link to={`/session/${s.id}`} className="link-button mr-4" style={{ marginRight: '1rem' }}>Resume</Link>
                               )}
                               <button onClick={() => handleDelete(s.id)} className="link-button" style={{ color: 'var(--error)' }}>Delete</button>
                           </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
            </div>
         )}
      </div>
    </div>
  );
}
