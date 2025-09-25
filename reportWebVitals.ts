// Lightweight Web Vitals reporter. We lazy import web-vitals only in production to avoid
// increasing dev bundle / speeding up HMR.
// Metrics: LCP, CLS, FID (deprecated, replaced by INP), INP, TTFB, FCP.
// You can pipe these to an analytics endpoint (Netlify function, GA4, etc.).

type Metric = {
  name: string;
  value: number;
  id: string;
  rating?: string;
};

interface ReportOptions {
  endpoint?: string; // POST endpoint to send metrics
  log?: boolean;     // console.log metrics (default true in development)
  sampleRate?: number; // 0..1 to sample traffic
}

const defaultOptions: ReportOptions = {
  log: true,
  sampleRate: 1,
};

function sendMetric(metric: Metric, options: ReportOptions) {
  if (options.sampleRate !== undefined && Math.random() > options.sampleRate) return;
  if (options.log) {
    // eslint-disable-next-line no-console
    console.log(`[WebVitals] ${metric.name}:`, metric.value, metric);
  }
  if (options.endpoint) {
    try {
      fetch(options.endpoint, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          rating: metric.rating,
          url: window.location.href,
          ts: Date.now(),
        }),
      }).catch(() => {/* swallow */});
    } catch {/* ignore */}
  }
}

export function reportWebVitals(opts: ReportOptions = {}) {
  const options: ReportOptions = { ...defaultOptions, ...opts };
  // Only import when browser is idle to reduce contention with LCP.
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    // @ts-ignore
    window.requestIdleCallback(load);
  } else {
    setTimeout(load, 0);
  }

  function load() {
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(m => sendMetric(m as Metric, options));
      onINP(m => sendMetric(m as Metric, options));
      onLCP(m => sendMetric(m as Metric, options));
      onFCP(m => sendMetric(m as Metric, options));
      onTTFB(m => sendMetric(m as Metric, options));
    }).catch(() => {/* ignore */});
  }
}

export default reportWebVitals;