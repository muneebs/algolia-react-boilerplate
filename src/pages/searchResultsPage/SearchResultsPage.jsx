// This is the Search Results Page that you'll see on a normal computer screen
import { Fragment, lazy, Suspense, useEffect, useState } from 'react'

// eslint-disable-next-line import/order
import {
  Configure,
  Index,
  useInfiniteHits,
} from 'react-instantsearch-hooks-web'

//import react router
import { useSearchParams } from 'react-router-dom'

// Custom Hooks
import { windowSize } from '@/hooks/useScreenSize'

// State Manager Recoil
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

// Import Components
import SkeletonLoader from '@/components/hits/components/HitsSkeletonLoader'
import WrappedTrendingFacetValues from '@/components/recommend/trending/TrendingFacetValues'
import TrendingProducts from '@/components/recommend/trending/TrendingProducts'
import CustomSortBy from '@/components/sortBy/SortBy'
import { CustomStats } from '@/components/stats/Stats'
const CustomClearRefinements = lazy(() =>
  import('@/components/facets/components/ClearRefinement')
)
const CustomCurrentRefinements = lazy(() =>
  import('@/components/facets/components/CurrentRefinement')
)
const GenericRefinementList = lazy(() => import('@/components/facets/Facets'))

// Configuration
import { indexNames, mainIndex } from '@/config/algoliaEnvConfig'
import {
  shouldHaveInjectedHits,
  shouldHaveSorts,
  shouldHaveStats,
  shouldHaveTrendingFacets,
  shouldHaveTrendingProducts,
} from '@/config/featuresConfig'
import { setNbHitsAtom } from '@/config/hitsConfig'
import {
  personalizationImpact,
  personaSelectedAtom,
  personaSelectedFiltersAtom,
} from '@/config/personaConfig'
import { isFacetPanelOpen } from '@/config/refinementsConfig'
import { queryAtom } from '@/config/searchboxConfig'
import { segmentSelectedAtom } from '@/config/segmentConfig'
import { sortBy } from '@/config/sortByConfig'

import { navigationStateAtom } from '@/config/navigationConfig'
// SVG
import { FilterPicto } from '@/assets/svg/SvgIndex'

import CustomHits from '@/components/hits/components/CustomHits'
import InjectedHits from '@/components/hits/components/injected-hits/InjectedHits'

import Banner from '@/components/banners/Banner'

import { shouldHaveInjectedBanners } from '@/config/featuresConfig'

//Import scope SCSS
import '@/pages/searchResultsPage/searchResultsPage.scss'

