import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'project'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export default function SEOHead({
  title = "Cofundry - Where Students & Developers Build Together",
  description = "Cofundry is the premier platform for students, SaaS developers, and professionals to collaborate on innovative projects. Find teammates, showcase your work, and build the future together.",
  keywords = [
    "student collaboration",
    "SaaS projects", 
    "team building",
    "project collaboration",
    "student projects",
    "startup collaboration",
    "tech projects",
    "remote collaboration",
    "project management",
    "student networking",
    "SaaS development",
    "collaborative platform",
    "project showcase",
    "team formation",
    "innovation platform"
  ],
  image = "/og-image.svg",
  url = "https://cofundry.com",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = []
}: SEOHeadProps) {
  const fullTitle = title.includes("Cofundry") ? title : `${title} | Cofundry`
  const fullKeywords = [...keywords, "Cofundry", "collaboration", "projects"]
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={fullKeywords.join(", ")} />
      <meta name="author" content={author || "Cofundry Team"} />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Cofundry" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@cofundry" />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.length > 0 && (
        tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))
      )}
      
      {/* Additional SEO meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#FFD700" />
      <meta name="msapplication-TileColor" content="#FFD700" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      
      {/* Favicon and app icons */}
  <link rel="icon" href="/favicon.ico" type="image/x-icon" />
  <link rel="icon" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/favicon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  )
}
