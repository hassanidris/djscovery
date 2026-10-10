const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://djcovery.com";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DJcovery",
  url: SITE_URL,
  description: "The marketplace for DJ bookings and gig opportunities. Discover top DJs by genre and city, post open gigs, and connect with talent built for events that move people.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/directory?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
