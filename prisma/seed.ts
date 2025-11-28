import { PrismaClient, UserRole, CompanyKind, JobStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create SUPER_ADMIN user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      role: UserRole.SUPER_ADMIN,
      password: adminPassword,
    },
  });
  console.log("✅ Created SUPER_ADMIN:", admin.email);

  // Create ACCOUNTANT user
  const accountantPassword = await bcrypt.hash("accountant123", 10);
  const accountant = await prisma.user.upsert({
    where: { email: "accountant@example.com" },
    update: {},
    create: {
      email: "accountant@example.com",
      role: UserRole.ACCOUNTANT,
      password: accountantPassword,
    },
  });
  console.log("✅ Created ACCOUNTANT:", accountant.email);

  // Create test DRIVER user
  const driverPin = await bcrypt.hash("1234", 10);
  const driver = await prisma.user.upsert({
    where: { phone: "+971501234567" },
    update: {},
    create: {
      phone: "+971501234567",
      email: "driver@example.com",
      role: UserRole.DRIVER,
      pinHash: driverPin,
    },
  });
  console.log("✅ Created DRIVER:", driver.phone);

  // Create sample clients
  const client1 = await prisma.company.create({
    data: {
      kind: CompanyKind.CLIENT,
      name: "ABC Travel Agency",
      phone: "+971412345678",
      contacts: {
        create: [
          {
            phone: "+971412345678",
            email: "contact@abctravel.com",
          },
        ],
      },
    },
  });

  const client2 = await prisma.company.create({
    data: {
      kind: CompanyKind.CLIENT,
      name: "XYZ Tours",
      phone: "+971422345678",
      contacts: {
        create: [
          {
            phone: "+971422345678",
            email: "info@xyztours.com",
          },
        ],
      },
    },
  });

  console.log("✅ Created clients:", client1.name, client2.name);

  // Create sample suppliers
  const supplier1 = await prisma.company.create({
    data: {
      kind: CompanyKind.SUPPLIER,
      name: "Premium Transport LLC",
      phone: "+971433345678",
      contacts: {
        create: [
          {
            phone: "+971433345678",
            email: "contact@premiumtransport.com",
          },
        ],
      },
      supplierCategories: {
        create: [
          {
            category: "Sedan",
            vehicleCount: 5,
          },
          {
            category: "SUV",
            vehicleCount: 3,
          },
        ],
      },
      supplierVehicles: {
        create: [
          {
            category: "Sedan",
            regNumber: "DXB-1234",
            model: "Toyota Camry",
          },
          {
            category: "Sedan",
            regNumber: "DXB-1235",
            model: "Honda Accord",
          },
          {
            category: "SUV",
            regNumber: "DXB-2234",
            model: "Toyota Land Cruiser",
          },
        ],
      },
    },
  });

  const supplier2 = await prisma.company.create({
    data: {
      kind: CompanyKind.SUPPLIER,
      name: "Elite Car Services",
      phone: "+971444445678",
      contacts: {
        create: [
          {
            phone: "+971444445678",
            email: "info@elitecars.com",
          },
        ],
      },
      supplierCategories: {
        create: [
          {
            category: "Luxury",
            vehicleCount: 2,
          },
        ],
      },
      supplierVehicles: {
        create: [
          {
            category: "Luxury",
            regNumber: "DXB-9999",
            model: "Mercedes S-Class",
          },
        ],
      },
    },
  });

  console.log("✅ Created suppliers:", supplier1.name, supplier2.name);

  // Create OWN_FLEET company
  const ownFleet = await prisma.company.create({
    data: {
      kind: CompanyKind.OWN_FLEET,
      name: "Own Company",
      phone: "+971455555678",
    },
  });
  console.log("✅ Created OWN_FLEET:", ownFleet.name);

  // Create sample jobs
  const job1 = await prisma.job.create({
    data: {
      clientId: client1.id,
      supplierId: supplier1.id,
      guestName: "John Doe",
      guestContact: "+971501111111",
      pickup: "Dubai Airport Terminal 1",
      drop: "Burj Al Arab Hotel",
      flight: "EK 201",
      category: "Sedan",
      vehicle: "DXB-1234",
      status: JobStatus.IN_POOL,
      price: 150.0,
      taxAmount: 7.5,
      totalAmount: 157.5,
      jobLogs: {
        create: [
          {
            actorId: admin.id,
            action: "CREATED",
            notes: "Job created by admin",
          },
        ],
      },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      clientId: client2.id,
      supplierId: supplier2.id,
      guestName: "Jane Smith",
      guestContact: "+971502222222",
      pickup: "Dubai Marina",
      drop: "Dubai Airport Terminal 3",
      category: "Luxury",
      vehicle: "DXB-9999",
      status: JobStatus.ASSIGNED,
      price: 300.0,
      taxAmount: 15.0,
      totalAmount: 315.0,
      driverName: "Ahmed Ali",
      assignedPlate: "DXB-9999",
      jobLogs: {
        create: [
          {
            actorId: admin.id,
            action: "CREATED",
            notes: "Job created by admin",
          },
          {
            actorId: admin.id,
            action: "STATUS_CHANGED",
            notes: "Status changed to ASSIGNED",
          },
        ],
      },
    },
  });

  console.log("✅ Created sample jobs");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

