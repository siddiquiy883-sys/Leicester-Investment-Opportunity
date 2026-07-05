"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

const CALENDAR_DATES = [
  { id: '2026-07-31', label: 'July 31, 2026', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
  { id: '2026-08-01', label: 'Aug 1, 2026', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'] },
  { id: '2026-08-02', label: 'Aug 2, 2026', slots: ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'] },
  { id: '2026-08-03', label: 'Aug 3, 2026', slots: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'] },
]; // 18 slots total

// Info cards shown after each qualification step
const INFO_CARDS: Record<string, { title: string; text: string; image: string }> = {
  'after-objective': {
    title: '📈 Why Dubai Property?',
    text: 'Sobha Realty has delivered 30%+ capital appreciation in key Dubai corridors. Our Leicester event gives you first access to off-market units before public release.',
    image: '/assets/exterior render 1.JPG',
  },
  'after-budget': {
    title: '💰 Flexible Payment Plans',
    text: 'Starting from just £15,000 down payment with flexible payment plans up to 5 years. Fully RERA-regulated and DLD-approved for your peace of mind.',
    image: '/assets/Interior Render 1.JPG',
  },
  'after-concierge': {
    title: '🤝 Full Concierge Support',
    text: 'From money wiring and legals to rental management — our full concierge team handles everything so you don\'t have to. Invest from the UK with zero hassle.',
    image: '/assets/Interior Render 2.JPG',
  },
  'after-timeline': {
    title: '🔒 Off-Market Exclusivity',
    text: 'Off-market units are released exclusively at this event. Early investors secure the best floor plans and pricing before the public launch.',
    image: '/assets/exterior render 2.JPG',
  },
};

export default function VIPFunnel() {
  const [step, setStep] = useState(0);
  const [showPopup, setShowPopup] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [utmParams, setUtmParams] = useState({ source: '', medium: '', campaign: '' });
  
  // Form State
  const [objective, setObjective] = useState('');
  const [budget, setBudget] = useState('');
  const [concierge, setConcierge] = useState('');
  const [timeline, setTimeline] = useState('');
  const [timeSlot, setTimeSlot] = useState({ date: '', time: '' });
  
  const [userData, setUserData] = useState({ firstName: '', lastName: '', email: '', whatsapp: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDateTab, setActiveDateTab] = useState(CALENDAR_DATES[0].id);

  // Capture UTMs on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmParams({
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || ''
    });
  }, []);

  const handleNext = (field: string, value: string) => {
    if (field === 'objective') setObjective(value);
    if (field === 'budget') setBudget(value);
    if (field === 'concierge') setConcierge(value);
    if (field === 'timeline') setTimeline(value);

    // Conditional Routing — rejections skip info cards
    if (field === 'budget' && value === 'No') {
      setStep(8); // Rejection PDF
      return;
    }
    if (field === 'timeline' && value === 'Next Year') {
      setStep(9); // Rejection Waitlist
      return;
    }
    
    // Show info card after qualifying answer
    const cardMap: Record<string, string> = {
      objective: 'after-objective',
      budget: 'after-budget',
      concierge: 'after-concierge',
      timeline: 'after-timeline',
    };
    if (cardMap[field]) {
      setShowInfoCard(cardMap[field]);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleInfoCardContinue = () => {
    setShowInfoCard(null);
    setStep(prev => prev + 1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      timestamp: new Date().toISOString(),
      ...userData,
      objective,
      budget,
      concierge,
      timeline,
      timeSlot: `${timeSlot.date} ${timeSlot.time}`,
      ...utmParams
    };

    try {
      const formBody = new URLSearchParams(payload as any).toString();

      await fetch('https://script.google.com/macros/s/AKfycbxgA4qVKyfnWX14kodkhTR_dyxUCUMvUYdZoFVk6ZXu9JgYkZlu-wY4xC4gmUmr2senxA/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody
      });
      // Fire generic pixel event simulation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('Qualified_Lead_Booked', { detail: payload }));
      }
      setStep(6); // Success
    } catch (error) {
      console.error(error);
      alert('Failed to secure your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBackgroundImage = () => {
    if (step === 1 || step === 2) return '/assets/exterior render 1.JPG';
    if (step >= 3 && step <= 5) return '/assets/Interior Render 1.JPG';
    return null;
  };

  // Progress: Steps 1-5 qualify, step 0 is hero
  const getProgress = () => {
    if (step <= 0) return 0;
    if (step >= 6) return 100;
    return Math.round((step / 5) * 100);
  };

  const bgImage = getBackgroundImage();

  return (
    <main className={styles.main}>
      {/* Welcome Popup */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={`${styles.popupModal} glass-panel`}>
            <div className={styles.popupIcon}>🏙️</div>
            <h2 className={styles.popupTitle}>Event Alert</h2>
            <p className={styles.popupSubtext}>
              Leicester, UK | 31 July to 3 August 2026. Before you begin your VIP application, we recommend watching a brief message from our Founder.
            </p>
            <div className={styles.popupButtons}>
              <button 
                className={styles.popupPrimaryBtn}
                onClick={() => { setShowPopup(false); setShowVideo(true); }}
              >
                ▶ Watch The Video
              </button>
              <button
                className={styles.popupSkipBtn}
                onClick={() => { setShowPopup(false); setStep(0); }}
              >
                Skip & Apply Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Founder Video Modal */}
      {showVideo && (
        <div className={styles.videoModal}>
          <button className={styles.videoModalClose} onClick={() => { setShowVideo(false); if (videoRef.current) videoRef.current.pause(); }}>✕</button>
          <div className={styles.videoModalContent}>
            <video
              ref={videoRef}
              className={styles.videoModalPlayer}
              controls
              autoPlay
              playsInline
            >
              <source src="/assets/founder-video.mp4" type="video/mp4" />
            </video>
            <button
              className={styles.videoModalCTA}
              onClick={() => { setShowVideo(false); if (videoRef.current) videoRef.current.pause(); setStep(1); }}
            >
              Begin Application
            </button>
          </div>
        </div>
      )}

      {/* Background Video */}
      <video className={styles.backgroundVideo} autoPlay loop muted playsInline>
        <source src="/assets/Cinematic Background Video.MP4" type="video/mp4" />
      </video>
      <div className={styles.videoOverlay}></div>

      {/* Header */}
      <header className={`${styles.header} glass-panel`}>
        <div className={styles.logoContainer}>
          <img src="/assets/Springboks logo.png" alt="Springbok Real Estate" className={styles.logo} />
        </div>
        <div className={styles.logoContainer}>
          <img src="/assets/Sobha-Realty-Square-Logo.jpg" alt="Sobha Realty" className={styles.logo} />
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.splitScreen}>
          {/* Dynamic Image Panel (desktop only) */}
          <div className={styles.imagePanel}>
            {bgImage && (
              <img 
                src={bgImage} 
                alt="Luxury Property" 
                className={styles.panelImage} 
                key={bgImage}
              />
            )}
          </div>

          {/* Form Panel */}
          <div className={`${styles.formPanel} glass-panel`}>
            
            {/* Progress Bar — visible during steps 1-5 */}
            {step >= 1 && step <= 5 && (
              <div>
                <div className={styles.progressText}>Application Progress: {getProgress()}%</div>
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBarFill} style={{ width: `${getProgress()}%` }}></div>
                </div>
              </div>
            )}

            {/* Back Button */}
            {step > 0 && step <= 5 && !showInfoCard && (
              <button onClick={() => setStep(step - 1)} className={styles.backButton}>
                ← Back
              </button>
            )}

            {/* ====== INFO CARD OVERLAY ====== */}
            {showInfoCard && INFO_CARDS[showInfoCard] && (
              <div className={`${styles.stepContainer} fade-in`}>
                <div className={styles.infoCard}>
                  <img 
                    src={INFO_CARDS[showInfoCard].image} 
                    alt={INFO_CARDS[showInfoCard].title} 
                    className={styles.infoCardImage} 
                  />
                  <div className={styles.infoCardBody}>
                    <h3>{INFO_CARDS[showInfoCard].title}</h3>
                    <p>{INFO_CARDS[showInfoCard].text}</p>
                  </div>
                </div>
                <button 
                  className={`${styles.infoCardContinue} glass-button`} 
                  onClick={handleInfoCardContinue}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ====== STEP 0: HERO ====== */}
            {step === 0 && !showInfoCard && !showPopup && (
              <div className={`${styles.stepContainer} fade-in`}>
                <div className={styles.heroEventBadge}>📍 Leicester, UK | July 31 to Aug 3, 2026</div>
                <h1 className={styles.questionTitle}>Exclusive Dubai Property Show</h1>
                <p className={styles.heroDescription}>
                  An invite-only consultation event by Springbok Real Estate & Sobha Realty. Meet directly with our investment advisors to access off-market luxury properties in Dubai before they are released to the public.
                </p>

                <div className={styles.heroStats}>
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatValue}>18</span>
                    <span className={styles.heroStatLabel}>VIP Slots</span>
                  </div>
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatValue}>30%+</span>
                    <span className={styles.heroStatLabel}>Capital Growth</span>
                  </div>
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatValue}>£150K</span>
                    <span className={styles.heroStatLabel}>Starting From</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--color-gold)', marginBottom: '8px' }}>Watch the message from our Founder:</p>
                <div className={styles.videoPlaceholder} onClick={() => setShowVideo(true)}>
                  <video className={styles.videoThumbnail} muted playsInline preload="metadata">
                    <source src="/assets/founder-video.mp4#t=0.5" type="video/mp4" />
                  </video>
                  <div className={styles.playButton}>
                    <div className={styles.playTriangle}></div>
                  </div>
                </div>
                <button className={`${styles.submitButton} glass-button`} onClick={() => setStep(1)} style={{ background: 'var(--color-gold)', color: 'var(--color-onyx)' }}>
                  Begin Application
                </button>
              </div>
            )}

            {/* ====== STEP 1: OBJECTIVE ====== */}
            {step === 1 && !showInfoCard && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>What is your primary objective?</h2>
                <p className={styles.questionSubtitle}>Select the option that best describes your investment goal.</p>
                <div className={styles.optionsGrid}>
                  {['High ROI', 'Rental Yield', 'Golden Visa', 'Relocation'].map(opt => (
                    <button key={opt} className={`${styles.optionButton} glass-button`} onClick={() => handleNext('objective', opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ====== STEP 2: BUDGET ====== */}
            {step === 2 && !showInfoCard && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>Do you have access to £15,000 - £30,000 in liquid funds for the initial down payment?</h2>
                <div className={styles.optionsGrid}>
                  <button className={`${styles.optionButton} glass-button`} onClick={() => handleNext('budget', 'Yes')}>
                    Yes, I am ready.
                  </button>
                  <button className={`${styles.optionButton} glass-button`} onClick={() => handleNext('budget', 'No')}>
                    No, not currently.
                  </button>
                </div>
              </div>
            )}

            {/* ====== STEP 3: CONCIERGE ====== */}
            {step === 3 && !showInfoCard && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>Which services do you require?</h2>
                <p className={styles.questionSubtitle}>Our concierge team will prepare everything before your consultation.</p>
                <div className={styles.optionsGrid} style={{ gridTemplateColumns: '1fr' }}>
                  {['Money Wiring', 'Legals', 'Rental Management', 'Flipping', 'Acquisition'].map(opt => (
                    <button key={opt} className={`${styles.optionButton} glass-button`} onClick={() => handleNext('concierge', opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ====== STEP 4: TIMELINE ====== */}
            {step === 4 && !showInfoCard && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>When are you looking to invest?</h2>
                <div className={styles.optionsGrid}>
                  <button className={`${styles.optionButton} glass-button`} onClick={() => handleNext('timeline', 'Immediately')}>Immediately</button>
                  <button className={`${styles.optionButton} glass-button`} onClick={() => handleNext('timeline', '1-3 Months')}>1-3 Months</button>
                  <button className={`${styles.optionButton} glass-button`} onClick={() => handleNext('timeline', 'Next Year')}>Next Year</button>
                </div>
              </div>
            )}

            {/* ====== STEP 5: CALENDAR BOOKING ====== */}
            {step === 5 && !showInfoCard && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>Secure Your VIP Consultation</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-gold)' }}>⚠️ These off-market opportunities will NOT be available after this event.</p>
                
                <form onSubmit={handleFinalSubmit}>
                  {/* Calendar UI */}
                  <div className={styles.calendarContainer}>
                    <div className={styles.dateTabs}>
                      {CALENDAR_DATES.map(date => (
                        <button 
                          key={date.id} type="button"
                          className={`${styles.dateTab} glass-button ${activeDateTab === date.id ? styles.active : ''}`}
                          onClick={() => setActiveDateTab(date.id)}
                        >
                          {date.label}
                        </button>
                      ))}
                    </div>
                    <div className={styles.slotsGrid}>
                      {CALENDAR_DATES.find(d => d.id === activeDateTab)?.slots.map(slot => (
                        <button 
                          key={slot} type="button"
                          className={`${styles.slotButton} glass-button ${timeSlot.time === slot && timeSlot.date === activeDateTab ? styles.selected : ''}`}
                          onClick={() => setTimeSlot({ date: activeDateTab, time: slot })}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr style={{ borderColor: 'var(--color-glass-border)', margin: '20px 0' }} />

                  {/* Form Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className={styles.formGroup}>
                      <label>First Name</label>
                      <input required type="text" value={userData.firstName} onChange={e => setUserData({...userData, firstName: e.target.value})} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Last Name</label>
                      <input required type="text" value={userData.lastName} onChange={e => setUserData({...userData, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <input required type="email" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>UK WhatsApp (+44)</label>
                    <input required type="tel" pattern="(\+44|0)[0-9]{9,10}" placeholder="+44 7123 456789" value={userData.whatsapp} onChange={e => setUserData({...userData, whatsapp: e.target.value})} />
                  </div>

                  <div className={styles.scarcityContainer}>
                    <img src="/assets/Off-Market%22%20Teaser%20Graphic%201.JPG" alt="Off-Market Teaser 1" className={styles.scarcityImage} />
                    <img src="/assets/Off-Market%22%20Teaser%20Graphic%202.JPG" alt="Off-Market Teaser 2" className={styles.scarcityImage} />
                  </div>

                  <button type="submit" disabled={!timeSlot.time || isSubmitting} className={`${styles.submitButton} glass-button`} style={{ background: 'var(--color-gold)', color: 'black' }}>
                    {isSubmitting ? 'Securing...' : 'Lock In My VIP Allocation'}
                  </button>
                </form>
              </div>
            )}

            {/* ====== STEP 6: SUCCESS ====== */}
            {step === 6 && (
              <div className={`${styles.stepContainer} fade-in`} style={{ textAlign: 'center' }}>
                <h2 className={styles.questionTitle} style={{ color: 'var(--color-gold)' }}>Allocation Secured.</h2>
                <p>We look forward to seeing you on {timeSlot.date} at {timeSlot.time}.</p>
                <p>Our concierge team will reach out via WhatsApp shortly with location details.</p>
                <a
                  href="https://springboksrealestate.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.submitButton} glass-button`}
                  style={{ background: 'var(--color-gold)', color: 'var(--color-onyx)', display: 'inline-block', textDecoration: 'none', marginTop: '16px' }}
                >
                  Visit Our Website →
                </a>
              </div>
            )}

            {/* ====== STEP 8: REJECTION PDF ====== */}
            {step === 8 && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>While our VIP allocations require a £15k minimum down payment...</h2>
                <p>We still want to help you on your investment journey. Download our exclusive UK Investor&apos;s Guide to Dubai Real Estate.</p>
                <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/assets/UK%20INVESTMENT%20GUIDE.pdf'; }}>
                   <div className={styles.formGroup}>
                    <label>First Name</label>
                    <input required type="text" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <input required type="email" />
                  </div>
                  <button type="submit" className={`${styles.submitButton} glass-button`} style={{ background: 'var(--color-gold)', color: 'black' }}>
                    Download Free Guide Now
                  </button>
                </form>
              </div>
            )}

            {/* ====== STEP 9: REJECTION WAITLIST ====== */}
            {step === 9 && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>Since you are looking to invest next year...</h2>
                <p>We have added you to our priority waitlist. We will contact you when our next portfolio is released.</p>
                <form onSubmit={(e) => { e.preventDefault(); setStep(6); }}>
                   <div className={styles.formGroup}>
                    <label>First Name</label>
                    <input required type="text" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <input required type="email" />
                  </div>
                  <button type="submit" className={`${styles.submitButton} glass-button`} style={{ background: 'var(--color-gold)', color: 'black' }}>
                    Join Priority Waitlist
                  </button>
                </form>
              </div>
            )}

            {/* Regulatory Footer */}
            {!showInfoCard && (
              <div className={styles.regulatoryFooter}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-platinum)', opacity: 0.7 }}>Authorized & Regulated By</span>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
                  <img src="/assets/land-department-logo-png_seeklogo-217733.png" alt="Dubai Land Department" className={styles.regLogo} />
                  <img src="/assets/RERA_new.jpeg" alt="RERA" className={styles.regLogo} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
