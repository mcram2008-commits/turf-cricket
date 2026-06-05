import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Clock, User, LogOut, Trophy, Activity, DollarSign,
  Check, Lock, MapPin, Phone, ArrowRight, Users, Eye,
  CreditCard, Car, Bath, Shirt, X, History, ShieldAlert, AlertTriangle, FileText, Download, Package
} from 'lucide-react';
import './App.css';

const TURF_INFO = {
  name: 'Premium Green Arena',
  location: 'City Center, Sector 5, Main Road',
  image: '/img.jpeg', // Using the uploaded image
  sports: ['Football', 'Cricket'],
  amenities: [
    { name: 'UPI Payment', icon: <CreditCard size={16} /> },
    { name: 'Parking', icon: <Car size={16} /> },
    { name: 'Toilet', icon: <Bath size={16} /> },
    { name: 'Dress Change Rooms', icon: <Shirt size={16} /> },
    { name: 'Sports Kits Provided', icon: <Package size={16} /> }
  ],
  rating: 4.8,
  description: 'Premium artificial grass turf suitable for football matches and box cricket. Equipped with high-intensity floodlights.'
};

// Global Helpers
const get24Hour = (timeObj) => {
  let hour = parseInt(timeObj.hour);
  if (timeObj.ampm === 'PM' && hour !== 12) hour += 12;
  if (timeObj.ampm === 'AM' && hour === 12) hour = 0;
  return hour + (parseInt(timeObj.minute) / 60);
};

const formatTime = (timeObj) => `${timeObj.hour}:${timeObj.minute} ${timeObj.ampm}`;
const formatPhoneForWA = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
};

