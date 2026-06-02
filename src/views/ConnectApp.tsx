import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TopBar } from '../components/layout/TopBar'
import { apiKeysApi, type ApiKeyEntry } from '../lib/api/endpoints'

const ENDPOINT_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/v1/ingest/penlo-brain`

export function ConnectApp() {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([])
  const [newKey, setNewKey] = useState<string | null>(null)
  const [label, setLabel] = useState('Penlo App')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiKeysApi.list().then(setKeys).catch(() => setError('Failed to load API keys'))
  }, [])

  async function handleCreate() {
    setCreating(true)
    setError(null)
    try {
      const created = await apiKeysApi.create(label)
      setNewKey(created.key)
      setKeys((prev) => [{ ...created, key_prefix: created.key.slice(0, 16), last_used_at: null }, ...prev])
    } catch {
      setError('Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: string) {
    try {
      await apiKeysApi.revoke(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
      if (newKey && keys.find((k) => k.id === id)) setNewKey(null)
    } catch {
      setError('Failed to revoke key')
    }
  }

  function copy(text: string, tag: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(tag)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <motion.div
      key="connect-app"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-screen"
    >
      <TopBar title="Connect Penlo App" subtitle="Link your iOS device to the Enterprise Brain" />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* Step 1 — Endpoint URL */}
        <Section step="1" title="Copy your endpoint URL">
          <p className="text-[13px] text-stone mb-3">
            Enter this URL (or just the brain base URL, e.g. <span className="font-mono text-[12px]">http://localhost:8000</span>) in the Penlo iOS app under{' '}
            <span className="font-mono text-[12px] text-ink">Settings → Enterprise Brain</span>.
            For the Chrome meeting-capture extension, use the brain <strong>base URL</strong> only — it posts to{' '}
            <span className="font-mono text-[12px]">/api/v1/ingest/standup</span>, not penlo-brain.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-paper border border-mist rounded-lg text-[12px] font-mono text-graphite break-all">
              {ENDPOINT_URL}
            </code>
            <button
              onClick={() => copy(ENDPOINT_URL, 'url')}
              className="shrink-0 px-3 py-2 border border-mist rounded-lg text-[12px] text-stone hover:text-ink hover:border-graphite transition-colors"
            >
              {copied === 'url' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </Section>

        {/* Step 2 — Generate API key */}
        <Section step="2" title="Generate an API key">
          <p className="text-[13px] text-stone mb-3">
            Generate a key and enter it in <span className="font-mono text-[12px] text-ink">Settings → Enterprise → API Key</span>.
            The key is shown only once — copy it before closing.
          </p>

          {newKey && (
            <div className="mb-4 p-4 border border-mist rounded-xl bg-paper animate-reveal">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone mb-2">Your new API key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-white border border-mist rounded-lg text-[12px] font-mono text-ink break-all">
                  {newKey}
                </code>
                <button
                  onClick={() => copy(newKey, 'key')}
                  className="shrink-0 px-3 py-2 bg-ink text-white rounded-lg text-[12px] hover:bg-graphite transition-colors"
                >
                  {copied === 'key' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-stone">This key will not be shown again.</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Key label"
              className="px-3 py-2 border border-mist rounded-lg text-[13px] text-ink placeholder-stone focus:outline-none focus:border-graphite transition-colors w-48"
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-ink text-white rounded-lg text-[13px] font-medium hover:bg-graphite transition-colors disabled:opacity-50"
            >
              {creating ? 'Generating…' : 'Generate key'}
            </button>
          </div>
          {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
        </Section>

        {/* Step 3 — Active keys */}
        <Section step="3" title="Active API keys">
          {keys.length === 0 ? (
            <p className="text-[13px] text-stone">No keys yet. Generate one above.</p>
          ) : (
            <div className="space-y-2">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between px-4 py-3 border border-mist rounded-xl">
                  <div>
                    <p className="text-[13px] text-ink font-medium">{k.label}</p>
                    <p className="text-[11px] font-mono text-stone mt-0.5">{k.key_prefix}…</p>
                    <p className="text-[11px] text-stone mt-0.5">
                      Created {new Date(k.created_at).toLocaleDateString()}
                      {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevoke(k.id)}
                    className="text-[12px] text-stone hover:text-red-600 transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Step 4 — How it works */}
        <Section step="4" title="How it works">
          <ul className="space-y-2 text-[13px] text-stone">
            <li>The Penlo pen captures ambient speech and transcribes it on-device.</li>
            <li>Claude extracts structured facts — who said what, about whom, with what context.</li>
            <li>When you tap <span className="font-mono text-[12px] text-ink">Sync to Enterprise Brain</span> in the app, those facts are pushed here as structured knowledge.</li>
            <li>The Enterprise Brain creates nodes for people, topics, and decisions, and builds edges between related entities.</li>
            <li>Every team member's sync feeds the same shared graph — no context is lost across conversations.</li>
          </ul>
        </Section>

      </div>
    </motion.div>
  )
}

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-6 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center shrink-0">{step}</span>
        <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </div>
  )
}
