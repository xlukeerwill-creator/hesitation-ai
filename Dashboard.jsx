import { useState, useEffect, useRef } from 'react'
import useIsMobile from './useIsMobile'

// ============ DATA ============
const visitors = [
  { id: 'V-4821', time: '6m 32s', pages: 8, product: 'Organic Face Serum', risk: 78, blocker: 'Price Sensitivity', device: 'iPhone 15', source: 'Google Ads', location: 'Washington, DC', sessions: 3 },
  { id: 'V-4822', time: '4m 15s', pages: 5, product: 'Retinol Night Cream', risk: 92, blocker: 'Purchase Anxiety', device: 'MacBook Pro', source: 'Instagram Ad', location: 'New York, NY', sessions: 1 },
  { id: 'V-4823', time: '2m 48s', pages: 3, product: 'SPF 50 Daily Shield', risk: 25, blocker: null, device: 'iPad Air', source: 'Direct', location: 'Miami, FL', sessions: 7 },
  { id: 'V-4824', time: '8m 01s', pages: 12, product: 'Vitamin C Moisturizer', risk: 65, blocker: 'Trust Deficit', device: 'Samsung S24', source: 'TikTok', location: 'Chicago, IL', sessions: 2 },
  { id: 'V-4825', time: '3m 22s', pages: 4, product: 'Gentle Cleanser Gel', risk: 85, blocker: 'Information Gap', device: 'iPhone 14', source: 'Google Organic', location: 'Austin, TX', sessions: 1 },
]

const signals = [
  { icon: '\uD83D\uDCB2', label: 'Price comparison', desc: 'Hovered price 4x in 30s, opened competitor tab, returned after 2 min.', time: '2m ago', severity: 'high', blocker: 'Price Sensitivity', dataPoints: ['Hovers: 4', 'Tab switch: 1', 'Return: 2m'] },
  { icon: '\uD83D\uDED2', label: 'Cart abandonment', desc: 'Added Retinol Night Cream, removed after 18s, re-added but no checkout.', time: '45s ago', severity: 'critical', blocker: 'Purchase Anxiety', dataPoints: ['Cycles: 2', 'Cart time: 4m', 'Checkout: 0'] },
  { icon: '\u2B50', label: 'Negative review focus', desc: 'Skipped 47 positive reviews, spent 3 min on 1-star reviews only.', time: '4m ago', severity: 'medium', blocker: 'Trust Deficit', dataPoints: ['Skipped: 47', '1-star read: 6', 'Time: 3m'] },
  { icon: '\u21A9\uFE0F', label: 'Repeated exits', desc: 'Left product page 3x, returned via Google search each time.', time: '8m ago', severity: 'high', blocker: 'Information Gap', dataPoints: ['Exits: 3', 'Source: Google', 'Query: "nova skin"'] },
  { icon: '\uD83D\uDCDC', label: 'Erratic scrolling', desc: 'Fast scroll past ingredients (0.4s), slow on testimonials (45s).', time: '1m ago', severity: 'low', blocker: 'Social Proof Need', dataPoints: ['Ingredients: 0.4s', 'Testimonials: 45s', 'Changes: 12'] },
]

const interventions = [
  { blocker: 'Price Sensitivity', action: '15% discount banner after 4+ price hovers in 30s.', status: 'active', impact: '+23%', color: '#34c759', logic: 'hover_count > 3 AND time < 30s' },
  { blocker: 'Purchase Anxiety', action: 'Money-back guarantee popup on cart add/remove > 1.', status: 'active', impact: '+18%', color: '#0071e3', logic: 'cart_cycles > 1' },
  { blocker: 'Trust Deficit', action: 'Video reviews when negative review dwell > 60s.', status: 'ready', impact: '+31%', color: '#af52de', logic: 'neg_review_dwell > 60s' },
  { blocker: 'Information Gap', action: 'AI chatbot on 2+ Google re-entries.', status: 'active', impact: '+27%', color: '#ff9500', logic: 'google_reentry > 2' },
  { blocker: 'Social Proof Need', action: 'Live purchase notifications on testimonial dwell > 30s.', status: 'ready', impact: '+14%', color: '#ff3b30', logic: 'testimonial_dwell > 30s' },
]

const journey = [
  { time: '0:00', event: 'Landed on homepage', detail: 'Google Ads \u00B7 iPhone 15 \u00B7 Washington, DC', type: 'neutral' },
  { time: '0:45', event: 'Browsed Best Sellers', detail: '6 products viewed \u00B7 4.2s avg per card', type: 'neutral' },
  { time: '1:30', event: 'Opened Retinol Night Cream', detail: '2m 14s dwell \u00B7 8 reviews read', type: 'neutral' },
  { time: '2:15', event: 'Competitor tab detected', detail: 'Lost focus 2m 03s \u00B7 scrolled to price on return', type: 'warning' },
  { time: '3:00', event: 'Price hover pattern', detail: '4 hovers in 28s', type: 'warning' },
  { time: '4:20', event: 'Cart add/remove cycle', detail: 'Added \u2192 removed 18s \u2192 re-added', type: 'critical' },
  { time: '4:45', event: 'AI Intervention deployed', detail: '15% discount + guarantee \u00B7 87% confidence', type: 'ai' },
  { time: '5:10', event: 'Re-added to cart', detail: 'Applied WELCOME15 \u00B7 $45.90', type: 'success' },
  { time: '5:30', event: 'On checkout page...', detail: 'Filling shipping info', type: 'active' },
]

const cookieData = [
  { name: '_ns_hesitation_score', value: '92', category: 'AI Tracking', desc: 'Real-time risk score', expires: 'Session' },
  { name: '_ns_blocker_type', value: 'purchase_anxiety', category: 'AI Tracking', desc: 'Classified blocker', expires: 'Session' },
  { name: '_ns_hover_map', value: 'price:4,cta:1,img:7', category: 'AI Tracking', desc: 'Hover count map', expires: 'Session' },
  { name: '_ns_scroll_depth', value: '78.4', category: 'AI Tracking', desc: 'Max scroll depth %', expires: 'Session' },
  { name: '_ns_tab_switches', value: '2', category: 'AI Tracking', desc: 'Tab focus/blur', expires: 'Session' },
  { name: '_ns_cart_events', value: 'add:2,remove:1', category: 'AI Tracking', desc: 'Cart event log', expires: 'Session' },
  { name: '_ns_intervention_log', value: 'discount|guarantee', category: 'AI Engine', desc: 'Deployed interventions', expires: 'Session' },
  { name: '_ns_ab_group', value: 'B', category: 'AI Engine', desc: 'A/B test group', expires: '30 days' },
  { name: '_ns_session', value: 'a8f2c...e91b', category: 'Essential', desc: 'Session ID', expires: 'Session' },
  { name: '_ns_visitor_id', value: 'V-4822', category: 'Essential', desc: 'Visitor ID', expires: '1 year' },
  { name: '_ga', value: 'GA1.2.14...82', category: 'Analytics', desc: 'Google Analytics', expires: '2 years' },
  { name: '_fbp', value: 'fb.1.170...48', category: 'Marketing', desc: 'Facebook Pixel', expires: '90 days' },
]

