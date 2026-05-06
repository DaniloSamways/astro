export const ASTRO_API_BASE_PATH = "/api/astro";

export type HealthResponse = {
  ok: boolean;
  service: string;
  status: string;
};

export type ObjectReport = {
  city: string;
  observation_time: string;
  object: {
    name: string;
    ra: string;
    dec: string;
    magnitude: number | null;
    source: string;
    kind: string;
  };
  sky_position: {
    altitude: number;
    azimuth: number;
  };
  weather: {
    available?: boolean;
    cloud_cover?: number | null;
    description?: string;
  };
  visibility_messages: string[];
};

export type VisibleObjectsReport = {
  city: string;
  observation_time: string;
  weather_description: string;
  objects: Array<{
    object: {
      name: string;
      magnitude: number | null;
      source: string;
    };
    sky_position: {
      altitude: number;
      azimuth: number;
    };
    summary: string;
  }>;
};

export type SatellitePass = {
  name: string;
  rise_time: string;
  peak_time: string;
  set_time: string;
  peak_altitude: number;
  peak_azimuth: number;
  sunlit: boolean;
  sun_altitude: number;
};

export type SatelliteReport = {
  city: string;
  observation_time: string;
  lookahead_hours: number;
  all_passes: SatellitePass[];
  visual_passes: SatellitePass[];
};

type DashboardQuery = {
  city: string;
  objectName: string;
  datetime?: string;
};

type SectionQuery = {
  city: string;
  datetime?: string;
};

function withCacheBuster(searchParams: URLSearchParams) {
  searchParams.set("t", Date.now().toString());
  return searchParams;
}

async function fetchJson<T>(path: string, searchParams?: URLSearchParams) {
  const query = searchParams ? withCacheBuster(searchParams) : withCacheBuster(new URLSearchParams());
  const queryString = query.toString();
  const url = queryString ? `${path}?${queryString}` : path;

  const response = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

function buildSectionQuery(query: SectionQuery) {
  const sectionQuery = new URLSearchParams({ city: query.city });

  if (query.datetime) {
    sectionQuery.set("datetime", query.datetime);
  }

  return sectionQuery;
}

export async function loadObjectReport(query: DashboardQuery) {
  const objectQuery = new URLSearchParams({
    city: query.city,
    name: query.objectName,
  });

  if (query.datetime) {
    objectQuery.set("datetime", query.datetime);
  }

  const response = await fetchJson<{ ok: boolean; data: ObjectReport }>(
    `${ASTRO_API_BASE_PATH}/object`,
    objectQuery,
  );

  return response.data;
}

export async function loadVisibleObjectsReport(query: SectionQuery) {
  const response = await fetchJson<{ ok: boolean; data: VisibleObjectsReport }>(
    `${ASTRO_API_BASE_PATH}/visible-objects`,
    buildSectionQuery(query),
  );

  return response.data;
}

export async function loadSatelliteReport(query: SectionQuery) {
  const response = await fetchJson<{ ok: boolean; data: SatelliteReport }>(
    `${ASTRO_API_BASE_PATH}/satellites`,
    buildSectionQuery(query),
  );

  return response.data;
}

export async function loadAstroDashboard(query: DashboardQuery) {
  const [health, objectReport, visibleReport, satelliteReport] = await Promise.all([
    fetchJson<HealthResponse>(`${ASTRO_API_BASE_PATH}/health`),
    loadObjectReport(query).then((data) => ({ ok: true, data })),
    loadVisibleObjectsReport(query).then((data) => ({ ok: true, data })),
    loadSatelliteReport(query).then((data) => ({ ok: true, data })),
  ]);

  return {
    health,
    objectReport: objectReport.data,
    visibleReport: visibleReport.data,
    satelliteReport: satelliteReport.data,
  };
}
