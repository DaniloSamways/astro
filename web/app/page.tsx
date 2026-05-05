"use client";

import { useEffect, useState } from "react";

import {
  loadAstroDashboard,
  type HealthResponse,
  type ObjectReport,
  type SatelliteReport,
  type VisibleObjectsReport,
} from "../lib/astro-api";

type DashboardState = {
  city: string;
  objectName: string;
  datetime: string;
};

type StatusTone = "emerald" | "amber" | "rose";

const quickTargets = ["Sol", "Lua", "Júpiter", "Sirius"];

const fallbackState = {
  health: {
    ok: true,
    service: "astro-web",
    status: "standby",
  } satisfies HealthResponse,
  objectReport: null as ObjectReport | null,
  visibleReport: null as VisibleObjectsReport | null,
  satelliteReport: null as SatelliteReport | null,
};

function toDateTimeLocal(value: Date) {
  const shifted = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
}

function toIsoDatetime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDegrees(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${value.toFixed(1)}°`;
}

function formatMagnitude(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return value.toFixed(1);
}

function statusTone(status?: string): StatusTone {
  const normalized = (status ?? "").toLowerCase();
  if (
    normalized.includes("up") ||
    normalized.includes("ok") ||
    normalized.includes("ready")
  ) {
    return "emerald";
  }

  if (normalized.includes("standby") || normalized.includes("idle")) {
    return "amber";
  }

  return "rose";
}

function toneClass(tone: StatusTone) {
  switch (tone) {
    case "emerald":
      return "border-mint/30 bg-mint/10 text-mint";
    case "amber":
      return "border-sun/30 bg-sun/10 text-sun";
    default:
      return "border-rose-400/30 bg-rose-400/10 text-rose-200";
  }
}

export default function Page() {
  const [state, setState] = useState<DashboardState>({
    city: "São Paulo",
    objectName: "Sirius",
    datetime: toDateTimeLocal(new Date()),
  });
  const [health, setHealth] = useState<HealthResponse>(fallbackState.health);
  const [objectReport, setObjectReport] = useState<ObjectReport | null>(null);
  const [visibleReport, setVisibleReport] =
    useState<VisibleObjectsReport | null>(null);
  const [satelliteReport, setSatelliteReport] =
    useState<SatelliteReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  async function refreshDashboard(nextState?: Partial<DashboardState>) {
    const mergedState = { ...state, ...nextState };
    setState(mergedState);
    setLoading(true);
    setError(null);

    try {
      const snapshot = await loadAstroDashboard({
        city: mergedState.city,
        objectName: mergedState.objectName,
        datetime: toIsoDatetime(mergedState.datetime),
      });

      setHealth(snapshot.health);
      setObjectReport(snapshot.objectReport);
      setVisibleReport(snapshot.visibleReport);
      setSatelliteReport(snapshot.satelliteReport);
      setLastSynced(new Date().toISOString());
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Falha ao consultar a API.",
      );
      setHealth(fallbackState.health);
      setObjectReport(fallbackState.objectReport);
      setVisibleReport(fallbackState.visibleReport);
      setSatelliteReport(fallbackState.satelliteReport);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleCount = visibleReport?.objects.length ?? 0;
  const visualPassCount = satelliteReport?.visual_passes.length ?? 0;
  const allPassCount = satelliteReport?.all_passes.length ?? 0;
  const weatherLabel =
    visibleReport?.weather_description ??
    objectReport?.weather.description ??
    "Leitura pendente";
  const altitude = objectReport?.sky_position.altitude;
  const azimuth = objectReport?.sky_position.azimuth;
  const nextVisualPass = satelliteReport?.visual_passes[0];
  const focusObject = objectReport?.object.name ?? state.objectName;
  const status = health.status ?? "standby";

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      <div className="absolute inset-0 cosmic-grid opacity-35" />
      <div className="absolute inset-0 cosmic-noise mix-blend-screen" />

      <div className="absolute -left-36 top-16 h-80 w-80 rounded-full border border-sky/20 blur-3xl animate-float" />
      <div className="absolute right-[-8rem] top-24 h-96 w-96 rounded-full border border-sun/15 blur-3xl animate-drift" />
      <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full border border-mint/20 blur-3xl animate-float" />

      <div className="absolute inset-x-0 top-0 h-px cosmic-divider opacity-70" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl animate-reveal [animation-delay:60ms]">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="cosmic-chip">Astro Control Deck</span>
            </div>
            <h1 className="font-display text-4xl leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Painel orbital para rastrear céu, visibilidade e passagens em
              tempo real.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
              Uma central cósmica com vidro translúcido, leituras ao vivo e foco
              em análise rápida para objetos celestes, objetos visíveis e
              satélites observáveis.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[28rem]">
            <div className="cosmic-panel rounded-3xl px-4 py-3 animate-reveal [animation-delay:200ms]">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                Visíveis
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {visibleCount}
              </p>
              <p className="mt-1 text-xs text-white/52">
                objetos acima do horizonte
              </p>
            </div>
            <div className="cosmic-panel rounded-3xl px-4 py-3 animate-reveal [animation-delay:260ms]">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                Passagens
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {visualPassCount}
              </p>
              <p className="mt-1 text-xs text-white/52">
                janelas com chance visual
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="cosmic-panel-strong rounded-[2rem] p-5 animate-reveal [animation-delay:340ms]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Command panel
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Controle de leitura
                </h2>
              </div>
              <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/[0.04]" />
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/42">
                  Cidade
                </span>
                <input
                  value={state.city}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-sky/40 focus:ring-2 focus:ring-sky/20"
                  placeholder="Curitiba"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/42">
                  Objeto
                </span>
                <input
                  value={state.objectName}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      objectName: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-sky/40 focus:ring-2 focus:ring-sky/20"
                  placeholder="Sirius"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/42">
                  Horário
                </span>
                <input
                  type="datetime-local"
                  value={state.datetime}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      datetime: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky/40 focus:ring-2 focus:ring-sky/20"
                />
              </label>

              <button
                type="button"
                onClick={() => void refreshDashboard()}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky/30 bg-sky/12 px-4 py-3 text-sm font-semibold text-sky transition hover:border-sky/50 hover:bg-sky/18"
              >
                {loading
                  ? "Atualizando leitura..."
                  : "Executar leitura orbital"}
                <span className="transition group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                Atalhos
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickTargets.map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() =>
                      void refreshDashboard({ objectName: target })
                    }
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/78 transition hover:border-sky/30 hover:bg-sky/10 hover:text-white"
                  >
                    {target}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-ink-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                Last sync
              </p>
              <p className="mt-2 text-sm text-white/80">
                {lastSynced
                  ? formatTime(lastSynced)
                  : "Ainda sem sincronização"}
              </p>
              <p className="mt-2 text-xs leading-6 text-white/50">
                {error ??
                  "Proxy Next.js lendo a API Express e normalizando a interface para a navegação."}
              </p>
            </div>
          </aside>

          <div className="grid gap-6">
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-glow backdrop-blur-2xl animate-reveal [animation-delay:420ms]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,240,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,203,107,0.10),transparent_28%)]" />
                <div className="relative flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                        Target lock
                      </p>
                      <h2 className="mt-2 font-display text-3xl tracking-tight text-white sm:text-4xl">
                        {focusObject}
                      </h2>
                      <p className="mt-2 text-sm text-white/58">
                        {objectReport
                          ? `${objectReport.city} · ${formatTime(objectReport.observation_time)}`
                          : "Sem leitura concreta ainda, aguardando resposta do observatório."}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl border px-4 py-3 ${toneClass(statusTone(status))}`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.22em] opacity-70">
                        Estado
                      </p>
                      <p className="mt-1 text-sm font-semibold">{status}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-ink-900/55 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                        Altitude
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {formatDegrees(altitude)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-ink-900/55 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                        Azimute
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {formatDegrees(azimuth)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-ink-900/55 p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">
                        Magnitude
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {formatMagnitude(objectReport?.object.magnitude)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                        Coordenadas
                      </p>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-white/54">RA</dt>
                          <dd className="font-mono text-white">
                            {objectReport?.object.ra ?? "--"}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-white/54">Dec</dt>
                          <dd className="font-mono text-white">
                            {objectReport?.object.dec ?? "--"}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-white/54">Fonte</dt>
                          <dd className="text-white">
                            {objectReport?.object.source ?? "--"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                        Visibilidade
                      </p>
                      <div className="mt-4 space-y-2">
                        {(
                          objectReport?.visibility_messages ?? [
                            "Aguardando resposta da API para exibir as mensagens de visibilidade.",
                          ]
                        ).map((message) => (
                          <div
                            key={message}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/76"
                          >
                            {message}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="cosmic-panel rounded-[2rem] p-6 animate-reveal [animation-delay:500ms]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                      Atmospheric layer
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Clima e contexto
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                    {weatherLabel}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                      Visibilidade geral
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {visibleCount} objetos
                    </p>
                    <p className="mt-2 text-sm text-white/58">
                      {visibleReport
                        ? `${visibleReport.city} · ${formatTime(visibleReport.observation_time)}`
                        : "Sem dados carregados no momento."}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                      Passagens totais
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {allPassCount}
                    </p>
                    <p className="mt-2 text-sm text-white/58">
                      lookahead de {satelliteReport?.lookahead_hours ?? 12}h
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                    Melhor janela visual
                  </p>
                  {nextVisualPass ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {nextVisualPass.name}
                        </p>
                        <p className="mt-1 text-sm text-white/58">
                          Pico às {formatTime(nextVisualPass.peak_time)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                          <p className="text-white/42">Altitude</p>
                          <p className="mt-1 font-semibold text-white">
                            {formatDegrees(nextVisualPass.peak_altitude)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                          <p className="text-white/42">Luz solar</p>
                          <p className="mt-1 font-semibold text-white">
                            {nextVisualPass.sunlit ? "Iluminado" : "Em sombra"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-white/58">
                      Nenhuma passagem visual detectada para a janela atual.
                    </p>
                  )}
                </div>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                    Status da leitura
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {error ??
                      "O painel puxa os endpoints do proxy Next.js e mantém uma leitura contínua das consultas, mesmo sob fallback visual."}
                  </p>
                </div>
              </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="cosmic-panel rounded-[2rem] p-6 animate-reveal [animation-delay:580ms]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                      Visible objects
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Radar do horizonte
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                    {weatherLabel}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {(visibleReport?.objects.length
                    ? visibleReport.objects.slice(0, 5)
                    : [
                        {
                          object: {
                            name: "Sem retorno ainda",
                            magnitude: null,
                            source: "API",
                          },
                          sky_position: { altitude: 0, azimuth: 0 },
                          summary:
                            "Execute a leitura para popular o radar de objetos visíveis.",
                        },
                      ]
                  ).map((item) => (
                    <div
                      key={item.object.name}
                      className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-base font-semibold text-white">
                          {item.object.name}
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          {item.summary}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm sm:min-w-[14rem]">
                        <div>
                          <p className="text-white/40">Alt</p>
                          <p className="mt-1 font-mono text-white">
                            {formatDegrees(item.sky_position.altitude)}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40">Az</p>
                          <p className="mt-1 font-mono text-white">
                            {formatDegrees(item.sky_position.azimuth)}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40">Mag</p>
                          <p className="mt-1 font-mono text-white">
                            {formatMagnitude(item.object.magnitude)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="cosmic-panel rounded-[2rem] p-6 animate-reveal [animation-delay:660ms]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                      Satellite stream
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Passagens em órbita
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                    {visualPassCount} visuais
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {(satelliteReport?.all_passes.length
                    ? satelliteReport.all_passes.slice(0, 5)
                    : [
                        {
                          name: "Sem passagens ainda",
                          rise_time: new Date().toISOString(),
                          peak_time: new Date().toISOString(),
                          set_time: new Date().toISOString(),
                          peak_altitude: 0,
                          peak_azimuth: 0,
                          sunlit: false,
                          sun_altitude: 0,
                        },
                      ]
                  ).map((item) => (
                    <div
                      key={`${item.name}-${item.peak_time}`}
                      className="rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-base font-semibold text-white">
                            {item.name}
                          </p>
                          <p className="mt-1 text-sm text-white/55">
                            Pico em {formatTime(item.peak_time)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-white/65">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                            {item.sunlit ? "Sunlit" : "Shadow"}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                            Alt {formatDegrees(item.peak_altitude)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-white/40">Rise</p>
                          <p className="mt-1 text-white">
                            {formatTime(item.rise_time)}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40">Peak</p>
                          <p className="mt-1 text-white">
                            {formatTime(item.peak_time)}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40">Set</p>
                          <p className="mt-1 text-white">
                            {formatTime(item.set_time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
