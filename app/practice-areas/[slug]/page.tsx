import { notFound } from "next/navigation"

import { SiteFrame } from "@/components/site-frame"
import { PracticeAreaDetail } from "@/components/practice-area-detail"
import { getPracticeAreaBySlug } from "@/lib/practice-areas-data"

export default function PracticeAreaDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const area = getPracticeAreaBySlug(params.slug)
  if (!area) return notFound()

  return (
    <SiteFrame>
      <PracticeAreaDetail area={area} />
    </SiteFrame>
  )
}
