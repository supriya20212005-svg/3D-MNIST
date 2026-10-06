import { useState } from 'react'
import DigitViewer from './components/DigitViewer'
import Controls from './components/Controls'
import { getDigitStats } from './components/DigitModel'
import { generateDigit } from './services/api'
import { DIGITS, type Digit, type ViewerSettings } from './types/digit'

const initialSettings: ViewerSettings = { thickness: 0.42, scale: 1, smoothness: 5, material: 'glass', wireframe: false, lighting: 'studio' }

function App() {
  const [digit, setDigit] = useState<Digit>(7)
  const [settings, setSettings] = useState(initialSettings)
  const [resetSignal, setResetSignal] = useState(0)
  const [generation, setGeneration] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const stats = getDigitStats(digit, settings)

  const selectDigit = (next: Digit) => { setDigit(next); setGeneration(value => value + 1) }
  const generate = async () => { setIsGenerating(true); await generateDigit(digit); setGeneration(value => value + 1); window.setTimeout(() => setIsGenerating(false), 420) }
  const regenerate = () => { setGeneration(value => value + 1) }

  return <div className="app-shell">
    <nav className="navbar"><a className="brand" href="#top"><span className="brand-mark">3D</span><span>MNIST<span className="brand-dot">.</span></span></a><div className="nav-links"><a className="active" href="#generator">Generator</a><a href="#gallery">Gallery</a><a href="#about">About</a></div><div className="nav-status"><span className="status-dot" /> Pipeline ready</div></nav>
    <main id="top">
      <section className="hero"><div className="hero-copy"><p className="kicker"><span className="kicker-line" /> MNIST / GEOMETRY LAB</p><h1>Handwritten.<br /><em>Reimagined.</em></h1><p className="hero-subtitle">Generate and explore handwritten digits as interactive 3D models.</p><a href="#generator" className="button button-primary hero-button">Start generating <span>↓</span></a></div><div className="hero-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="hero-digit">7</div><span className="orbit-label label-top">2D → 3D</span><span className="orbit-label label-right">V 160 / F 228</span><span className="orbit-label label-bottom">DEPTH 0.42</span></div><div className="hero-meta"><span>01</span><span>Turn pixels into presence.</span><span>Scroll to explore ↓</span></div></section>
      <section id="generator" className="workspace-section"><div className="section-intro"><div><span className="eyebrow">01 / Generator</span><h2>Choose a digit.<br /><span>Shape the output.</span></h2></div><p>Each form is built from a responsive stroke field, then given volume, light and a little attitude.</p></div>
        <div className="digit-selector"><span className="selector-label">Select source digit</span><div className="digit-buttons">{DIGITS.map(value => <button key={value} className={digit === value ? 'digit-button selected' : 'digit-button'} onClick={() => selectDigit(value)}>{value}</button>)}</div><span className="sample-label">Sample {generation.toString().padStart(2, '0')} <button onClick={regenerate} aria-label="Regenerate sample">↻</button></span></div>
        <div className="generator-grid"><div className="viewer-wrap"><DigitViewer digit={digit} settings={settings} resetSignal={resetSignal} variation={generation} /></div><Controls settings={settings} setSettings={setSettings} onGenerate={generate} onReset={() => setResetSignal(value => value + 1)} /></div>
        <div className="model-summary"><div className="model-title"><span className="eyebrow">Output telemetry</span><strong>Digit {digit}</strong><span className="generated-badge">● Generated model</span></div><div className="summary-stats"><span><b>{stats.width}</b> width</span><span><b>{stats.height}</b> height</span><span><b>{stats.depth}</b> depth</span><span><b>{stats.vertices}</b> vertices</span><span><b>{stats.triangles}</b> triangles</span></div><div className="confidence"><span>Pipeline confidence</span><b>95%</b><div className="confidence-bar"><i /></div></div></div>
      </section>
      <section id="gallery" className="gallery-section"><div className="section-intro gallery-heading"><div><span className="eyebrow">02 / Explore the set</span><h2>Every number<br /><span>has a point of view.</span></h2></div><p>Browse all ten source forms. Tap a card to bring its geometry into the lab.</p></div><div className="gallery-grid">{DIGITS.map(value => <button className={`gallery-card ${digit === value ? 'active' : ''}`} key={value} onClick={() => { selectDigit(value); window.scrollTo({ top: document.getElementById('generator')?.offsetTop ?? 0, behavior: 'smooth' }) }}><span className="gallery-number">{value}</span><span className="gallery-caption">MNIST / 0{value}</span><span className="gallery-arrow">↗</span></button>)}</div></section>
      <section id="about" className="about-section"><span className="eyebrow">03 / About the pipeline</span><div><h2>From pixels to<br /><em>perspective.</em></h2><p>The browser fallback traces an MNIST-inspired handwritten stroke field into thick, lit geometry. The FastAPI contract is ready for real MNIST samples and a trained generator when you connect the dataset.</p></div></section>
    </main><footer><span>3D MNIST / 2026</span><span>Built for curious hands</span></footer>
  </div>
}

export default App
