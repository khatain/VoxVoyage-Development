export interface DevQaPreviewBinding {
  mode: 'aistudio_dev_serve';
  expectedOrigin: string;
  expectedHostname: string;
  serviceIdPrefix: 'ais-dev-';
}

declare const __VOXVOYAGE_DEV_QA_PREVIEW_BINDING__: DevQaPreviewBinding | null | undefined;

export type QaAccessDeniedReason =
  | 'production_build'
  | 'remote_or_shared_preview_restricted'
  | 'preview_origin_mismatch'
  | 'untrusted_iframe_ancestor'
  | 'missing_window_context';

export type QaAccessAuthorizedReason =
  | 'authorized_local_dev'
  | 'authorized_aistudio_dev_preview';

export type QaEnvironmentKind = 'local_dev' | 'aistudio_dev_preview' | 'unauthorized';

export interface QaAccessEvaluation {
  allowed: boolean;
  buildDevEnabled: boolean;
  isLocalHost: boolean;
  isAiStudioDevPreview: boolean;
  environmentKind: QaEnvironmentKind;
  hostname: string;
  origin: string;
  reason: QaAccessDeniedReason | QaAccessAuthorizedReason;
}

const LOCAL_DEV_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '[::1]',
  '0.0.0.0',
]);

export function isLocalDevHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized) return false;
  if (LOCAL_DEV_HOSTNAMES.has(normalized)) return true;
  if (normalized.endsWith('.localhost')) return true;
  return false;
}

export function isAiStudioDevPreviewHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized || normalized.startsWith('ais-pre-')) return false;
  return /^ais-dev-[a-z0-9-]+\.[a-z0-9-]+\.run\.app$/.test(normalized);
}

export function isTrustedAiStudioAncestorOrigin(
  ancestorOrigin: string,
  currentOrigin?: string,
): boolean {
  const normalized = ancestorOrigin.trim();
  if (!normalized || normalized === 'null') return false;
  if (currentOrigin && normalized === currentOrigin) return true;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;
  const host = parsed.hostname.toLowerCase();
  if (host === 'google.com' || host.endsWith('.google.com')) return true;
  if (host === 'localhost.corp.google.com' && parsed.port === '26001') return true;
  return false;
}

function hasUntrustedIframeAncestor(
  isEmbeddedInIframe: boolean,
  ancestorOrigins: string[],
  referrer: string,
  currentOrigin: string,
): boolean {
  if (!isEmbeddedInIframe) return false;

  if (ancestorOrigins.length > 0) {
    return !ancestorOrigins.every((ao) => isTrustedAiStudioAncestorOrigin(ao, currentOrigin));
  }

  if (referrer.trim()) {
    try {
      const refOrigin = new URL(referrer).origin;
      return !isTrustedAiStudioAncestorOrigin(refOrigin, currentOrigin);
    } catch {
      return true;
    }
  }

  return false;
}

/**
 * Compile-time Vite dead-code gate.
 * In `vite build` (production), `import.meta.env.DEV` is statically replaced with `false`
 * and `import.meta.env.PROD` with `true`, allowing Rollup to strip QA UI out of production bundles.
 */
export function isDeveloperQaBuildEnabled(): boolean {
  try {
    return Boolean(import.meta.env?.DEV) && !Boolean(import.meta.env?.PROD);
  } catch {
    return false;
  }
}

export function getInjectedDevQaPreviewBinding(): DevQaPreviewBinding | null {
  try {
    const globalHolder = globalThis as {
      __VOXVOYAGE_DEV_QA_PREVIEW_BINDING__?: DevQaPreviewBinding | null;
    };
    if (globalHolder.__VOXVOYAGE_DEV_QA_PREVIEW_BINDING__) {
      return globalHolder.__VOXVOYAGE_DEV_QA_PREVIEW_BINDING__;
    }
    if (typeof __VOXVOYAGE_DEV_QA_PREVIEW_BINDING__ === 'undefined') {
      return null;
    }
    return __VOXVOYAGE_DEV_QA_PREVIEW_BINDING__ ?? null;
  } catch {
    return null;
  }
}

