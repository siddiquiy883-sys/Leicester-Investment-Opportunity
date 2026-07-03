"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

const CALENDAR_DATES = [
  { id: '2026-07-31', label: 'July 31, 2026', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
  { id: '2026-08-01', label: 'Aug 1, 2026', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'] },
  { id: '2026-08-02', label: 'Aug 2, 2026', slots: ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'] },
  { id: '2026-08-03', label: 'Aug 3, 2026', slots: ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'] },
]; // 18 slots total

export default function VIPFunnel() {
  const [step, setStep] = useState(0);
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

    // Conditional Routing
    if (field === 'budget' && value === 'No') {
      setStep(8); // Rejection PDF
      return;
    }
    if (field === 'timeline' && value === 'Next Year') {
      setStep(9); // Rejection Waitlist
      return;
    }
    
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
    return null; // fallback or default
  };

  const bgImage = getBackgroundImage();

  return (
    <main className={styles.main}>
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
          {/* Dynamic Image Panel */}
          <div className={styles.imagePanel}>
            {bgImage && (
              <img 
                src={bgImage} 
                alt="Luxury Property" 
                className={styles.panelImage} 
                key={bgImage} // Forces re-render for transition
              />
            )}
          </div>

          {/* Form Panel */}
          <div className={`${styles.formPanel} glass-panel`}>
            
            {step > 0 && step <= 5 && (
              <button onClick={() => setStep(step - 1)} className={styles.backButton}>
                &larr; Back
              </button>
            )}

            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className={`${styles.stepContainer} ${styles.stepZero} fade-in`}>
                <h1 className={styles.questionTitle}>Watch the message from our Founder before applying for your VIP consultation.</h1>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-gold)', marginBottom: '10px' }}>Limited to only 18 slots in Leicester</p>
                <div className={styles.videoPlaceholder} onClick={() => alert("Video coming soon!")}>
                  <div className={styles.playButton}>
                    <div className={styles.playTriangle}></div>
                  </div>
                  <p style={{position: 'absolute', bottom: 10, color: 'white'}}>Founder Video</p>
                </div>
                <button className={`${styles.glassButton} ${styles.submitButton} glass-button`} onClick={() => setStep(1)}>
                  Begin Application
                </button>
              </div>
            )}

            {/* Step 1: Objective */}
            {step === 1 && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>What is your primary objective?</h2>
                <div className={styles.optionsGrid}>
                  {['High ROI', 'Rental Yield', 'Golden Visa', 'Relocation'].map(opt => (
                    <button key={opt} className={`${styles.optionButton} glass-button`} onClick={() => handleNext('objective', opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Budget */}
            {step === 2 && (
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

            {/* Step 3: Concierge */}
            {step === 3 && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>Which services do you require?</h2>
                <div className={styles.optionsGrid} style={{ gridTemplateColumns: '1fr' }}>
                  {['Money Wiring', 'Legals', 'Rental Management', 'Flipping', 'Acquisition'].map(opt => (
                    <button key={opt} className={`${styles.optionButton} glass-button`} onClick={() => handleNext('concierge', opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Timeline */}
            {step === 4 && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>When are you looking to invest?</h2>
                <div className={styles.optionsGrid}>
                  <button className={`${styles.optionButton} glass-button`} onClick={() => handleNext('timeline', 'Immediately')}>Immediately</button>
                  <button className={`${styles.optionButton} glass-button`} onClick={() => handleNext('timeline', '1-3 Months')}>1-3 Months</button>
                  <button className={`${styles.optionButton} glass-button`} onClick={() => handleNext('timeline', 'Next Year')}>Next Year</button>
                </div>
              </div>
            )}

            {/* Step 5: Calendar Booking */}
            {step === 5 && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>Secure Your VIP Consultation</h2>
                <p>Strictly 18 allocations available in Leicester.</p>
                
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
                    <img src="/assets/Off-Market%22%20Teaser%20Graphic%201.JPG" alt="Scarcity 1" className={styles.scarcityImage} />
                    <img src="/assets/Off-Market%22%20Teaser%20Graphic%202.JPG" alt="Scarcity 2" className={styles.scarcityImage} />
                  </div>

                  <button type="submit" disabled={!timeSlot.time || isSubmitting} className={`${styles.submitButton} glass-button`} style={{ background: 'var(--color-gold)', color: 'black' }}>
                    {isSubmitting ? 'Securing...' : 'Lock In My VIP Allocation'}
                  </button>
                </form>
              </div>
            )}

            {/* Step 6: Success */}
            {step === 6 && (
              <div className={`${styles.stepContainer} fade-in`} style={{ textAlign: 'center' }}>
                <h2 className={styles.questionTitle} style={{ color: 'var(--color-gold)' }}>Allocation Secured.</h2>
                <p>We look forward to seeing you on {timeSlot.date} at {timeSlot.time}.</p>
                <p>Our concierge team will reach out via WhatsApp shortly with location details.</p>
              </div>
            )}

            {/* Step 8: Rejection PDF */}
            {step === 8 && (
              <div className={`${styles.stepContainer} fade-in`}>
                <h2 className={styles.questionTitle}>While our VIP allocations require a £15k minimum down payment...</h2>
                <p>We still want to help you on your investment journey. Download our exclusive UK Investor's Guide to Dubai Real Estate.</p>
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

            {/* Step 9: Rejection Waitlist */}
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
            <div className={styles.regulatoryFooter}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-platinum)', opacity: 0.7 }}>Authorized & Regulated By</span>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
                <img src="/assets/land-department-logo-png_seeklogo-217733.png" alt="Dubai Land Department" className={styles.regLogo} />
                <img src="/assets/RERA_new.jpeg" alt="RERA" className={styles.regLogo} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
