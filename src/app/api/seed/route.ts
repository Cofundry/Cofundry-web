import { NextResponse } from 'next/server';
import { getDB } from '@/lib/mongodb';

const sampleProjects = [
  {
    title: "E-commerce Mobile App Development",
    description: "Looking for a team to build a modern e-commerce mobile application with React Native. The app should include user authentication, product catalog, shopping cart, payment integration, and admin dashboard.",
    requirements: "Experience with React Native, Node.js, MongoDB, and payment gateways. Knowledge of UI/UX design principles and mobile app development best practices.",
    teamSize: 3,
    techStack: ["React Native", "Node.js", "MongoDB", "Stripe", "Firebase"],
    deadline: new Date("2024-12-31"),
    budget: {
      min: 5000,
      max: 15000,
      currency: "USD"
    },
    location: "remote",
    category: "mobile-development",
    difficulty: "intermediate",
    authorId: "sample-user-1",
    authorName: "John Smith",
    authorEmail: "john@example.com",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["e-commerce", "mobile", "react-native", "payment"],
    contactInfo: {
      email: "john@example.com",
      linkedin: "linkedin.com/in/johnsmith"
    }
  },
  {
    title: "AI-Powered Chatbot for Customer Support",
    description: "Develop an intelligent chatbot using machine learning to handle customer inquiries. The bot should integrate with our existing CRM system and provide 24/7 customer support.",
    requirements: "Strong background in NLP, machine learning, and Python. Experience with chatbot frameworks like Rasa or Dialogflow. Knowledge of API integration and web development.",
    teamSize: 2,
    techStack: ["Python", "TensorFlow", "Rasa", "FastAPI", "PostgreSQL"],
    deadline: new Date("2024-11-30"),
    budget: {
      min: 8000,
      max: 20000,
      currency: "USD"
    },
    location: "hybrid",
    category: "ai-ml",
    difficulty: "advanced",
    authorId: "sample-user-2",
    authorName: "Sarah Johnson",
    authorEmail: "sarah@example.com",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["ai", "chatbot", "nlp", "customer-support"],
    contactInfo: {
      email: "sarah@example.com",
      phone: "+1-555-0123"
    }
  },
  {
    title: "Blockchain-based Supply Chain Tracking",
    description: "Create a decentralized supply chain tracking system using blockchain technology. The system should provide transparency and traceability for product movement from manufacturer to consumer.",
    requirements: "Experience with blockchain development, smart contracts, and Solidity. Knowledge of supply chain processes and web3 technologies. Familiarity with React and Node.js.",
    teamSize: 4,
    techStack: ["Solidity", "Ethereum", "React", "Node.js", "IPFS"],
    deadline: new Date("2025-02-28"),
    budget: {
      min: 15000,
      max: 35000,
      currency: "USD"
    },
    location: "remote",
    category: "blockchain",
    difficulty: "advanced",
    authorId: "sample-user-3",
    authorName: "Mike Chen",
    authorEmail: "mike@example.com",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["blockchain", "supply-chain", "smart-contracts", "web3"],
    contactInfo: {
      email: "mike@example.com",
      github: "github.com/mikechen"
    }
  },
  {
    title: "Data Analytics Dashboard for E-commerce",
    description: "Build a comprehensive analytics dashboard that provides insights into sales performance, customer behavior, and inventory management. Should include interactive charts and real-time data updates.",
    requirements: "Experience with data visualization libraries (D3.js, Chart.js), frontend frameworks, and data processing. Knowledge of SQL and database design. Understanding of e-commerce metrics.",
    teamSize: 2,
    techStack: ["React", "D3.js", "Node.js", "PostgreSQL", "Redis"],
    deadline: new Date("2024-10-31"),
    budget: {
      min: 6000,
      max: 12000,
      currency: "USD"
    },
    location: "onsite",
    category: "data-science",
    difficulty: "intermediate",
    authorId: "sample-user-4",
    authorName: "Emily Davis",
    authorEmail: "emily@example.com",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["analytics", "dashboard", "data-visualization", "e-commerce"],
    contactInfo: {
      email: "emily@example.com",
      linkedin: "linkedin.com/in/emilydavis"
    }
  },
  {
    title: "2D Platformer Game Development",
    description: "Create a 2D platformer game with engaging gameplay mechanics, multiple levels, and smooth animations. The game should be cross-platform compatible and include sound effects and background music.",
    requirements: "Experience with game development engines (Unity or Godot), 2D art creation, and game design principles. Knowledge of C# or GDScript. Understanding of game physics and animation.",
    teamSize: 3,
    techStack: ["Unity", "C#", "Photoshop", "Audacity", "Git"],
    deadline: new Date("2025-01-31"),
    budget: {
      min: 4000,
      max: 10000,
      currency: "USD"
    },
    location: "remote",
    category: "game-development",
    difficulty: "beginner",
    authorId: "sample-user-5",
    authorName: "Alex Rodriguez",
    authorEmail: "alex@example.com",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["game-dev", "2d", "platformer", "unity"],
    contactInfo: {
      email: "alex@example.com",
      portfolio: "alexgames.com"
    }
  },
  {
    title: "Progressive Web App for Food Delivery",
    description: "Develop a PWA for food delivery service with offline functionality, push notifications, and fast loading times. Should include user authentication, restaurant listings, order tracking, and payment processing.",
    requirements: "Experience with PWA development, service workers, and modern web technologies. Knowledge of responsive design and mobile-first development. Understanding of food delivery business logic.",
    teamSize: 3,
    techStack: ["React", "PWA", "Service Workers", "Firebase", "Stripe"],
    deadline: new Date("2024-12-15"),
    budget: {
      min: 7000,
      max: 18000,
      currency: "USD"
    },
    location: "hybrid",
    category: "web-development",
    difficulty: "intermediate",
    authorId: "sample-user-6",
    authorName: "Lisa Wang",
    authorEmail: "lisa@example.com",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ["pwa", "food-delivery", "offline", "notifications"],
    contactInfo: {
      email: "lisa@example.com",
      phone: "+1-555-0456"
    }
  }
];

export async function POST() {
  try {
    const db = await getDB();
    const projectsCollection = db.collection('projects');

    // Clear existing projects
    await projectsCollection.deleteMany({});

    // Insert sample projects
    const result = await projectsCollection.insertMany(sampleProjects);

    return NextResponse.json({
      message: 'Database seeded successfully',
      insertedCount: result.insertedCount
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
