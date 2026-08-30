// The calendar always displays instants in the viewer's own device
// timezone - that's just how `Date` getters (`getHours`, `getDate`, ...)
// already work, no conversion needed. The one place we need the IANA zone
// name explicitly is when *writing* a timed event to Google, so recurring
// events and Google's own UI reflect the zone it was actually created in
// (instead of a hardcoded "UTC" that drifts across DST changes).
export function getDeviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
