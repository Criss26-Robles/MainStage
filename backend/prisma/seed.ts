import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedEvent {
  title: string;
  artist: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  department: string;
  price: number;
  image: string;
  description: string;
  availableTickets: number;
  featured: boolean;
  popular: boolean;
  discount: number;
  serviceFeePercent?: number;
  salePhase?: string;
  tags: string[];
}

interface SeedTier {
  name: string;
  price: number;
  available: number;
  description: string;
  sortOrder: number;
}

function buildTiers(basePrice: number, totalAvailable: number): SeedTier[] {
  if (basePrice === 0) {
    return [
      {
        name: 'Entrada libre',
        price: 0,
        available: totalAvailable,
        description: 'Acceso general sin costo',
        sortOrder: 0
      }
    ];
  }

  const round = (n: number) => Math.round(n / 1000) * 1000;
  const general = Math.round(totalAvailable * 0.6);
  const vip = Math.round(totalAvailable * 0.3);
  const palco = Math.max(totalAvailable - general - vip, 0);

  return [
    {
      name: 'General',
      price: basePrice,
      available: general,
      description: 'Acceso a la zona general del evento',
      sortOrder: 0
    },
    {
      name: 'VIP',
      price: round(basePrice * 1.8),
      available: vip,
      description: 'Zona preferencial más cerca del escenario',
      sortOrder: 1
    },
    {
      name: 'Palco Platino',
      price: round(basePrice * 2.5),
      available: palco,
      description: 'Palco exclusivo con la mejor vista y servicio premium',
      sortOrder: 2
    }
  ];
}