const conversionData = {
  hourly: [
    { hour: '9AM', without: 2.1, with: 2.1 }, { hour: '10AM', without: 2.3, with: 3.1 },
    { hour: '11AM', without: 2.0, with: 3.8 }, { hour: '12PM', without: 2.4, with: 4.2 },
    { hour: '1PM', without: 1.9, with: 4.5 }, { hour: '2PM', without: 2.2, with: 5.1 },
    { hour: '3PM', without: 2.5, with: 5.8 }, { hour: '4PM', without: 2.1, with: 6.2 },
    { hour: '5PM', without: 2.3, with: 6.8 }, { hour: '6PM', without: 2.6, with: 7.1 },
  ],
  blockerBreakdown: [
    { blocker: 'Price Sensitivity', pct: 34, recovered: 23, color: '#34c759' },
    { blocker: 'Purchase Anxiety', pct: 26, recovered: 18, color: '#0071e3' },
    { blocker: 'Trust Deficit', pct: 18, recovered: 31, color: '#af52de' },
    { blocker: 'Information Gap', pct: 14, recovered: 27, color: '#ff9500' },
    { blocker: 'Social Proof', pct: 8, recovered: 14, color: '#ff3b30' },
  ],
  recentConversions: [
    { id: 'V-4801', product: 'Face Serum', value: '$40.80', blocker: 'Price', intervention: '15% discount', time: '12m ago' },
    { id: 'V-4808', product: 'Night Cream', value: '$54.00', blocker: 'Trust', intervention: 'Video reviews', time: '28m ago' },
    { id: 'V-4812', product: 'SPF Shield', value: '$32.00', blocker: 'Info Gap', intervention: 'AI chatbot', time: '43m ago' },
    { id: 'V-4815', product: 'Cleanser', value: '$28.00', blocker: 'Anxiety', intervention: 'Guarantee', time: '1h ago' },
  ]
}

const abTests = [
  { name: 'Price Sensitivity Intervention', status: 'running', startDate: 'Mar 15, 2026', visitors: 2840, confidence: 96.4, variants: [
    { name: 'Control (no action)', visitors: 960, conversions: 22, rate: 2.3, revenue: '$1,056', isWinner: false },
    { name: '10% discount banner', visitors: 940, conversions: 47, rate: 5.0, revenue: '$2,115', isWinner: false },
    { name: '15% discount + urgency', visitors: 940, conversions: 68, rate: 7.2, revenue: '$2,938', isWinner: true },
  ]},
  { name: 'Purchase Anxiety Intervention', status: 'running', startDate: 'Mar 18, 2026', visitors: 1560, confidence: 89.2, variants: [
    { name: 'Control (no action)', visitors: 520, conversions: 12, rate: 2.3, revenue: '$648', isWinner: false },
    { name: 'Money-back guarantee', visitors: 520, conversions: 29, rate: 5.6, revenue: '$1,566', isWinner: true },
    { name: 'Free returns badge', visitors: 520, conversions: 21, rate: 4.0, revenue: '$1,134', isWinner: false },
  ]},
  { name: 'Trust Deficit Intervention', status: 'completed', startDate: 'Mar 1, 2026', visitors: 4200, confidence: 99.1, variants: [
    { name: 'Control (no action)', visitors: 1400, conversions: 32, rate: 2.3, revenue: '$1,728', isWinner: false },
    { name: 'Text reviews highlight', visitors: 1400, conversions: 58, rate: 4.1, revenue: '$3,132', isWinner: false },
    { name: 'Video reviews carousel', visitors: 1400, conversions: 91, rate: 6.5, revenue: '$4,914', isWinner: true },
  ]},
]

// Session replay path — simulated cursor journey across the product page
const sessionPath = [
  { x: 50, y: 4, t: 0, action: 'Viewing navigation bar', zone: 'Navigation', risk: 0 },
  { x: 78, y: 4, t: 800, action: 'Looking at cart icon', zone: 'Navigation', risk: 0 },
  { x: 50, y: 15, t: 1600, action: 'Reading hero headline', zone: 'Hero', risk: 0 },
  { x: 45, y: 22, t: 2400, action: 'Hovering Shop Now button', zone: 'Hero CTA', risk: 5 },
  { x: 15, y: 38, t: 3400, action: 'Browsing Face Serum card', zone: 'Product Card', risk: 10 },
  { x: 15, y: 45, t: 4200, action: 'Checking serum price ($48)', zone: 'Price Tag', risk: 25 },
  { x: 50, y: 38, t: 5000, action: 'Moving to Moisturizer', zone: 'Product Card', risk: 15 },
  { x: 82, y: 38, t: 5800, action: 'Viewing Night Cream card', zone: 'Product Card', risk: 20 },
  { x: 88, y: 45, t: 6600, action: 'Hovering Night Cream price ($54)', zone: 'Price Tag', risk: 45 },
  { x: 88, y: 45, t: 7400, action: 'Still on price... hesitating', zone: 'Price Tag', risk: 55 },
  { x: 87, y: 46, t: 8200, action: 'Price hover #3 \u2014 comparing mentally', zone: 'Price Tag', risk: 65 },
  { x: 89, y: 44, t: 9000, action: 'Price hover #4 \u2014 SIGNAL TRIGGERED', zone: 'Price Tag', risk: 78 },
  { x: 50, y: 4, t: 9500, action: '\u26A0 Tab switch detected! Left site', zone: 'TAB LOST', risk: 82 },
  { x: 50, y: 4, t: 11500, action: 'Returned after 2 min (competitor visit)', zone: 'TAB RETURN', risk: 85 },
  { x: 88, y: 45, t: 12300, action: 'Back to Night Cream price', zone: 'Price Tag', risk: 88 },
  { x: 82, y: 52, t: 13100, action: 'Hovering Add to Cart button', zone: 'Add to Cart', risk: 75 },
  { x: 82, y: 52, t: 13600, action: 'CLICKED Add to Cart!', zone: 'Add to Cart', risk: 60 },
  { x: 82, y: 52, t: 14400, action: 'Removed from cart after 18s', zone: 'Cart', risk: 88 },
  { x: 40, y: 62, t: 15200, action: 'Scrolling to reviews section', zone: 'Reviews', risk: 70 },
  { x: 65, y: 67, t: 16000, action: 'Skipping positive reviews...', zone: 'Reviews', risk: 72 },
  { x: 72, y: 70, t: 16800, action: 'Found 1-star reviews area', zone: '1-Star Reviews', risk: 80 },
  { x: 75, y: 72, t: 17600, action: 'Reading negative review #1', zone: '1-Star Reviews', risk: 85 },
  { x: 73, y: 74, t: 18400, action: 'Reading negative review #2', zone: '1-Star Reviews', risk: 88 },
  { x: 70, y: 73, t: 19200, action: 'Still on negatives \u2014 3 min dwell', zone: '1-Star Reviews', risk: 92 },
  { x: 50, y: 50, t: 19800, action: '\uD83E\uDD16 AI INTERVENTION: 15% discount deployed', zone: 'INTERVENTION', risk: 92 },
  { x: 50, y: 50, t: 20600, action: '\uD83E\uDD16 + Money-back guarantee popup', zone: 'INTERVENTION', risk: 80 },
  { x: 82, y: 52, t: 21400, action: 'Re-added to cart!', zone: 'Add to Cart', risk: 50 },
  { x: 50, y: 85, t: 22200, action: 'Applied WELCOME15 code', zone: 'Checkout', risk: 30 },
  { x: 50, y: 88, t: 23000, action: 'Proceeding to checkout...', zone: 'Checkout', risk: 15 },
  { x: 50, y: 90, t: 23800, action: '\u2705 CONVERSION COMPLETE', zone: 'Success', risk: 0 },
]

