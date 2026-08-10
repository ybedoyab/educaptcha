/**
 * Detail line under “Not recommended to share” — must match the deception type.
 * Generic “original source” copy is wrong for charts, urgency posts, etc.
 */
export function misleadingShareDetail(
  skill: string | undefined,
  details: {
    default: string;
    chart: string;
    photoClaim: string;
    context: string;
    pressure: string;
  },
): string {
  switch (skill) {
    case "misleading-chart":
      return details.chart;
    case "vaccine-claim":
      return details.photoClaim;
    case "emotional-pressure":
      return details.pressure;
    case "image-context":
    case "wildfire-context":
    case "protest-context":
      return details.context;
    default:
      return details.default;
  }
}
