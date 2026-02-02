export type PracticeArea = {
  slug: string
  titleKey: string
  descKey: string
  icon: "Globe" | "FileCheck" | "Scale" | "Shield" | "Users" | "Briefcase"
}

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    slug: "immigration",
    titleKey: "practice.immigration.title",
    descKey: "practice.immigration.desc",
    icon: "Globe",
  },
  {
    slug: "greencard",
    titleKey: "practice.greencard.title",
    descKey: "practice.greencard.desc",
    icon: "FileCheck",
  },
  {
    slug: "criminal-defense",
    titleKey: "practice.criminal.title",
    descKey: "practice.criminal.desc",
    icon: "Scale",
  },
  {
    slug: "civil-rights",
    titleKey: "practice.civilrights.title",
    descKey: "practice.civilrights.desc",
    icon: "Shield",
  },
  {
    slug: "family-law",
    titleKey: "practice.family.title",
    descKey: "practice.family.desc",
    icon: "Users",
  },
  {
    slug: "business-immigration",
    titleKey: "practice.business.title",
    descKey: "practice.business.desc",
    icon: "Briefcase",
  },
]

export function getPracticeAreaBySlug(slug: string) {
  return PRACTICE_AREAS.find((area) => area.slug === slug)
}