const aiPipeline = [
  { step: '1', title: 'Collect', color: '#0071e3', desc: 'Behavioral data capture', details: ['Mouse movements & hovers', 'Scroll depth & speed', 'Page dwell time', 'Tab focus/blur', 'Cart interactions'] },
  { step: '2', title: 'Classify', color: '#af52de', desc: 'ML blocker identification', details: ['Random Forest on 50K sessions', '5 blocker categories', '75%+ confidence threshold', 'Hover 32%, Cart 28%, Scroll 18%'] },
  { step: '3', title: 'Intervene', color: '#ff9500', desc: 'Personalized nudge', details: ['Price \u2192 discount', 'Anxiety \u2192 guarantee', 'Trust \u2192 video reviews', 'Info \u2192 chatbot'] },
  { step: '4', title: 'Learn', color: '#34c759', desc: 'Optimization loop', details: ['Track per-intervention CVR', 'Auto A/B test variants', 'Weekly model retrain', 'LTV measurement'] },
]

const pricing = [
  { name: 'Starter', price: 49, period: '/mo', desc: 'For small stores', features: ['1,000 visitors/mo', '3 intervention types', 'Basic analytics', 'Email support', '1 website'], cta: 'Start Free Trial', popular: false },
  { name: 'Growth', price: 149, period: '/mo', desc: 'For growing brands', features: ['25,000 visitors/mo', 'All 5 interventions', 'Heatmaps + A/B testing', 'Session replay', 'Priority support', '3 websites'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: null, period: '', desc: 'For large-scale ops', features: ['Unlimited visitors', 'Custom ML models', 'Dedicated manager', 'API access', 'White-label', 'Unlimited websites'], cta: 'Contact Sales', popular: false },
]

const sidebarItems = [
  { icon: '\uD83D\uDCCA', label: 'Overview', key: 'overview' },
  { icon: '\uD83D\uDC65', label: 'Visitors', key: 'visitors' },
  { icon: '\uD83D\uDCC8', label: 'Conversions', key: 'conversions' },
  { icon: '\uD83D\uDD25', label: 'Session Replay', key: 'heatmap' },
  { icon: '\uD83E\uDDEA', label: 'A/B Tests', key: 'abtests' },
  { icon: '\uD83C\uDF6A', label: 'Cookies', key: 'cookies' },
  { icon: '\uD83E\uDDE0', label: 'AI Engine', key: 'engine' },
  { icon: '\uD83D\uDCB0', label: 'Pricing', key: 'pricing' },
]

// ============ COMPONENTS ============
function Badge({ text, color, bg }) {
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 980, background: bg, color, whiteSpace: 'nowrap' }}>{text}</span>
}
function DataTag({ text }) {
  return <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: '#f5f5f7', color: '#6e6e73' }}>{text}</span>
}
function MiniBar({ value, max, color }) {
  return <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: `${(value/max)*100}%`, background: color, borderRadius: 3, transition: 'width 1s ease' }} /></div>
}
function RiskCircle({ score, size = 56 }) {
  const color = score >= 80 ? '#ff3b30' : score >= 50 ? '#ff9500' : '#34c759'
  const r = (size-8)/2, circ = 2*Math.PI*r, off = circ-(score/100)*circ
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f5f5f7" strokeWidth="4"/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:'stroke-dashoffset 1s ease'}}/><text x={size/2} y={size/2+5} textAnchor="middle" fill={color} fontSize={size*0.26} fontWeight="700">{score}</text></svg>
}

function ConversionChart({ mobile }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d'), dpr = window.devicePixelRatio||1
    const w = mobile?340:560, h = 200
    c.width=w*dpr; c.height=h*dpr; c.style.width=w+'px'; c.style.height=h+'px'; ctx.scale(dpr,dpr)
    const data=conversionData.hourly, pad={top:16,right:16,bottom:28,left:36}
    const cw=w-pad.left-pad.right, ch=h-pad.top-pad.bottom, maxVal=8, xStep=cw/(data.length-1)
    ctx.clearRect(0,0,w,h); ctx.strokeStyle='#f0f0f0'; ctx.lineWidth=1
    for(let i=0;i<=4;i++){const y=pad.top+(ch/4)*i;ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(w-pad.right,y);ctx.stroke();ctx.fillStyle='#86868b';ctx.font='10px -apple-system,sans-serif';ctx.textAlign='right';ctx.fillText((maxVal-(maxVal/4)*i).toFixed(0)+'%',pad.left-6,y+3)}
    ctx.textAlign='center';data.forEach((d,i)=>{if(mobile&&i%2!==0)return;ctx.fillStyle='#86868b';ctx.fillText(d.hour,pad.left+i*xStep,h-6)})
    ctx.beginPath();ctx.strokeStyle='#d2d2d7';ctx.lineWidth=2;ctx.setLineDash([4,4]);data.forEach((d,i)=>{const x=pad.left+i*xStep,y=pad.top+ch-(d.without/maxVal)*ch;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});ctx.stroke();ctx.setLineDash([])
    ctx.beginPath();data.forEach((d,i)=>{const x=pad.left+i*xStep,y=pad.top+ch-(d.with/maxVal)*ch;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});ctx.lineTo(pad.left+(data.length-1)*xStep,pad.top+ch);ctx.lineTo(pad.left,pad.top+ch);ctx.closePath()
    const grad=ctx.createLinearGradient(0,pad.top,0,pad.top+ch);grad.addColorStop(0,'rgba(0,113,227,0.12)');grad.addColorStop(1,'rgba(0,113,227,0)');ctx.fillStyle=grad;ctx.fill()
    ctx.beginPath();ctx.strokeStyle='#0071e3';ctx.lineWidth=2.5;data.forEach((d,i)=>{const x=pad.left+i*xStep,y=pad.top+ch-(d.with/maxVal)*ch;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});ctx.stroke()
    data.forEach((d,i)=>{const x=pad.left+i*xStep,y=pad.top+ch-(d.with/maxVal)*ch;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle='#0071e3';ctx.fill()})
  },[mobile])
  return <canvas ref={ref} style={{width:'100%',maxWidth:mobile?340:560,height:200}}/>
}