const CustomTimePicker = ({ label, time, setTime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
  const hours = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));

  return (
    <div className="time-picker-wrapper">
      <label><Clock size={14} /> {label}</label>
      <button type="button" className="time-display-btn" onClick={() => setIsOpen(!isOpen)}>
        {time.hour}:{time.minute} {time.ampm}
      </button>
      {isOpen && (
        <div className="time-dropdown-panel glass-panel animate-scale">
          <div style={{display: 'flex', gap: '10px', justifyContent: 'space-between'}}>
            <div className="time-col">
              <span className="time-col-label">Hour</span>
              <select value={time.hour} onChange={e => setTime({...time, hour: e.target.value})} size={5}>
                {hours.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="time-col">
              <span className="time-col-label">Min</span>
              <select value={time.minute} onChange={e => setTime({...time, minute: e.target.value})} size={5}>
                {minutes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="time-col">
              <span className="time-col-label">AM/PM</span>
              <select value={time.ampm} onChange={e => { setTime({...time, ampm: e.target.value}); }} size={5}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <button type="button" className="btn-primary w-100" style={{marginTop:'12px', padding:'8px'}} onClick={() => setIsOpen(false)}>Done</button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  // 1. Storage & Live Sync
  const loadBookings = () => JSON.parse(localStorage.getItem('turf_bookings')) || [];
  const loadBlocked = () => JSON.parse(localStorage.getItem('turf_blocked')) || [];

  const [bookings, setBookings] = useState(loadBookings());
  const [blockedSlots, setBlockedSlots] = useState(loadBlocked());

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'turf_bookings') setBookings(JSON.parse(e.newValue || '[]'));
      if (e.key === 'turf_blocked') setBlockedSlots(JSON.parse(e.newValue || '[]'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => { localStorage.setItem('turf_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('turf_blocked', JSON.stringify(blockedSlots)); }, [blockedSlots]);

  // 2. Path Routing
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname || '/');
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // 3. Client State
  const [clientProfile, setClientProfile] = useState(() => JSON.parse(sessionStorage.getItem('turf_client')) || null);
  const [entryName, setEntryName] = useState('');
  const [entryTeam, setEntryTeam] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [inTime, setInTime] = useState({ hour: '10', minute: '00', ampm: 'AM' });
  const [outTime, setOutTime] = useState({ hour: '11', minute: '00', ampm: 'AM' });
  const [bookingTeam, setBookingTeam] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const inTime24 = get24Hour(inTime);
  const outTime24 = get24Hour(outTime);
  const duration = outTime24 - inTime24;

  useEffect(() => {
    if (clientProfile && !bookingTeam) {
      setBookingTeam(clientProfile.team);
    }
  }, [clientProfile]);

  // 4. Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [adminTab, setAdminTab] = useState('bookings');
  
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockInTime, setBlockInTime] = useState({ hour: '10', minute: '00', ampm: 'AM' });
  const [blockOutTime, setBlockOutTime] = useState({ hour: '12', minute: '00', ampm: 'PM' });
  const [blockReason, setBlockReason] = useState('Maintenance');



  // Handlers
  const handleEntrySubmit = (e) => {
    e.preventDefault();
    if (entryName.trim() && entryTeam.trim()) {
      const profile = { name: entryName, team: entryTeam };
      setClientProfile(profile);
      setBookingTeam(entryTeam);
      sessionStorage.setItem('turf_client', JSON.stringify(profile));
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (duration <= 0) return setBookingError('Out time must be later than In time.');

    const isBookingOverlap = bookings.some(b => {
      if (b.bookingDate !== bookingDate || b.status === 'rejected') return false;
      return inTime24 < b.outTime24 && outTime24 > b.inTime24;
    });

    const isBlockedOverlap = blockedSlots.some(b => {
      if (b.date !== bookingDate) return false;
      return inTime24 < b.out24 && outTime24 > b.in24;
    });

    if (isBookingOverlap) return setBookingError('This time slot overlaps with an existing booking. Please try another time.');
    if (isBlockedOverlap) return setBookingError('This time slot is blocked by Admin (Maintenance/Leave). Please choose another time.');

    const newBooking = {
      id: 'B' + String(bookings.length + 1).padStart(3, '0') + '-' + Math.floor(Math.random() * 1000),
      userName: clientProfile.name,
      teamName: bookingTeam,
      userPhone: bookingPhone,
      userEmail: bookingEmail,
      bookingDate,
      inTimeStr: formatTime(inTime),
      outTimeStr: formatTime(outTime),
      inTime24,
      outTime24,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setBookings([newBooking, ...bookings]);
    setBookingSuccess(newBooking);
    setBookingError('');
    setBookingPhone('');
    setBookingEmail('');

    const text = `New Turf Booking Request! ⚽\n\n*Name:* ${newBooking.userName}\n*Team:* ${newBooking.teamName}\n*Date:* ${newBooking.bookingDate}\n*Time:* ${newBooking.inTimeStr} - ${newBooking.outTimeStr}\n*Phone:* ${newBooking.userPhone}\n\nPlease check admin portal.`;
    window.open(`https://wa.me/916379782142?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAdminBlockSlot = (e) => {
    e.preventDefault();
    const bIn24 = get24Hour(blockInTime);
    const bOut24 = get24Hour(blockOutTime);
    if (bOut24 <= bIn24) return alert('Out time must be later than In time');

    const newBlock = {
      id: 'BLK-' + Math.floor(Math.random() * 10000),
      date: blockDate,
      inTimeStr: formatTime(blockInTime),
      outTimeStr: formatTime(blockOutTime),
      in24: bIn24,
      out24: bOut24,
      reason: blockReason
    };
    setBlockedSlots([newBlock, ...blockedSlots]);
    setBlockReason('Maintenance');
  };

  const handleUpdateBookingStatus = (id, newStatus) => {
    setBookings(bookings.map(b => {
      if (b.id === id) {
        const statusText = newStatus === 'confirmed' ? 'APPROVED ✅' : 'REJECTED ❌';
        let text = `Hello ${b.userName},\nYour turf booking for *${b.bookingDate}* at *${b.inTimeStr} - ${b.outTimeStr}* has been *${statusText}*.\n`;
        if (newStatus === 'confirmed') text += `\nPlease visit the turf on time. Thank you!`;
        window.open(`https://wa.me/${formatPhoneForWA(b.userPhone)}?text=${encodeURIComponent(text)}`, '_blank');
        return { ...b, status: newStatus };
      }
      return b;
    }));
  };


  const myBookings = useMemo(() => {
    if (!clientProfile) return [];
    return bookings.filter(b => b.userName === clientProfile.name);
  }, [bookings, clientProfile]);

  const stats = useMemo(() => {
    return {
      totalBookings: bookings.length
    };
  }, [bookings]);

  // View: Admin
  if (currentPath === '/admin') {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="app-header">
          <div className="header-content">
            <div className="logo-container" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
              <Trophy className="logo-icon" size={28} />
              <h1 className="logo-text">TURF TIME</h1>
            </div>
            <nav className="nav-links">
              {isAdminLoggedIn ? (
                <button onClick={() => { setIsAdminLoggedIn(false); setAdminUsername(''); setAdminPassword(''); }} className="btn-secondary" style={{padding: '8px 16px', fontSize: '13px'}}>
                  <LogOut size={14} style={{display: 'inline', marginRight: '6px'}}/> Logout
                </button>
              ) : (
                <button onClick={() => navigate('/')} className="btn-secondary" style={{padding: '8px 16px', fontSize: '13px'}}>
                  Back to Client Site
                </button>
              )}
            </nav>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!isAdminLoggedIn ? (
            <div className="admin-login-container animate-fade">
              <div className="glass-panel login-panel animate-scale">
                <div className="login-header">
                  <Lock size={36} style={{color: 'var(--primary)', marginBottom: '16px'}}/>
                  <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Admin Portal</h2>
                  <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Login to manage bookings</p>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (adminUsername === 'admin' && adminPassword === '1234') {
                    setIsAdminLoggedIn(true); setLoginError(false);
                  } else setLoginError(true);
                }} style={{ marginTop: '24px' }}>
                  {loginError && <div className="error-banner">Invalid credentials.</div>}
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn-primary w-100" style={{marginTop: '20px'}}>Login</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="admin-layout animate-fade" style={{ flex: 1 }}>
              <aside className="admin-sidebar">
                <div className="sidebar-nav">
                  <button className={`sidebar-btn ${adminTab === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminTab('dashboard')}>
                    <Activity size={16} /> Dashboard
                  </button>
                  <button className={`sidebar-btn ${adminTab === 'bookings' ? 'active' : ''}`} onClick={() => setAdminTab('bookings')}>
                    <Calendar size={16} /> Live Bookings
                  </button>
                  <button className={`sidebar-btn ${adminTab === 'leave' ? 'active' : ''}`} onClick={() => setAdminTab('leave')}>
                    <ShieldAlert size={16} /> Leave Timings
                  </button>
                </div>
              </aside>
              <main className="admin-main">
                {adminTab === 'dashboard' && (
                  <div>
                    <h3 className="section-title">Dashboard Overview</h3>
                    <div className="metrics-grid">
                      <div className="metric-card glass-panel">
                        <div className="metric-data">
                          <p>Total Bookings</p>
                          <h3>{stats.totalBookings}</h3>
                        </div>
                        <div className="metric-icon blue"><Calendar size={24} /></div>
                      </div>
                    </div>
                  </div>
                )}
                {adminTab === 'bookings' && (
                  <div>
                    <h3 className="section-title">Manage Bookings (Live Sync)</h3>
                    {bookings.length === 0 ? (
                      <p>No bookings yet.</p>
                    ) : (
                      <div className="bookings-list">
                        {bookings.map(booking => (
                          <div className="booking-card glass-panel" key={booking.id}>
                            <div className="booking-card-info">
                              <div className="booking-sport-icon"><Users size={24} /></div>
                              <div className="booking-details-text">
                                <h4>{booking.teamName} <span style={{fontSize:'12px', color:'var(--text-muted)', fontWeight:'normal'}}>(Req by: {booking.userName})</span></h4>
                                <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                                  <Phone size={12}/> {booking.userPhone}
                                  <span style={{fontSize: '12px', marginLeft: '4px'}}> | Email: {booking.userEmail}</span>
                                </p>
                                <p style={{marginTop: '6px', color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Calendar size={14}/> {booking.bookingDate} <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>|</span> <Clock size={14}/> {booking.inTimeStr} - {booking.outTimeStr}
                                </p>
                              </div>
                            </div>
                            <div className="booking-status-actions">
                              {booking.status === 'confirmed' && <span className="badge badge-green">Accepted</span>}
                              {booking.status === 'pending' && <span className="badge badge-yellow">Pending</span>}
                              {booking.status === 'rejected' && <span className="badge badge-red">Rejected</span>}
                              <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                                {booking.status === 'pending' && (
                                  <>
                                    <button className="btn-primary" style={{padding: '8px 16px', fontSize: '13px'}} onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}>Accept</button>
                                    <button className="btn-secondary" style={{padding: '8px 16px', fontSize: '13px', color: 'var(--accent-red)'}} onClick={() => handleUpdateBookingStatus(booking.id, 'rejected')}>Reject</button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {adminTab === 'leave' && (
                  <div>
                    <h3 className="section-title">Update Leave Timings (Block Slots)</h3>
                    <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                      <form onSubmit={handleAdminBlockSlot}>
                        <div className="form-group">
                          <label>Date to Block</label>
                          <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} required style={{ maxWidth: '300px' }} />
                        </div>
                        <div className="time-row" style={{ marginTop: '20px' }}>
                          <CustomTimePicker label="Block From" time={blockInTime} setTime={setBlockInTime} />
                          <CustomTimePicker label="Block Until" time={blockOutTime} setTime={setBlockOutTime} />
                        </div>
                        <div className="form-group" style={{ marginTop: '20px' }}>
                          <label>Reason / Note</label>
                          <input type="text" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-danger" style={{marginTop: '20px'}}>Block Slot</button>
                      </form>
                    </div>
                    <h4 style={{ marginBottom: '16px' }}>Currently Blocked Slots</h4>
                    <div className="bookings-list">
                      {blockedSlots.map(b => (
                        <div className="booking-card glass-panel" key={b.id} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                          <div>
                            <h4 style={{ color: 'var(--accent-red)' }}><AlertTriangle size={16} style={{display:'inline', verticalAlign:'text-bottom'}}/> {b.reason}</h4>
                            <p style={{marginTop: '6px', color: 'var(--text-bright)'}}>{b.date} | {b.inTimeStr} - {b.outTimeStr}</p>
                          </div>
                          <button className="btn-secondary" onClick={() => setBlockedSlots(blockedSlots.filter(s => s.id !== b.id))}>Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      </div>
    );
  }

  // View: Client Main
  return (
    <div className="app-container">
      <div className="marquee-container">
        <marquee behavior="scroll" direction="left" scrollamount="6">
          🌟 Special Pricing Running: <b>Monday to Friday ₹600/hr</b> | <b>Saturday and Sunday ₹800/hr</b> ⚽
        </marquee>
      </div>

      <header className="app-header">
        <div className="header-content">
          <div className="logo-container" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
            <Trophy className="logo-icon animate-pulse" size={28} />
            <h1 className="logo-text">TURF TIME</h1>
          </div>
          <nav className="nav-links">
            {clientProfile && (
              <button onClick={() => setShowProfileModal(true)} className="role-btn active" style={{marginRight: '12px'}}>
                <History size={14} /> My History
              </button>
            )}

          </nav>
        </div>
      </header>

      {!clientProfile ? (
        <div className="client-entry-screen animate-scale">
          <div className="glass-panel entry-panel">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Users size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h2>Welcome to Turf Time!</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Please enter your details to continue</p>
            </div>
            <form onSubmit={handleEntrySubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" placeholder="e.g. Rahul" value={entryName} onChange={(e) => setEntryName(e.target.value)} required style={{ fontSize: '16px', padding: '12px' }} />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Team Name</label>
                <input type="text" placeholder="e.g. FC Strikers" value={entryTeam} onChange={(e) => setEntryTeam(e.target.value)} required style={{ fontSize: '16px', padding: '12px' }} />
              </div>
              <button type="submit" className="btn-primary w-100" style={{ marginTop: '24px', fontSize: '16px', padding: '14px' }}>
                Enter Website <ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }}/>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <main className="animate-fade main-client-view">
          
          {currentPath === '/' && (
            <>
              <div className="welcome-banner glass-panel">
                <h2>Welcome, <span style={{ color: 'var(--primary)' }}>{clientProfile.name}</span>!</h2>
                <p style={{color: 'var(--text-muted)', marginTop: '4px'}}>Representing <strong style={{color: 'white'}}>{clientProfile.team}</strong></p>
              </div>

              <div className="glass-panel turf-front-panel animate-slide">
                <div className="front-image-wrapper">
                  <img src={TURF_INFO.image} alt="Turf View" className="front-turf-image" />
                </div>
                <div className="front-details">
                  <h2 className="front-title">{TURF_INFO.name}</h2>
                  <div className="front-address">
                    <MapPin size={20} className="address-icon"/>
                    <p>{TURF_INFO.location}</p>
                  </div>

                  <div className="front-facilities">
                    <h3>Facilities Available</h3>
                    <div className="facilities-grid">
                      {TURF_INFO.amenities.map((item, idx) => (
                        <div key={idx} className="facility-item">
                          <div className="facility-icon">{item.icon}</div>
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="front-action">
                    <button className="btn-primary book-slot-btn" onClick={() => navigate('/book')}>
                      Book a Slot <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentPath === '/book' && (
            <div id="booking-section" className="booking-top-section animate-slide" style={{ animationDelay: '0.1s' }}>
              <div className="glass-panel booking-form-panel">
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px'}}>
                  <button className="btn-secondary" onClick={() => navigate('/')} style={{marginRight: '12px', padding: '6px 12px'}}>&larr; Back</button>
                  <h3 className="section-title" style={{margin: 0, borderBottom: 'none', paddingBottom: 0}}>Book Your Slot</h3>
                </div>
              
              {bookingSuccess ? (
                <div className="success-message animate-scale" style={{ textAlign: 'left', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', textAlign: 'center' }}>
                    <div className="success-icon"><Check size={40} /></div>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>Booking Request Sent!</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Your slot request is live and pending admin approval.</p>
                  </div>
                  
                  {/* Premium Booking Details Receipt */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Booking ID</span>
                      <strong style={{ color: 'var(--text-bright)' }}>{bookingSuccess.id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Team Name</span>
                      <strong style={{ color: 'var(--text-bright)' }}>{bookingSuccess.teamName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Player Name</span>
                      <strong style={{ color: 'var(--text-bright)' }}>{bookingSuccess.userName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Date</span>
                      <strong style={{ color: 'var(--text-bright)' }}>{bookingSuccess.bookingDate}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Time Slot</span>
                      <strong style={{ color: 'var(--primary)' }}>{bookingSuccess.inTimeStr} - {bookingSuccess.outTimeStr}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Phone Number</span>
                      <strong style={{ color: 'var(--text-bright)' }}>{bookingSuccess.userPhone}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Email Address</span>
                      <strong style={{ color: 'var(--text-bright)' }}>{bookingSuccess.userEmail}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                      <span className="badge badge-yellow animate-pulse" style={{ fontSize: '13px', padding: '6px 16px', borderRadius: '30px' }}>
                        Pending Admin Approval
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setBookingSuccess(null)}>
                      Book Another Slot
                    </button>
                    <button className="btn-primary" style={{ flex: 1, padding: '12px' }} onClick={() => { setShowProfileModal(true); setBookingSuccess(null); }}>
                      View History
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="booking-form">
                  {bookingError && <div className="error-banner"><Activity size={16}/> {bookingError}</div>}
                  
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label><Calendar size={14} /> Select Date</label>
                    <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required style={{ maxWidth: '300px', width: '100%' }} />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--text-bright)' }}>Bookings on {bookingDate}</h4>
                    {bookings.filter(b => b.bookingDate === bookingDate && b.status !== 'rejected').length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No bookings yet for this date. All timings available!</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {bookings.filter(b => b.bookingDate === bookingDate && b.status !== 'rejected').map(b => (
                          <div key={b.id} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: '3px solid ' + (b.status === 'confirmed' ? 'var(--accent-green)' : 'var(--accent-yellow)'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary)' }}>{b.inTimeStr} - {b.outTimeStr}</strong>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.teamName} (by {b.userName})</span>
                            </div>
                            <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}>{b.status === 'confirmed' ? 'Booked' : 'Pending'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="time-row" style={{ marginTop: '20px', marginBottom: '24px' }}>
                    <CustomTimePicker label="In Time (AM / PM)" time={inTime} setTime={setInTime} />
                    <CustomTimePicker label="Out Time (AM / PM)" time={outTime} setTime={setOutTime} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <div className="form-group" style={{ flex: '1 1 200px' }}>
                      <label><Users size={14} /> Team Name</label>
                      <input type="text" placeholder="Enter Team Name" value={bookingTeam} onChange={(e) => setBookingTeam(e.target.value)} required />
                    </div>

                    <div className="form-group" style={{ flex: '1 1 200px' }}>
                      <label><Phone size={14} /> Phone Number</label>
                      <input type="tel" placeholder="Enter phone number" value={bookingPhone} onChange={(e) => setBookingPhone(e.target.value)} required />
                    </div>

                    <div className="form-group" style={{ flex: '1 1 200px' }}>
                      <label><FileText size={14} /> Email Address</label>
                      <input type="email" placeholder="Enter email address" value={bookingEmail} onChange={(e) => setBookingEmail(e.target.value)} required />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{marginTop: '24px', padding: '14px 40px', fontSize: '16px', width: '100%'}}>
                    Request Booking Slot
                  </button>
                </form>
              )}
            </div>
          </div>
          )}
        </main>
      )}


      {/* Profile History Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-scale" style={{ maxWidth: '800px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><History size={24} color="var(--primary)"/> My Booking History</h2>
              <button onClick={() => setShowProfileModal(false)} className="btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            {myBookings.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Activity size={48} style={{ margin: '0 auto 16px', color: 'var(--border)' }}/>
                <p>You have no booking history yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                {myBookings.map(b => (
                  <div key={b.id} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '18px', color: 'var(--text-bright)' }}>{b.bookingDate}</h4>
                        <p style={{ fontSize: '15px', color: 'var(--primary)', marginTop: '6px', fontWeight: 'bold' }}>
                          {b.inTimeStr} - {b.outTimeStr}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Req ID: {b.id} | Team: {b.teamName}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {b.status === 'pending' && <span className="badge badge-yellow animate-pulse">Pending Admin Approval</span>}
                        {b.status === 'confirmed' && <span className="badge badge-green">Slot Confirmed & Booked!</span>}
                        {b.status === 'rejected' && <span className="badge badge-red">Rejected</span>}
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