const events: SeedEvent[] = [
  {
    title: 'Festival Estéreo Picnic',
    artist: 'Varios Artistas',
    category: 'Festival',
    date: '2026-03-28',
    time: '12:00',
    venue: 'Parque Simón Bolívar',
    city: 'Bogotá',
    department: 'Cundinamarca',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf3852a859?w=800&q=80',
    description:
      'El festival de música alternativa más importante de Colombia. Tres días de rock, electrónica, hip-hop y más en el corazón de Bogotá.',
    availableTickets: 8500,
    featured: true,
    popular: true,
    discount: 20,
    serviceFeePercent: 12,
    tags: ['Música', 'Festival', 'En vivo']
  },
  {
    title: 'Karol G — Mañana Será Bonito Tour',
    artist: 'Karol G',
    category: 'Concierto',
    date: '2026-06-14',
    time: '20:00',
    venue: 'Estadio Atanasio Girardot',
    city: 'Medellín',
    department: 'Antioquia',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    description:
      'La Bichota llega a Medellín con su gira mundial. Una noche épica con los grandes éxitos del reggaetón colombiano.',
    availableTickets: 12000,
    featured: true,
    popular: true,
    discount: 15,
    serviceFeePercent: 10,
    salePhase: 'presale',
    tags: ['Reggaetón', 'Concierto', 'Pop']
  },
  {
    title: 'Festival de Salsa del Pacífico',
    artist: 'Grupo Niche + Joe Arroyo Tribute',
    category: 'Festival',
    date: '2026-08-08',
    time: '19:00',
    venue: 'Teatro Municipal',
    city: 'Cali',
    department: 'Valle del Cauca',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    description:
      'La capital mundial de la salsa celebra su festival anual. Ritmo, sabor y las mejores orquestas del Pacífico colombiano.',
    availableTickets: 1800,
    featured: true,
    popular: true,
    discount: 10,
    tags: ['Salsa', 'Festival', 'Cultura']
  },
  {
    title: 'Carnaval de Barranquilla — Concierto Principal',
    artist: 'Shakira + Artistas Invitados',
    category: 'Festival',
    date: '2026-02-22',
    time: '21:00',
    venue: 'Estadio Metropolitano Roberto Meléndez',
    city: 'Barranquilla',
    department: 'Atlántico',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    description:
      'El evento más esperado del carnaval barranquillero. Música, cultura y la fiesta más grande de Colombia.',
    availableTickets: 22000,
    featured: true,
    popular: true,
    discount: 10,
    serviceFeePercent: 8,
    salePhase: 'presale',
    tags: ['Carnaval', 'Festival', 'Pop']
  },
  {
    title: 'Jazz al Parque Cartagena',
    artist: 'Ensamble Nacional + Invitados',
    category: 'Concierto',
    date: '2026-09-20',
    time: '18:30',
    venue: 'Plaza de la Proclamación',
    city: 'Cartagena',
    department: 'Bolívar',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0f5fbf3f8?w=800&q=80',
    description:
      'Jazz bajo las estrellas en la ciudad amurallada. Una velada íntima con los mejores músicos del país.',
    availableTickets: 900,
    featured: false,
    popular: false,
    discount: 25,
    tags: ['Jazz', 'Al aire libre']
  },
  {
    title: 'Rock al Parque Bucaramanga',
    artist: 'Aterciopelados + Diamante Eléctrico',
    category: 'Concierto',
    date: '2026-07-12',
    time: '16:00',
    venue: 'Parque del Agua',
    city: 'Bucaramanga',
    department: 'Santander',
    price: 0,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c7b0a7ee?w=800&q=80',
    description:
      'El festival de rock gratuito más grande de Colombia llega a la Ciudad Bonita. Entrada libre, música sin límites.',
    availableTickets: 15000,
    featured: false,
    popular: true,
    discount: 0,
    tags: ['Rock', 'Gratis', 'Al aire libre']
  },
  {
    title: 'Festival Frontera Viva',
    artist: 'Varios Artistas',
    category: 'Festival',
    date: '2026-08-15',
    time: '18:00',
    venue: 'Coliseo Julio Torres',
    city: 'Cúcuta',
    department: 'Norte de Santander',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    description:
      'El festival más grande del oriente colombiano. Más de 12 artistas nacionales e internacionales en una sola noche.',
    availableTickets: 3200,
    featured: false,
    popular: false,
    discount: 15,
    tags: ['Música', 'Festival', 'En vivo']
  },
  {
    title: 'Electro Paradise',
    artist: 'Matador + DJ Camilo',
    category: 'Electrónica',
    date: '2026-10-05',
    time: '22:00',
    venue: 'Movistar Arena',
    city: 'Bogotá',
    department: 'Cundinamarca',
    price: 195000,
    image: 'https://images.unsplash.com/photo-1571266025197-6d9a4e4e8b0e?w=800&q=80',
    description:
      'La mejor música electrónica del mundo llega a Bogotá. Producción visual de clase mundial y beats que no paran.',
    availableTickets: 4500,
    featured: true,
    popular: true,
    discount: 25,
    tags: ['Electrónica', 'DJ', 'Noche']
  },
  {
    title: 'Teatro: La Casa de Bernarda Alba',
    artist: 'Compañía Nacional de Teatro',
    category: 'Teatro',
    date: '2026-07-18',
    time: '19:00',
    venue: 'Teatro Colón',
    city: 'Bogotá',
    department: 'Cundinamarca',
    price: 75000,
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80',
    description:
      'Clásico del teatro español en el escenario más emblemático de Colombia. Una producción de talla internacional.',
    availableTickets: 420,
    featured: false,
    popular: false,
    discount: 20,
    tags: ['Teatro', 'Cultura']
  },
  {
    title: 'Comedy Night Colombia',
    artist: 'Ricardo Quevedo + Invitados',
    category: 'Comedia',
    date: '2026-08-22',
    time: '21:00',
    venue: 'Teatro Pablo Tobón Uribe',
    city: 'Medellín',
    department: 'Antioquia',
    price: 89000,
    image: 'https://images.unsplash.com/photo-1585699320311-4f4d7317653f?w=800&q=80',
    description:
      'Los mejores comediantes de Colombia en una noche de risas sin filtro. Humor inteligente y entretenimiento garantizado.',
    availableTickets: 650,
    featured: false,
    popular: true,
    discount: 30,
    tags: ['Comedia', 'Stand-up']
  },
  {
    title: 'Festival Iberoamericano de Teatro',
    artist: 'Compañías Internacionales',
    category: 'Teatro',
    date: '2026-04-10',
    time: '17:00',
    venue: 'Teatro Mayor Julio Mario Santo Domingo',
    city: 'Bogotá',
    department: 'Cundinamarca',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&q=80',
    description:
      'El festival de teatro más importante de América Latina. Obras de compañías de más de 20 países.',
    availableTickets: 2100,
    featured: false,
    popular: false,
    discount: 15,
    tags: ['Teatro', 'Internacional', 'Cultura']
  },
  {
    title: 'Vallenato Legendario',
    artist: 'Carlos Vives + Diomedes Díaz Tribute',
    category: 'Concierto',
    date: '2026-05-30',
    time: '20:30',
    venue: 'Coliseo Centenario',
    city: 'Santa Marta',
    department: 'Magdalena',
    price: 110000,
    image: 'https://images.unsplash.com/photo-1429962710814-755aa28af963?w=800&q=80',
    description:
      'Un homenaje al vallenato en la tierra donde nació el género. Noche mágica en la costa caribeña.',
    availableTickets: 2800,
    featured: false,
    popular: true,
    discount: 12,
    tags: ['Vallenato', 'Caribe', 'Concierto']
  },
  {
    title: 'Noche de Museos — Bogotá',
    artist: 'Museo del Oro + Museo Nacional',
    category: 'Museo',
    date: '2026-11-15',
    time: '18:00',
    venue: 'Museo del Oro',
    city: 'Bogotá',
    department: 'Cundinamarca',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654fef3?w=800&q=80',
    description:
      'Recorridos nocturnos guiados por los museos más emblemáticos de la capital. Arte, historia y cultura en una sola noche.',
    availableTickets: 800,
    featured: false,
    popular: false,
    discount: 40,
    tags: ['Museo', 'Cultura', 'Arte']
  },
  {
    title: 'Exposición Botero — Medellín',
    artist: 'Museo de Antioquia',
    category: 'Museo',
    date: '2026-09-05',
    time: '10:00',
    venue: 'Museo de Antioquia',
    city: 'Medellín',
    department: 'Antioquia',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
    description:
      'Exposición especial de Fernando Botero con obras inéditas. Una experiencia cultural imperdible en la Plaza Botero.',
    availableTickets: 1200,
    featured: false,
    popular: false,
    discount: 35,
    tags: ['Museo', 'Arte', 'Exposición']
  }
];

