export interface ImageCredit {
  id: string;
  title: string;
  author: string;
  date: string;
  source: string;
  license: string;
  licenseUrl: string;
  path: string;
  modifications: string;
}

export const imageCredits: ImageCredit[] = [
  {
    id: "flood-lagos",
    title: "Street Flood",
    author: "Omagxii",
    date: "June 24, 2019",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    path: "/demo-assets/photos/flood-lagos-2019.jpg",
    modifications: "Cropped for 16:9 display in the demo",
  },
  {
    id: "flood-response",
    title: "National Guard flood response",
    author: "Airman Megan Floyd / U.S. Air National Guard",
    date: "October 11, 2015",
    source: "Wikimedia Commons",
    license: "Public domain",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    path: "/demo-assets/photos/flood-response-2015.jpg",
    modifications: "Cropped for 16:9 display in the demo",
  },
  {
    id: "flood-guadalajara",
    title: "Flooded street and vehicles",
    author: "MarkBuckawicki",
    date: "August 12, 2013",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    path: "/demo-assets/photos/flooded-guadalajara-2013.jpg",
    modifications: "Cropped for 16:9 display in the demo",
  },
  {
    id: "wildfire-dc",
    title: "Wildfire smoke in Washington DC",
    author: "Wikimedia Commons contributors",
    date: "2023",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    path: "/demo-assets/photos/wildfire-washington-dc.jpg",
    modifications: "Cropped for 16:9 display in the demo",
  },
  {
    id: "protest-gate",
    title: "Protest under the gate",
    author: "Wikimedia Commons contributors",
    date: "2024",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    path: "/demo-assets/photos/protest-2024.jpg",
    modifications: "Cropped for 16:9 display in the demo",
  },
  {
    id: "vaccine-vial",
    title: "COVID-19 vaccine vial (2024)",
    author: "Wikimedia Commons contributors",
    date: "2024",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    path: "/demo-assets/photos/vaccine-vial-2024.jpg",
    modifications: "Cropped for 16:9 display in the demo",
  },
  {
    id: "covid-protest",
    title: "LSE protest against zero-Covid policy",
    author: "Wikimedia Commons contributors",
    date: "December 2, 2022",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    path: "/demo-assets/photos/covid-protest-2020.jpg",
    modifications: "Cropped for 16:9 display; filename kept for demo continuity",
  },
];
