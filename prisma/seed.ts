import { config } from 'dotenv';
import { PrismaClient, UserRole, CompanyKind, JobStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create SUPER_ADMIN user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      role: UserRole.SUPER_ADMIN,
      password: adminPassword
    }
  });
  console.log('✅ Created SUPER_ADMIN:', admin.email);

  // Create ACCOUNTANT user
  const accountantPassword = await bcrypt.hash('accountant123', 10);
  const accountant = await prisma.user.upsert({
    where: { email: 'accountant@example.com' },
    update: {},
    create: {
      email: 'accountant@example.com',
      role: UserRole.ACCOUNTANT,
      password: accountantPassword
    }
  });
  console.log('✅ Created ACCOUNTANT:', accountant.email);

  // Create test DRIVER users
  const driverPin = await bcrypt.hash('1234', 10);
  const driver1 = await prisma.user.upsert({
    where: { phone: '+971501234567' },
    update: {
      name: 'Ahmed Hassan',
      vehiclePlate: 'ABC123'
    },
    create: {
      phone: '+971501234567',
      role: UserRole.DRIVER,
      pinHash: driverPin,
      pinTemp: true, // Temporary PIN - driver must change on first login
      name: 'Ahmed Hassan',
      vehiclePlate: 'ABC123'
    }
  });
  console.log('✅ Created DRIVER:', driver1.phone, `(${driver1.name})`);

  const driver2 = await prisma.user.upsert({
    where: { phone: '+971507654321' },
    update: {
      name: 'Mohammed Ali',
      vehiclePlate: 'XYZ789'
    },
    create: {
      phone: '+971507654321',
      role: UserRole.DRIVER,
      pinHash: await bcrypt.hash('5678', 10),
      pinTemp: false, // Permanent PIN
      name: 'Mohammed Ali',
      vehiclePlate: 'XYZ789'
    }
  });
  console.log('✅ Created DRIVER:', driver2.phone, `(${driver2.name})`);

  // Create master vehicle categories
  const categories = [
    { name: 'Sedan', sortOrder: 1 },
    { name: 'SUV / 4x4', sortOrder: 2 },
    { name: 'Luxury Car', sortOrder: 3 },
    { name: 'Economy Car', sortOrder: 4 },
    { name: 'Van / Mini Bus', sortOrder: 5 },
    { name: 'Coaster Bus', sortOrder: 6 },
    { name: 'Sports Car', sortOrder: 7 },
    { name: 'Limousine', sortOrder: 8 },
    { name: 'Hybrid', sortOrder: 9 },
    { name: 'Electric', sortOrder: 10 },
    { name: 'Pickup Truck', sortOrder: 11 },
    { name: 'Station Wagon', sortOrder: 12 },
    { name: 'Hatchback', sortOrder: 13 },
    { name: 'MPV', sortOrder: 14 },
    { name: 'Custom/Special', sortOrder: 99, isCustom: true }
  ];

  for (const category of categories) {
    await prisma.vehicleCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }
  console.log('✅ Created vehicle categories:', categories.length);

  // Create master vehicle brands
  const brands = [
    // Popular brands (UAE market)
    { name: 'Toyota', isPopular: true, sortOrder: 1 },
    { name: 'Nissan', isPopular: true, sortOrder: 2 },
    { name: 'Honda', isPopular: true, sortOrder: 3 },
    { name: 'Mazda', isPopular: true, sortOrder: 4 },
    { name: 'Mitsubishi', isPopular: true, sortOrder: 5 },
    { name: 'Hyundai', isPopular: true, sortOrder: 6 },
    { name: 'Kia', isPopular: true, sortOrder: 7 },
    { name: 'Chevrolet', isPopular: true, sortOrder: 8 },
    { name: 'Ford', isPopular: true, sortOrder: 9 },
    { name: 'Mercedes-Benz', isPopular: true, sortOrder: 10 },
    { name: 'BMW', isPopular: true, sortOrder: 11 },
    { name: 'Audi', isPopular: true, sortOrder: 12 },
    { name: 'Lexus', isPopular: true, sortOrder: 13 },
    { name: 'Land Rover', isPopular: true, sortOrder: 14 },
    { name: 'Range Rover', isPopular: true, sortOrder: 15 },
    // Other brands
    { name: 'Volkswagen', sortOrder: 20 },
    { name: 'Peugeot', sortOrder: 21 },
    { name: 'Renault', sortOrder: 22 },
    { name: 'Jeep', sortOrder: 23 },
    { name: 'Dodge', sortOrder: 24 },
    { name: 'GMC', sortOrder: 25 },
    { name: 'Cadillac', sortOrder: 26 },
    { name: 'Porsche', sortOrder: 27 },
    { name: 'Jaguar', sortOrder: 28 },
    { name: 'Volvo', sortOrder: 29 },
    { name: 'Infiniti', sortOrder: 30 },
    { name: 'Genesis', sortOrder: 31 },
    { name: 'Tesla', sortOrder: 32 },
    { name: 'BYD', sortOrder: 33 },
    { name: 'MG', sortOrder: 34 },
    { name: 'Suzuki', sortOrder: 35 },
    { name: 'Subaru', sortOrder: 36 },
    { name: 'Isuzu', sortOrder: 37 },
    { name: 'Fiat', sortOrder: 38 },
    { name: 'Other', sortOrder: 99 }
  ];

  for (const brand of brands) {
    await prisma.vehicleBrand.upsert({
      where: { name: brand.name },
      update: {},
      create: brand
    });
  }
  console.log('✅ Created vehicle brands:', brands.length);

  // Create master vehicle models
  const models = [
    // Toyota models
    {
      name: 'Camry',
      brandName: 'Toyota',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Corolla',
      brandName: 'Toyota',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'Land Cruiser',
      brandName: 'Toyota',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'Prado',
      brandName: 'Toyota',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 4
    },
    {
      name: 'Fortuner',
      brandName: 'Toyota',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 5
    },
    {
      name: 'Yaris',
      brandName: 'Toyota',
      category: 'Hatchback',
      isPopular: true,
      sortOrder: 6
    },
    {
      name: 'Hilux',
      brandName: 'Toyota',
      category: 'Pickup Truck',
      isPopular: true,
      sortOrder: 7
    },
    {
      name: 'RAV4',
      brandName: 'Toyota',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 8
    },
    { name: 'Avalon', brandName: 'Toyota', category: 'Sedan', sortOrder: 9 },
    {
      name: 'Hiace',
      brandName: 'Toyota',
      category: 'Van / Mini Bus',
      sortOrder: 10
    },

    // Nissan models
    {
      name: 'Altima',
      brandName: 'Nissan',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Patrol',
      brandName: 'Nissan',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'X-Trail',
      brandName: 'Nissan',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'Pathfinder',
      brandName: 'Nissan',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 4
    },
    {
      name: 'Maxima',
      brandName: 'Nissan',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 5
    },
    {
      name: 'Sunny',
      brandName: 'Nissan',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 6
    },
    { name: 'Kicks', brandName: 'Nissan', category: 'SUV / 4x4', sortOrder: 7 },
    {
      name: 'Armada',
      brandName: 'Nissan',
      category: 'SUV / 4x4',
      sortOrder: 8
    },

    // Honda models
    {
      name: 'Accord',
      brandName: 'Honda',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Civic',
      brandName: 'Honda',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'CR-V',
      brandName: 'Honda',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'HR-V',
      brandName: 'Honda',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 4
    },
    {
      name: 'City',
      brandName: 'Honda',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 5
    },
    { name: 'Pilot', brandName: 'Honda', category: 'SUV / 4x4', sortOrder: 6 },

    // BMW models
    {
      name: 'X5',
      brandName: 'BMW',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'X6',
      brandName: 'BMW',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'X7',
      brandName: 'BMW',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: '5 Series',
      brandName: 'BMW',
      category: 'Luxury Car',
      isPopular: true,
      sortOrder: 4
    },
    {
      name: '7 Series',
      brandName: 'BMW',
      category: 'Luxury Car',
      isPopular: true,
      sortOrder: 5
    },
    {
      name: '3 Series',
      brandName: 'BMW',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 6
    },
    { name: 'X3', brandName: 'BMW', category: 'SUV / 4x4', sortOrder: 7 },
    { name: 'X1', brandName: 'BMW', category: 'SUV / 4x4', sortOrder: 8 },

    // Mercedes-Benz models
    {
      name: 'S-Class',
      brandName: 'Mercedes-Benz',
      category: 'Luxury Car',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'E-Class',
      brandName: 'Mercedes-Benz',
      category: 'Luxury Car',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'C-Class',
      brandName: 'Mercedes-Benz',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'GLE',
      brandName: 'Mercedes-Benz',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 4
    },
    {
      name: 'GLS',
      brandName: 'Mercedes-Benz',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 5
    },
    {
      name: 'G-Class',
      brandName: 'Mercedes-Benz',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 6
    },
    {
      name: 'GLC',
      brandName: 'Mercedes-Benz',
      category: 'SUV / 4x4',
      sortOrder: 7
    },
    {
      name: 'A-Class',
      brandName: 'Mercedes-Benz',
      category: 'Sedan',
      sortOrder: 8
    },

    // Audi models
    {
      name: 'Q7',
      brandName: 'Audi',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Q8',
      brandName: 'Audi',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'A6',
      brandName: 'Audi',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'A8',
      brandName: 'Audi',
      category: 'Luxury Car',
      isPopular: true,
      sortOrder: 4
    },
    {
      name: 'Q5',
      brandName: 'Audi',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 5
    },
    { name: 'A4', brandName: 'Audi', category: 'Sedan', sortOrder: 6 },
    { name: 'Q3', brandName: 'Audi', category: 'SUV / 4x4', sortOrder: 7 },

    // Lexus models
    {
      name: 'LX',
      brandName: 'Lexus',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'RX',
      brandName: 'Lexus',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'ES',
      brandName: 'Lexus',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'LS',
      brandName: 'Lexus',
      category: 'Luxury Car',
      isPopular: true,
      sortOrder: 4
    },
    { name: 'NX', brandName: 'Lexus', category: 'SUV / 4x4', sortOrder: 5 },
    { name: 'UX', brandName: 'Lexus', category: 'SUV / 4x4', sortOrder: 6 },

    // Land Rover / Range Rover models
    {
      name: 'Range Rover',
      brandName: 'Range Rover',
      category: 'Luxury Car',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Range Rover Sport',
      brandName: 'Range Rover',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'Range Rover Evoque',
      brandName: 'Range Rover',
      category: 'SUV / 4x4',
      sortOrder: 3
    },
    {
      name: 'Discovery',
      brandName: 'Land Rover',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Defender',
      brandName: 'Land Rover',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },

    // Ford models
    {
      name: 'Explorer',
      brandName: 'Ford',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Expedition',
      brandName: 'Ford',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'F-150',
      brandName: 'Ford',
      category: 'Pickup Truck',
      isPopular: true,
      sortOrder: 3
    },
    { name: 'Edge', brandName: 'Ford', category: 'SUV / 4x4', sortOrder: 4 },
    {
      name: 'Mustang',
      brandName: 'Ford',
      category: 'Sports Car',
      sortOrder: 5
    },

    // Hyundai models
    {
      name: 'Tucson',
      brandName: 'Hyundai',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Santa Fe',
      brandName: 'Hyundai',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'Sonata',
      brandName: 'Hyundai',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'Elantra',
      brandName: 'Hyundai',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 4
    },
    { name: 'Accent', brandName: 'Hyundai', category: 'Sedan', sortOrder: 5 },
    {
      name: 'Palisade',
      brandName: 'Hyundai',
      category: 'SUV / 4x4',
      sortOrder: 6
    },

    // Kia models
    {
      name: 'Sportage',
      brandName: 'Kia',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Sorento',
      brandName: 'Kia',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'Optima',
      brandName: 'Kia',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'Cerato',
      brandName: 'Kia',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 4
    },
    {
      name: 'Telluride',
      brandName: 'Kia',
      category: 'SUV / 4x4',
      sortOrder: 5
    },
    { name: 'Carnival', brandName: 'Kia', category: 'MPV', sortOrder: 6 },

    // Mazda models
    {
      name: 'CX-5',
      brandName: 'Mazda',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'CX-9',
      brandName: 'Mazda',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'Mazda6',
      brandName: 'Mazda',
      category: 'Sedan',
      isPopular: true,
      sortOrder: 3
    },
    { name: 'Mazda3', brandName: 'Mazda', category: 'Sedan', sortOrder: 4 },
    { name: 'CX-30', brandName: 'Mazda', category: 'SUV / 4x4', sortOrder: 5 },

    // Mitsubishi models
    {
      name: 'Pajero',
      brandName: 'Mitsubishi',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Outlander',
      brandName: 'Mitsubishi',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'Montero Sport',
      brandName: 'Mitsubishi',
      category: 'SUV / 4x4',
      sortOrder: 3
    },
    {
      name: 'Lancer',
      brandName: 'Mitsubishi',
      category: 'Sedan',
      sortOrder: 4
    },

    // Chevrolet models
    {
      name: 'Tahoe',
      brandName: 'Chevrolet',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Suburban',
      brandName: 'Chevrolet',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'Silverado',
      brandName: 'Chevrolet',
      category: 'Pickup Truck',
      sortOrder: 3
    },
    {
      name: 'Traverse',
      brandName: 'Chevrolet',
      category: 'SUV / 4x4',
      sortOrder: 4
    },

    // GMC models
    {
      name: 'Yukon',
      brandName: 'GMC',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Sierra',
      brandName: 'GMC',
      category: 'Pickup Truck',
      isPopular: true,
      sortOrder: 2
    },
    { name: 'Acadia', brandName: 'GMC', category: 'SUV / 4x4', sortOrder: 3 },

    // Porsche models
    {
      name: 'Cayenne',
      brandName: 'Porsche',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Macan',
      brandName: 'Porsche',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: '911',
      brandName: 'Porsche',
      category: 'Sports Car',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'Panamera',
      brandName: 'Porsche',
      category: 'Luxury Car',
      sortOrder: 4
    },

    // Dodge models
    {
      name: 'Durango',
      brandName: 'Dodge',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    { name: 'Charger', brandName: 'Dodge', category: 'Sedan', sortOrder: 2 },
    {
      name: 'Challenger',
      brandName: 'Dodge',
      category: 'Sports Car',
      sortOrder: 3
    },

    // Jeep models
    {
      name: 'Grand Cherokee',
      brandName: 'Jeep',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Wrangler',
      brandName: 'Jeep',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 2
    },
    { name: 'Compass', brandName: 'Jeep', category: 'SUV / 4x4', sortOrder: 3 },

    // Cadillac models
    {
      name: 'Escalade',
      brandName: 'Cadillac',
      category: 'SUV / 4x4',
      isPopular: true,
      sortOrder: 1
    },
    { name: 'XT5', brandName: 'Cadillac', category: 'SUV / 4x4', sortOrder: 2 },

    // Tesla models
    {
      name: 'Model S',
      brandName: 'Tesla',
      category: 'Electric',
      isPopular: true,
      sortOrder: 1
    },
    {
      name: 'Model 3',
      brandName: 'Tesla',
      category: 'Electric',
      isPopular: true,
      sortOrder: 2
    },
    {
      name: 'Model X',
      brandName: 'Tesla',
      category: 'Electric',
      isPopular: true,
      sortOrder: 3
    },
    {
      name: 'Model Y',
      brandName: 'Tesla',
      category: 'Electric',
      isPopular: true,
      sortOrder: 4
    }
  ];

  for (const model of models) {
    await prisma.vehicleModel.upsert({
      where: {
        name_brandName: {
          name: model.name,
          brandName: model.brandName
        }
      },
      update: {},
      create: model
    });
  }
  console.log('✅ Created vehicle models:', models.length);

  // Create sample clients
  const client1 = await prisma.company.create({
    data: {
      kind: CompanyKind.CLIENT,
      name: 'ABC Travel Agency',
      phone: '+971412345678',
      contacts: {
        create: [
          {
            phone: '+971412345678',
            email: 'contact@abctravel.com'
          }
        ]
      }
    }
  });

  const client2 = await prisma.company.create({
    data: {
      kind: CompanyKind.CLIENT,
      name: 'XYZ Tours',
      phone: '+971422345678',
      contacts: {
        create: [
          {
            phone: '+971422345678',
            email: 'info@xyztours.com'
          }
        ]
      }
    }
  });

  console.log('✅ Created clients:', client1.name, client2.name);

  // Create sample suppliers
  const supplier1 = await prisma.company.create({
    data: {
      kind: CompanyKind.SUPPLIER,
      name: 'Premium Transport LLC',
      phone: '+971433345678',
      contacts: {
        create: [
          {
            phone: '+971433345678',
            email: 'contact@premiumtransport.com'
          }
        ]
      },
      supplierCategories: {
        create: [
          {
            category: 'Sedan',
            vehicleCount: 5
          },
          {
            category: 'SUV',
            vehicleCount: 3
          }
        ]
      },
      supplierVehicles: {
        create: [
          {
            category: 'Sedan',
            regNumber: 'DXB-1234',
            model: 'Toyota Camry'
          },
          {
            category: 'Sedan',
            regNumber: 'DXB-1235',
            model: 'Honda Accord'
          },
          {
            category: 'SUV',
            regNumber: 'DXB-2234',
            model: 'Toyota Land Cruiser'
          }
        ]
      }
    }
  });

  const supplier2 = await prisma.company.create({
    data: {
      kind: CompanyKind.SUPPLIER,
      name: 'Elite Car Services',
      phone: '+971444445678',
      contacts: {
        create: [
          {
            phone: '+971444445678',
            email: 'info@elitecars.com'
          }
        ]
      },
      supplierCategories: {
        create: [
          {
            category: 'Luxury',
            vehicleCount: 2
          }
        ]
      },
      supplierVehicles: {
        create: [
          {
            category: 'Luxury',
            regNumber: 'DXB-9999',
            model: 'Mercedes S-Class'
          }
        ]
      }
    }
  });

  console.log('✅ Created suppliers:', supplier1.name, supplier2.name);

  // Create OWN_FLEET company
  const ownFleet = await prisma.company.create({
    data: {
      kind: CompanyKind.OWN_FLEET,
      name: 'Own Company',
      phone: '+971455555678'
    }
  });
  console.log('✅ Created OWN_FLEET:', ownFleet.name);

  // Create sample jobs
  const job1 = await prisma.job.create({
    data: {
      clientId: client1.id,
      supplierId: supplier1.id,
      guestName: 'John Doe',
      numberOfAdults: 2,
      guestContact: '+971501111111',
      pickup: 'Dubai Airport Terminal 1',
      drop: 'Burj Al Arab Hotel',
      flight: 'EK 201',
      pickupTime: '10:30 AM',
      category: 'Sedan',
      vehicleModel: 'Toyota Camry',
      vehicle: 'DXB-1234',
      status: JobStatus.IN_POOL,
      price: 150.0,
      taxAmount: 7.5,
      totalAmount: 157.5,
      driverName: 'Premium Transport LLC',
      remarks: 'VIP guest, please be on time',
      enteredBy: admin.email,
      jobLogs: {
        create: [
          {
            actorId: admin.id,
            action: 'CREATED',
            notes: 'Job created by admin'
          }
        ]
      }
    }
  });

  const job2 = await prisma.job.create({
    data: {
      clientId: client2.id,
      supplierId: supplier2.id,
      guestName: 'Jane Smith',
      numberOfAdults: 3,
      guestContact: '+971502222222',
      pickup: 'Dubai Marina',
      drop: 'Dubai Airport Terminal 3',
      flight: 'EK 305',
      pickupTime: '2:00 PM',
      category: 'Luxury',
      vehicleModel: 'Mercedes S-Class',
      vehicle: 'DXB-9999',
      status: JobStatus.ASSIGNED,
      price: 300.0,
      taxAmount: 15.0,
      totalAmount: 315.0,
      driverName: 'Elite Car Services',
      assignedPlate: 'DXB-9999',
      remarks: 'Airport pickup, flight arrival time confirmed',
      enteredBy: admin.email,
      jobLogs: {
        create: [
          {
            actorId: admin.id,
            action: 'Job created',
            notes: 'Initial job creation'
          },
          {
            actorId: admin.id,
            action: 'Status updated',
            notes: 'Changed status from IN_POOL to ASSIGNED'
          }
        ]
      }
    }
  });

  // Create a job for own company
  const job3 = await prisma.job.create({
    data: {
      clientId: client1.id,
      supplierId: ownFleet.id,
      guestName: 'Mohammed Ali',
      numberOfAdults: 4,
      guestContact: '+971503333333',
      pickup: 'Terminal 2',
      drop: 'Jumeirah Beach',
      flight: 'FZ 50',
      pickupTime: '11:45 AM',
      category: 'MINI BUS',
      vehicleModel: 'MINI BUS',
      vehicle: 'DXB-5555',
      status: JobStatus.ASSIGNED,
      price: 200.0,
      taxAmount: 10.0,
      totalAmount: 210.0,
      driverName: 'Ahmed Hassan (DXB-5555)',
      assignedPlate: 'DXB-5555',
      remarks: 'Family with luggage',
      enteredBy: admin.email,
      jobLogs: {
        create: [
          {
            actorId: admin.id,
            action: 'Job created',
            notes: 'Own company job created'
          }
        ]
      }
    }
  });

  console.log('✅ Created sample jobs');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