const venues: Prisma.VenueCreateManyInput[] = [
  {
    name: 'Movistar Arena',
    city: 'Bogotá',
    department: 'Cundinamarca',
    capacity: 14000,
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    description: 'El escenario indoor más moderno de Latinoamérica.',
    eventCount: 48
  },
  {
    name: 'Estadio Atanasio Girardot',
    city: 'Medellín',
    department: 'Antioquia',
    capacity: 45000,
    image: 'https://images.unsplash.com/photo-1429962710814-755aa28af963?w=800&q=80',
    description: 'Templo del fútbol y los mega conciertos paisa.',
    eventCount: 32
  },
  {
    name: 'Parque Simón Bolívar',
    city: 'Bogotá',
    department: 'Cundinamarca',
    capacity: 80000,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf3852a859?w=800&q=80',
    description: 'Epicentro de festivales masivos en la capital.',
    eventCount: 24
  },
  {
    name: 'Teatro Colón',
    city: 'Bogotá',
    department: 'Cundinamarca',
    capacity: 1500,
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80',
    description: 'Patrimonio cultural y escenario de artes escénicas.',
    eventCount: 56
  },
  {
    name: 'Estadio Metropolitano',
    city: 'Barranquilla',
    department: 'Atlántico',
    capacity: 46000,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    description: 'Casa del carnaval y grandes shows caribeños.',
    eventCount: 18
  },
  {
    name: 'Teatro Pablo Tobón Uribe',
    city: 'Medellín',
    department: 'Antioquia',
    capacity: 1100,
    image: 'https://images.unsplash.com/photo-1585699320311-4f4d7317653f?w=800&q=80',
    description: 'Referente del teatro y la comedia en Antioquia.',
    eventCount: 41
  }
];

async function main() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "OrderItem", "Order", "TicketTier", "PriceHistory", "Event", "Venue" RESTART IDENTITY CASCADE'
  );

  for (const event of events) {
    const tiers = buildTiers(event.price, event.availableTickets);
    const price = Math.min(...tiers.map((t) => t.price));
    const availableTickets = tiers.reduce((sum, t) => sum + t.available, 0);

    const created = await prisma.event.create({
      data: {
        ...event,
        serviceFeePercent: event.serviceFeePercent ?? 10,
        salePhase: event.salePhase ?? 'general',
        price,
        availableTickets,
        tiers: { create: tiers }
      }
    });

    if (event.title === 'Festival Estéreo Picnic') {
      await prisma.priceHistory.create({
        data: {
          eventId: created.id,
          oldPrice: Math.round(price * 1.15),
          newPrice: price,
          reason: 'Ajuste por demanda inicial — precio reducido para venta temprana'
        }
      });
    }
  }

  await prisma.venue.createMany({ data: venues });

  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@mainstage.co' },
    update: { presaleAccess: true },
    create: {
      name: 'Administrador',
      email: 'admin@mainstage.co',
      password: passwordHash,
      role: 'admin',
      presaleAccess: true
    }
  });

  const memberHash = await bcrypt.hash('member123', 10);
  await prisma.user.upsert({
    where: { email: 'member@mainstage.co' },
    update: { presaleAccess: true },
    create: {
      name: 'Miembro Preventa',
      email: 'member@mainstage.co',
      password: memberHash,
      role: 'user',
      presaleAccess: true
    }
  });

  console.log(
    `Seed completado: ${events.length} eventos, ${venues.length} escenarios, admin y member@mainstage.co (preventa).`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
