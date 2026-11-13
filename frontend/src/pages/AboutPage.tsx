import React from 'react'
import Layout from '../components/layout/Layout'

export const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: TBP Dataset Commons */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#B8860B]">
                Editorial & Governance
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A] mt-2 mb-6">
                About TBP Dataset Commons
              </h1>
              <div className="prose prose-neutral max-w-none text-base text-[#4B5563] leading-relaxed space-y-4">
                <p>
                  TBP Dataset Commons is an open repository established to serve the machine learning,
                  artificial intelligence, and scientific research communities. Maintained by The Builder
                  Protocol, the platform provides public infrastructure for indexing, discovering, and
                  distributing research datasets across multidisciplinary domains.
                </p>
                <p>
                  Modern artificial intelligence research demands reliable, verified, and well-documented
                  data. However, open data often suffers from link rot, unclear provenance, ambiguous
                  licensing, and fragmented hosting. TBP Dataset Commons addresses these challenges by
                  offering structured metadata schemas, persistent identifiers, and curated peer-review
                  workflows.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
                Our Mission
              </h2>
              <p className="text-base text-[#4B5563] leading-relaxed">
                To democratize access to high-quality data through transparent sharing, rigorous
                documentation, and reproducible research standards. We aim to ensure that researchers,
                independent engineers, and institutions of all sizes can discover and build upon
                public datasets without arbitrary gatekeeping or opaque terms.
              </p>
            </div>

            {/* Principles */}
            <div className="border-t border-[#E5E7EB] pt-8">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">
                Core Principles
              </h2>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-white border border-[#E5E7EB]">
                  <dt className="text-sm font-semibold text-[#1A1A1A] mb-1">Open Discovery</dt>
                  <dd className="text-sm text-[#6B7280] leading-relaxed">
                    All published datasets, schemas, and metadata are searchable and accessible
                    without mandatory account creation or fee walls.
                  </dd>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E5E7EB]">
                  <dt className="text-sm font-semibold text-[#1A1A1A] mb-1">Clear Documentation</dt>
                  <dd className="text-sm text-[#6B7280] leading-relaxed">
                    Every dataset requires documented collection methodologies, intended usage boundaries,
                    and stated limitations to avoid misuse.
                  </dd>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E5E7EB]">
                  <dt className="text-sm font-semibold text-[#1A1A1A] mb-1">Responsible Sharing</dt>
                  <dd className="text-sm text-[#6B7280] leading-relaxed">
                    Contributions undergo editorial review to verify licensing terms, data integrity,
                    privacy protection, and compliance with ethical standards.
                  </dd>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E5E7EB]">
                  <dt className="text-sm font-semibold text-[#1A1A1A] mb-1">Transparent Licensing</dt>
                  <dd className="text-sm text-[#6B7280] leading-relaxed">
                    Explicit, standardized licences (such as CC, MIT, or Apache) accompany all datasets
                    so practitioners know their legal rights and restrictions.
                  </dd>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E5E7EB]">
                  <dt className="text-sm font-semibold text-[#1A1A1A] mb-1">Reproducible Research</dt>
                  <dd className="text-sm text-[#6B7280] leading-relaxed">
                    Detailed provenance, data dictionaries, and standardized citation strings support
                    scientific rigor and downstream replicability.
                  </dd>
                </div>

                <div className="p-4 rounded-lg bg-white border border-[#E5E7EB]">
                  <dt className="text-sm font-semibold text-[#1A1A1A] mb-1">Community Contributions</dt>
                  <dd className="text-sm text-[#6B7280] leading-relaxed">
                    The commons is sustained by researchers, engineers, and data creators who contribute,
                    curate, and review datasets cooperatively.
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column: The Builder Protocol */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-4">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#6B7280]">
                Parent Initiative
              </span>
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                About The Builder Protocol
              </h2>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                The Builder Protocol is a collective dedicated to developing open digital infrastructure,
                distributed protocols, and developer-first toolchains for autonomous agents, research
                laboratories, and open-source creators.
              </p>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Through open repositories, technical standards, and ecosystem grants, The Builder Protocol
                advances sustainable digital commons for artificial intelligence and scientific computing.
              </p>

              <div className="pt-2">
                <a
                  href="https://thebuilderprotocol.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-[#B8860B] hover:text-[#996F09] transition-colors"
                >
                  Visit thebuilderprotocol.me →
                </a>
              </div>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Dataset Inquiries & Review
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Have questions regarding dataset governance, licensing reviews, or institutional
                partnerships? Reach out to our review panel or explore our submission guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AboutPage
