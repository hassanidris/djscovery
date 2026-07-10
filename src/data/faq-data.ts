export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  label: string;
  items: FaqItem[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "general",
    label: "General",
    items: [
      {
        question: "What is DJcovery?",
        answer:
          "DJcovery is a platform where DJs showcase their skills, build professional profiles, and connect with organizers looking to book talent.",
      },
      {
        question: "Who is DJcovery for?",
        answer:
          "DJcovery is built for DJs, event organizers, venues, agencies, and fans who want a better way to discover and connect around DJ talent.",
      },
      {
        question: "Is DJcovery free to use?",
        answer:
          "Yes. DJs, organizers, and fans can create accounts and use the core features for free.",
      },
      {
        question: "Do I need an account to browse DJs?",
        answer:
          "No. Anyone can browse public DJ profiles and discover talent without creating an account.",
      },
    ],
  },
  {
    id: "for-djs",
    label: "For DJs",
    items: [
      {
        question: "How do I create a DJ profile?",
        answer:
          "Sign up as a DJ, complete your profile with your stage name, genres, location, media, and experience, then submit it for review.",
      },
      {
        question: "Why isn't my DJ profile visible yet?",
        answer:
          "New DJ profiles may require approval before appearing publicly to maintain quality, trust, and safety on the platform.",
      },
      {
        question: "Can I upload music and videos?",
        answer:
          "Yes. DJs can showcase mixes, videos, photos, and other media on their profiles.",
      },
      {
        question: "How do DJs get discovered?",
        answer:
          "DJs can be discovered through public profiles, search, directory listings, genres, location, events, and future featured placements.",
      },
    ],
  },
  {
    id: "for-organizers",
    label: "For Organizers",
    items: [
      {
        question: "How do organizers hire DJs?",
        answer:
          "Organizers can browse DJ profiles, compare talent, and contact DJs directly or through booking features available on the platform.",
      },
      {
        question: "Can I post gigs?",
        answer:
          "Yes. Organizers can create gig listings and receive applications from DJs.",
      },
      {
        question: "Can other organizers see my gigs?",
        answer:
          "No. Organizer dashboards only display gigs created by that organizer.",
      },
      {
        question: "When is a private gig address shown?",
        answer:
          "Private gig addresses should stay hidden until a DJ is accepted for that gig.",
      },
    ],
  },
  {
    id: "for-fans",
    label: "For Fans",
    items: [
      {
        question: "What can fans do on DJcovery?",
        answer:
          "Fans can discover DJs, follow profiles, explore events, leave ratings, and engage with public DJ content.",
      },
      {
        question: "Do fans need an account?",
        answer:
          "Fans can browse public content without an account, but an account is needed for features like ratings, follows, and engagement.",
      },
      {
        question: "Can fans apply for gigs?",
        answer: "No. Gig applications are only available to DJ accounts.",
      },
    ],
  },
  {
    id: "account-security",
    label: "Account & Security",
    items: [
      {
        question: "How do I change my account role?",
        answer:
          "Some role changes may be available through account settings. If help is needed, users can contact support.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "You can request account deletion through account settings or by contacting support.",
      },
      {
        question: "Is my information safe?",
        answer:
          "DJcovery protects user data with secure authentication, server-side validation, protected routes, and database access rules.",
      },
    ],
  },
  {
    id: "gigs-bookings",
    label: "Gigs & Bookings",
    items: [
      {
        question: "Can DJs apply for gigs?",
        answer:
          "Yes. DJs can browse available gigs and submit applications directly through the platform.",
      },
      {
        question: "Who can see gigs?",
        answer:
          "Gigs are visible only to DJ accounts. Guests and fans do not see the gigs section.",
      },
      {
        question: "What happens after a DJ applies?",
        answer:
          "The organizer can review applications and update the application status — such as shortlisted, accepted, or rejected.",
      },
    ],
  },
  {
    id: "payments-future",
    label: "Payments & Future Features",
    items: [
      {
        question: "Does DJcovery charge commission on bookings?",
        answer:
          "Currently, DJcovery does not charge commission on bookings. Future premium features may be introduced.",
      },
      {
        question: "Will DJcovery have premium DJ profiles?",
        answer:
          "Premium DJ profiles may be introduced later with features such as featured placement, booking buttons, and enhanced visibility.",
      },
      {
        question: "Will organizers have paid features?",
        answer:
          "Organizer premium tools may be added later, such as promoted gigs, advanced filtering, and hiring tools.",
      },
    ],
  },
];

export const HOMEPAGE_FAQ: FaqItem[] = [
  {
    question: "What is DJcovery?",
    answer:
      "DJcovery is a platform where DJs showcase their skills, build professional profiles, and connect with organizers looking to book talent.",
  },
  {
    question: "Is DJcovery free to use?",
    answer:
      "Yes. DJs, organizers, and fans can create accounts and use the core features for free.",
  },
  {
    question: "Does DJcovery charge commission on bookings?",
    answer:
      "Currently, DJcovery does not charge commission on bookings. Future premium features may be introduced.",
  },
  {
    question: "How do DJs get discovered?",
    answer:
      "DJs can be discovered through public profiles, search, directory listings, genres, location, events, and future featured placements.",
  },
  {
    question: "How do organizers hire DJs?",
    answer:
      "Organizers can browse DJ profiles, compare talent, and contact DJs directly or through booking features available on the platform.",
  },
  {
    question: "Can I post gigs?",
    answer:
      "Yes. Organizers can create gig listings and receive applications from DJs.",
  },
];
