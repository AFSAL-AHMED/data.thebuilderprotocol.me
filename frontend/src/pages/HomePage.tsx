import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Brain,
  MessageSquare,
  Eye,
  FlaskConical,
  Leaf,
  Map,
  Code,
  Globe,
  Languages,
  MoreHorizontal,
  Search,
  ArrowRight,
  ShieldCheck,
  FileText,
  Scale,
  GitFork,
  Users,
  Sparkles,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import DatasetListItem from '../components/dataset/DatasetListItem'
import CategoryBadge from '../components/dataset/CategoryBadge'
import {
  useFeaturedDatasets,
  useRecentDatasets,
  useCategoryStats,
} from '../hooks/useDatasets'
import { formatDate } from '../lib/utils'
import type { DatasetCategory } from '../types'

interface CategoryCardMeta {
  key: DatasetCategory
  name: string
  icon: React.ComponentType<{ className?: string }>
}

const CATEGORIES: CategoryCardMeta[] = [
  { key: 'ai_ml', name: 'AI & Machine Learning', icon: Brain },
  { key: 'nlp', name: 'Natural Language Processing', icon: MessageSquare },
  { key: 'computer_vision', name: 'Computer Vision', icon: Eye },
  { key: 'scientific_research', name: 'Scientific Research', icon: FlaskConical },
  { key: 'climate_environment', name: 'Climate & Environment', icon: Leaf },
  { key: 'geospatial', name: 'Geospatial & Mapping', icon: Map },
  { key: 'software_engineering', name: 'Software Engineering', icon: Code },
  { key: 'public_data', name: 'Public & Gov Data', icon: Globe },
  { key: 'language_culture', name: 'Language & Culture', icon: Languages },
  { key: 'other', name: 'Other Domains', icon: MoreHorizontal },
]

