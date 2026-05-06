"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  loadObjectReport,
  loadSatelliteReport,
  loadVisibleObjectsReport,
  type ObjectReport,
  type SatelliteReport,
  type VisibleObjectsReport,
} from "../lib/astro-api";

type DashboardState = {
  city: string;
  objectName: string;
  datetime: string;
};

const quickTargets = ["Sol", "Lua", "Júpiter", "Sirius"];

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

function formatCoordinates(coord?: string) {
  if (!coord) return "--";

  const val = Number(coord).toFixed(2);

  if (val !== "NaN") {
    return val;
  }

  return "--";
}

type VisibilityStatus = {
  status: "visible" | "difficult" | "not_visible";
  label: string;
  bgColor: string;
  textColor: string;
};

function getVisibilityStatus(
  altitude?: number | null,
  magnitude?: number | null,
  cloudCover?: number | null,
): VisibilityStatus {
  if (altitude === null || altitude === undefined || altitude < 0) {
    return {
      status: "not_visible",
      label: "Não visível",
      bgColor: "bg-rose/15",
      textColor: "text-rose",
    };
  }

  const difficultConditions: string[] = [];
  const favorableConditions: string[] = [];

  if (altitude < 10) {
    difficultConditions.push("altitude baixa");
  } else {
    favorableConditions.push("altitude boa");
  }

  if (magnitude === null || magnitude === undefined) {
    difficultConditions.push("magnitude desconhecida");
  } else if (magnitude > 6) {
    difficultConditions.push("brilho fraco");
  } else {
    favorableConditions.push("brilho adequado");
  }

  if (cloudCover === null || cloudCover === undefined) {
    difficultConditions.push("nuvens desconhecidas");
  } else if (cloudCover >= 85) {
    return {
      status: "not_visible",
      label: "Muito nublado",
      bgColor: "bg-rose/15",
      textColor: "text-rose",
    };
  } else if (cloudCover >= 60) {
    difficultConditions.push("bastante nublado");
  } else if (cloudCover >= 25) {
    difficultConditions.push("parcialmente nublado");
  } else {
    favorableConditions.push("céu limpo");
  }

  const hasDifficulties =
    altitude < 10 ||
    magnitude === null ||
    magnitude === undefined ||
    (magnitude !== null && magnitude > 6) ||
    (cloudCover !== null && cloudCover !== undefined && cloudCover >= 60);

  if (hasDifficulties) {
    return {
      status: "difficult",
      label: "Difícil",
      bgColor: "bg-amber/15",
      textColor: "text-amber",
    };
  }

  return {
    status: "visible",
    label: "Visível",
    bgColor: "bg-emerald/15",
    textColor: "text-emerald",
  };
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-full bg-white/10 ${className}`}
    />
  );
}

function SkeletonPanel({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-3xl border border-white/10 bg-white/4 ${className}`}
    >
      {children}
    </div>
  );
}

