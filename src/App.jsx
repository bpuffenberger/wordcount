import React, { useMemo, useState } from 'react'

const SAMPLE_TEXT = `Paste or type text here.

This React version gives you a live word count and lets you exclude words you choose. For example, if the word hotel appears four times and you exclude hotel, those four instances are removed from the adjusted count. You can also choose to exclude numbers like 2026 or 123 automatically.`

function tokenize(text) {
  return text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []
}

function isNumberToken(token) {
  return /^\d+(?:[.,]\d+)?$/.test(token)
}

function normalize(token) {
  return token.toLowerCase()
}

function buildFrequency(tokens) {
  const map = new Map()
  for (const token of tokens) {
    map.set(token, (map.get(token) || 0) + 1)
  }
  return [...map.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="card stat-card">
      <div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
      <div className="stat-icon" aria-hidden="true">{icon}</div>
    </div>
  )
}

export default function App() {
  const [text, setText] = useState('')
  const [excludeNumbers, setExcludeNumbers] = useState(false)
  const [manualWord, setManualWord] = useState('')
  const [excludedWords, setExcludedWords] = useState([])
  const [status, setStatus] = useState('')

  const excludedSet = useMemo(() => new Set(excludedWords), [excludedWords])

  const analysis = useMemo(() => {
    const rawTokens = tokenize(text)
    const normalizedRaw = rawTokens.map(normalize)
    const consideredTokens = normalizedRaw.filter((t) => !(excludeNumbers && isNumberToken(t)))
    const countedTokens = consideredTokens.filter((t) => !excludedSet.has(t))

    const sourceFrequency = buildFrequency(consideredTokens)
    const countedFrequency = buildFrequency(countedTokens)

    return {
      rawCount: rawTokens.length,
      consideredCount: consideredTokens.length,
      adjustedCount: countedTokens.length,
      uniqueCount: new Set(countedTokens).size,
      excludedOccurrences: consideredTokens.length - countedTokens.length,
      topSourceWords: sourceFrequency.slice(0, 140),
      topCountedWords: countedFrequency.slice(0, 40),
    }
  }, [text, excludeNumbers, excludedSet])

  function showStatus(message) {
    setStatus(message)
    window.clearTimeout(showStatus.timer)
    showStatus.timer = window.setTimeout(() => setStatus(''), 2600)
  }

  function addExcludedWords(input) {
    const toAdd = tokenize(input).map(normalize).filter(Boolean)
    if (!toAdd.length) return

    setExcludedWords((prev) => {
      const next = new Set(prev)
      toAdd.forEach((word) => next.add(word))
      return [...next].sort((a, b) => a.localeCompare(b))
    })
    setManualWord('')
  }

  function toggleExcludedWord(word) {
    setExcludedWords((prev) => {
      const next = new Set(prev)
      if (next.has(word)) next.delete(word)
      else next.add(word)
      return [...next].sort((a, b) => a.localeCompare(b))
    })
  }

  function removeExcludedWord(word) {
    setExcludedWords((prev) => prev.filter((w) => w !== word))
  }

  async function pasteFromClipboard() {
    try {
      const value = await navigator.clipboard.readText()
      setText((prev) => (prev ? `${prev}\n${value}` : value))
      showStatus('Text pasted from clipboard.')
    } catch (error) {
      showStatus('Clipboard paste failed in this browser. Please paste manually.')
    }
  }

  async function copySummary() {
    const summary = [
      `Raw words/tokens: ${analysis.rawCount}`,
      `Counted after number rule: ${analysis.consideredCount}`,
      `Adjusted count after exclusions: ${analysis.adjustedCount}`,
      `Unique counted words: ${analysis.uniqueCount}`,
      `Excluded occurrences removed: ${analysis.excludedOccurrences}`,
      `Excluded words: ${excludedWords.length ? excludedWords.join(', ') : 'None'}`,
      `Numbers excluded: ${excludeNumbers ? 'Yes' : 'No'}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(summary)
      showStatus('Summary copied to clipboard.')
    } catch (error) {
      showStatus('Clipboard copy failed in this browser. You can still select and copy manually.')
    }
  }

  function clearAll() {
    setText('')
    setExcludedWords([])
    setManualWord('')
    setExcludeNumbers(false)
    showStatus('Cleared.')
  }

  return (
    <div className="app-shell">
      <div className="container">
        <header className="hero">
          <h1>Word Count Exclusion Tool</h1>
          <p className="subtitle">
            A real React + Vite app for GitHub Pages. Paste text, get a live word count,
            optionally exclude number-only tokens, and click words to remove them from the adjusted total.
          </p>
        </header>

        <section className="stats" aria-label="Summary stats">
          <StatCard title="Raw words/tokens" value={analysis.rawCount.toLocaleString()} subtitle="Everything detected in the text" icon="T" />
          <StatCard title="After number rule" value={analysis.consideredCount.toLocaleString()} subtitle={excludeNumbers ? 'Numeric tokens removed' : 'Numbers still included'} icon="#" />
          <StatCard title="Adjusted count" value={analysis.adjustedCount.toLocaleString()} subtitle="Final count after exclusions" icon="F" />
          <StatCard title="Unique counted words" value={analysis.uniqueCount.toLocaleString()} subtitle="Distinct terms still counted" icon="U" />
          <StatCard title="Removed occurrences" value={analysis.excludedOccurrences.toLocaleString()} subtitle="Excluded words removed from total" icon="−" />
        </section>

        <main className="layout">
          <section className="card section">
            <h2>Paste text</h2>
            <div className="toolbar">
              <button className="btn" onClick={pasteFromClipboard} type="button">Paste</button>
              <button className="btn secondary" onClick={() => { setText(SAMPLE_TEXT); showStatus('Sample text loaded.') }} type="button">Load sample</button>
              <button className="btn secondary" onClick={copySummary} type="button">Copy summary</button>
              <button className="btn outline" onClick={clearAll} type="button">Clear all</button>
            </div>

            <textarea
              className="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cut and paste text here..."
            />

            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={excludeNumbers}
                  onChange={(e) => setExcludeNumbers(e.target.checked)}
                />
                Exclude number-only tokens (example: 123, 2026)
              </label>
              <div className="note">Word matching is case-insensitive.</div>
            </div>

            <div className="status" role="status" aria-live="polite">{status}</div>
            <div className="footer-note">Tip: click any word on the right to remove it from the adjusted total. Click it again to add it back.</div>
          </section>

          <div className="stack">
            <section className="card section">
              <h2>Exclude words</h2>
              <div className="input-row">
                <input
                  className="line-input"
                  value={manualWord}
                  onChange={(e) => setManualWord(e.target.value)}
                  placeholder="Type one or more words, then add"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addExcludedWords(manualWord)
                    }
                  }}
                />
                <button className="btn small" onClick={() => addExcludedWords(manualWord)} type="button">Add</button>
              </div>

              <div className="excluded-block">
                <div className="label">Currently excluded</div>
                {excludedWords.length ? (
                  <div className="excluded-wrap">
                    {excludedWords.map((word) => (
                      <button key={word} type="button" className="excluded-chip" onClick={() => removeExcludedWord(word)} title="Click to remove">
                        <span>{word}</span>
                        <span className="xmark">×</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="empty">No excluded words yet. Add them manually or click terms below.</div>
                )}
              </div>
            </section>

            <section className="card section">
              <h2>Click words to exclude/include</h2>
              {analysis.topSourceWords.length ? (
                <div className="chip-wrap">
                  {analysis.topSourceWords.map(({ word, count }) => {
                    const active = excludedSet.has(word)
                    return (
                      <button
                        key={word}
                        type="button"
                        className={`chip${active ? ' active' : ''}`}
                        onClick={() => toggleExcludedWord(word)}
                        title={active ? 'Currently excluded. Click to include again.' : 'Click to exclude this word'}
                      >
                        <span>{word}</span>
                        <span className="chip-count">{count}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="empty">Paste text to see selectable words here.</div>
              )}
            </section>

            <section className="card section">
              <h2>Most frequent counted words</h2>
              {analysis.topCountedWords.length ? (
                <div className="freq-list">
                  {analysis.topCountedWords.map(({ word, count }) => (
                    <div key={word} className="freq-row">
                      <div className="freq-word">{word}</div>
                      <div className="freq-count">{count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">No counted words available yet.</div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
