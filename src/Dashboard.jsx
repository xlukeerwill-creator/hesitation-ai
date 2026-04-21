import { useState, useEffect, useRef, useCallback } from 'react'
import useIsMobile from './useIsMobile'

// ============ DATA ============
const liveVisitors = [
  { id: 'Sarah K.', product: 'Organic Face Serum', action: 'Viewing product page', risk: 'low', emoji: '\uD83D\uDC40', avatar: 'SK' },
  { id: 'Mike T.', product: 'Retinol Night Cream', action: 'Hovering over price 3x', risk: 'medium', emoji: '\uD83E\uDD14', avatar: 'MT' },
  { id: 'Emma L.', product: 'Vitamin C Moisturizer', action: 'Reading 1-star reviews', risk: 'high', emoji: '\uD83D\uDE1F', avatar: 'EL' },
  { id: 'James R.', product: 'SPF 50 Daily Shield', action: 'Added to cart!', risk: 'none', emoji: '\uD83D\uDED2', avatar: 'JR' },
  { id: 'Priya M.', product: 'Retinol Night Cream', action: 'Left site, came back', risk: 'critical', emoji: '\u26A0\uFE0F', avatar: 'PM' },
  { id: 'Alex W.', product: 'Gentle Cleanser Gel', action: 'Comparing competitors', risk: 'high', emoji: '\uD83D\uDD0D', avatar: 'AW' },
  { id: 'Lisa P.', product: 'Hydrating Lip Balm', action: 'Checkout complete!', risk: 'converted', emoji: '\u2705', avatar: 'LP' },
  { id: 'Chen Y.', product: 'Organic Face Serum', action: 'Scrolling testimonials', risk: 'medium', emoji: '\uD83D\uDCDC', avatar: 'CY' },
]

const savedSales = [
  { customer: 'Emma L.', product: 'Retinol Night Cream', amount: 54, blocker: 'Trust issues', fix: 'Video reviews', time: '2 min ago', emoji: '\uD83C\uDFA5' },
  { customer: 'David H.', product: 'Organic Face Serum', amount: 41, blocker: 'Price too high', fix: '15% discount', time: '8 min ago', emoji: '\uD83D\uDCB8' },
  { customer: 'Maria G.', product: 'SPF 50 Shield', amount: 32, blocker: 'Confused', fix: 'AI chatbot', time: '15 min ago', emoji: '\uD83E\uDD16' },
  { customer: 'Tom S.', product: 'Vitamin C Moisturizer', amount: 36, blocker: 'Nervous buyer', fix: 'Guarantee popup', time: '22 min ago', emoji: '\uD83D\uDEE1\uFE0F' },
  { customer: 'Amy K.', product: 'Gentle Cleanser', amount: 28, blocker: 'Needs validation', fix: 'Purchase alerts', time: '34 min ago', emoji: '\uD83D\uDC65' },
]
const aiSuggestions = [
  { visitor: 'Rachel B.', product: 'Retinol Night Cream', blocker: 'Price Sensitivity', suggested: '15% discount', suggestedAmount: 15, risk: 84, timeLeft: '~45 seconds before she leaves' },
  { visitor: 'Omar K.', product: 'Organic Face Serum', blocker: 'Purchase Anxiety', suggested: 'Money-back guarantee', suggestedAmount: null, risk: 71, timeLeft: '~2 minutes browsing' },
]

const tips = [
  { title: 'Add 3 more product photos', desc: 'Your Night Cream only has 1 image. Products with 3+ photos convert 23% better.', impact: '+23%', icon: '\uD83D\uDCF8', category: 'Quick Win', applied: false },
  { title: 'Drop free shipping to $35', desc: 'Average cart is $41 but free shipping starts at $50. Lowering captures 78% more carts.', impact: '+18%', icon: '\uD83D\uDE9A', category: 'Quick Win', applied: false },
  { title: 'Add video testimonials', desc: '68% of hesitating visitors read reviews. Video builds 3x more trust than text.', impact: '+31%', icon: '\uD83C\uDFA5', category: 'High Impact', applied: false },
  { title: 'Show "Only X left" badges', desc: 'Scarcity creates urgency. Your Serum sells 8/day \u2014 show real stock numbers.', impact: '+15%', icon: '\u23F0', category: 'Easy', applied: false },
]

const weekData = [
  { day: 'Mon', without: 2.1, with: 5.8, revenue: 580 },
  { day: 'Tue', without: 2.3, with: 6.2, revenue: 720 },
  { day: 'Wed', without: 1.9, with: 6.8, revenue: 890 },
  { day: 'Thu', without: 2.4, with: 7.1, revenue: 940 },
  { day: 'Fri', without: 2.6, with: 7.5, revenue: 1100 },
  { day: 'Sat', without: 2.8, with: 8.2, revenue: 1280 },
  { day: 'Sun', without: 2.2, with: 7.8, revenue: 1050 },
]

const blockerData = [
  { name: 'Price Sensitivity', pct: 34, icon: '\uD83D\uDCB0', color: '#ff9500', saved: 89 },
  { name: 'Purchase Anxiety', pct: 26, icon: '\uD83D\uDE30', color: '#af52de', saved: 67 },
  { name: 'Trust Deficit', pct: 18, icon: '\uD83E\uDD14', color: '#ff3b30', saved: 52 },
  { name: 'Info Gap', pct: 14, icon: '\u2753', color: '#0071e3', saved: 41 },
  { name: 'Social Proof', pct: 8, icon: '\uD83D\uDC65', color: '#34c759', saved: 23 },
]