export function evaluateQaAccess(options?: {
  devBuildOverride?: boolean;
  prodBuildOverride?: boolean;
  hostnameOverride?: string;
  originOverride?: string;
  protocolOverride?: string;
  previewBindingOverride?: DevQaPreviewBinding | null;
  embeddedInIframeOverride?: boolean;
  ancestorOriginsOverride?: string[];
  referrerOverride?: string;
}): QaAccessEvaluation {
  const prodBuildFlag =
    options?.prodBuildOverride !== undefined
      ? Boolean(options.prodBuildOverride)
      : (() => {
          try {
            return Boolean(import.meta.env?.PROD);
          } catch {
            return false;
          }
        })();

  const buildDevEnabled =
    (options?.devBuildOverride !== undefined
      ? Boolean(options.devBuildOverride)
      : isDeveloperQaBuildEnabled()) && !prodBuildFlag;

  const hostname =
    options?.hostnameOverride !== undefined
      ? options.hostnameOverride.trim()
      : typeof window !== 'undefined' && window.location
        ? window.location.hostname
        : '';

  const origin =
    options?.originOverride !== undefined
      ? options.originOverride.trim()
      : typeof window !== 'undefined' && window.location
        ? window.location.origin
        : '';

  const protocol =
    options?.protocolOverride !== undefined
      ? options.protocolOverride.trim().toLowerCase()
      : typeof window !== 'undefined' && window.location
        ? window.location.protocol.toLowerCase()
        : '';

  const isLocalHost = isLocalDevHostname(hostname);

  if (!buildDevEnabled) {
    return {
      allowed: false,
      buildDevEnabled: false,
      isLocalHost,
      isAiStudioDevPreview: false,
      environmentKind: 'unauthorized',
      hostname,
      origin,
      reason: 'production_build',
    };
  }

  if (!hostname) {
    return {
      allowed: false,
      buildDevEnabled: true,
      isLocalHost: false,
      isAiStudioDevPreview: false,
      environmentKind: 'unauthorized',
      hostname: '',
      origin,
      reason: 'missing_window_context',
    };
  }

  let isEmbeddedInIframe = false;
  if (options?.embeddedInIframeOverride !== undefined) {
    isEmbeddedInIframe = options.embeddedInIframeOverride;
  } else if (typeof window !== 'undefined') {
    try {
      isEmbeddedInIframe = window.self !== window.top;
    } catch {
      isEmbeddedInIframe = true;
    }
  }

  const ancestorOrigins =
    options?.ancestorOriginsOverride !== undefined
      ? options.ancestorOriginsOverride
      : typeof window !== 'undefined' &&
          window.location &&
          'ancestorOrigins' in window.location &&
          window.location.ancestorOrigins
        ? Array.from(window.location.ancestorOrigins)
        : [];

  const referrer =
    options?.referrerOverride !== undefined
      ? options.referrerOverride
      : typeof document !== 'undefined'
        ? document.referrer || ''
        : '';

  if (isLocalHost) {
    if (hasUntrustedIframeAncestor(isEmbeddedInIframe, ancestorOrigins, referrer, origin)) {
      return {
        allowed: false,
        buildDevEnabled: true,
        isLocalHost: true,
        isAiStudioDevPreview: false,
        environmentKind: 'unauthorized',
        hostname,
        origin,
        reason: 'untrusted_iframe_ancestor',
      };
    }

    return {
      allowed: true,
      buildDevEnabled: true,
      isLocalHost: true,
      isAiStudioDevPreview: false,
      environmentKind: 'local_dev',
      hostname,
      origin,
      reason: 'authorized_local_dev',
    };
  }

  const normalizedHost = hostname.toLowerCase();
  if (normalizedHost.startsWith('ais-pre-')) {
    return {
      allowed: false,
      buildDevEnabled: true,
      isLocalHost: false,
      isAiStudioDevPreview: false,
      environmentKind: 'unauthorized',
      hostname,
      origin,
      reason: 'remote_or_shared_preview_restricted',
    };
  }

  const previewBinding =
    options?.previewBindingOverride !== undefined
      ? options.previewBindingOverride
      : getInjectedDevQaPreviewBinding();

  if (
    !previewBinding ||
    previewBinding.mode !== 'aistudio_dev_serve' ||
    previewBinding.serviceIdPrefix !== 'ais-dev-' ||
    !previewBinding.expectedOrigin ||
    !previewBinding.expectedHostname
  ) {
    return {
      allowed: false,
      buildDevEnabled: true,
      isLocalHost: false,
      isAiStudioDevPreview: false,
      environmentKind: 'unauthorized',
      hostname,
      origin,
      reason: 'remote_or_shared_preview_restricted',
    };
  }

  if (
    !isAiStudioDevPreviewHostname(normalizedHost) ||
    !isAiStudioDevPreviewHostname(previewBinding.expectedHostname)
  ) {
    return {
      allowed: false,
      buildDevEnabled: true,
      isLocalHost: false,
      isAiStudioDevPreview: false,
      environmentKind: 'unauthorized',
      hostname,
      origin,
      reason: 'remote_or_shared_preview_restricted',
    };
  }

  const effectiveProtocol = protocol || (origin.startsWith('https://') ? 'https:' : '');
  const effectiveOrigin = origin || (effectiveProtocol ? `${effectiveProtocol}//${hostname}` : '');

  if (
    effectiveProtocol !== 'https:' ||
    normalizedHost !== previewBinding.expectedHostname.toLowerCase() ||
    effectiveOrigin !== previewBinding.expectedOrigin
  ) {
    return {
      allowed: false,
      buildDevEnabled: true,
      isLocalHost: false,
      isAiStudioDevPreview: false,
      environmentKind: 'unauthorized',
      hostname,
      origin: effectiveOrigin,
      reason: 'preview_origin_mismatch',
    };
  }

  if (hasUntrustedIframeAncestor(isEmbeddedInIframe, ancestorOrigins, referrer, effectiveOrigin)) {
    return {
      allowed: false,
      buildDevEnabled: true,
      isLocalHost: false,
      isAiStudioDevPreview: false,
      environmentKind: 'unauthorized',
      hostname,
      origin: effectiveOrigin,
      reason: 'untrusted_iframe_ancestor',
    };
  }

  return {
    allowed: true,
    buildDevEnabled: true,
    isLocalHost: false,
    isAiStudioDevPreview: true,
    environmentKind: 'aistudio_dev_preview',
    hostname,
    origin: effectiveOrigin,
    reason: 'authorized_aistudio_dev_preview',
  };
}
