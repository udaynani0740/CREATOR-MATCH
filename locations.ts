export interface CountryLocationData {
  country: string;
  flag: string;
  states: {
    [stateName: string]: string[];
  };
}

export const WORLD_LOCATIONS: CountryLocationData[] = [
  {
    country: 'United States',
    flag: '🇺🇸',
    states: {
      California: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Oakland', 'Palo Alto', 'Stanford'],
      'New York': ['New York', 'Brooklyn', 'Manhattan', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
      Texas: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington'],
      Washington: ['Seattle', 'Bellevue', 'Tacoma', 'Spokane', 'Olympia', 'Vancouver'],
      Florida: ['Miami', 'Orlando', 'Tampa', 'Fort Lauderdale', 'Jacksonville', 'St. Petersburg'],
      Illinois: ['Chicago', 'Naperville', 'Evanston', 'Springfield', 'Peoria', 'Rockford'],
      Massachusetts: ['Boston', 'Cambridge', 'Worcester', 'Somerville', 'Quincy'],
      Georgia: ['Atlanta', 'Savannah', 'Athens', 'Alpharetta', 'Decatur'],
      Colorado: ['Denver', 'Boulder', 'Colorado Springs', 'Fort Collins', 'Aurora'],
      Tennessee: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga'],
      Oregon: ['Portland', 'Eugene', 'Bend', 'Salem'],
      Arizona: ['Phoenix', 'Scottsdale', 'Tucson', 'Tempe', 'Mesa'],
      Nevada: ['Las Vegas', 'Reno', 'Henderson', 'Carson City'],
      'District of Columbia': ['Washington, D.C.'],
      'North Carolina': ['Charlotte', 'Raleigh', 'Durham', 'Asheville'],
      Pennsylvania: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Lancaster'],
    },
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    states: {
      England: ['London', 'Manchester', 'Birmingham', 'Bristol', 'Leeds', 'Liverpool', 'Oxford', 'Cambridge', 'Newcastle', 'Brighton'],
      Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'],
      Wales: ['Cardiff', 'Swansea', 'Newport', 'Bangor'],
      'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Armagh'],
    },
  },
  {
    country: 'Canada',
    flag: '🇨🇦',
    states: {
      Ontario: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Waterloo', 'Markham'],
      'British Columbia': ['Vancouver', 'Victoria', 'Burnaby', 'Surrey', 'Richmond', 'Kelowna'],
      Quebec: ['Montreal', 'Quebec City', 'Laval', 'Gatineau'],
      Alberta: ['Calgary', 'Edmonton', 'Banff', 'Red Deer'],
      Manitoba: ['Winnipeg', 'Brandon'],
      'Nova Scotia': ['Halifax', 'Dartmouth', 'Sydney'],
    },
  },
  {
    country: 'India',
    flag: '🇮🇳',
    states: {
      Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
      Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'],
      Delhi: ['New Delhi', 'Delhi', 'Dwarka', 'Saket'],
      Haryana: ['Gurugram', 'Faridabad', 'Panchkula'],
      'Uttar Pradesh': ['Noida', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra'],
      Telangana: ['Hyderabad', 'Warangal', 'Secunderabad'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
      'West Bengal': ['Kolkata', 'Siliguri', 'Howrah', 'Durgapur'],
      Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
      Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'],
      Punjab: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Mohali'],
      Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota'],
    },
  },
  {
    country: 'Australia',
    flag: '🇦🇺',
    states: {
      'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Byron Bay'],
      Victoria: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
      Queensland: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Cairns'],
      'Western Australia': ['Perth', 'Fremantle', 'Bunbury'],
      'South Australia': ['Adelaide', 'Mount Gambier'],
      'Australian Capital Territory': ['Canberra'],
    },
  },
  {
    country: 'Germany',
    flag: '🇩🇪',
    states: {
      Berlin: ['Berlin'],
      Bavaria: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
      'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn'],
      Hamburg: ['Hamburg'],
      Hesse: ['Frankfurt', 'Wiesbaden', 'Kassel'],
      'Baden-Württemberg': ['Stuttgart', 'Heidelberg', 'Karlsruhe', 'Freiburg'],
      Saxony: ['Leipzig', 'Dresden'],
    },
  },
  {
    country: 'France',
    flag: '🇫🇷',
    states: {
      'Île-de-France': ['Paris', 'Boulogne-Billancourt', 'Versailles', 'Montreuil'],
      'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne', 'Annecy'],
      'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice', 'Cannes', 'Aix-en-Provence'],
      'Nouvelle-Aquitaine': ['Bordeaux', 'Limoges', 'Poitiers', 'Biarritz'],
      Occitanie: ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan'],
    },
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    states: {
      Tokyo: ['Tokyo', 'Shibuya', 'Shinjuku', 'Roppongi', 'Akihabara', 'Ginza'],
      Osaka: ['Osaka', 'Umeda', 'Namba', 'Sakai'],
      Kyoto: ['Kyoto', 'Uji'],
      Kanagawa: ['Yokohama', 'Kawasaki', 'Kamakura'],
      Hokkaido: ['Sapporo', 'Hakodate', 'Otaru'],
      Aichi: ['Nagoya', 'Toyota'],
      Fukuoka: ['Fukuoka', 'Kitakyushu'],
    },
  },
  {
    country: 'Brazil',
    flag: '🇧🇷',
    states: {
      'São Paulo': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'],
      'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Petrópolis'],
      'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Ouro Preto'],
      Paraná: ['Curitiba', 'Londrina', 'Maringá'],
      Bahia: ['Salvador', 'Feira de Santana'],
      'Distrito Federal': ['Brasília'],
    },
  },
  {
    country: 'Netherlands',
    flag: '🇳🇱',
    states: {
      'North Holland': ['Amsterdam', 'Haarlem', 'Hilversum', 'Alkmaar'],
      'South Holland': ['Rotterdam', 'The Hague', 'Leiden', 'Delft'],
      Utrecht: ['Utrecht', 'Amersfoort'],
      'North Brabant': ['Eindhoven', 'Tilburg', 'Breda', '\'s-Hertogenbosch'],
    },
  },
  {
    country: 'Spain',
    flag: '🇪🇸',
    states: {
      Madrid: ['Madrid', 'Getafe', 'Alcalá de Henares'],
      Catalonia: ['Barcelona', 'Girona', 'Tarragona', 'Lleida'],
      Andalusia: ['Seville', 'Málaga', 'Granada', 'Córdoba'],
      Valencia: ['Valencia', 'Alicante', 'Castellón'],
      Basque: ['Bilbao', 'San Sebastián', 'Vitoria-Gasteiz'],
    },
  },
  {
    country: 'Italy',
    flag: '🇮🇹',
    states: {
      Lombardy: ['Milan', 'Bergamo', 'Brescia', 'Como'],
      Lazio: ['Rome', 'Latina', 'Viterbo'],
      Tuscany: ['Florence', 'Pisa', 'Siena', 'Lucca'],
      Piedmont: ['Turin', 'Novara'],
      Veneto: ['Venice', 'Verona', 'Padua'],
    },
  },
  {
    country: 'Singapore',
    flag: '🇸🇬',
    states: {
      'Singapore District': ['Singapore Downtown', 'Marina Bay', 'Orchard', 'Jurong', 'Tampines', 'Woodlands'],
    },
  },
  {
    country: 'South Korea',
    flag: '🇰🇷',
    states: {
      Seoul: ['Seoul', 'Gangnam', 'Hongdae', 'Mapo', 'Yongsan'],
      Gyeonggi: ['Suwon', 'Seongnam', 'Goyang', 'Yongin'],
      Busan: ['Busan', 'Haeundae'],
      Incheon: ['Incheon', 'Songdo'],
    },
  },
  {
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    states: {
      Dubai: ['Dubai', 'Downtown Dubai', 'Dubai Marina', 'Business Bay'],
      'Abu Dhabi': ['Abu Dhabi', 'Al Ain', 'Yas Island'],
      Sharjah: ['Sharjah'],
    },
  },
  {
    country: 'Mexico',
    flag: '🇲🇽',
    states: {
      'Mexico City': ['Mexico City', 'Polanco', 'Condesa', 'Roma'],
      Jalisco: ['Guadalajara', 'Zapopan', 'Puerto Vallarta'],
      'Nuevo León': ['Monterrey', 'San Pedro Garza García'],
      'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Tulum'],
    },
  },
  {
    country: 'Sweden',
    flag: '🇸🇪',
    states: {
      'Stockholm County': ['Stockholm', 'Solna', 'Södertälje'],
      'Västra Götaland': ['Gothenburg', 'Borås'],
      Skåne: ['Malmö', 'Lund', 'Helsingborg'],
    },
  },
  {
    country: 'Switzerland',
    flag: '🇨🇭',
    states: {
      Zurich: ['Zurich', 'Winterthur'],
      Geneva: ['Geneva'],
      Vaud: ['Lausanne', 'Montreux'],
      'Basel-Stadt': ['Basel'],
    },
  },
  {
    country: 'Ireland',
    flag: '🇮🇪',
    states: {
      Leinster: ['Dublin', 'Dundalk', 'Kilkenny'],
      Munster: ['Cork', 'Limerick', 'Waterford', 'Killarney'],
      Connacht: ['Galway', 'Sligo'],
    },
  },
];