const SEARCH_SUGGESTIONS = [
  { label: 'AI & ML', query: 'ai_ml', isCategory: true },
  { label: 'Climate Data', query: 'climate_environment', isCategory: true },
  { label: 'NLP Corpus', query: 'nlp', isCategory: true },
  { label: 'Geospatial', query: 'geospatial', isCategory: true },
]

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: featuredDatasets, isLoading: loadingFeatured } = useFeaturedDatasets()
  const { data: recentDatasets, isLoading: loadingRecent } = useRecentDatasets()
  const { data: categoryStats } = useCategoryStats()

  // Build category count lookup
  const categoryCounts = React.useMemo(() => {
    const map: Partial<Record<DatasetCategory, number>> = {}
    if (Array.isArray(categoryStats)) {
      categoryStats.forEach((stat) => {
        map[stat.category] = stat.count
      })
    }
    return map
  }, [categoryStats])

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = searchQuery.trim()
    if (trimmed) {
      navigate(`/explore?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/explore')
    }
  }

  return (
    <Layout>
      {/* 1. Hero Section */}
      <section className="py-16 sm:py-24 bg-[#FAFAF8] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF8EE] border border-[#B8860B]/30 text-xs font-semibold text-[#B8860B] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
              <span>Open Dataset Repository</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] tracking-tight leading-tight">
              Discover data.{' '}
              <span className="text-[#B8860B]">Share knowledge.</span>
            </h1>

            {/* Subtext */}
            <p className="mt-5 text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
              TBP Dataset Commons is a community-driven repository of open datasets
              for researchers, developers, and data practitioners.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link to="/explore">
                <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Datasets
                </Button>
              </Link>
              <Link to="/submit">
                <Button variant="gold-outline" size="lg">
                  Contribute a Dataset
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-10 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-sm rounded-lg bg-white">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit()
                    }
                  }}
                  leftIcon={<Search className="w-5 h-5 text-gray-400" />}
                  placeholder="Search datasets by keywords, formats, domain..."
                  className="py-3.5 text-base pl-11 pr-24 border-[#E5E7EB] focus:border-[#B8860B]"
                />
                <div className="absolute right-2">
                  <Button type="submit" variant="gold" size="sm">
                    Search
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-[#6B7280]">
                <span className="font-medium text-gray-500">Popular:</span>
                {SEARCH_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.label}
                    type="button"
                    onClick={() => {
                      if (sug.isCategory) {
                        navigate(`/explore?category=${sug.query}`)
                      } else {
                        navigate(`/explore?q=${encodeURIComponent(sug.query)}`)
                      }
                    }}
                    className="px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] hover:border-[#B8860B] hover:text-[#B8860B] transition-colors"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Featured Datasets */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              Featured Datasets
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Hand-picked and verified datasets of significant community value
            </p>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-[#B8860B] hover:text-[#996F09] inline-flex items-center gap-1 group shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="animate-pulse bg-white border border-[#E5E7EB] rounded-lg p-5 h-28"
              />
            ))}
          </div>
        ) : featuredDatasets && featuredDatasets.length > 0 ? (
          <div className="space-y-3.5">
            {featuredDatasets.slice(0, 6).map((dataset) => (
              <DatasetListItem key={dataset.id} dataset={dataset} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No featured datasets available"
            description="Explore our repository or be the first to contribute a dataset to this section."
            action={
              <Link to="/explore">
                <Button variant="gold-outline" size="sm">
                  Browse All Datasets
                </Button>
              </Link>
            }
          />
        )}
      </section>

      {/* 3. Browse by Category */}
      <section className="py-12 sm:py-16 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              Browse by Category
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] mt-2">
              Explore open datasets organized across core scientific, computational, and public disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const count = categoryCounts[cat.key] ?? 0
              return (
                <Link
                  key={cat.key}
                  to={`/explore?category=${cat.key}`}
                  className="group bg-[#FAFAF8] hover:bg-white border border-[#E5E7EB] hover:border-[#B8860B] rounded-lg p-5 transition-all duration-150 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-white group-hover:bg-[#FDF8EE] border border-[#E5E7EB] group-hover:border-[#B8860B]/40 flex items-center justify-center text-[#B8860B] transition-colors shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#B8860B] transition-colors leading-snug">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {count} {count === 1 ? 'dataset' : 'datasets'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#B8860B] group-hover:translate-x-0.5 transition-all" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. Recently Added */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              Recently Added
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Fresh data deposits reviewed and published into the commons
            </p>
          </div>
          <Link
            to="/explore?sort=newest"
            className="text-sm font-semibold text-[#B8860B] hover:text-[#996F09] inline-flex items-center gap-1 group shrink-0"
          >
            <span>See Newest</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loadingRecent ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="animate-pulse bg-white border border-[#E5E7EB] rounded-lg p-4 h-16"
              />
            ))}
          </div>
        ) : recentDatasets && recentDatasets.length > 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
            {recentDatasets.slice(0, 5).map((dataset) => (
              <div
                key={dataset.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAF8] transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <CategoryBadge category={dataset.category} size="sm" />
                  <Link
                    to={`/datasets/${dataset.slug}`}
                    className="font-medium text-[#1A1A1A] hover:text-[#B8860B] text-sm sm:text-base transition-colors"
                  >
                    {dataset.title}
                  </Link>
                </div>
                <div className="text-xs text-[#6B7280] shrink-0">
                  Added {formatDate(dataset.created_at)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recent datasets"
            description="New datasets will appear here as they are reviewed and approved."
          />
        )}
      </section>

      {/* 5. Why Dataset Commons */}
      <section className="py-12 sm:py-16 bg-[#FAFAF8] border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              Why TBP Dataset Commons?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#6B7280]">
              Built with care for open-source researchers, data engineers, and practitioners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#FDF8EE] text-[#B8860B] flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1A1A]">Open Discovery</h3>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Every dataset is publicly discoverable without registration.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#FDF8EE] text-[#B8860B] flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1A1A]">Clear Documentation</h3>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Contributors are required to document structure, methodology and limitations.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#FDF8EE] text-[#B8860B] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1A1A]">Responsible Sharing</h3>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Datasets undergo review for quality, licensing, and ethical considerations.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#FDF8EE] text-[#B8860B] flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1A1A]">Transparent Licensing</h3>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Every dataset carries an explicit licence so you know exactly how you can use it.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#FDF8EE] text-[#B8860B] flex items-center justify-center mb-4">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1A1A]">Reproducible Research</h3>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Detailed provenance information helps you reproduce results and build on prior work.
              </p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-[#FDF8EE] text-[#B8860B] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1A1A]">Community Contributions</h3>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                Researchers and practitioners contribute, review, and improve datasets together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contribution CTA */}
      <section className="py-16 bg-[#FDF8EE] border-t border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#1A1A1A]">
            Have data to share?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#6B7280] max-w-xl mx-auto">
            Contributing a dataset is free and open to everyone. Help the community by sharing your data.
          </p>
          <div className="mt-8">
            <Link to="/submit">
              <Button variant="gold" size="lg">
                Submit a Dataset
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default HomePage
