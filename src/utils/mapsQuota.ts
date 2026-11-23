export function isMapsQuotaError(error: unknown): boolean {
  if (!error) return false;
  const msg =
    typeof error === 'string'
      ? error
      : error instanceof Error
      ? `${error.name} ${error.message}`
      : JSON.stringify(error);

  const upper = msg.toUpperCase();
  return (
    upper.includes('RESOURCE_EXHAUSTED') ||
    upper.includes('OVER_QUERY_LIMIT') ||
    upper.includes('OVERQUOTAMAPERROR') ||
    upper.includes('QUOTA_EXCEEDED') ||
    upper.includes('QUOTAEXCEEDEDERROR') ||
    upper.includes('429')
  );
}

export function checkAndDispatchMapsQuotaError(error: unknown): boolean {
  if (isMapsQuotaError(error)) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    return true;
  }
  return false;
}
