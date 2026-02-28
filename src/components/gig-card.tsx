'use client'

import Link from 'next/link'
import { Star, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCents } from '@/lib/utils'

export interface GigCardData {
  id: string
  title: string
  description: string
  cover_image_url: string | null
  commission_per_appointment: number
  commission_per_close: number
  company_name: string
  category_name: string | null
  category_slug: string | null
  avg_rating: number | null
  review_count: number
  setter_count: number
  created_at: string
  seller_name: string
  ideal_customer: string | null
}

export function GigCard({ gig }: { gig: GigCardData }) {
  const commissionLabel = gig.commission_per_appointment
    ? `${formatCents(gig.commission_per_appointment)}/meeting`
    : gig.commission_per_close
      ? `${formatCents(gig.commission_per_close)}/close`
      : 'Contact for pricing'

  return (
    <Link href={`/browse/${gig.id}`} className="group block">
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        {/* Cover Image */}
        <div className="aspect-[16/10] relative overflow-hidden">
          {gig.cover_image_url ? (
            <img
              src={gig.cover_image_url}
              alt={gig.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#00FF94]/10 via-[#0088ff]/10 to-[#7722cc]/10 flex items-center justify-center">
              <div className="text-4xl font-black text-white/[0.06] select-none">
                {gig.company_name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
          {gig.category_name && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="backdrop-blur-md bg-black/50 border-white/10">
                {gig.category_name}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Seller info */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00FF94]/20 to-[#0088ff]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] font-bold text-white">
                {gig.seller_name.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-400 truncate">{gig.seller_name}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500 truncate">{gig.company_name}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 leading-snug group-hover:text-[#00FF94] transition-colors">
            {gig.title}
          </h3>

          {/* Ideal customer */}
          {gig.ideal_customer && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {gig.ideal_customer}
            </p>
          )}

          {/* Rating + setter count */}
          <div className="flex items-center gap-3 mb-3">
            {gig.review_count > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-white">
                  {(gig.avg_rating || 0).toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">({gig.review_count})</span>
              </div>
            ) : (
              <Badge variant="outline" className="text-[10px] py-0">New</Badge>
            )}
            {gig.setter_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                {gig.setter_count} setter{gig.setter_count !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Divider + Price */}
          <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">Commission</span>
            <span className="text-sm font-bold text-[#00FF94]">
              {commissionLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