const SearchResultsPage = () => {
  const { hits, isLastPage, showMore, sendEvent } = useInfiniteHits()

  const setNbHit = useSetRecoilState(setNbHitsAtom)
  setNbHit(hits.length)

  // Do you want to show banner on SRP? This boolean tells us yes or no
  const shouldDisplayBanners = useRecoilValue(shouldHaveInjectedBanners)

  // Recoil & React states
  const stats = useRecoilValue(shouldHaveStats)
  const queryState = useRecoilValue(queryAtom)
  const { isDesktop } = useRecoilValue(windowSize)
  const navigationState = useRecoilValue(navigationStateAtom)

  // Should show injected content or not
  // Defined in config file
  const shouldInjectContent = useRecoilValue(shouldHaveInjectedHits)

  // Get indexes Value
  const index = useRecoilValue(mainIndex)
  const { injectedContentIndex } = useRecoilValue(indexNames)

  // Define Price Sort By Const
  const { labelIndex } = useRecoilValue(sortBy)

  const shouldHaveSortsAtom = useRecoilValue(shouldHaveSorts)

  // Persona
  const userToken = useRecoilValue(personaSelectedAtom)
  const personalizationFilters = useRecoilValue(personaSelectedFiltersAtom)

  // Segments
  const segmentOptionalFilters = useRecoilValue(segmentSelectedAtom)

  // Trending
  const shouldHaveTrendingProductsValue = useRecoilValue(
    shouldHaveTrendingProducts
  )

  // Trending
  const shouldHaveTrendingFacetsValue = useRecoilValue(shouldHaveTrendingFacets)

  // Handle the facet panel on mobile
  const [isFacetsPanelOpen, setIsFacetsPanelOpen] =
    useRecoilState(isFacetPanelOpen)

  // Handle URL search parameters through React Router
  let [searchParams, setSearchParams] = useSearchParams()

  // Related to next conditional
  let facetName
  let facetValue

  useEffect(() => {
    // Trending needs to know if you are on category page
    if (
      navigationState?.type === 'filter' &&
      navigationState?.action !== null
    ) {
      facetName = navigationState.action.split(':')[0]
      facetValue = navigationState.action.split(':')[1].replace(/['"]+/g, '')
    }
  }, [navigationState])

  let configureProps = {
    analytics: false,
    clickAnalytics: true,
    enablePersonalization: true,
    userToken: userToken,
    personalizationImpact: personalizationImpact,
    personalizationFilters: personalizationFilters,
    filters:
      (navigationState?.type === 'filter' ||
        navigationState?.type === 'rawFilter') &&
      navigationState?.action !== null
        ? navigationState.action
        : '',
    optionalFilters: segmentOptionalFilters,
    ruleContexts:
      navigationState?.type === 'context' ? navigationState.action : '',
    query: searchParams.get('query') === null ? '' : searchParams.get('query'),
    getRankingInfo: true,
  }

  return (
    <>
      {shouldDisplayBanners && <Banner />}
      {/* Render Recommend component - Trending Products Slider */}
      {/* Change header and maxRecommendations in /config/trendingConfig.js */}

      <Fragment>
        <div
          className={!isDesktop ? 'recommend recommend-mobile' : 'recommend'}
        >
          {shouldHaveTrendingProductsValue &&
            queryState === '' &&
            navigationState?.type !== 'context' && (
              <Suspense>
                <TrendingProducts
                  facetName={facetName}
                  facetValue={facetValue}
                />
              </Suspense>
            )}
        </div>

        <div
          className={` ${
            !isDesktop ? 'srp-container-mobile' : ''
          } srp-active srp-container`}
        >
          <div
            className={`${
              !isDesktop
                ? 'srp-container__facets-mobile'
                : 'srp-container__facets'
            } ${
              isFacetsPanelOpen ? 'srp-container__facets-mobile-active' : ''
            }`}
          >
            <Suspense fallback={<SkeletonLoader type={'facet'} />}>
              {/* Render Recommend component - Trending Facets */}
              {/* Change config in /config/trendingConfig.js */}
              {shouldHaveTrendingFacetsValue && (
                <WrappedTrendingFacetValues
                  attribute="brand"
                  facetName={'brand'}
                  limit={500}
                  facetValue={facetValue}
                />
              )}
              <GenericRefinementList />
            </Suspense>
          </div>

          <div className="srp-container__hits">
            {searchParams.get('query') &&
              searchParams.get('query').trim() !== '' && (
                <div className="srp-container__searchInfos">
                  <p>Showing results for: </p>
                  <p>"{searchParams.get('query')}"</p>
                </div>
              )}
            {/* This is above the items and shows the Algolia search speed and the sorting options (eg. price asc) */}
            <div className="srp-container__stats-sort">
              {!isDesktop && (
                <div
                  className={
                    isFacetsPanelOpen
                      ? 'srp-container__filterPicto-active'
                      : 'srp-container__filterPicto'
                  }
                  onClick={() => setIsFacetsPanelOpen(!isFacetsPanelOpen)}
                >
                  <FilterPicto />
                </div>
              )}
              {stats && (
                <Suspense fallback={''}>
                  <CustomStats />
                </Suspense>
              )}
              {shouldHaveSortsAtom && (
                <Suspense fallback={''}>
                  <CustomSortBy items={labelIndex} defaultRefinement={index} />
                </Suspense>
              )}
            </div>
            {/* Refinements, to the left of the items, including a list of currently selected refinements */}
            <div className="refinement-container">
              <Suspense fallback={''}>
                <CustomCurrentRefinements />
                <CustomClearRefinements />
              </Suspense>
            </div>

            <Configure {...configureProps} />
            {/* Render the Injected Hits component or the Standard Hits component */}
            {shouldInjectContent ? (
              <Suspense fallback={<SkeletonLoader type={'hit'} />}>
                <Index indexName={injectedContentIndex}>
                  <Configure hitsPerPage={1} page={0} />
                </Index>
                {/* Injected content*/}
                <InjectedHits
                  hits={hits}
                  isLastPage={isLastPage}
                  showMore={showMore}
                  sendEvent={sendEvent}
                />
              </Suspense>
            ) : (
              <Suspense fallback={<SkeletonLoader type={'hit'} />}>
                <CustomHits
                  hits={hits}
                  isLastPage={isLastPage}
                  showMore={showMore}
                  sendEvent={sendEvent}
                />
              </Suspense>
            )}
          </div>
        </div>
      </Fragment>
    </>
  )
}

export default SearchResultsPage
