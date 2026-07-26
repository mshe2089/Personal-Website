import Callout from '../../Components/Common/Callout';
import PageTemplate from '../../Components/Common/PageTemplate';
import { usePalworldStatus } from '../../hooks/usePalworldStatus';

const formatUptime = (seconds) => {
  if (!Number.isFinite(seconds)) return '—';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return [
    days > 0 ? `${days}d` : null,
    hours > 0 ? `${hours}h` : null,
    `${minutes}m`,
  ].filter(Boolean).join(' ');
};

const formatMemory = (bytes) => (
  Number.isFinite(bytes) ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : '—'
);

function Metric({ label, value, detail }) {
  return (
    <div className="border-t border-default py-sm">
      <div className="text-xs text-secondary">{label}</div>
      <div className="mt-2xs text-lg font-semibold text-primary">{value ?? '—'}</div>
      {detail && <div className="mt-2xs text-xs text-secondary">{detail}</div>}
    </div>
  );
}

function Palworld() {
  const { status, isConnected, error } = usePalworldStatus();
  const metrics = status?.metrics;
  const resources = status?.resources;
  const info = status?.info;
  const online = status?.online === true;

  return (
    <PageTemplate
      title="Palworld server"
      date="Live"
      tag="Realtime status for TTLIVE Revenue"
    >
      {error && (
        <div className="mb-xl">
          <Callout emoji="⚠️" variant="note">{error}</Callout>
        </div>
      )}

      <section className="mb-2xl">
        <div className="flex flex-wrap items-center justify-between gap-md">
          <div className="flex items-center gap-sm">
            <span
              className={`h-3 w-3 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`}
              aria-hidden="true"
            />
            <h2 className="article-subtitle m-0">
              {online ? 'Online' : status ? 'Offline' : 'Checking…'}
            </h2>
          </div>
          <span className="text-xs text-secondary">
            {isConnected ? 'live updates' : 'connecting'}
          </span>
        </div>

        <p className="mt-sm text-sm text-secondary">
          {info?.name ?? 'TTLIVE Revenue'}
          {info?.version ? ` · ${info.version}` : ''}
        </p>
      </section>

      <section className="mb-2xl">
        <h2 className="article-subtitle">Server load</h2>
        <div className="grid grid-cols-2 gap-x-xl md:grid-cols-3">
          <Metric
            label="CPU"
            value={
              Number.isFinite(resources?.cpu_percent)
                ? `${resources.cpu_percent.toFixed(1)}%`
                : null
            }
          />
          <Metric label="Memory" value={formatMemory(resources?.memory_bytes)} />
          <Metric label="Server FPS" value={metrics?.server_fps} />
          <Metric
            label="Frame time"
            value={
              metrics?.frame_time_ms != null
                ? `${metrics.frame_time_ms.toFixed(2)} ms`
                : null
            }
          />
          <Metric
            label="Players"
            value={metrics ? `${metrics.players} / ${metrics.max_players}` : null}
          />
          <Metric label="Uptime" value={formatUptime(metrics?.uptime_seconds)} />
        </div>
      </section>

      <section className="mb-2xl">
        <h2 className="article-subtitle">World</h2>
        <div className="grid grid-cols-2 gap-x-xl">
          <Metric label="In-game day" value={metrics?.days} />
          <Metric label="Base camps" value={metrics?.base_count} />
        </div>
      </section>

      <section className="mb-2xl">
        <h2 className="article-subtitle">Connection</h2>
        <div>
          <Metric
            label="Address"
            value={`${status?.hostname ?? 'pal.muqing.dev'}:8211`}
          />
        </div>
        <p className="mt-sm text-xs text-secondary">
          Last checked{' '}
          {status?.checked_at ? new Date(status.checked_at).toLocaleString() : '—'}
        </p>
      </section>
    </PageTemplate>
  );
}

export default Palworld;