// ============ SESSION REPLAY HEATMAP ============
function SessionReplayView({ mobile }) {
  const [playing, setPlaying] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [heatTrail, setHeatTrail] = useState([])
  const [eventLog, setEventLog] = useState([])
  const intervalRef = useRef(null)

  const current = sessionPath[currentIdx] || sessionPath[0]
  const progress = currentIdx / (sessionPath.length - 1)
  const riskColor = current.risk >= 80 ? '#ff3b30' : current.risk >= 50 ? '#ff9500' : current.risk >= 30 ? '#ffcc00' : '#34c759'
  const isIntervention = current.zone === 'INTERVENTION'
  const isTabLost = current.zone === 'TAB LOST' || current.zone === 'TAB RETURN'

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx(prev => {
          if (prev >= sessionPath.length - 1) { setPlaying(false); return prev }
          const next = prev + 1
          const point = sessionPath[next]
          setHeatTrail(t => [...t, { x: point.x, y: point.y, risk: point.risk, id: Date.now() }].slice(-60))
          setEventLog(log => [{ action: point.action, zone: point.zone, risk: point.risk, time: (point.t / 1000).toFixed(1) + 's', id: Date.now() }, ...log].slice(0, 12))
          return next
        })
      }, 600 / speed)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, speed])

  const reset = () => { setCurrentIdx(0); setHeatTrail([]); setEventLog([]); setPlaying(false) }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: mobile ? 24 : 28, fontWeight: 700, margin: '0 0 4px' }}>Session replay & heatmap</h2>
        <p style={{ fontSize: 13, color: '#86868b' }}>Watch visitor V-4822 navigate the product page in real-time</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 320px', gap: 20 }}>
        {/* REPLAY VIEWPORT */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {/* Browser chrome */}
          <div style={{ padding: '10px 16px', background: '#f8f8f8', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 6, padding: '5px 12px', fontSize: 11, color: '#86868b', border: '1px solid rgba(0,0,0,0.08)' }}>
              {'\uD83D\uDD12'} novaskin.com/products/retinol-night-cream
            </div>
            <Badge text={playing ? 'RECORDING' : 'PAUSED'} color={playing ? '#ff3b30' : '#86868b'} bg={playing ? 'rgba(255,59,48,0.08)' : '#f5f5f7'} />
          </div>

          {/* Page with cursor */}
          <div style={{ position: 'relative', height: mobile ? 420 : 520, background: '#fbfbfd', overflow: 'hidden' }}>
            {/* Simplified page structure */}
            <div style={{ position: 'absolute', inset: 0 }}>
              {/* Nav */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '7%', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 3%' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#1d1d1f' }}>NOVA SKIN</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                  {['Shop', 'Reviews', 'About'].map(l => <span key={l} style={{ fontSize: 8, color: '#86868b' }}>{l}</span>)}
                </div>
              </div>
              {/* Hero */}
              <div style={{ position: 'absolute', top: '7%', left: 0, right: 0, height: '18%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>Your skin deserves better science.</div>
                <div style={{ fontSize: 8, color: '#86868b', marginBottom: 8 }}>Clinically-proven formulas</div>
                <div style={{ padding: '4px 16px', background: '#0071e3', borderRadius: 6, fontSize: 8, color: '#fff', fontWeight: 600 }}>Shop Now</div>
              </div>
              {/* Product cards */}
              <div style={{ position: 'absolute', top: '27%', left: '3%', right: '3%', height: '28%', display: 'flex', gap: '2%' }}>
                {['Face Serum\n$48', 'Moisturizer\n$36', 'Night Cream\n$54'].map((p, i) => (
                  <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 8, border: '1px solid #eee', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ flex: 1, background: i === 0 ? '#f0e8d8' : i === 1 ? '#e8f0e8' : '#e8e0f0' }} />
                    <div style={{ padding: 6 }}>
                      <div style={{ fontSize: 8, fontWeight: 600 }}>{p.split('\n')[0]}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#1d1d1f' }}>{p.split('\n')[1]}</div>
                      <div style={{ marginTop: 4, padding: '3px 0', background: '#0071e3', borderRadius: 4, fontSize: 7, color: '#fff', textAlign: 'center', fontWeight: 600 }}>Add to Cart</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Reviews */}
              <div style={{ position: 'absolute', top: '57%', left: '3%', right: '3%', height: '18%', background: '#fff', borderRadius: 8, border: '1px solid #eee', padding: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>Reviews & Ratings</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[5,5,5,4,1].map((s,i) => <div key={i} style={{ fontSize: 8, color: s >= 4 ? '#ff9500' : '#ff3b30' }}>{'\u2605'.repeat(s)}</div>)}
                </div>
                <div style={{ position: 'absolute', right: 8, top: '40%', width: '40%', height: '50%', background: 'rgba(255,59,48,0.04)', borderRadius: 6, border: '1px solid rgba(255,59,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 7, color: '#ff3b30', fontWeight: 600 }}>1-Star Reviews</span>
                </div>
              </div>
              {/* Testimonials */}
              <div style={{ position: 'absolute', top: '77%', left: 0, right: 0, height: '10%', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 8, color: '#86868b' }}>Testimonials</span>
              </div>
              {/* Checkout */}
              <div style={{ position: 'absolute', top: '88%', left: '25%', right: '25%', height: '6%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ padding: '4px 20px', background: '#34c759', borderRadius: 6, fontSize: 8, color: '#fff', fontWeight: 600 }}>Proceed to Checkout</div>
              </div>
              {/* Footer */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6%', background: '#1d1d1f' }} />
            </div>

            {/* Heat trail */}
            {heatTrail.map((point, i) => {
              const age = (heatTrail.length - i) / heatTrail.length
              const r = point.risk
              const color = r >= 80 ? `rgba(255,59,48,${0.5 * age})` : r >= 50 ? `rgba(255,149,0,${0.4 * age})` : r >= 30 ? `rgba(255,204,0,${0.3 * age})` : `rgba(52,199,89,${0.2 * age})`
              const size = 12 + (r / 100) * 30
              return <div key={point.id} style={{
                position: 'absolute', left: `${point.x}%`, top: `${point.y}%`,
                width: size, height: size, borderRadius: '50%',
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)', pointerEvents: 'none',
                transition: 'opacity 0.5s', opacity: age,
              }} />
            })}

            {/* Cursor */}
            {!isTabLost && (
              <div style={{
                position: 'absolute',
                left: `${current.x}%`, top: `${current.y}%`,
                transform: 'translate(-4px, -2px)',
                transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                zIndex: 20, pointerEvents: 'none',
                filter: isIntervention ? 'drop-shadow(0 0 12px rgba(175,82,222,0.6))' : `drop-shadow(0 0 8px ${riskColor})`,
              }}>
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                  <path d="M1 1L1 18L5.5 13.5L10 22L13 20.5L8.5 12L15 12L1 1Z" fill={isIntervention ? '#af52de' : riskColor} stroke="#fff" strokeWidth="1.5"/>
                </svg>
              </div>
            )}

            {/* Tab lost overlay */}
            {isTabLost && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, textAlign: 'center', maxWidth: 260 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{current.zone === 'TAB LOST' ? '\u26A0\uFE0F' : '\u21A9\uFE0F'}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{current.zone === 'TAB LOST' ? 'User left the site!' : 'User returned!'}</div>
                  <div style={{ fontSize: 12, color: '#86868b' }}>{current.zone === 'TAB LOST' ? 'Likely visiting a competitor' : 'Back after 2 min on competitor site'}</div>
                </div>
              </div>
            )}

            {/* Intervention overlay */}
            {isIntervention && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(175,82,222,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: 20, textAlign: 'center', maxWidth: 280, boxShadow: '0 12px 40px rgba(175,82,222,0.2)', border: '2px solid rgba(175,82,222,0.2)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{'\uD83E\uDD16'}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#af52de', marginBottom: 4 }}>AI Intervention Active</div>
                  <div style={{ fontSize: 12, color: '#6e6e73' }}>{current.action.replace('\uD83E\uDD16 ', '')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
            {/* Progress bar */}
            <div style={{ height: 4, background: '#e8e8ed', borderRadius: 2, marginBottom: 12, overflow: 'hidden', cursor: 'pointer' }}
              onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; setCurrentIdx(Math.floor(pct * (sessionPath.length - 1))) }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, background: riskColor, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setPlaying(!playing)} style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: playing ? '#ff3b30' : '#0071e3', color: '#fff',
                fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{playing ? '\u23F8' : '\u25B6'}</button>
              <button onClick={reset} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer', fontSize: 12 }}>{'\u21BB'}</button>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 4].map(s => (
                  <button key={s} onClick={() => setSpeed(s)} style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: speed === s ? '#1d1d1f' : '#f5f5f7', color: speed === s ? '#fff' : '#86868b',
                  }}>{s}x</button>
                ))}
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: '#86868b', fontVariantNumeric: 'tabular-nums' }}>
                {(sessionPath[currentIdx]?.t / 1000 || 0).toFixed(1)}s / {(sessionPath[sessionPath.length-1].t / 1000).toFixed(1)}s
              </div>
            </div>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Risk meter */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Hesitation risk</h3>
              <span style={{ fontSize: 24, fontWeight: 800, color: riskColor }}>{current.risk}%</span>
            </div>
            <div style={{ height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{
                height: '100%', width: `${current.risk}%`, borderRadius: 5,
                background: `linear-gradient(90deg, #34c759, #ffcc00 40%, #ff9500 70%, #ff3b30)`,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>{current.zone}</div>
            <div style={{ fontSize: 12, color: '#6e6e73' }}>{current.action}</div>
          </div>

          {/* Event log */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 20, flex: 1, minHeight: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Live event stream</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflow: 'hidden' }}>
              {eventLog.map((ev, i) => {
                const evColor = ev.risk >= 80 ? '#ff3b30' : ev.risk >= 50 ? '#ff9500' : ev.risk >= 30 ? '#ffcc00' : '#34c759'
                const isAI = ev.action.includes('\uD83E\uDD16')
                return (
                  <div key={ev.id} style={{
                    padding: '8px 10px', borderRadius: 8, fontSize: 12,
                    background: isAI ? 'rgba(175,82,222,0.06)' : i === 0 ? 'rgba(0,113,227,0.04)' : '#fafafa',
                    border: isAI ? '1px solid rgba(175,82,222,0.12)' : '1px solid rgba(0,0,0,0.03)',
                    animation: i === 0 ? 'fadeIn 0.3s ease' : 'none',
                    opacity: i === 0 ? 1 : 0.5 + (1 - i / eventLog.length) * 0.5,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, color: isAI ? '#af52de' : '#1d1d1f', fontSize: 11 }}>{ev.zone}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: evColor }} />
                        <span style={{ fontSize: 10, color: '#86868b' }}>{ev.time}</span>
                      </div>
                    </div>
                    <div style={{ color: '#6e6e73', fontSize: 11 }}>{ev.action}</div>
                  </div>
                )
              })}
              {eventLog.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#86868b', fontSize: 13 }}>
                  Press play to start session replay
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ A/B TESTS ============
function ABTestView({ mobile }) {
  const [expanded, setExpanded] = useState(0)
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: mobile ? 24 : 28, fontWeight: 700, margin: '0 0 4px' }}>A/B testing</h2>
        <p style={{ fontSize: 13, color: '#86868b' }}>AI-powered intervention experiments</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[{ label: 'Active tests', value: '2', color: '#0071e3' }, { label: 'Avg confidence', value: '94.9%', color: '#34c759' }, { label: 'Revenue uplift', value: '+$3,840', color: '#ff9500' }].map((m, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: '#86868b', marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
      {abTests.map((test, ti) => (
        <div key={ti} onClick={() => setExpanded(expanded === ti ? -1 : ti)} style={{
          background: '#fff', borderRadius: 16, border: expanded === ti ? '2px solid #0071e3' : '1px solid rgba(0,0,0,0.06)',
          padding: mobile ? 18 : 24, marginBottom: 16, cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: expanded === ti ? 20 : 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{test.name}</h3>
                <Badge text={test.status === 'running' ? 'Running' : 'Completed'} color={test.status === 'running' ? '#0071e3' : '#34c759'} bg={test.status === 'running' ? 'rgba(0,113,227,0.08)' : 'rgba(52,199,89,0.08)'} />
              </div>
              <div style={{ fontSize: 12, color: '#86868b' }}>Started {test.startDate} \u00B7 {test.visitors.toLocaleString()} visitors</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#86868b' }}>Confidence</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: test.confidence >= 95 ? '#34c759' : '#ff9500' }}>{test.confidence}%</div>
            </div>
          </div>
          {expanded === ti && test.variants.map((v, vi) => (
            <div key={vi} style={{
              display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.5fr repeat(4, 1fr)', gap: mobile ? 8 : 0,
              padding: '14px 16px', borderRadius: 12, marginBottom: 8, alignItems: 'center',
              background: v.isWinner ? 'rgba(52,199,89,0.04)' : '#fafafa',
              border: v.isWinner ? '1px solid rgba(52,199,89,0.15)' : '1px solid rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</span>
                {v.isWinner && <Badge text="Winner" color="#34c759" bg="rgba(52,199,89,0.08)" />}
              </div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: '#86868b' }}>Visitors</div><div style={{ fontSize: 14, fontWeight: 600 }}>{v.visitors}</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: '#86868b' }}>Conversions</div><div style={{ fontSize: 14, fontWeight: 600 }}>{v.conversions}</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: '#86868b' }}>Rate</div><div style={{ fontSize: 14, fontWeight: 700, color: v.isWinner ? '#34c759' : '#1d1d1f' }}>{v.rate}%</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: '#86868b' }}>Revenue</div><div style={{ fontSize: 14, fontWeight: 600 }}>{v.revenue}</div></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ============ PRICING ============
function PricingView({ mobile }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h2 style={{ fontSize: mobile ? 28 : 36, fontWeight: 700, margin: '0 0 8px' }}>Simple, transparent pricing</h2>
        <p style={{ fontSize: 15, color: '#86868b' }}>Start free. Scale as you grow.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
        {pricing.map((plan, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 20, padding: mobile ? 24 : 32,
            border: plan.popular ? '2px solid #0071e3' : '1px solid rgba(0,0,0,0.06)',
            position: 'relative', display: 'flex', flexDirection: 'column',
          }}>
            {plan.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#0071e3', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 16px', borderRadius: 980 }}>Most Popular</div>}
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
            <p style={{ fontSize: 13, color: '#86868b', margin: '0 0 20px' }}>{plan.desc}</p>
            <div style={{ marginBottom: 24 }}>
              {plan.price ? <span style={{ fontSize: 42, fontWeight: 700 }}>${plan.price}<span style={{ fontSize: 16, fontWeight: 500, color: '#86868b' }}>{plan.period}</span></span> : <span style={{ fontSize: 28, fontWeight: 700 }}>Custom</span>}
            </div>
            <button style={{
              width: '100%', padding: 14, borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 24,
              background: plan.popular ? '#0071e3' : '#f5f5f7', color: plan.popular ? '#fff' : '#1d1d1f',
            }}>{plan.cta}</button>
            <div style={{ flex: 1 }}>
              {plan.features.map((f, fi) => (
                <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: 13, color: '#6e6e73' }}>
                  <span style={{ color: '#34c759', fontWeight: 600 }}>{'\u2713'}</span>{f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ VISITOR DETAIL ============
function VisitorDetail({ selected, tab, setTab, mobile }) {
  const riskStyle = s => s >= 80 ? { color:'#ff3b30', bg:'rgba(255,59,48,0.08)', label:'Critical' } : s >= 50 ? { color:'#ff9500', bg:'rgba(255,149,0,0.08)', label:'At risk' } : { color:'#34c759', bg:'rgba(52,199,89,0.08)', label:'Low risk' }
  const r = riskStyle(selected.risk)
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', padding: mobile ? 16 : 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: mobile ? 18 : 22, fontWeight: 700, margin: 0 }}>{selected.id}</h3>
            <Badge text={r.label} color={r.color} bg={r.bg} />
          </div>
          <p style={{ fontSize: 13, color: '#86868b', margin: 0 }}><strong style={{ color: '#1d1d1f' }}>{selected.product}</strong> \u00B7 {selected.time}</p>
        </div>
        <RiskCircle score={selected.risk} size={mobile ? 48 : 56} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
        {[{label:'Device',value:selected.device},{label:'Source',value:selected.source},{label:'Location',value:selected.location},{label:'Sessions',value:selected.sessions+(selected.sessions===1?' (new)':'')}].map((m,i) => (
          <div key={i} style={{ padding: '8px 10px', background: '#f5f5f7', borderRadius: 8 }}><div style={{ fontSize: 10, color: '#86868b' }}>{m.label}</div><div style={{ fontSize: 12, fontWeight: 600 }}>{m.value}</div></div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        {[{key:'signals',label:'Signals',count:signals.length},{key:'interventions',label:'Actions',count:interventions.filter(i=>i.status==='active').length},{key:'journey',label:'Journey',count:journey.length}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 14px', border: 'none', background: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', color: tab === t.key ? '#0071e3' : '#86868b', borderBottom: tab === t.key ? '2px solid #0071e3' : '2px solid transparent' }}>{t.label}</button>
        ))}
      </div>
      {tab === 'signals' && signals.map((s,i) => (
        <div key={i} style={{ padding: mobile?12:14, borderRadius: 10, marginBottom: 8, background: s.severity==='critical'?'rgba(255,59,48,0.04)':s.severity==='high'?'rgba(255,149,0,0.04)':'#fafafa', border: `1px solid ${s.severity==='critical'?'rgba(255,59,48,0.1)':s.severity==='high'?'rgba(255,149,0,0.1)':'rgba(0,0,0,0.04)'}` }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</span><span style={{ fontSize: 10, color: '#86868b' }}>{s.time}</span></div>
              <p style={{ fontSize: 12, color: '#6e6e73', margin: '0 0 6px', lineHeight: 1.4 }}>{s.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>{s.dataPoints.map((d,j)=><DataTag key={j} text={d}/>)}</div>
              <Badge text={s.blocker} color="#af52de" bg="rgba(175,82,222,0.08)" />
            </div>
          </div>
        </div>
      ))}
      {tab === 'interventions' && interventions.map((intv,i) => (
        <div key={i} style={{ padding: mobile?12:16, borderRadius: 10, background: '#fafafa', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${intv.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: intv.color }}>AI</div>
              <div><span style={{ fontSize: 13, fontWeight: 700 }}>{intv.blocker}</span><div style={{ marginTop: 2 }}><Badge text={intv.status==='active'?'\u25CF Active':'\u25CB Ready'} color={intv.status==='active'?'#34c759':'#ff9500'} bg={intv.status==='active'?'rgba(52,199,89,0.08)':'rgba(255,149,0,0.08)'}/></div></div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#34c759' }}>{intv.impact}</div>
          </div>
          <p style={{ fontSize: 12, color: '#6e6e73', margin: '0 0 6px' }}>{intv.action}</p>
          <div style={{ padding: '4px 8px', borderRadius: 4, background: '#fff', border: '1px solid rgba(0,0,0,0.04)', fontFamily: 'monospace', fontSize: 10, color: '#86868b' }}>{intv.logic}</div>
        </div>
      ))}
      {tab === 'journey' && (
        <div style={{ paddingLeft: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 2, background: '#f0f0f0' }} />
          {journey.map((step,i) => {
            const dotC = ({critical:'#ff3b30',warning:'#ff9500',ai:'#af52de',success:'#34c759',active:'#0071e3',neutral:'#d2d2d7'}[step.type]||'#d2d2d7')
            return <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, position: 'relative' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginLeft: -9, zIndex: 1, background: dotC, border: '2px solid #fff' }} />
              <div><span style={{ fontSize: 10, color: '#86868b', fontWeight: 600 }}>{step.time}</span><p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 1px', color: step.type==='ai'?'#af52de':step.type==='critical'?'#ff3b30':step.type==='success'?'#34c759':'#1d1d1f' }}>{step.event}</p><p style={{ fontSize: 11, color: '#86868b', margin: 0 }}>{step.detail}</p></div>
            </div>
          })}
        </div>
      )}
    </div>
  )
}

// ============ MAIN DASHBOARD ============
export default function Dashboard({ onSwitchView }) {
  const mobile = useIsMobile()
  const [selected, setSelected] = useState(visitors[1])
  const [tab, setTab] = useState('signals')
  const [loaded, setLoaded] = useState(false)
  const [expandedStep, setExpandedStep] = useState(null)
  const [liveRevenue, setLiveRevenue] = useState(4280)
  const [activeSection, setActiveSection] = useState('overview')
  const [notifications, setNotifications] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [visitorDetailOpen, setVisitorDetailOpen] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100)
    const ri = setInterval(() => setLiveRevenue(p => p+Math.floor(Math.random()*15)+5), 4000)
    const ni = setInterval(() => {
      const ns = ['V-4826 hesitation \u2014 Price (84%)','Intervention: discount \u2192 V-4827','V-4819 converted via chatbot','3 tab switches \u2192 V-4828','V-4830 cart abandoned']
      setNotifications(p => [{text:ns[Math.floor(Math.random()*ns.length)],time:'Just now',id:Date.now()},...p].slice(0,8))
    }, 5000)
    return () => { clearInterval(ri); clearInterval(ni) }
  }, [])

  const riskStyle = s => s>=80?{color:'#ff3b30',bg:'rgba(255,59,48,0.08)',label:'Critical'}:s>=50?{color:'#ff9500',bg:'rgba(255,149,0,0.08)',label:'At risk'}:{color:'#34c759',bg:'rgba(52,199,89,0.08)',label:'Low risk'}
  const navigateTo = k => { setActiveSection(k); setMobileMenuOpen(false); setVisitorDetailOpen(false) }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-10px) } to { opacity:1; transform:translateX(0) } }
      `}</style>

      {/* SIDEBAR */}
      {!mobile && (
        <aside style={{ width: 220, background: '#fff', borderRight: '1px solid rgba(0,0,0,0.06)', padding: '20px 0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
          <div style={{ padding: '0 20px', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>H</div>
              <span style={{ fontSize: 16, fontWeight: 700 }}>HesitationAI</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759' }}/><span style={{ fontSize: 11, color: '#34c759', fontWeight: 600 }}>System live</span></div>
          </div>
          <div style={{ padding: '0 10px', flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '0 10px', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dashboard</div>
            {sidebarItems.map(item => (
              <div key={item.key} onClick={() => navigateTo(item.key)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 2,
                background: activeSection===item.key ? 'rgba(0,113,227,0.08)' : 'transparent',
                color: activeSection===item.key ? '#0071e3' : '#6e6e73', fontWeight: activeSection===item.key ? 600 : 500, fontSize: 14,
              }}><span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}</div>
            ))}
            <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '16px 10px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live feed</div>
            <div style={{ maxHeight: 180, overflow: 'hidden' }}>
              {notifications.map(n => <div key={n.id} style={{ padding: '6px 12px', fontSize: 11, color: '#6e6e73', lineHeight: 1.4, borderLeft: '2px solid #0071e3', marginBottom: 4, marginLeft: 10, animation: 'slideIn 0.3s ease' }}>{n.text}</div>)}
            </div>
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <button onClick={onSwitchView} style={{ width: '100%', background: '#f5f5f7', color: '#1d1d1f', border: 'none', padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{'\u2190'} View Store</button>
          </div>
        </aside>
      )}

      {/* MOBILE NAV */}
      {mobile && (
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.72)', backdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>H</div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>HesitationAI</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onSwitchView} style={{ background: '#f5f5f7', border: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Store</button>
            <div onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>{mobileMenuOpen ? '\u2715' : '\u2630'}</div>
          </div>
        </nav>
      )}
      {mobile && mobileMenuOpen && (
        <div style={{ position: 'fixed', top: 54, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 90, padding: 16 }}>
          {sidebarItems.map(item => (
            <div key={item.key} onClick={() => navigateTo(item.key)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, cursor: 'pointer', marginBottom: 4,
              background: activeSection===item.key ? 'rgba(0,113,227,0.08)' : 'transparent',
              color: activeSection===item.key ? '#0071e3' : '#1d1d1f', fontWeight: 600, fontSize: 16,
            }}><span style={{ fontSize: 20 }}>{item.icon}</span>{item.label}</div>
          ))}
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: mobile ? 0 : 220, flex: 1, padding: mobile ? '70px 16px 24px' : '24px 32px', maxWidth: mobile ? '100%' : 1020 }}>
        {activeSection === 'overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: 20 }}><h2 style={{ fontSize: mobile?24:28, fontWeight: 700, margin: '0 0 4px' }}>Overview</h2><p style={{ fontSize: 13, color: '#86868b' }}>Real-time hesitation detection & AI metrics</p></div>
            <div style={{ display: 'grid', gridTemplateColumns: mobile?'repeat(2,1fr)':'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {[{label:'Live visitors',value:'847',sub:'\u2191 12%',subColor:'#34c759'},{label:'Hesitating',value:'23',sub:'3 new',subColor:'#ff9500'},{label:'Interventions',value:'156',sub:'89% accuracy',subColor:'#0071e3'},{label:'Recovered',value:`$${liveRevenue.toLocaleString()}`,sub:'\u2191 34%',subColor:'#34c759'}].map((m,i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: mobile?16:'20px 22px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 12, color: '#86868b', marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: mobile?22:28, fontWeight: 700, marginBottom: 2, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
                  <span style={{ fontSize: 11, color: m.subColor, fontWeight: 600 }}>{m.sub}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: mobile?'1fr':'1.5fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: mobile?16:24, border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Conversion \u2014 AI impact</h3>
                <ConversionChart mobile={mobile} />
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: mobile?16:24, border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Blocker breakdown</h3>
                {conversionData.blockerBreakdown.map((b,i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 600 }}>{b.blocker}</span><span style={{ fontSize: 11, color: '#86868b' }}>{b.pct}%</span></div>
                    <MiniBar value={b.pct} max={40} color={b.color} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: mobile?16:24, border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Recent AI conversions</h3>
              {conversionData.recentConversions.map((c,i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{c.id}</span><span style={{ fontSize: 12, color: '#6e6e73' }}>{c.product}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 13, fontWeight: 600, color: '#34c759' }}>{c.value}</span><span style={{ fontSize: 11, color: '#86868b' }}>{c.time}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'visitors' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: 20 }}><h2 style={{ fontSize: mobile?24:28, fontWeight: 700, margin: '0 0 4px' }}>Live visitors</h2><p style={{ fontSize: 13, color: '#86868b' }}>Tap to see hesitation profile</p></div>
            {mobile ? (
              !visitorDetailOpen ? visitors.map(v => {const r=riskStyle(v.risk);return(
                <div key={v.id} onClick={()=>{setSelected(v);setVisitorDetailOpen(true);setTab('signals')}} style={{background:'#fff',borderRadius:14,padding:'14px 16px',marginBottom:10,border:'1px solid rgba(0,0,0,0.06)',cursor:'pointer'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:15,fontWeight:600}}>{v.id}</span><Badge text={r.label} color={r.color} bg={r.bg}/></div>
                  <div style={{fontSize:12,color:'#86868b'}}>{v.product} \u00B7 {v.time}</div>
                  {v.blocker&&<div style={{marginTop:6}}><Badge text={v.blocker} color="#ff9500" bg="rgba(255,149,0,0.08)"/></div>}
                </div>)}) : (<div><button onClick={()=>setVisitorDetailOpen(false)} style={{background:'#f5f5f7',border:'none',padding:'8px 16px',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:16}}>{'\u2190'} Back</button><VisitorDetail selected={selected} tab={tab} setTab={setTab} mobile={mobile}/></div>)
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  {visitors.map(v => {const r=riskStyle(v.risk);const isSel=selected?.id===v.id;return(
                    <div key={v.id} onClick={()=>{setSelected(v);setTab('signals')}} style={{padding:'14px 20px',borderBottom:'1px solid rgba(0,0,0,0.04)',cursor:'pointer',background:isSel?'rgba(0,113,227,0.04)':'transparent',borderLeft:isSel?'3px solid #0071e3':'3px solid transparent'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:14,fontWeight:600}}>{v.id}</span><Badge text={r.label} color={r.color} bg={r.bg}/></div>
                      <div style={{fontSize:12,color:'#86868b'}}>{v.product} \u00B7 {v.time}</div>
                      {v.blocker&&<div style={{marginTop:6}}><Badge text={v.blocker} color="#ff9500" bg="rgba(255,149,0,0.08)"/></div>}
                    </div>)})}
                </div>
                {selected && <VisitorDetail selected={selected} tab={tab} setTab={setTab} mobile={mobile}/>}
              </div>
            )}
          </div>
        )}

        {activeSection === 'conversions' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: 20 }}><h2 style={{ fontSize: mobile?24:28, fontWeight: 700, margin: '0 0 4px' }}>Conversions</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: mobile?'1fr':'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
              {[{label:'Baseline',value:'2.3%',color:'#86868b'},{label:'AI-enhanced',value:'7.1%',color:'#0071e3'},{label:'Improvement',value:'+209%',color:'#34c759'}].map((m,i) => (
                <div key={i} style={{background:'#fff',borderRadius:14,padding:'18px 20px',border:'1px solid rgba(0,0,0,0.06)'}}><div style={{fontSize:12,color:'#86868b',marginBottom:6}}>{m.label}</div><div style={{fontSize:28,fontWeight:700,color:m.color}}>{m.value}</div></div>
              ))}
            </div>
            <div style={{background:'#fff',borderRadius:14,padding:mobile?16:24,border:'1px solid rgba(0,0,0,0.06)',marginBottom:20}}>
              <h3 style={{fontSize:15,fontWeight:700,margin:'0 0 12px'}}>Rate over time</h3>
              <ConversionChart mobile={mobile}/>
            </div>
            <div style={{background:'#fff',borderRadius:14,padding:mobile?16:24,border:'1px solid rgba(0,0,0,0.06)'}}>
              <h3 style={{fontSize:15,fontWeight:700,margin:'0 0 16px'}}>Recovery by blocker</h3>
              {conversionData.blockerBreakdown.map((b,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:mobile?10:16,marginBottom:16}}>
                  <div style={{width:mobile?90:140,fontSize:12,fontWeight:600,flexShrink:0}}>{b.blocker}</div>
                  <div style={{flex:1}}><MiniBar value={b.recovered} max={35} color={b.color}/></div>
                  <span style={{fontSize:14,fontWeight:700,color:b.color,width:50,textAlign:'right'}}>+{b.recovered}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'heatmap' && <SessionReplayView mobile={mobile} />}
        {activeSection === 'abtests' && <ABTestView mobile={mobile} />}

        {activeSection === 'cookies' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: 20 }}><h2 style={{ fontSize: mobile?24:28, fontWeight: 700, margin: '0 0 4px' }}>Cookie data</h2></div>
            {['AI Tracking','AI Engine','Essential','Analytics','Marketing'].map(cat => {
              const items=cookieData.filter(c=>c.category===cat)
              const col={'AI Tracking':'#0071e3','AI Engine':'#af52de','Essential':'#34c759','Analytics':'#ff9500','Marketing':'#ff3b30'}[cat]
              return <div key={cat} style={{marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><Badge text={cat} color={col} bg={`${col}12`}/><span style={{fontSize:11,color:'#86868b'}}>{items.length}</span></div>
                <div style={{background:'#fff',borderRadius:14,border:'1px solid rgba(0,0,0,0.06)',overflow:'hidden'}}>
                  {items.map((c,i) => (
                    <div key={i} style={{padding:'12px 16px',borderBottom:i<items.length-1?'1px solid rgba(0,0,0,0.04)':'none'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,fontWeight:600,fontFamily:'monospace'}}>{c.name}</span><span style={{fontSize:10,color:'#86868b'}}>{c.expires}</span></div>
                      <div style={{fontSize:11,color:col,fontFamily:'monospace',marginBottom:2}}>{c.value}</div>
                      <div style={{fontSize:11,color:'#86868b'}}>{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            })}
          </div>
        )}

        {activeSection === 'engine' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: 20 }}><h2 style={{ fontSize: mobile?24:28, fontWeight: 700, margin: '0 0 4px' }}>AI engine</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: mobile?'1fr':'repeat(2,1fr)', gap: 14 }}>
              {aiPipeline.map(s => {
                const isExp=expandedStep===s.step
                return <div key={s.step} onClick={()=>setExpandedStep(isExp?null:s.step)} style={{background:'#fff',borderRadius:14,padding:mobile?18:24,border:isExp?`2px solid ${s.color}`:'1px solid rgba(0,0,0,0.06)',cursor:'pointer'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:10,background:s.color,color:'#fff',fontSize:16,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.step}</div>
                    <div><div style={{fontSize:16,fontWeight:700,color:s.color}}>{s.title}</div><div style={{fontSize:12,color:'#86868b'}}>{s.desc}</div></div>
                  </div>
                  {isExp&&<div style={{borderTop:`1px solid ${s.color}20`,paddingTop:12}}>{s.details.map((d,j)=><div key={j} style={{fontSize:12,color:'#6e6e73',lineHeight:1.5,padding:'3px 0',display:'flex',gap:6}}><span style={{color:s.color}}>{'\u203A'}</span>{d}</div>)}</div>}
                </div>
              })}
            </div>
          </div>
        )}

        {activeSection === 'pricing' && <PricingView mobile={mobile} />}
      </main>
    </div>
  )
}