export default function Page() {
  const [state, setState] = useState<DashboardState>({
    city: "São Paulo",
    objectName: "Sirius",
    datetime: toDateTimeLocal(new Date()),
  });
  const [objectReport, setObjectReport] = useState<ObjectReport | null>(null);
  const [visibleReport, setVisibleReport] =
    useState<VisibleObjectsReport | null>(null);
  const [satelliteReport, setSatelliteReport] =
    useState<SatelliteReport | null>(null);
  const [objectLoading, setObjectLoading] = useState(false);
  const [visibleLoading, setVisibleLoading] = useState(false);
  const [satelliteLoading, setSatelliteLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const stateRef = useRef(state);
  const geoLocationAttemptedRef = useRef(false);
  const refreshVersionRef = useRef(0);
  const pendingSectionsRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const finishSection = useCallback((requestVersion: number) => {
    if (refreshVersionRef.current !== requestVersion) {
      return;
    }

    pendingSectionsRef.current -= 1;

    if (pendingSectionsRef.current === 0) {
      setLastSynced(new Date().toISOString());
    }
  }, []);

  const refreshDashboard = useCallback(
    async (nextState?: Partial<DashboardState>) => {
      const mergedState = { ...stateRef.current, ...nextState };
      stateRef.current = mergedState;
      setState(mergedState);

      const requestVersion = refreshVersionRef.current + 1;
      refreshVersionRef.current = requestVersion;
      pendingSectionsRef.current = 3;

      setObjectLoading(true);
      setVisibleLoading(true);
      setSatelliteLoading(true);

      setObjectReport(null);
      setVisibleReport(null);
      setSatelliteReport(null);

      const query = {
        city: mergedState.city,
        objectName: mergedState.objectName,
        datetime: toIsoDatetime(mergedState.datetime),
      };

      void loadObjectReport(query)
        .then((report) => {
          if (refreshVersionRef.current !== requestVersion) {
            return;
          }

          setObjectReport(report);
        })
        .catch(() => {
          if (refreshVersionRef.current !== requestVersion) {
            return;
          }

          setObjectReport(null);
        })
        .finally(() => {
          if (refreshVersionRef.current !== requestVersion) {
            return;
          }

          setObjectLoading(false);
          finishSection(requestVersion);
        });

      void loadVisibleObjectsReport({
        city: mergedState.city,
        datetime: query.datetime,
      })
        .then((report) => {
          if (refreshVersionRef.current !== requestVersion) {
            return;
          }

          setVisibleReport(report);
        })
        .catch(() => {
          if (refreshVersionRef.current !== requestVersion) {
            return;
          }

          setVisibleReport(null);
        })
        .finally(() => {
          if (refreshVersionRef.current !== requestVersion) {
            return;
          }

          setVisibleLoading(false);
          finishSection(requestVersion);
        });

      void loadSatelliteReport({
        city: mergedState.city,
        datetime: query.datetime,
      })
        .then((report) => {
          if (refreshVersionRef.current !== requestVersion) {
            return;
          }

          setSatelliteReport(report);
        })
        .catch(() => {
          if (refreshVersionRef.current !== requestVersion) {
            return;
          }

          setSatelliteReport(null);
        })
        .finally(() => {
          if (refreshVersionRef.current !== requestVersion) {
            return;
          }

          setSatelliteLoading(false);
          finishSection(requestVersion);
        });
    },
    [finishSection],
  );

  // Detecção de localização do usuário
  useEffect(() => {
    if (geoLocationAttemptedRef.current) return;
    geoLocationAttemptedRef.current = true;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding usando Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "pt-BR,pt;q=0.9",
              },
            },
          );

          if (!response.ok) throw new Error("Geocoding failed");

          const data = (await response.json()) as {
            address?: {
              city?: string;
              town?: string;
              municipality?: string;
              county?: string;
              state?: string;
            };
          };

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.municipality ||
            data.address?.county;

          if (city) {
            setState((current) => ({
              ...current,
              city,
            }));
            stateRef.current = {
              ...stateRef.current,
              city,
            };
            void refreshDashboard({ city });
          }
        } catch {
          // Silenciosamente falha se o geocoding não funcionar
        }
      },
      () => {
        // Silenciosamente falha se o usuário negar a localização
      },
    );
  }, [refreshDashboard]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshDashboard]);

  const visibleCount = visibleReport?.objects.length ?? 0;
  const visualPassCount = satelliteReport?.visual_passes.length ?? 0;
  const allPassCount = satelliteReport?.all_passes.length ?? 0;
  const weatherLabel =
    visibleReport?.weather_description ?? objectReport?.weather.description;
  const altitude = objectReport?.sky_position.altitude;
  const azimuth = objectReport?.sky_position.azimuth;
  const nextVisualPass = satelliteReport?.visual_passes[0];
  const focusObject = objectReport?.object.name ?? state.objectName;
  const isRefreshing = objectLoading || visibleLoading || satelliteLoading;

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      <div className="absolute inset-0 opacity-35" />
      <div className="absolute inset-0 mix-blend-screen" />

      <div className="absolute -left-36 top-16 h-80 w-80 rounded-full border border-sky/20 blur-3xl animate-float" />
      <div className="absolute right-[-8rem] top-24 h-96 w-96 rounded-full border border-sun/15 blur-3xl animate-drift" />
      <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full border border-mint/20 blur-3xl animate-float" />

      <div className="absolute inset-x-0 top-0 h-px opacity-70" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl animate-reveal [animation-delay:60ms]">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="cosmic-chip">Astro Control Deck</span>
            </div>
            <h1 className="font-display text-4xl leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Painel astronômico para rastrear céu, visibilidade e satélites em
              tempo real.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
              Uma central cósmica com vidro translúcido, leituras ao vivo e foco
              em análise rápida para objetos celestes, objetos visíveis e
              satélites observáveis.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[28rem]">
            <div className="rounded-3xl py-3 animate-reveal [animation-delay:200ms]">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                Visíveis
              </p>
              {visibleLoading ? (
                <div className="mt-3 space-y-2">
                  <SkeletonBlock className="h-7 w-16 rounded-2xl" />
                  <SkeletonBlock className="h-3 w-36 rounded-2xl" />
                </div>
              ) : (
                <>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {visibleCount}
                  </p>
                  <p className="mt-1 text-xs text-white/52">
                    objetos acima do horizonte
                  </p>
                </>
              )}
            </div>
            <div className="rounded-3xl px-4 py-3 animate-reveal [animation-delay:260ms]">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                Passagens
              </p>
              {satelliteLoading ? (
                <div className="mt-3 space-y-2">
                  <SkeletonBlock className="h-7 w-16 rounded-2xl" />
                  <SkeletonBlock className="h-3 w-28 rounded-2xl" />
                </div>
              ) : (
                <>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {visualPassCount}
                  </p>
                  <p className="mt-1 text-xs text-white/52">
                    com chance visual
                  </p>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] p-5 animate-reveal [animation-delay:340ms]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Command panel
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Controle de leitura
                </h2>
              </div>
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
                disabled={isRefreshing}
                onClick={() => !isRefreshing && refreshDashboard()}
                className="hover:cursor-pointer group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky/30 bg-sky/12 px-4 py-3 text-sm font-semibold text-sky transition hover:border-sky/50 hover:bg-sky/18"
              >
                {isRefreshing ? "Atualizando busca..." : "Buscar"}
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
                Última sincronização
              </p>
              <p className="mt-2 text-sm text-white/80">
                {lastSynced
                  ? formatTime(lastSynced)
                  : "Ainda sem sincronização"}
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
                      {objectLoading ? (
                        <div className="mt-3 space-y-3">
                          <SkeletonBlock className="h-9 w-56 rounded-2xl sm:w-72" />
                          <SkeletonBlock className="h-4 w-64 rounded-2xl" />
                        </div>
                      ) : (
                        <>
                          <h2 className="mt-2 font-display text-3xl tracking-tight text-white sm:text-4xl">
                            {focusObject}
                          </h2>
                          <p className="mt-2 text-sm text-white/58">
                            {objectReport
                              ? `${objectReport.city} · ${formatTime(objectReport.observation_time)}`
                              : "--"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {objectLoading ? (
                      <>
                        <SkeletonPanel className="p-4">
                          <div className="space-y-3">
                            <SkeletonBlock className="h-3 w-20 rounded-2xl" />
                            <SkeletonBlock className="h-8 w-24 rounded-2xl" />
                          </div>
                        </SkeletonPanel>
                        <SkeletonPanel className="p-4">
                          <div className="space-y-3">
                            <SkeletonBlock className="h-3 w-20 rounded-2xl" />
                            <SkeletonBlock className="h-8 w-24 rounded-2xl" />
                          </div>
                        </SkeletonPanel>
                        <SkeletonPanel className="p-4">
                          <div className="space-y-3">
                            <SkeletonBlock className="h-3 w-24 rounded-2xl" />
                            <SkeletonBlock className="h-8 w-20 rounded-2xl" />
                          </div>
                        </SkeletonPanel>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {objectLoading ? (
                      <>
                        <SkeletonPanel className="p-4">
                          <div className="space-y-4">
                            <SkeletonBlock className="h-3 w-28 rounded-2xl" />
                            <div className="space-y-3">
                              <SkeletonBlock className="h-4 w-full rounded-2xl" />
                              <SkeletonBlock className="h-4 w-11/12 rounded-2xl" />
                              <SkeletonBlock className="h-4 w-9/12 rounded-2xl" />
                            </div>
                          </div>
                        </SkeletonPanel>

                        <SkeletonPanel className="p-4">
                          <div className="space-y-4">
                            <SkeletonBlock className="h-3 w-28 rounded-2xl" />
                            <div className="space-y-2">
                              <SkeletonBlock className="h-10 w-full rounded-2xl" />
                              <SkeletonBlock className="h-10 w-full rounded-2xl" />
                              <SkeletonBlock className="h-10 w-10/12 rounded-2xl" />
                            </div>
                          </div>
                        </SkeletonPanel>
                      </>
                    ) : (
                      <>
                        <div className="rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                            Coordenadas
                          </p>
                          <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4">
                              <dt className="text-white/54">RA</dt>
                              <dd className="font-mono text-white">
                                {formatCoordinates(objectReport?.object.ra)}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <dt className="text-white/54">Dec</dt>
                              <dd className="font-mono text-white">
                                {formatCoordinates(objectReport?.object.dec)}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-ink-900/55 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                            Visibilidade
                          </p>
                          <div className="mt-4">
                            {objectReport ? (
                              (() => {
                                const visibility = getVisibilityStatus(
                                  objectReport.sky_position.altitude,
                                  objectReport.object.magnitude,
                                  objectReport.weather.cloud_cover,
                                );
                                return (
                                  <div
                                    className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 ${visibility.bgColor} px-3 py-2`}
                                  >
                                    <span
                                      className={`text-sm font-medium ${visibility.textColor}`}
                                    >
                                      {visibility.label}
                                    </span>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="text-sm text-white/58">--</div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </article>

              <article className="rounded-[2rem] p-6 animate-reveal [animation-delay:500ms]">
                <div>
                  <div className="flex align-center items-center gap-1 space-between">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                      Atmospheric layer
                    </p>

                    {visibleLoading ? (
                      <SkeletonBlock className="h-6 w-28 rounded-full" />
                    ) : weatherLabel ? (
                      <span className="text-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                        {weatherLabel}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Clima e contexto
                  </h2>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div></div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                      Visibilidade geral
                    </p>
                    {visibleLoading ? (
                      <div className="mt-3 space-y-3">
                        <SkeletonBlock className="h-8 w-20 rounded-2xl" />
                        <SkeletonBlock className="h-4 w-28 rounded-2xl" />
                      </div>
                    ) : (
                      <>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {visibleReport ? `${visibleCount} objetos` : "--"}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                      Passagens totais
                    </p>
                    {satelliteLoading ? (
                      <div className="mt-3 space-y-3">
                        <SkeletonBlock className="h-8 w-16 rounded-2xl" />
                        <SkeletonBlock className="h-4 w-32 rounded-2xl" />
                      </div>
                    ) : (
                      <>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {satelliteReport ? allPassCount : "--"}
                        </p>
                        <p className="mt-2 text-sm text-white/58">
                          dentro de {satelliteReport?.lookahead_hours ?? 12}h
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                    🛰️ Melhor satélite visível
                  </p>
                  {satelliteLoading ? (
                    <div className="mt-3 space-y-3">
                      <SkeletonBlock className="h-5 w-44 rounded-2xl" />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <SkeletonBlock className="h-20 rounded-2xl" />
                        <SkeletonBlock className="h-20 rounded-2xl" />
                      </div>
                    </div>
                  ) : nextVisualPass ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {nextVisualPass.name}
                        </p>
                        <p className="mt-1 text-sm text-white/58">
                          Pico em {formatTime(nextVisualPass.peak_time)}
                        </p>
                      </div>
                      <div className="text-sm">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                          <p className="text-white/42">Altitude</p>
                          <p className="mt-1 font-semibold text-white">
                            {formatDegrees(nextVisualPass.peak_altitude)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-white/58">Sem passagem</p>
                  )}
                </div>
              </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-[2rem] p-6 animate-reveal [animation-delay:580ms]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                      Visible objects
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Radar do horizonte
                    </h2>
                  </div>

                  {weatherLabel && (
                    <span className="text-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                      {weatherLabel}
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  {visibleLoading ? (
                    <>
                      <SkeletonPanel className="p-4">
                        <div className="space-y-3">
                          <SkeletonBlock className="h-5 w-44 rounded-2xl" />
                          <SkeletonBlock className="h-4 w-72 rounded-2xl" />
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                          </div>
                        </div>
                      </SkeletonPanel>
                      <SkeletonPanel className="p-4">
                        <div className="space-y-3">
                          <SkeletonBlock className="h-5 w-36 rounded-2xl" />
                          <SkeletonBlock className="h-4 w-64 rounded-2xl" />
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                          </div>
                        </div>
                      </SkeletonPanel>
                      <SkeletonPanel className="p-4">
                        <div className="space-y-3">
                          <SkeletonBlock className="h-5 w-40 rounded-2xl" />
                          <SkeletonBlock className="h-4 w-60 rounded-2xl" />
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                          </div>
                        </div>
                      </SkeletonPanel>
                    </>
                  ) : visibleReport?.objects.length ? (
                    visibleReport.objects.slice(0, 5).map((item) => (
                      <div
                        key={item.object.name}
                        className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-ink-900/55 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-base font-semibold text-white">
                            {item.object.name}
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
                    ))
                  ) : (
                    <p className="mt-3 text-sm text-white/58">--</p>
                  )}
                </div>
              </article>

              <article className="rounded-[2rem] p-6 animate-reveal [animation-delay:660ms]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                      Satellite stream
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Passagens em órbita
                    </h2>
                  </div>

                  {satelliteLoading
                    ? null
                    : visualPassCount > 0 && (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                          {visualPassCount} visuais
                        </span>
                      )}
                </div>

                <div className="mt-5 space-y-3">
                  {satelliteLoading ? (
                    <>
                      <SkeletonPanel className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3">
                              <SkeletonBlock className="h-5 w-40 rounded-2xl" />
                              <SkeletonBlock className="h-4 w-32 rounded-2xl" />
                            </div>
                            <SkeletonBlock className="h-7 w-28 rounded-full" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                          </div>
                        </div>
                      </SkeletonPanel>
                      <SkeletonPanel className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3">
                              <SkeletonBlock className="h-5 w-36 rounded-2xl" />
                              <SkeletonBlock className="h-4 w-32 rounded-2xl" />
                            </div>
                            <SkeletonBlock className="h-7 w-28 rounded-full" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                          </div>
                        </div>
                      </SkeletonPanel>
                      <SkeletonPanel className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3">
                              <SkeletonBlock className="h-5 w-44 rounded-2xl" />
                              <SkeletonBlock className="h-4 w-32 rounded-2xl" />
                            </div>
                            <SkeletonBlock className="h-7 w-28 rounded-full" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                            <SkeletonBlock className="h-12 rounded-2xl" />
                          </div>
                        </div>
                      </SkeletonPanel>
                    </>
                  ) : satelliteReport?.all_passes.length ? (
                    satelliteReport.all_passes.slice(0, 5).map((item) => (
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
                              {item.sunlit ? "Iluminado" : "Em sombra"}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                              Alt {formatDegrees(item.peak_altitude)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-white/40">Surgimento</p>
                            <p className="mt-1 text-white">
                              {formatTime(item.rise_time)}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/40">Pico</p>
                            <p className="mt-1 text-white">
                              {formatTime(item.peak_time)}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/40">Pôr</p>
                            <p className="mt-1 text-white">
                              {formatTime(item.set_time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/58">
                      Sem passagens encontradas
                    </p>
                  )}
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
