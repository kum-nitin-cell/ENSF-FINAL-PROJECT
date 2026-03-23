import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TermsAndPrivacyPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'inherit' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer',
          fontSize: '0.95rem', marginBottom: 24, padding: 0
        }}
      >
        &larr; Back
      </button>

      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Terms of Service & Privacy Policy</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Last updated: March 22, 2026</p>

      {/* Terms of Service */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Terms of Service</h2>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>1. Acceptance of Terms</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          By creating an account and using PrepWise AI, you agree to be bound by these Terms of Service.
          If you do not agree, please do not use the platform.
        </p>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>2. Description of Service</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          PrepWise AI is an AI-powered interview preparation platform that provides mock interviews,
          real-time feedback, and performance analytics to help users practice and improve their
          interview skills. The service is provided for educational and practice purposes only.
        </p>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>3. User Accounts</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          You are responsible for maintaining the confidentiality of your account credentials.
          You must provide accurate information when creating your account and keep it up to date.
          You may not share your account with others or create multiple accounts.
        </p>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>4. Acceptable Use</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          You agree not to misuse the platform, including but not limited to: attempting to exploit or
          disrupt the AI system, using the service for any unlawful purpose, or submitting harmful or
          offensive content during interview sessions.
        </p>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>5. Disclaimer</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          PrepWise AI is a practice tool and does not guarantee employment outcomes. AI-generated
          feedback and scores are for guidance purposes and may not reflect real interview
          evaluations. The service is provided "as is" without warranties of any kind.
        </p>
      </section>

      {/* Privacy Policy */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Privacy Policy</h2>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>1. Information We Collect</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          We collect the following information when you use PrepWise AI:
        </p>
        <ul style={{ lineHeight: 1.9, color: '#374151', paddingLeft: 24 }}>
          <li>Account information (name, email address)</li>
          <li>Interview session data (responses, scores, and feedback)</li>
          <li>Usage data (session history, performance analytics)</li>
        </ul>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>2. How We Use Your Information</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          Your information is used to provide and improve the service, including generating
          AI-powered interview questions, evaluating your responses, tracking your progress
          over time, and personalizing your experience.
        </p>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>3. Data Storage & Security</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          Your data is securely stored using Supabase infrastructure. We implement appropriate
          technical and organizational measures to protect your personal information against
          unauthorized access, alteration, or deletion.
        </p>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>4. Data Sharing</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          We do not sell or share your personal data with third parties for marketing purposes.
          Your interview responses may be processed by AI services (OpenAI) to generate feedback,
          but are not stored by third-party providers beyond what is necessary to deliver the service.
        </p>

        <h3 style={{ fontSize: '1.1rem', marginTop: 20, marginBottom: 8 }}>5. Your Rights</h3>
        <p style={{ lineHeight: 1.7, color: '#374151' }}>
          You may request to view, update, or delete your personal data at any time through
          your account settings or by contacting our team. Upon account deletion, all associated
          data will be permanently removed from our systems.
        </p>
      </section>

      <section style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20, color: '#6b7280', fontSize: '0.9rem' }}>
        <p>
          If you have questions about these terms, please reach out to the PrepWise AI team.
        </p>
      </section>
    </div>
  );
}
