import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SessionSummaryPage() {
   const { id } = useParams();
   const [session, setSession] = useState(null);
   const [questions, setQuestions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      async function fetchSummary() {
         try {
            const { data: sess, error: sErr } = await supabase
               .from('interview_sessions')
               .select('*')
               .eq('id', id)
               .single();
            if (sErr) throw sErr;

            const { data: qs, error: qErr } = await supabase
               .from('session_questions')
               .select('*')
               .eq('session_id', id)
               .order('question_number', { ascending: true });
            if (qErr) throw qErr;

            setSession(sess);
            setQuestions(qs || []);
         } catch (err) {
            console.error(err);
            setError("Could not load session summary.");
         } finally {
            setLoading(false);
         }
      }
      fetchSummary();
   }, [id]);

   if (loading) return <div className="p-8 center text-muted">Loading summary...</div>;
   if (error) return <div className="p-8 center text-error">{error}</div>;

   // Aggregate Top Strengths / Improvements across all questions
   const allStrengths = questions.flatMap(q => q.feedback_strengths || []);
   const allImprovements = questions.flatMap(q => q.feedback_improvements || []);

   // Deduplicate and slice top 3
   const topStrengths = [...new Set(allStrengths)].slice(0, 3);
   const topImprovements = [...new Set(allImprovements)].slice(0, 3);

   return (
      <div className="summary-page fade-in">
         <div className="dashboard-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Interview Summary</h2>
            <Link to="/dashboard" className="btn secondary">&larr; Back to Dashboard</Link>
         </div>

         <div className="card mb-4 text-center">
            <h3 className="card-title">Overall Performance</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem' }}>
               {session.overall_score !== null ? `${session.overall_score}%` : 'N/A'}
            </div>
            <p className="text-muted">
               {session.interview_type.charAt(0).toUpperCase() + session.interview_type.slice(1)} Interview ({session.difficulty})
               • {new Date(session.created_at).toLocaleDateString()}
            </p>
         </div>

         <div className="dashboard-grid mb-4">
            <div className="card">
               <h3 className="card-title" style={{ color: 'var(--success)' }}>Key Strengths</h3>
               {topStrengths.length > 0 ? (
                  <ul style={{ paddingLeft: '1.5rem' }}>
                     {topStrengths.map((s, i) => <li key={i} className="mb-2">{s}</li>)}
                  </ul>
               ) : <p className="text-muted">Insufficient data to determine key strengths.</p>}
            </div>

            <div className="card">
               <h3 className="card-title" style={{ color: 'var(--error)' }}>Areas for Improvement</h3>
               {topImprovements.length > 0 ? (
                  <ul style={{ paddingLeft: '1.5rem' }}>
                     {topImprovements.map((s, i) => <li key={i} className="mb-2">{s}</li>)}
                  </ul>
               ) : <p className="text-muted">Insufficient data to determine improvement areas.</p>}
            </div>
         </div>

         <div className="card">
            <h3 className="card-title">Full Transcript & Feedback</h3>
            <div className="session-list">
               {questions.map((q, idx) => (
                  <div key={q.id} className="mb-4" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                     <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                        Q{idx + 1}: {q.question_text}
                     </div>
                     <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '1rem' }}>
                        <strong className="text-muted">Your Answer:</strong>
                        <p className="mt-2">{q.user_answer || '(No answer provided)'}</p>
                     </div>
                     {q.user_answer && (
                        <div>
                           <span className="score-badge mr-2">Score: {q.score}/10</span>
                           {q.feedback_ideal && (
                              <div className="mt-2 text-muted" style={{ fontSize: '0.875rem' }}>
                                 <strong>Ideal approach: </strong> {q.feedback_ideal}
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>

         <div className="center mt-4">
            <Link to="/setup" className="btn primary">Start Another Interview</Link>
         </div>
      </div>
   );
}
