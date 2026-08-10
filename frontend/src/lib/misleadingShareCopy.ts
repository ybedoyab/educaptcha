/**
 * Detail + title under the share-return warning — evidence-based, not a
 * blanket “this post is false” claim.
 */
export function misleadingShareTitle(
  skill: string | undefined,
  titles: {
    default: string;
    context: string;
    chart: string;
    photoClaim: string;
    pressure: string;
  },
): string {
  switch (skill) {
    case "misleading-chart":
      return titles.chart;
    case "vaccine-claim":
      return titles.photoClaim;
    case "emotional-pressure":
      return titles.pressure;
    case "image-context":
    case "wildfire-context":
    case "protest-context":
      return titles.context;
    default:
      return titles.default;
  }
}

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
