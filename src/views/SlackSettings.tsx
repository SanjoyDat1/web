import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useSearchParams } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'
import { useAuthStore } from '../store/authStore'
import { slackApi, type SlackChannelDTO, type SlackWorkspaceDTO } from '../lib/api/endpoints'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function SlackSettings() {
  const user = useAuthStore((s) => s.user)
  const [params] = useSearchParams()
  const status = params.get('status')
  const reason = params.get('reason')

  const [workspaces, setWorkspaces] = useState<SlackWorkspaceDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channelsByWs, setChannelsByWs] = useState<Record<string, SlackChannelDTO[]>>({})
  const [loadingChannels, setLoadingChannels] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    slackApi
      .listWorkspaces()
      .then((rows) => {
        if (cancelled) return
        setWorkspaces(rows)
      })
      .catch(() => {
        if (cancelled) return
        setError("Couldn't load Slack workspaces.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    workspaces.forEach((ws) => {
      if (channelsByWs[ws.id] !== undefined) return
      setLoadingChannels((m) => ({ ...m, [ws.id]: true }))
      slackApi
        .listChannels(ws.id)
        .then((rows) => setChannelsByWs((m) => ({ ...m, [ws.id]: rows })))
        .catch(() => setChannelsByWs((m) => ({ ...m, [ws.id]: [] })))
        .finally(() => setLoadingChannels((m) => ({ ...m, [ws.id]: false })))
    })
  }, [workspaces, channelsByWs])

  if (user && user.role !== 'admin') {
    return <Navigate to="/brain/company" replace />
  }

  async function toggleSubscription(wsId: string, channel: SlackChannelDTO, enabled: boolean) {
    const prev = channelsByWs[wsId] ?? []
    setChannelsByWs((m) => ({
      ...m,
      [wsId]: prev.map((c) => (c.id === channel.id ? { ...c, is_subscribed: enabled } : c)),
    }))
    try {
      await slackApi.setSubscription(wsId, channel.id, enabled, channel.name)
    } catch {
      setChannelsByWs((m) => ({ ...m, [wsId]: prev }))
      setError("Couldn't update channel subscription.")
    }
  }

  async function disconnect(wsId: string) {
    if (!window.confirm('Disconnect this Slack workspace? Channel subscriptions will be removed.')) return
    try {
      await slackApi.disconnect(wsId)
      setWorkspaces((rows) => rows.filter((r) => r.id !== wsId))
    } catch {
      setError("Couldn't disconnect workspace.")
    }
  }

  function startInstall() {
    window.location.href = `${API_BASE}/api/v1/slack/install`
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-screen">
      <TopBar title="Slack" subtitle="Manage integration" />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl space-y-4">
          {status === 'ok' && (
            <div className="px-4 py-3 rounded-xl border border-mist bg-paper text-[12.5px] text-graphite">
              Slack workspace connected.
            </div>
          )}
          {status === 'error' && (
            <div className="px-4 py-3 rounded-xl border border-mist bg-paper text-[12.5px] text-ink">
              Connect failed{reason ? `: ${reason}` : '.'}
            </div>
          )}

          {loading && <p className="text-[13px] text-stone">Loading…</p>}

          {!loading && error && (
            <p className="text-[13px] text-ink">{error}</p>
          )}

          {!loading && workspaces.length === 0 && (
            <div className="px-6 py-8 rounded-xl border border-mist bg-paper text-center">
              <p className="text-[13px] text-graphite">Connect Slack to feed the brain from Slack threads.</p>
              <p className="text-[12px] text-stone mt-2">
                Once connected, your team can use <code className="text-ink">/brain &lt;question&gt;</code> in any channel.
              </p>
              <button
                type="button"
                onClick={startInstall}
                className="mt-5 px-4 py-2 rounded-xl bg-ink text-white text-[12px] uppercase tracking-[0.16em] hover:opacity-90 transition-opacity"
              >
                Add to Slack
              </button>
            </div>
          )}

          {workspaces.map((ws) => {
            const channels = channelsByWs[ws.id] ?? []
            const isLoading = loadingChannels[ws.id]
            return (
              <section key={ws.id} className="px-5 py-4 rounded-xl border border-mist bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{ws.slack_team_name}</p>
                    <p className="text-[10.5px] text-stone mt-0.5">
                      Installed {new Date(ws.installed_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => disconnect(ws.id)}
                    className="text-[10.5px] uppercase tracking-[0.16em] text-stone hover:text-ink transition-colors"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-[10.5px] uppercase tracking-[0.16em] text-stone mb-2">
                    Channels feeding the brain
                  </p>
                  {isLoading && <p className="text-[12px] text-stone">Loading channels…</p>}
                  {!isLoading && channels.length === 0 && (
                    <p className="text-[12px] text-stone">No channels visible. Invite the Penlo bot to channels first.</p>
                  )}
                  {!isLoading && channels.length > 0 && (
                    <ul className="space-y-1">
                      {channels.map((c) => (
                        <li key={c.id} className="flex items-center justify-between">
                          <span className="text-[12.5px] text-ink">#{c.name}</span>
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={c.is_subscribed}
                              onChange={(e) => toggleSubscription(ws.id, c, e.target.checked)}
                              className="accent-ink"
                            />
                            <span className="text-[11px] text-stone">
                              {c.is_subscribed ? 'Subscribed' : 'Off'}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p className="mt-4 text-[10.5px] text-stone">
                  Slash command results show public nodes only; team-private nodes are excluded.
                </p>
              </section>
            )
          })}

          {!loading && workspaces.length > 0 && (
            <button
              type="button"
              onClick={startInstall}
              className="text-[11px] uppercase tracking-[0.16em] text-stone hover:text-ink transition-colors"
            >
              + Connect another workspace
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
