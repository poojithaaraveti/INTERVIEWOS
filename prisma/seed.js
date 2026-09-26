const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with benchmark roles and users...");

  // 1. Create Recruiter
  const recruiter = await prisma.user.upsert({
    where: { email: "sarah.chen@interviewos.ai" },
    update: {},
    create: {
      email: "sarah.chen@interviewos.ai",
      name: "Sarah Chen",
      role: "RECRUITER",
    },
  });

  // 2. Create Candidate
  const candidate = await prisma.user.upsert({
    where: { email: "alex.morgan@example.com" },
    update: {},
    create: {
      email: "alex.morgan@example.com",
      name: "Alex Morgan",
      role: "CANDIDATE",
    },
  });

  // 3. Create Benchmark Job Roles
  const job1 = await prisma.jobRole.upsert({
    where: { id: "job-distributed-systems" },
    update: {},
    create: {
      id: "job-distributed-systems",
      title: "Senior Distributed Systems Engineer",
      description: `We are seeking a Senior Distributed Systems Engineer to design, scale, and maintain our high-throughput transactional backends.
Key Responsibilities:
- Architect distributed microservices using Node.js/TypeScript and Go.
- Manage high-concurrency datastores (PostgreSQL, Redis, Kafka).
- Handle cache invalidation, idempotent APIs, and graceful degradation under network partitions.
- Optimize database query execution plans, indexes, and horizontal partitioning.`,
      seniorityLevel: "Senior",
      requiredSkills: JSON.stringify(["Node.js", "Redis", "PostgreSQL", "Kafka", "Docker", "System Design"]),
      recruiterId: recruiter.id,
    },
  });

  const job2 = await prisma.jobRole.upsert({
    where: { id: "job-fullstack-architect" },
    update: {},
    create: {
      id: "job-fullstack-architect",
      title: "Lead Full-Stack Architect",
      description: `Lead our frontend and backend architecture initiatives.
Key Responsibilities:
- Build high-performance React and Next.js applications.
- Design resilient REST and GraphQL APIs.
- Lead code reviews, system design RFCs, and browser performance optimizations.`,
      seniorityLevel: "Lead",
      requiredSkills: JSON.stringify(["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "System Design"]),
      recruiterId: recruiter.id,
    },
  });

  console.log("Seeding completed successfully!");
  console.log(`Recruiter: ${recruiter.email}`);
  console.log(`Candidate: ${candidate.email}`);
  console.log(`Job Roles: ${job1.title}, ${job2.title}`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
