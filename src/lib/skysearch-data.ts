export type SearchMode = "cash" | "miles";
export type SortMode = "recommended" | "price" | "duration";

export type FlightResult = {
  id: string;
  airline: string;
  alliance: string;
  route: string;
  source: string;
  cashPrice: number;
  miles: number;
  taxes: number;
  program: string;
  milesValue: number;
  priceVsAverage: number;
  priceTrend7d: number;
  durationMin: number;
  stops: number;
  departure: string;
  arrival: string;
  cabin: string;
  baggage: string;
  seatsLeft: number;
  reliability: number;
  bookingRedirectSec: number;
  score: number;
  badges: string[];
  scoreBreakdown: {
    price: number;
    time: number;
    quality: number;
    context: number;
  };
};

export type CalendarDay = {
  day: number;
  date: string;
  cashPrice: number;
  miles: number;
  level: "low" | "mid" | "high";
};

export const flightResults: FlightResult[] = [
  {
    id: "tp-1862",
    airline: "TAP Air Portugal",
    alliance: "Star Alliance",
    route: "LIS -> JFK",
    source: "Amadeus + Flying Blue",
    cashPrice: 428,
    miles: 32500,
    taxes: 71,
    program: "Flying Blue",
    milesValue: 1.09,
    priceVsAverage: -34,
    priceTrend7d: -9,
    durationMin: 505,
    stops: 0,
    departure: "10:15",
    arrival: "13:40",
    cabin: "Económica",
    baggage: "Mão + porão",
    seatsLeft: 7,
    reliability: 96,
    bookingRedirectSec: 4,
    score: 94,
    badges: ["Melhor custo-benefício", "Sem escalas", "Preço a descer"],
    scoreBreakdown: { price: 35, time: 24, quality: 18, context: 17 },
  },
  {
    id: "ux-091",
    airline: "Air Europa",
    alliance: "SkyTeam",
    route: "LIS -> MAD -> JFK",
    source: "Duffel + Smiles",
    cashPrice: 392,
    miles: 28900,
    taxes: 93,
    program: "Smiles",
    milesValue: 1.03,
    priceVsAverage: -41,
    priceTrend7d: -12,
    durationMin: 710,
    stops: 1,
    departure: "07:35",
    arrival: "15:25",
    cabin: "Económica",
    baggage: "Mão",
    seatsLeft: 3,
    reliability: 91,
    bookingRedirectSec: 7,
    score: 88,
    badges: ["Mais barato", "Última disponibilidade"],
    scoreBreakdown: { price: 35, time: 18, quality: 17, context: 18 },
  },
  {
    id: "aa-259",
    airline: "American Airlines",
    alliance: "oneworld",
    route: "LIS -> PHL -> JFK",
    source: "AAdvantage",
    cashPrice: 487,
    miles: 22500,
    taxes: 112,
    program: "AAdvantage",
    milesValue: 1.67,
    priceVsAverage: -27,
    priceTrend7d: -5,
    durationMin: 655,
    stops: 1,
    departure: "11:05",
    arrival: "17:10",
    cabin: "Económica",
    baggage: "Mão + porão",
    seatsLeft: 12,
    reliability: 94,
    bookingRedirectSec: 5,
    score: 86,
    badges: ["Melhor em milhas", "Bagagem incluída"],
    scoreBreakdown: { price: 31, time: 20, quality: 18, context: 17 },
  },
  {
    id: "ba-503",
    airline: "British Airways",
    alliance: "oneworld",
    route: "LIS -> LHR -> JFK",
    source: "Skyscanner + Avios",
    cashPrice: 451,
    miles: 30000,
    taxes: 168,
    program: "Avios",
    milesValue: 0.94,
    priceVsAverage: -18,
    priceTrend7d: 3,
    durationMin: 630,
    stops: 1,
    departure: "12:40",
    arrival: "18:05",
    cabin: "Económica",
    baggage: "Mão",
    seatsLeft: 9,
    reliability: 89,
    bookingRedirectSec: 6,
    score: 79,
    badges: ["Fonte fiável"],
    scoreBreakdown: { price: 27, time: 20, quality: 16, context: 16 },
  },
  {
    id: "az-764",
    airline: "ITA Airways",
    alliance: "SkyTeam",
    route: "LIS -> FCO -> JFK",
    source: "Kiwi + Flying Blue",
    cashPrice: 368,
    miles: 36500,
    taxes: 84,
    program: "Flying Blue",
    milesValue: 0.78,
    priceVsAverage: -62,
    priceTrend7d: -17,
    durationMin: 805,
    stops: 1,
    departure: "06:20",
    arrival: "16:55",
    cabin: "Económica",
    baggage: "Mão",
    seatsLeft: 2,
    reliability: 83,
    bookingRedirectSec: 12,
    score: 82,
    badges: ["Erro tarifário", "Preço a descer"],
    scoreBreakdown: { price: 35, time: 14, quality: 15, context: 18 },
  },
  {
    id: "lh-1171",
    airline: "Lufthansa",
    alliance: "Star Alliance",
    route: "LIS -> FRA -> JFK",
    source: "Miles&More",
    cashPrice: 546,
    miles: 26000,
    taxes: 141,
    program: "Miles&More",
    milesValue: 1.56,
    priceVsAverage: -11,
    priceTrend7d: 1,
    durationMin: 620,
    stops: 1,
    departure: "08:45",
    arrival: "14:50",
    cabin: "Premium Economy",
    baggage: "Mão + porão",
    seatsLeft: 6,
    reliability: 97,
    bookingRedirectSec: 5,
    score: 85,
    badges: ["Cabine superior", "Fonte fiável"],
    scoreBreakdown: { price: 28, time: 20, quality: 20, context: 17 },
  },
];