// ============ ANIMATED NUMBER ============
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const prevVal = useRef(0)
  useEffect(() => {
    const start = prevVal.current
    const diff = value - start
    const startTime = Date.now()
    const dur = 1200
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / dur, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(start + diff * eased))
      if (progress < 1) ref.current = requestAnimationFrame(animate)
      else prevVal.current = value
    }
    ref.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(ref.current)
  }, [value])
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>
}

// ============ CONFETTI ============
function Confetti({ show }) {
  if (!show) return null
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}>
      {Array.from({ length: 40 }, (_, i) => {
        const colors = ['#0071e3', '#34c759', '#ff9500', '#af52de', '#ff3b30', '#ffcc00']
        return <div key={i} style={{
          position: 'absolute', left: `${Math.random() * 100}%`, top: -10,
          width: 7 + Math.random() * 7, height: 5 + Math.random() * 4,
          background: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: 2, transform: `rotate(${Math.random() * 360}deg)`,
          animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.6}s forwards`,
        }} />
      })}
      <style>{`@keyframes confettiFall { 0% { opacity:1 } 100% { transform:translateY(105vh) rotate(1080deg); opacity:0; } }`}</style>
    </div>
  )
}

// ============ MOOD METER ============
function MoodMeter({ value, aiEnabled }) {
  const moodEmoji = value >= 80 ? '\uD83E\uDD29' : value >= 60 ? '\uD83D\uDE0A' : value >= 40 ? '\uD83D\uDE10' : value >= 20 ? '\uD83D\uDE1F' : '\uD83D\uDE2D'
  const moodLabel = value >= 80 ? 'Thriving!' : value >= 60 ? 'Doing great' : value >= 40 ? 'Needs attention' : value >= 20 ? 'Struggling' : 'Critical!'
  const moodColor = value >= 60 ? '#34c759' : value >= 40 ? '#ff9500' : '#ff3b30'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 160, height: 90, margin: '0 auto 10px', overflow: 'hidden' }}>
        <svg width="160" height="90" viewBox="0 0 160 90">
          <path d="M 10 85 A 70 70 0 0 1 150 85" fill="none" stroke="#f0f0f0" strokeWidth="10" strokeLinecap="round" />
          <path d="M 10 85 A 70 70 0 0 1 150 85" fill="none" stroke="url(#moodG)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 220} 220`} style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.25,1,0.5,1)' }} />
          <defs><linearGradient id="moodG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ff3b30"/><stop offset="50%" stopColor="#ff9500"/><stop offset="100%" stopColor="#34c759"/></linearGradient></defs>
        </svg>
        <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', fontSize: 32, transition: 'all 0.5s' }}>{moodEmoji}</div>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: moodColor, transition: 'color 0.5s' }}>{moodLabel}</div>
      <div style={{ fontSize: 12, color: '#86868b', marginTop: 2 }}>Health: {value}/100</div>
    </div>
  )
}

