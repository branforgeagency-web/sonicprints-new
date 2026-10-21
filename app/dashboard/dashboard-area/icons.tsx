const PATHS = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  orders: "M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5 5-2z",
  customers: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5M16 4.3a3.5 3.5 0 010 6.4M18 13.8c2.1.8 3.5 3 3.5 5.7",
  employees: "M5 3h14v18H5zM9 3v3h6V3M12 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8 18c.5-2 2-3 4-3s3.5 1 4 3",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z",
  chat: "M21 12a8.5 8.5 0 01-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1121 12z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z",
  building: "M4 21V5l8-2v18M12 8h8v13M8 8h.01M8 12h.01M8 16h.01M16 12h.01M16 16h.01M2 21h20",
  menu: "M4 7h16M4 12h16M4 17h16",
  sun: "M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z",
  logout: "M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h11",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  cart: "M3 4h2l2.4 11.2a1 1 0 001 .8h9.2a1 1 0 001-.8L20 8H6.2M9 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z",
  card: "M3 6h18v12H3zM3 10h18M7 15h3",
  refresh: "M20 11a8 8 0 00-14.9-3.9M4 4v4h4M4 13a8 8 0 0014.9 3.9M20 20v-4h-4",
  truck: "M3 6h11v9H3zM14 9h4l3 3v3h-7M7 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  close: "M6 6l12 12M18 6L6 18",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