export function getCountriesList(): { name: string; flag: string }[] {
  return WORLD_LOCATIONS.map((loc) => ({ name: loc.country, flag: loc.flag }));
}

export function getStatesForCountry(countryName: string): string[] {
  const match = WORLD_LOCATIONS.find(
    (loc) => loc.country.toLowerCase() === countryName.toLowerCase()
  );
  if (!match) return [];
  return Object.keys(match.states).sort();
}

export function getCitiesForState(countryName: string, stateName: string): string[] {
  const match = WORLD_LOCATIONS.find(
    (loc) => loc.country.toLowerCase() === countryName.toLowerCase()
  );
  if (!match) return [];
  const cities = match.states[stateName];
  return cities ? [...cities].sort() : [];
}

export function getAllCitiesForCountry(countryName: string): string[] {
  const match = WORLD_LOCATIONS.find(
    (loc) => loc.country.toLowerCase() === countryName.toLowerCase()
  );
  if (!match) return [];
  const citySet = new Set<string>();
  Object.values(match.states).forEach((cities) => {
    cities.forEach((c) => citySet.add(c));
  });
  return Array.from(citySet).sort();
}

export function getFlagForCountry(countryName: string): string {
  const match = WORLD_LOCATIONS.find(
    (loc) => loc.country.toLowerCase() === countryName.toLowerCase()
  );
  return match ? match.flag : '🌐';
}