// ============ HESITATION TRACKER (Demo Moment 3) ============
function HesitationTracker({ visitor, onClose }) {
  const [seconds, setSeconds] = useState(0)
  const [phase, setPhase] = useState(0)
  const phases = [
    { time: 3, text: 'Browsing product page...', risk: 15, color: '#34c759' },
    { time: 6, text: 'Hovering over price tag...', risk: 35, color: '#ff9500' },
    { time: 9, text: 'Still on price... comparing mentally', risk: 55, color: '#ff9500' },
    { time: 12, text: 'Price hover #3 \u2014 hesitation detected!', risk: 72, color: '#ff3b30' },
    { time: 15, text: 'Price hover #4 \u2014 HIGH RISK!', risk: 85, color: '#ff3b30' },
    { time: 17, text: '\u26A0 Left the site! Checking competitor...', risk: 92, color: '#ff3b30' },
    { time: 20, text: '\uD83E\uDD16 AI DEPLOYING: 15% discount + guarantee', risk: 88, color: '#af52de' },
    { time: 22, text: '\u2705 Customer returned and purchased!', risk: 10, color: '#34c759' },
  ]

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const idx = phases.findIndex(p => p.time > seconds)
    setPhase(idx === -1 ? phases.length - 1 : Math.max(0, idx - 1))
  }, [seconds])

  const current = phases[phase]
  const isComplete = phase === phases.length - 1

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 28, padding: 36, maxWidth: 480, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Tracking: {visitor.id}</div>
            <div style={{ fontSize: 13, color: '#86868b' }}>{visitor.product}</div>
          </div>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 18, color: '#86868b', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7' }}>{'\u2715'}</span>
        </div>

        {/* RISK BAR */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#86868b' }}>Hesitation Risk</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: current.color, transition: 'color 0.5s' }}>{current.risk}%</span>
          </div>
          <div style={{ height: 12, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${current.risk}%`, borderRadius: 6,
              background: `linear-gradient(90deg, #34c759, #ffcc00 40%, #ff9500 65%, #ff3b30 85%)`,
              transition: 'width 0.8s cubic-bezier(0.25,1,0.5,1)',
            }} />
          </div>
        </div>

        {/* STATUS */}
        <div style={{
          padding: '18px 20px', borderRadius: 16, marginBottom: 20,
          background: isComplete ? 'rgba(52,199,89,0.06)' : current.risk >= 80 ? 'rgba(255,59,48,0.06)' : current.risk >= 50 ? 'rgba(255,149,0,0.06)' : '#fafafa',
          border: `1.5px solid ${current.color}20`,
          transition: 'all 0.5s',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: current.color, marginBottom: 4, transition: 'color 0.5s' }}>
            {current.text}
          </div>
          <div style={{ fontSize: 12, color: '#86868b' }}>Time elapsed: {seconds}s</div>
        </div>

        {/* TIMELINE */}
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {phases.filter((p, i) => i <= phase).map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
              opacity: i === phase ? 1 : 0.5,
              animation: i === phase ? 'fadeIn 0.4s ease' : 'none',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#86868b', width: 30, flexShrink: 0 }}>{p.time}s</span>
              <span style={{ fontSize: 13, fontWeight: i === phase ? 600 : 400, color: i === phase ? p.color : '#6e6e73' }}>{p.text}</span>
            </div>
          ))}
        </div>

        {isComplete && (
          <div style={{ marginTop: 16, textAlign: 'center', animation: 'bounceIn 0.5s ease' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{'\uD83C\uDF89'}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#34c759' }}>Sale saved! +$54 recovered</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============ MAIN DASHBOARD ============
export default function Dashboard({ onSwitchView }) {
  const mobile = useIsMobile()
  const [aiEnabled, setAiEnabled] = useState(true)
  const [revenue, setRevenue] = useState(4280)
  const [savedCount, setSavedCount] = useState(23)
  const [visitorCount, setVisitorCount] = useState(847)
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [activeLive, setActiveLive] = useState(null)
  const [expandedTip, setExpandedTip] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedBlocker, setSelectedBlocker] = useState(null)
  const [storeHealth, setStoreHealth] = useState(0)
  const [chartRevealed, setChartRevealed] = useState(false)
  const [appliedTips, setAppliedTips] = useState({})
  const [showTracker, setShowTracker] = useState(null)
  const [approvedSuggestions, setApprovedSuggestions] = useState({})
const [rejectedSuggestions, setRejectedSuggestions] = useState({})
const [customAmounts, setCustomAmounts] = useState({ 0: 15, 1: 0 })
  const [bigSave, setBigSave] = useState(null)
  const [lastConfettiTime, setLastConfettiTime] = useState(null)
const [hasShownInitialConfetti, setHasShownInitialConfetti] = useState(false)
  const chartRef = useRef(null)
  const canTriggerConfetti = () => {
  if (!hasShownInitialConfetti) return false

  if (!lastConfettiTime) return true

  const now = Date.now()
  const diff = now - lastConfettiTime

  return diff > 7 * 60 * 1000
}

  // Cinematic entrance: health counts up from 0
  useEffect(() => {
    setTimeout(() => setLoaded(true), 100)
    let health = 0
    const hi = setInterval(() => {
      health += 2
      if (health >= 78) { clearInterval(hi); setStoreHealth(78) }
      else setStoreHealth(health)
    }, 40)
    return () => clearInterval(hi)
  }, [])

  // Live data updates
  useEffect(() => {
    const ri = setInterval(() => {
      if (!aiEnabled) {
        setStoreHealth(p => Math.max(12, p - 2))
        return
      }
      setRevenue(p => p + Math.floor(Math.random() * 20) + 8)
      setSavedCount(p => p + (Math.random() > 0.6 ? 1 : 0))
      setVisitorCount(p => p + Math.floor(Math.random() * 5) - 2)
      setStoreHealth(p => Math.min(92, p + (Math.random() > 0.4 ? 1 : 0)))
    }, 3500)

    const ni = setInterval(() => {
      if (!aiEnabled) return
      const msgs = [
        { text: '\uD83C\uDF89 Sale saved! Emma bought the Night Cream \u2014 $54 recovered', type: 'success', amount: 54 },
        { text: '\uD83E\uDD16 AI activated: showing 15% discount to hesitating visitor', type: 'action' },
        { text: '\u26A0\uFE0F Visitor about to leave \u2014 deploying guarantee popup', type: 'warning' },
        { text: '\u2705 Checkout complete! +$36.00 revenue', type: 'success', amount: 36 },
        { text: '\uD83D\uDCA1 Night Cream visitors hesitate 3x more than average', type: 'insight' },
        { text: '\uD83C\uDFAF A/B winner: urgency timer beats plain discount by 44%', type: 'insight' },
      ]
      const msg = msgs[Math.floor(Math.random() * msgs.length)]
      if (msg.type === 'success' && canTriggerConfetti()) {
  setShowConfetti(true)
  setBigSave(msg.amount || 54)
  setLastConfettiTime(Date.now())

  setTimeout(() => {
    setShowConfetti(false)
    setBigSave(null)
  }, 3500)
}
      setNotifications(p => [{ ...msg, id: Date.now() }, ...p].slice(0, 6))
      setShowNotif(true)
      setTimeout(() => setShowNotif(false), 4500)
    }, 15000)

    return () => { clearInterval(ri); clearInterval(ni) }
  }, [aiEnabled])

  // AI toggle effect
  useEffect(() => {
    if (!aiEnabled) setStoreHealth(p => Math.max(12, p - 15))
    else {
      setStoreHealth(p => Math.min(78, p + 20))
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }, [aiEnabled])

  // Chart drawing
  useEffect(() => {
    const c = chartRef.current; if (!c) return
    const ctx = c.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = c.parentElement.offsetWidth, h = 260
    c.width = w * dpr; c.height = h * dpr
    c.style.width = w + 'px'; c.style.height = h + 'px'
    ctx.scale(dpr, dpr)
    const pad = { top: 28, right: 20, bottom: 44, left: 48 }
    const cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom
    const maxVal = 10, gap = cw / weekData.length, barW = gap * 0.28
    ctx.clearRect(0, 0, w, h)

    // Grid
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i
      ctx.strokeStyle = '#f0f0f0'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke()
      ctx.fillStyle = '#b0b0b0'; ctx.font = '500 11px -apple-system,sans-serif'; ctx.textAlign = 'right'
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i) + '%', pad.left - 10, y + 4)
    }

    weekData.forEach((d, i) => {
      const x = pad.left + i * gap + gap / 2

      // Without AI bar
      const h1 = (d.without / maxVal) * ch
      ctx.fillStyle = '#e8e8ed'
      ctx.beginPath(); ctx.roundRect(x - barW - 3, pad.top + ch - h1, barW, h1, [6, 6, 0, 0]); ctx.fill()

      // With AI bar (animated via chartRevealed)
      const targetH = aiEnabled ? (d.with / maxVal) * ch : (d.without / maxVal) * ch
      const h2 = chartRevealed ? targetH : 0
      if (h2 > 0) {
        const grad = ctx.createLinearGradient(0, pad.top + ch - h2, 0, pad.top + ch)
        grad.addColorStop(0, '#0071e3'); grad.addColorStop(1, '#34c759')
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.roundRect(x + 3, pad.top + ch - h2, barW, h2, [6, 6, 0, 0]); ctx.fill()

        // Value on top
        ctx.fillStyle = '#0071e3'; ctx.font = '700 11px -apple-system,sans-serif'; ctx.textAlign = 'center'
        ctx.fillText((aiEnabled ? d.with : d.without) + '%', x + 3 + barW / 2, pad.top + ch - h2 - 8)
      }

      // Day label
      ctx.fillStyle = '#86868b'; ctx.font = '500 13px -apple-system,sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(d.day, x, h - 18)

      // Revenue
      if (chartRevealed && aiEnabled) {
        ctx.fillStyle = '#34c759'; ctx.font = '600 10px -apple-system,sans-serif'
        ctx.fillText('$' + d.revenue, x, h - 4)
      }
    })
  }, [aiEnabled, loaded, chartRevealed])

  const riskStyles = {
    none: { color: '#86868b', bg: '#f5f5f7', label: 'Browsing', glow: false },
    low: { color: '#34c759', bg: 'rgba(52,199,89,0.06)', label: 'Happy', glow: false },
    medium: { color: '#ff9500', bg: 'rgba(255,149,0,0.06)', label: 'Thinking...', glow: false },
    high: { color: '#ff3b30', bg: 'rgba(255,59,48,0.06)', label: 'Hesitating!', glow: true },
    critical: { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)', label: 'About to leave!', glow: true },
    converted: { color: '#34c759', bg: 'rgba(52,199,89,0.1)', label: 'Purchased!', glow: false },
  }

  const px = mobile ? 16 : 40

  return (
    <div style={{
      minHeight: '100vh',
      background: aiEnabled ? '#f2f2f7' : '#fef2f2',
      transition: 'background 1s ease',
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes glow { 0%,100% { box-shadow:0 0 20px rgba(0,113,227,0.12) } 50% { box-shadow:0 0 40px rgba(0,113,227,0.22) } }
        @keyframes glowRed { 0%,100% { box-shadow:0 0 12px rgba(255,59,48,0.1) } 50% { box-shadow:0 0 24px rgba(255,59,48,0.25) } }
        @keyframes bounceIn { 0% { transform:scale(0.3);opacity:0 } 50% { transform:scale(1.08) } 100% { transform:scale(1);opacity:1 } }
        @keyframes liveDot { 0%,100% { transform:scale(1) } 50% { transform:scale(1.6) } }
        @keyframes shakeMild { 0%,100% { transform:translateX(0) } 25% { transform:translateX(-3px) } 75% { transform:translateX(3px) } }
        @keyframes bigSaveIn { 0% { transform:scale(0) rotate(-10deg);opacity:0 } 60% { transform:scale(1.1) rotate(2deg) } 100% { transform:scale(1) rotate(0deg);opacity:1 } }
      `}</style>

      <Confetti show={showConfetti} />

      {/* HESITATION TRACKER MODAL */}
      {showTracker && <HesitationTracker visitor={showTracker} onClose={() => setShowTracker(null)} />}

      {/* BIG SAVE CELEBRATION */}
      {bigSave && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 250, animation: 'bigSaveIn 0.6s cubic-bezier(0.25,1,0.5,1)',
          background: '#fff', borderRadius: 28, padding: '32px 48px', textAlign: 'center',
          boxShadow: '0 24px 80px rgba(52,199,89,0.25)', border: '2px solid rgba(52,199,89,0.2)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{'\uD83C\uDF89'}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#34c759' }}>+${bigSave}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f' }}>Sale saved by AI!</div>
        </div>
      )}

      {/* TOAST */}
      {showNotif && notifications.length > 0 && !bigSave && (
        <div style={{
          position: 'fixed', top: mobile ? 70 : 20, right: 20, left: mobile ? 20 : 'auto',
          width: mobile ? 'auto' : 400, background: '#fff', borderRadius: 18, padding: '16px 22px', zIndex: 200,
          boxShadow: '0 16px 48px rgba(0,0,0,0.12)', animation: 'slideDown 0.4s cubic-bezier(0.25,1,0.5,1)',
          borderLeft: `4px solid ${notifications[0].type === 'success' ? '#34c759' : notifications[0].type === 'warning' ? '#ff3b30' : '#0071e3'}`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>{notifications[0].text}</div>
        </div>
      )}

      {/* HEADER */}
      <nav style={{
        padding: `14px ${px}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: aiEnabled ? 'rgba(242,242,247,0.8)' : 'rgba(254,242,242,0.9)',
        backdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: `1px solid ${aiEnabled ? 'rgba(0,0,0,0.04)' : 'rgba(255,59,48,0.1)'}`,
        position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.5s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: aiEnabled ? 'linear-gradient(135deg, #0071e3, #34c759)' : '#d2d2d7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 700, color: '#fff', transition: 'background 0.5s',
          }}>H</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>WhyNot AI</div>
            <div style={{
              fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              color: aiEnabled ? '#34c759' : '#ff3b30', transition: 'color 0.5s',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: aiEnabled ? '#34c759' : '#ff3b30',
                animation: aiEnabled ? 'liveDot 2s infinite' : 'pulse 1s infinite',
              }} />
              {aiEnabled ? 'Protecting your store' : 'PROTECTION OFF!'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14,
            padding: '8px 16px', border: aiEnabled ? '1px solid rgba(0,0,0,0.06)' : '2px solid rgba(255,59,48,0.3)',
            animation: aiEnabled ? 'glow 3s ease infinite' : 'glowRed 1.5s ease infinite',
            transition: 'border 0.5s',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: aiEnabled ? '#0071e3' : '#ff3b30' }}>
              {aiEnabled ? 'AI ON' : 'AI OFF'}
            </span>
            <div onClick={() => setAiEnabled(!aiEnabled)} style={{
              width: 48, height: 26, borderRadius: 13, cursor: 'pointer',
              background: aiEnabled ? 'linear-gradient(135deg, #0071e3, #34c759)' : '#ff3b30',
              padding: 2, transition: 'background 0.3s', display: 'flex', alignItems: 'center',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11, background: '#fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                transform: aiEnabled ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.3s cubic-bezier(0.25,1,0.5,1)',
              }} />
            </div>
          </div>
          <button onClick={onSwitchView} style={{
            background: '#fff', border: '1px solid rgba(0,0,0,0.06)', padding: '9px 18px',
            borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>View Store</button>
        </div>
      </nav>

      {/* AI OFF WARNING BANNER */}
      {!aiEnabled && (
        <div onClick={() => setAiEnabled(true)} style={{
          background: 'linear-gradient(90deg, #ff3b30, #ff6b6b)', padding: '14px 20px',
          textAlign: 'center', cursor: 'pointer', animation: 'shakeMild 0.5s ease',
        }}>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
            {'\u26A0\uFE0F'} Your store is unprotected! You're losing ~$178/hour in potential sales. Tap here to turn AI back on.
          </span>
        </div>
      )}

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: `24px ${px}px` }}>

        {/* GREETING */}
        <div style={{ marginBottom: 24, animation: loaded ? 'fadeIn 0.6s ease' : 'none' }}>
          <h1 style={{ fontSize: mobile ? 28 : 36, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.025em' }}>
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'} {'\u2615'}
          </h1>
          <p style={{ fontSize: 16, color: '#86868b', margin: 0 }}>
            {aiEnabled ? 'Your store is protected and converting' : 'Turn on AI to start recovering lost sales'}
          </p>
        </div>

        {/* TOP ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 260px', gap: 16, marginBottom: 16 }}>
          {/* MONEY CARD */}
          <div style={{
            background: aiEnabled
              ? 'linear-gradient(135deg, #0071e3 0%, #0ea5e9 40%, #34c759 100%)'
              : 'linear-gradient(135deg, #8e8e93 0%, #b0b0b0 100%)',
            borderRadius: 24, padding: mobile ? '28px 24px' : '36px 40px', color: '#fff',
            position: 'relative', overflow: 'hidden', transition: 'all 0.8s',
            animation: loaded ? 'fadeInUp 0.6s ease' : 'none',
          }}>
            <div style={{ position: 'absolute', top: -80, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.85, marginBottom: 10 }}>
                {'\uD83D\uDCB0'} {aiEnabled ? 'Revenue recovered by AI today' : 'Revenue recovery paused'}
              </div>
              <div style={{ fontSize: mobile ? 48 : 64, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16 }}>
                <AnimatedNumber value={revenue} prefix="$" />
              </div>
              <div style={{ display: 'flex', gap: mobile ? 16 : 32, flexWrap: 'wrap' }}>
                {[
                  { val: savedCount, label: 'Sales saved', emoji: '\uD83C\uDF89' },
                  { val: visitorCount, label: 'Live visitors', emoji: '\uD83D\uDC40' },
                  { val: '7.1%', label: 'Conv. rate', emoji: '\uD83D\uDCC8' },
                ].map((m, i) => (
                  <div key={i} style={{ opacity: aiEnabled ? 1 : 0.5, transition: 'opacity 0.5s' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{m.emoji}</span>
                      {typeof m.val === 'number' ? <AnimatedNumber value={m.val} /> : m.val}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MOOD METER */}
          <div style={{
            background: '#fff', borderRadius: 24, padding: '24px',
            border: `1px solid ${aiEnabled ? 'rgba(0,0,0,0.06)' : 'rgba(255,59,48,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: loaded ? 'fadeInUp 0.6s ease 0.1s both' : 'none',
            transition: 'border 0.5s',
          }}>
            <MoodMeter value={storeHealth} aiEnabled={aiEnabled} />
          </div>
        </div>

        {/* BLOCKERS */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: mobile ? 20 : 28,
          border: '1px solid rgba(0,0,0,0.06)', marginBottom: 16,
          animation: loaded ? 'fadeInUp 0.6s ease 0.15s both' : 'none',
        }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 4px' }}>Why customers hesitate</h2>
          <p style={{ fontSize: 12, color: '#86868b', margin: '0 0 18px' }}>Tap any reason to see how many sales we recovered</p>
          <div style={{ display: 'flex', gap: mobile ? 8 : 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            {blockerData.map((b, i) => {
              const isSel = selectedBlocker === i
              return (
                <div key={i} onClick={() => setSelectedBlocker(isSel ? null : i)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '16px 18px', borderRadius: 18, cursor: 'pointer', minWidth: mobile ? 75 : 95,
                  background: isSel ? `${b.color}08` : '#fafafa',
                  border: isSel ? `2px solid ${b.color}30` : '1px solid rgba(0,0,0,0.03)',
                  transform: isSel ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.25,1,0.5,1)',
                }}>
                  <span style={{ fontSize: 26 }}>{b.icon}</span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: b.color }}>{b.pct}%</div>
                  <div style={{ fontSize: 10, color: '#6e6e73', fontWeight: 600, textAlign: 'center' }}>{b.name}</div>
                </div>
              )
            })}
          </div>
          {selectedBlocker !== null && (
            <div style={{
              marginTop: 14, padding: '16px 20px', borderRadius: 14, animation: 'bounceIn 0.4s ease',
              background: `${blockerData[selectedBlocker].color}06`,
              border: `1px solid ${blockerData[selectedBlocker].color}15`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {blockerData[selectedBlocker].icon} {blockerData[selectedBlocker].name}
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#34c759' }}>
                {'\uD83C\uDF89'} {blockerData[selectedBlocker].saved} sales recovered this week
              </span>
            </div>
          )}
        </div>

        {/* LIVE + SAVED */}
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* LIVE VISITORS */}
          <div style={{
            background: '#fff', borderRadius: 24, padding: mobile ? 20 : 28,
            border: '1px solid rgba(0,0,0,0.06)',
            animation: loaded ? 'fadeInUp 0.6s ease 0.2s both' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Live right now</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(52,199,89,0.06)', padding: '4px 12px', borderRadius: 980 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: 11, color: '#34c759', fontWeight: 600 }}>{visitorCount}</span>
              </div>
            </div>
            {liveVisitors.map((v, i) => {
              const rs = riskStyles[v.risk] || riskStyles.none
              const isActive = activeLive === i
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  borderRadius: 14, marginBottom: 4, cursor: 'pointer',
                  background: isActive ? rs.bg : 'transparent',
                  border: isActive ? `1.5px solid ${rs.color}25` : '1px solid transparent',
                  animation: rs.glow && !isActive ? 'glowRed 2s ease infinite' : 'none',
                  transition: 'all 0.2s',
                }}
                  onClick={() => setActiveLive(isActive ? null : i)}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: rs.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: rs.color, flexShrink: 0,
                    border: `1.5px solid ${rs.color}20`,
                  }}>{v.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{v.id}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 980, background: rs.bg, color: rs.color }}>{rs.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#86868b', marginTop: 1 }}>{v.action}</div>
                  </div>
                </div>
              )
            })}
            {activeLive !== null && (riskStyles[liveVisitors[activeLive]?.risk]?.glow) && (
              <button onClick={() => setShowTracker(liveVisitors[activeLive])} style={{
                width: '100%', marginTop: 8, padding: 12, borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #ff3b30, #ff6b6b)', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                animation: 'bounceIn 0.4s ease',
              }}>
                {'\uD83D\uDD0D'} Watch this hesitation live
              </button>
            )}
          </div>

          {/* SAVED SALES */}
          <div style={{
            background: '#fff', borderRadius: 24, padding: mobile ? 20 : 28,
            border: '1px solid rgba(0,0,0,0.06)',
            animation: loaded ? 'fadeInUp 0.6s ease 0.25s both' : 'none',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>{'\uD83C\uDF89'} Sales rescued by AI</h2>
            {savedSales.map((s, i) => (
              <div key={i} style={{
                padding: '13px 16px', borderRadius: 14, marginBottom: 6,
                background: '#fafafa', border: '1px solid rgba(0,0,0,0.03)',
                transition: 'all 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{s.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.customer}</div>
                      <div style={{ fontSize: 11, color: '#86868b' }}>{s.product}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#34c759' }}>+${s.amount}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,59,48,0.05)', color: '#ff3b30', fontWeight: 600 }}>{'\u2717'} {s.blocker}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(52,199,89,0.05)', color: '#34c759', fontWeight: 600 }}>{'\u2713'} {s.fix}</span>
                  <span style={{ fontSize: 10, color: '#b0b0b0', marginLeft: 'auto' }}>{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
{/* AI SUGGESTIONS - HUMAN DECIDES */}
        {aiEnabled && aiSuggestions.map((s, i) => {
          const isApproved = approvedSuggestions[i]
          const isRejected = rejectedSuggestions[i]
          const currentAmount = customAmounts[i] || 0
          if (isApproved || isRejected) return null
          return null
        }).some(x => !x) && (
          <div style={{
            background: '#fff', borderRadius: 24, padding: mobile ? 20 : 28,
            border: '2px solid rgba(0,113,227,0.15)', marginBottom: 16,
            animation: loaded ? 'fadeInUp 0.6s ease 0.28s both' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 22 }}>{'\uD83E\uDD16'}</span>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI needs your decision</h2>
                <p style={{ fontSize: 12, color: '#86868b', margin: 0 }}>AI suggests, you approve</p>
              </div>
            </div>
            {aiSuggestions.map((s, i) => {
              const isApproved = approvedSuggestions[i]
              const isRejected = rejectedSuggestions[i]
              const currentAmount = customAmounts[i] || 0
              if (isRejected) return <div key={i} style={{ padding: 14, borderRadius: 14, background: '#fafafa', marginBottom: 8, opacity: 0.5 }}><span style={{ fontSize: 13, color: '#86868b' }}>Skipped {s.visitor}</span></div>
              if (isApproved) return <div key={i} style={{ padding: 14, borderRadius: 14, background: 'rgba(52,199,89,0.04)', border: '1px solid rgba(52,199,89,0.15)', marginBottom: 8 }}><span style={{ fontSize: 14, fontWeight: 700, color: '#34c759' }}>{'\u2705'} Deployed {s.suggested}{s.suggestedAmount ? ` (${currentAmount}%)` : ''} to {s.visitor}</span></div>
              return (
                <div key={i} style={{ padding: 18, borderRadius: 16, marginBottom: 10, background: s.risk >= 80 ? 'rgba(255,59,48,0.03)' : 'rgba(255,149,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{s.visitor}</div>
                      <div style={{ fontSize: 12, color: '#6e6e73' }}>{s.product} {'\u00B7'} {s.blocker}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 980, background: s.risk >= 80 ? 'rgba(255,59,48,0.08)' : 'rgba(255,149,0,0.08)', color: s.risk >= 80 ? '#ff3b30' : '#ff9500' }}>Risk: {s.risk}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#ff3b30', fontWeight: 600, marginBottom: 12 }}>{'\u23F1'} {s.timeLeft}</div>
                  <div style={{ padding: '12px 16px', background: 'rgba(0,113,227,0.04)', borderRadius: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#0071e3', marginBottom: 4 }}>{'\uD83E\uDD16'} AI recommends:</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{s.suggested}</div>
                    {s.suggestedAmount && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        {[5, 10, 15, 20, 25].map(amt => (
                          <button key={amt} onClick={() => setCustomAmounts(p => ({...p, [i]: amt}))} style={{
                            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                            background: currentAmount === amt ? 'linear-gradient(135deg, #0071e3, #34c759)' : '#f0f0f0',
                            color: currentAmount === amt ? '#fff' : '#6e6e73',
                          }}>{amt}%</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setApprovedSuggestions(p => ({...p, [i]: true})); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2000) }} style={{
                      flex: 1, padding: 12, borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #0071e3, #34c759)', color: '#fff', fontSize: 14, fontWeight: 700,
                    }}>{'\u2713'} Approve & Deploy</button>
                    <button onClick={() => setRejectedSuggestions(p => ({...p, [i]: true}))} style={{
                      padding: '12px 18px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)',
                      background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#86868b',
                    }}>Skip</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {/* CHART with REVEAL BUTTON */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: mobile ? 20 : 28,
          border: '1px solid rgba(0,0,0,0.06)', marginBottom: 16,
          animation: loaded ? 'fadeInUp 0.6s ease 0.3s both' : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 2px' }}>This week's performance</h2>
              <p style={{ fontSize: 12, color: '#86868b', margin: 0 }}>Conversion rate and daily revenue</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: '#e8e8ed' }} />
                  <span style={{ color: '#86868b' }}>Without AI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg, #0071e3, #34c759)' }} />
                  <span style={{ color: '#0071e3', fontWeight: 600 }}>With AI</span>
                </div>
              </div>
              {!chartRevealed && (
                <button onClick={() => setChartRevealed(true)} style={{
                  background: 'linear-gradient(135deg, #0071e3, #34c759)', color: '#fff', border: 'none',
                  padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,113,227,0.2)',
                  animation: 'pulse 2s infinite',
                }}>Show AI Impact {'\u2192'}</button>
              )}
            </div>
          </div>
          <div style={{ position: 'relative', width: '100%', height: 260 }}><canvas ref={chartRef} /></div>
        </div>

        {/* TIPS */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: mobile ? 20 : 28,
          border: '1px solid rgba(0,0,0,0.06)', marginBottom: 16,
          animation: loaded ? 'fadeInUp 0.6s ease 0.35s both' : 'none',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{'\uD83D\uDCA1'} AI recommendations</h2>
          <p style={{ fontSize: 12, color: '#86868b', margin: '0 0 18px' }}>Personalized tips from your visitor data</p>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
            {tips.map((tip, i) => {
              const isExp = expandedTip === i
              const isApplied = appliedTips[i]
              return (
                <div key={i} onClick={() => !isApplied && setExpandedTip(isExp ? null : i)} style={{
                  padding: '18px 20px', borderRadius: 18, cursor: isApplied ? 'default' : 'pointer',
                  background: isApplied ? 'rgba(52,199,89,0.04)' : isExp ? 'rgba(0,113,227,0.03)' : '#fafafa',
                  border: isApplied ? '1.5px solid rgba(52,199,89,0.15)' : isExp ? '1.5px solid rgba(0,113,227,0.12)' : '1px solid rgba(0,0,0,0.03)',
                  transition: 'all 0.25s',
                  transform: isExp ? 'scale(1.01)' : 'scale(1)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{isApplied ? '\u2705' : tip.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isApplied ? '#34c759' : '#1d1d1f' }}>
                          {isApplied ? 'Applied!' : tip.title}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: '#f5f5f7', color: '#86868b' }}>{tip.category}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 15, fontWeight: 800, padding: '4px 12px', borderRadius: 10,
                      background: isApplied ? 'rgba(52,199,89,0.08)' : 'rgba(52,199,89,0.06)',
                      color: '#34c759',
                    }}>{tip.impact}</span>
                  </div>
                  {isExp && !isApplied && (
                    <div style={{ animation: 'fadeIn 0.3s ease', marginTop: 10 }}>
                      <p style={{ fontSize: 13, color: '#6e6e73', lineHeight: 1.6, margin: '0 0 12px' }}>{tip.desc}</p>
                      <button onClick={(e) => {
                        e.stopPropagation()
                        setAppliedTips(p => ({ ...p, [i]: true }))
                        setExpandedTip(null)
                        setShowConfetti(true)
                        setTimeout(() => setShowConfetti(false), 2000)
                      }} style={{
                        background: 'linear-gradient(135deg, #0071e3, #34c759)', color: '#fff', border: 'none',
                        padding: '10px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,113,227,0.2)',
                      }}>Apply this tip {'\u2192'}</button>
                    </div>
                  )}
                  {isApplied && (
                    <div style={{ fontSize: 12, color: '#34c759', fontWeight: 600, marginTop: 4 }}>
                      Expected impact: {tip.impact} more sales
                    </div>
                  )}
                  {!isExp && !isApplied && <div style={{ fontSize: 11, color: '#b0b0b0', marginTop: 2 }}>Tap to learn more</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={{
          background: 'linear-gradient(135deg, #1d1d1f, #2d2d30)', borderRadius: 24,
          padding: mobile ? 24 : 36, color: '#fff', marginBottom: 16,
          animation: loaded ? 'fadeInUp 0.6s ease 0.4s both' : 'none',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 24px', textAlign: 'center' }}>How WhyNot AI works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { emoji: '\uD83D\uDC40', title: 'Watch', desc: 'AI observes browsing behavior', color: '#0071e3', num: '1' },
              { emoji: '\uD83E\uDDE0', title: 'Understand', desc: 'Detects why they hesitate', color: '#af52de', num: '2' },
              { emoji: '\u26A1', title: 'Act', desc: 'Sends the perfect nudge', color: '#ff9500', num: '3' },
              { emoji: '\uD83D\uDCB0', title: 'Convert', desc: 'They buy instead of leaving', color: '#34c759', num: '4' },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '24px 14px', borderRadius: 20,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.3s', cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 8, background: s.color,
                  fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', color: '#fff',
                }}>{s.num}</div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVITY LOG */}
        {notifications.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 24, padding: mobile ? 20 : 28,
            border: '1px solid rgba(0,0,0,0.06)', marginBottom: 16,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 14px' }}>{'\uD83D\uDD14'} Live activity</h2>
            {notifications.map((n, i) => (
              <div key={n.id} style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 4,
                background: n.type === 'success' ? 'rgba(52,199,89,0.04)' : n.type === 'warning' ? 'rgba(255,59,48,0.04)' : '#fafafa',
                borderLeft: `3px solid ${n.type === 'success' ? '#34c759' : n.type === 'warning' ? '#ff3b30' : n.type === 'insight' ? '#0071e3' : '#ff9500'}`,
                opacity: 1 - (i * 0.12),
              }}>
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>{n.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}