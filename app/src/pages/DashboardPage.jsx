import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
   const { user } = useAuth();
   const [profile, setProfile] = useState(null);
   const [recentSessions, setRecentSessions] = useState([]);
   const [stats, setStats] = useState({ total: 0, average: 0, bestCategory: 'N/A' });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      async function loadDashboardData() {
         try {
            const { data: profileData } = await supabase
               .from('profiles')
               .select('*')
               .eq('id', user.id)
               .single();
            if (profileData) setProfile(profileData);

            // Fetch all sessions to calculate accurate stats
            const { data: allSessions, error: sessionsError } = await supabase
               .from('interview_sessions')
               .select('id, interview_type, overall_score, created_at, status')
               .eq('user_id', user.id)
               .order('created_at', { ascending: false });

            if (sessionsError) throw sessionsError;

            const sessions = allSessions || [];
            setRecentSessions(sessions.slice(0, 5)); // show only top 5 in recent

            const completed = sessions.filter(s => s.status === 'completed');
            let avg = 0;
            let bestCat = 'N/A';

            if (completed.length > 0) {
               const totalScore = completed.reduce((sum, s) => sum + (s.overall_score || 0), 0);
               avg = Math.round(totalScore / completed.length);

               // Find best category natively
               const categoryScores = {};
               completed.forEach(s => {
                  if (!categoryScores[s.interview_type]) {
                     categoryScores[s.interview_type] = { sum: 0, count: 0 };
                  }
                  categoryScores[s.interview_type].sum += (s.overall_score || 0);
                  categoryScores[s.interview_type].count += 1;
               });

               let highestAvg = 0;
               Object.keys(categoryScores).forEach(type => {
                  const catAvg = categoryScores[type].sum / categoryScores[type].count;
                  if (catAvg > highestAvg) {
                     highestAvg = catAvg;
                     bestCat = type;
                  }
               });
            }

            setStats({ total: completed.length, average: avg, bestCategory: bestCat });

         } catch (error) {
            console.error("Error loading dashboard:", error);
         } finally {
            setLoading(false);
         }
      }

      if (user) loadDashboardData();
   }, [user]);

   if (loading) return <div className="p-8 center text-muted">Loading your progress...</div>;

   return (
      <div className="dashboard fade-in">
         <div className="dashboard-header mb-4">
            <h2>Good evening, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}. Ready for your next interview practice?</h2>
         </div>

         <div className="dashboard-grid">
            <div className="dashboard-main">

               {/* New Stats Row */}
               <div className="status-grid" style={{ flexDirection: 'row', marginBottom: '2rem' }}>
                  <div className="status-item" style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                     <p className="text-muted mb-2">Total Interviews</p>
                     <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.total}</h3>
                  </div>
                  <div className="status-item" style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                     <p className="text-muted mb-2">Average Score</p>
                     <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--primary)' }}>{stats.average}%</h3>
                  </div>
                  <div className="status-item" style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                     <p className="text-muted mb-2">Strongest Area</p>
                     <h3 style={{ fontSize: '1.5rem', margin: 0, textTransform: 'capitalize' }}>{stats.bestCategory}</h3>
                  </div>
               </div>

               <div className="card mb-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link to="/setup" className="btn primary flex-1">Start New Interview</Link>
                  <Link to="/practice" className="btn secondary flex-1">Practice Question Bank</Link>
                  <Link to="/profile" className="btn secondary flex-1">Update Resume Target</Link>
               </div>

               <div className="card">
                  <h3 className="card-title">Recommended for you</h3>
                  <p className="text-muted" style={{ margin: 0 }}>
                     <strong>Pro Tip:</strong> Based on your recent activity, try a <em>Behavioral</em> mock interview next to refine your communication skills.
                  </p>
               </div>

            </div>

            <div className="dashboard-sidebar">
               <div className="card h-full">
                  <h3 className="card-title">Recent Activity</h3>
                  {recentSessions.length === 0 ? (
                     <div className="empty-state text-center mt-8">
                        <p className="text-muted">No interviews yet.</p>
                     </div>
                  ) : (
                     <div className="session-list">
                        {recentSessions.map(session => (
                           <Link to={session.status === 'completed' ? `/summary/${session.id}` : `/session/${session.id}`} key={session.id} className="session-item text-main" style={{ textDecoration: 'none' }}>
                              <div className="session-info">
                                 <strong>{session.interview_type} Interview</strong>
                                 <span className="session-date">{new Date(session.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="session-score" style={{ display: 'flex', alignItems: 'center' }}>
                                 {session.status === 'completed'
                                    ? <span className="score-badge">{session.overall_score || 0}/10</span>
                                    : <span className="status-badge">{session.status}</span>
                                 }
                              </div>
                           </Link>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
