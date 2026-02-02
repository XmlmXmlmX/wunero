export function isLegalFeaturesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_LEGAL_FEATURES === 'true';
}