export const priceCalendar: CalendarDay[] = [
  { day: 1, date: "2026-06-01", cashPrice: 512, miles: 36000, level: "high" },
  { day: 2, date: "2026-06-02", cashPrice: 488, miles: 33500, level: "mid" },
  { day: 3, date: "2026-06-03", cashPrice: 451, miles: 32000, level: "mid" },
  { day: 4, date: "2026-06-04", cashPrice: 428, miles: 32500, level: "low" },
  { day: 5, date: "2026-06-05", cashPrice: 392, miles: 28900, level: "low" },
  { day: 6, date: "2026-06-06", cashPrice: 619, miles: 41000, level: "high" },
  { day: 7, date: "2026-06-07", cashPrice: 583, miles: 39000, level: "high" },
  { day: 8, date: "2026-06-08", cashPrice: 468, miles: 33000, level: "mid" },
  { day: 9, date: "2026-06-09", cashPrice: 433, miles: 31000, level: "low" },
  { day: 10, date: "2026-06-10", cashPrice: 421, miles: 30500, level: "low" },
  { day: 11, date: "2026-06-11", cashPrice: 475, miles: 34000, level: "mid" },
  { day: 12, date: "2026-06-12", cashPrice: 536, miles: 37200, level: "high" },
  { day: 13, date: "2026-06-13", cashPrice: 602, miles: 42000, level: "high" },
  { day: 14, date: "2026-06-14", cashPrice: 549, miles: 38000, level: "high" },
  { day: 15, date: "2026-06-15", cashPrice: 417, miles: 30000, level: "low" },
  { day: 16, date: "2026-06-16", cashPrice: 406, miles: 29500, level: "low" },
  { day: 17, date: "2026-06-17", cashPrice: 438, miles: 31500, level: "mid" },
  { day: 18, date: "2026-06-18", cashPrice: 462, miles: 33000, level: "mid" },
  { day: 19, date: "2026-06-19", cashPrice: 521, miles: 36500, level: "high" },
  { day: 20, date: "2026-06-20", cashPrice: 579, miles: 39800, level: "high" },
  { day: 21, date: "2026-06-21", cashPrice: 556, miles: 38600, level: "high" },
  { day: 22, date: "2026-06-22", cashPrice: 431, miles: 30800, level: "low" },
  { day: 23, date: "2026-06-23", cashPrice: 409, miles: 29200, level: "low" },
  { day: 24, date: "2026-06-24", cashPrice: 368, miles: 36500, level: "low" },
  { day: 25, date: "2026-06-25", cashPrice: 442, miles: 31800, level: "mid" },
  { day: 26, date: "2026-06-26", cashPrice: 498, miles: 35400, level: "mid" },
  { day: 27, date: "2026-06-27", cashPrice: 615, miles: 42600, level: "high" },
  { day: 28, date: "2026-06-28", cashPrice: 584, miles: 40100, level: "high" },
  { day: 29, date: "2026-06-29", cashPrice: 444, miles: 31800, level: "mid" },
  { day: 30, date: "2026-06-30", cashPrice: 414, miles: 29900, level: "low" },
];

export const integrations = [
  { name: "Amadeus", type: "Dinheiro", status: "Online", latency: "412 ms", coverage: "92%" },
  { name: "Duffel NDC", type: "Dinheiro", status: "Online", latency: "366 ms", coverage: "76%" },
  { name: "Skyscanner", type: "Dinheiro", status: "Cache quente", latency: "118 ms", coverage: "88%" },
  { name: "Smiles", type: "Milhas", status: "Limitado", latency: "1.8 s", coverage: "54%" },
  { name: "Flying Blue", type: "Milhas", status: "Online", latency: "740 ms", coverage: "71%" },
  { name: "AAdvantage", type: "Milhas", status: "Online", latency: "682 ms", coverage: "69%" },
];

export const destinations = [
  {
    city: "Nova Iorque",
    code: "JFK",
    match: 94,
    cashPrice: 428,
    miles: 32500,
    image:
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=900&q=80",
  },
  {
    city: "Paris",
    code: "CDG",
    match: 89,
    cashPrice: 114,
    miles: 9800,
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80",
  },
  {
    city: "Tóquio",
    code: "HND",
    match: 82,
    cashPrice: 712,
    miles: 61000,
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80",
  },
];

export const plans = [
  {
    name: "Gratuito",
    price: "€0",
    detail: "5 pesquisas/dia",
    features: ["Dinheiro e milhas", "Calendário ±3 dias", "Resultados com origem visível"],
  },
  {
    name: "Explorer",
    price: "€7",
    detail: "por mês",
    featured: true,
    features: ["Pesquisas ilimitadas", "10 alertas ativos", "Histórico de 90 dias"],
  },
  {
    name: "Pro",
    price: "€19",
    detail: "por mês",
    features: ["Alertas ilimitados", "Erro tarifário push", "API 1.000 req/dia"],
  },
  {
    name: "Business",
    price: "Custom",
    detail: "SLA e white-label",
    features: ["API ilimitada", "Widget embutido", "Analytics de parceiros"],
  },
];

export function sortFlightResults(mode: SearchMode, sort: SortMode) {
  return [...flightResults].sort((a, b) => {
    if (sort === "price") {
      return mode === "cash" ? a.cashPrice - b.cashPrice : a.miles + a.taxes * 120 - (b.miles + b.taxes * 120);
    }

    if (sort === "duration") {
      return a.durationMin - b.durationMin;
    }

    return b.score - a.score;
  });
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}
