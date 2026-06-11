export const DJ_TYPES = [
  { value: "WEDDING", label: "Wedding", icon: "💍" },
  { value: "CLUB", label: "Club", icon: "🎛️" },
  { value: "CORPORATE", label: "Corporate", icon: "🏢" },
  { value: "FESTIVAL", label: "Festival", icon: "🎪" },
  { value: "PRIVATE_PARTY", label: "Private Party", icon: "🎉" },
  { value: "BAR_LOUNGE", label: "Lounge / Bar", icon: "🍸" },
  { value: "BIRTHDAY", label: "Birthday", icon: "🎂" },
  { value: "CULTURAL_EVENT", label: "Cultural Event", icon: "🌍" },
] as const;

export type DjTypeOption = (typeof DJ_TYPES)[number];
