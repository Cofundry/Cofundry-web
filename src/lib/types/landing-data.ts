// src/lib/landing-data.ts

export type FAQItem = {
    id?: string
    q: string
    a: string
}

export const homeFaqs: FAQItem[] = [
    {
        q: "What is Cofundry?",
        a: "Cofundry helps students, SaaS developers, and professionals discover, back, and collaborate on projects."
    },
    {
        q: "How do I submit my product?",
        a: "Go to the Products page and click “Submit”. Our team reviews submissions within 1–2 business days."
    },
    {
        q: "Is there a fee to list a project?",
        a: "Listing is free. We offer optional premium placements and review services."
    },
    {
        q: "Can I collaborate with other founders?",
        a: "Yes. Use the Projects area to find collaborations and contact owners directly."
    },
    {
        q: "Do you support payments or equity?",
        a: "We don't process equity or payments directly. We integrate with trusted partners via each listing."
    },
    {
        q: "How do I contact support?",
        a: "Email support@cofundry.io or use the in-app help widget."
    }
]

// Optional: move footer sections here too
export const footerSections = [
    {
        title: "Platform",
        links: [
            { name: "Home", href: "/" },
            { name: "Projects", href: "/projects" },
            { name: "How It Works", href: "#" }
        ]
    },
    {
        title: "Account",
        links: [
            { name: "Login", href: "/login" },
            { name: "Sign up", href: "/register" }
        ]
    }
]

// Optional: centralize navbar data as well
export const navbarData = {
    menu: [
        { title: "Home", url: "/" },
        { title: "Projects", url: "/projects" },
        { title: "Products", url: "/saas" }
    ],
    auth: {
        login: { title: "Login", url: "/login" },
        signup: { title: "Sign up", url: "/register" }
    }
}
