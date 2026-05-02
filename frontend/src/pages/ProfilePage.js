import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import ownerService from '../services/ownerService';
import bookingService from '../services/bookingService';
import { toast } from 'react-toastify';
import { FaEnvelope, FaCheckCircle, FaCalendarAlt, FaRupeeSign, FaTools } from 'react-icons/fa';

const ProfilePage = () => {
  const { refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ tools: 0, rentals: 0, successRate: 0, totalEarnings: 0, calculating: true });
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setName(data.name || '');
      const [tools, bookings] = await Promise.all([
        ownerService.getMyTools().catch(() => []),
        bookingService.getUserBookings().catch(() => [])
      ]);
      const completed = bookings.filter(b => b.status === 'COMPLETED').length;
      const finished = bookings.filter(b => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(b.status)).length;
      setStats({
        tools: tools.length,
        rentals: bookings.length,
        successRate: finished > 0 ? Math.round((completed / finished) * 100) : 100,
        totalEarnings: bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.totalAmount || 0), 0),
        calculating: false
      });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const saveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await userService.updateProfile({ name });
      if (refreshUserProfile) await refreshUserProfile();
      toast.success('Name updated');
      setEditingName(false);
      loadAll();
    } catch (err) { toast.error('Failed to update name'); }
    finally { setSaving(false); }
  };

  if (loading && !profile) {
    return (
      <div style={{ background: '#121212', minHeight: '100vh', paddingTop: 76, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner animation="border" style={{ color: '#34D399' }} />
      </div>
    );
  }

  return (
    <div style={{ background: '#121212', minHeight: '100vh', paddingTop: 100, fontFamily: 'Inter, sans-serif', color: '#E5E5E5' }}>
      <Container style={{ maxWidth: 640 }}>
        <style>{`
          .profile-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 2rem;
            margin-bottom: 1rem;
          }
          .label { color: #737373; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { color: #E5E5E5; }
          .mint { color: #34D399; }
          .stat-box {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 12px;
            padding: 1.25rem;
            text-align: center;
          }
          .stat-num { font-size: 1.5rem; font-weight: 700; color: #F5F5F5; }
          .input-clean {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            color: #E5E5E5;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.95rem;
            width: 200px;
          }
          .input-clean:focus { border-color: #10B981; outline: none; }
          .btn-sm { padding: 6px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: 1px solid #2A2A2A; background: transparent; color: #A3A3A3; }
          .btn-sm:hover { border-color: #3A3A3A; color: #E5E5E5; }
          .btn-sm.mint { background: #10B981; color: #121212; border-color: #10B981; }
          .btn-sm.mint:hover { background: #059669; }
          .btn-sm:disabled { opacity: 0.5; }
        `}</style>

        {/* Profile card */}
        <div className="profile-card">
          <Row className="align-items-center">
            <Col xs="auto">
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', fontWeight: 700, color: '#121212'
              }}>
                {(profile?.name || 'U').charAt(0).toUpperCase()}
              </div>
            </Col>
            <Col>
              {editingName ? (
                <Form onSubmit={saveName} className="d-flex align-items-center gap-2">
                  <input className="input-clean" value={name} onChange={e => setName(e.target.value)} autoFocus disabled={saving} />
                  <button type="submit" className="btn-sm mint" disabled={saving}>{saving ? '...' : 'Save'}</button>
                  <button type="button" className="btn-sm" onClick={() => { setEditingName(false); setName(profile?.name || ''); }}>Cancel</button>
                </Form>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F5F5F5' }}>
                    {profile?.name}
                    {profile?.verified && <FaCheckCircle className="mint ms-2" size={14} />}
                  </span>
                  <button className="btn-sm" onClick={() => setEditingName(true)}>Edit</button>
                </div>
              )}
              <div className="d-flex align-items-center gap-3 mt-1" style={{ fontSize: '0.8rem', color: '#737373' }}>
                <span><FaCalendarAlt size={10} className="me-1" />Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              </div>
            </Col>
          </Row>

          <div className="d-flex align-items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #2A2A2A' }}>
            <FaEnvelope size={13} className="mint" />
            <span className="value" style={{ fontSize: '0.9rem' }}>
              {profile?.email}
              {profile?.emailVerified && <FaCheckCircle className="mint ms-2" size={11} />}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-card">
          <div className="label mb-3">Activity Overview</div>
          <Row className="g-3">
            {[
              { icon: '🔧', num: stats.tools, label: 'Tools Listed' },
              { icon: '📅', num: stats.rentals, label: 'Total Rentals' },
              { icon: '✅', num: `${stats.successRate}%`, label: 'Success Rate' },
              { icon: '💰', num: `₹${stats.totalEarnings.toLocaleString('en-IN')}`, label: 'Earnings' },
            ].map((s, i) => (
              <Col xs={6} key={i}>
                <div className="stat-box">
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.icon}</div>
                  <div className="stat-num">{stats.calculating ? <Spinner animation="border" size="sm" /> : s.num}</div>
                  <div className="label" style={{ marginTop: 2 }}>{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;