import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function InterviewSetupPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState('');

    const [type, setType] = useState('behavioral');
    const [difficulty, setDifficulty] = useState('medium');
    const [numQuestions, setNumQuestions] = useState(5);
    const [followUp, setFollowUp] = useState(true);

    const [industry, setIndustry] = useState('');
    const [roleTitle, setRoleTitle] = useState('');

    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('resume_text, job_description')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                setProfile(data);
            } catch (err) {
                console.error("Error loading profile data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [user]);

    const handleStart = async (e) => {
        e.preventDefault();
        if (!profile?.resume_text && !roleTitle) {
            setError("Please either upload a resume in your profile, or specify an industry and role title below.");
            return;
        }

        setStarting(true);
        setError('');

        try {
            const { data, error } = await supabase
                .from('interview_sessions')
                .insert({
                    user_id: user.id,
                    interview_type: type,
                    difficulty,
                    num_questions: numQuestions,
                    follow_up_enabled: followUp,
                    industry: industry || null,
                    role_title: roleTitle || null,
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            // Navigate to the newly created session
            navigate(`/session/${data.id}`);
        } catch (err) {
            setError(err.message || 'Failed to start interview session');
            setStarting(false);
        }
    };

    if (loading) return <div className="p-8 center text-muted">Loading settings...</div>;

    const hasContext = profile?.resume_text || profile?.job_description;

    return (
        <div className="setup-page fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="dashboard-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>New Interview Setup</h2>
                <button type="button" className="btn secondary outline" onClick={() => navigate('/dashboard')}>
                    &larr; Cancel
                </button>
            </div>

            {!hasContext && (
                <div className="alert error mb-4">
                    <strong>Warning:</strong> You have not uploaded a resume or job description. We highly recommend adding these in your profile first to get tailored AI questions.
                </div>
            )}

            {error && <div className="alert error mb-4">{error}</div>}

            <form onSubmit={handleStart}>
                <div className="card mb-4">
                    <h3 className="card-title">Context & Role</h3>

                    <div className="form-group">
                        <label>Industry (optional if JD/Resume uploaded)</label>
                        <input
                            type="text"
                            value={industry}
                            onChange={e => setIndustry(e.target.value)}
                            placeholder="e.g., Software Engineering, Finance..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Target Role / Job Title</label>
                        <input
                            type="text"
                            value={roleTitle}
                            onChange={e => setRoleTitle(e.target.value)}
                            placeholder="e.g., Senior Frontend Developer"
                        />
                    </div>
                </div>

                <div className="card mb-4">
                    <h3 className="card-title">Interview Settings</h3>

                    <div className="form-group">
                        <label>Interview Type</label>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            <option value="behavioral">Behavioral (Soft skills, past experiences)</option>
                            <option value="technical">Technical (System design, domain knowledge)</option>
                            <option value="mixed">Mixed (Both behavioral and technical)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Difficulty</label>
                        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option value="easy">Easy (Entry-level, standard questions)</option>
                            <option value="medium">Medium (Mid-level, specific scenarios)</option>
                            <option value="hard">Hard (Senior-level, deep dives)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Number of Questions: {numQuestions}</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={numQuestions}
                            onChange={e => setNumQuestions(Number(e.target.value))}
                            className="w-full"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>1</span>
                            <span>10</span>
                        </div>
                    </div>

                    <div className="form-options mt-4">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={followUp}
                                onChange={e => setFollowUp(e.target.checked)}
                            />
                            Enable AI Follow-up Questions
                        </label>
                    </div>
                </div>

                <button type="submit" className="btn primary block" disabled={starting}>
                    {starting ? 'Preparing Session...' : 'Start Interview'}
                </button>
            </form>
        </div>
    );
}
