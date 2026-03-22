import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    AVAILABLE_MODELS,
    getSelectedModel,
    setSelectedModel,
} from '../lib/gemini';

export default function SettingsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [model, setModel] = useState(getSelectedModel());
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                if (error && error.code !== 'PGRST116') throw error;
                if (data) setFullName(data.full_name || '');
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setLoading(false);
            }
        }
        if (user) loadProfile();
    }, [user]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleSave = async () => {
        setSelectedModel(model);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: fullName || null,
                    updated_at: new Date().toISOString()
                });
            if (error) throw error;
            showMessage('Settings saved successfully!');
        } catch (err) {
            showMessage(err.message, 'error');
        }
    };

    const allModels = Object.entries(AVAILABLE_MODELS);

    if (loading) return <div className="p-8 center text-muted">Loading settings...</div>;

    return (
        <div className="settings-page fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="dashboard-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Settings</h2>
                <button className="btn secondary" onClick={() => navigate('/dashboard')}>
                    &larr; Back to Dashboard
                </button>
            </div>

            {message.text && (
                <div className={`alert ${message.type}`}>{message.text}</div>
            )}

            {/* ── AI Model Selection ───────────────────────────────────────── */}
            <div className="card mb-4">
                <h3 className="card-title">AI Model</h3>
                <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                    Choose which Gemini model to use for question generation and evaluation.
                </p>

                <div className="form-group">
                    <div className="model-cards">
                        {allModels.map(([id, meta]) => (
                            <label
                                key={id}
                                className={`model-card ${model === id ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="model"
                                    value={id}
                                    checked={model === id}
                                    onChange={() => setModel(id)}
                                    style={{ display: 'none' }}
                                />
                                <div className="model-card-header">
                                    <span className="model-card-name">{meta.label}</span>
                                    {id === 'gemini-2.5-flash-lite' && <span className="model-badge">Default</span>}
                                </div>
                                <span className="model-card-desc">{meta.description}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Account ──────────────────────────────────────────────────── */}
            <div className="card mb-4">
                <h3 className="card-title">Account</h3>

                <div className="form-group">
                    <label>Display Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="text" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                </div>
            </div>

            {/* ── Save ─────────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn primary" onClick={handleSave}>
                    Save Settings
                </button>
            </div>
        </div>
    );
}
