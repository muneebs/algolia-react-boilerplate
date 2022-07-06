import { useEffect, useState } from 'react';

import { useTrendingFacets } from '@algolia/recommend-react';
import { useRefinementList } from 'react-instantsearch-hooks-web';

import { useRecoilValue } from 'recoil';

import { mainIndex, recommendClient } from '@/config/algoliaEnvConfig';
import '@algolia/ui-components-horizontal-slider-theme';

import { trendingConfig } from '@/config/trendingConfig';
import CustomSkeleton from '@/components/skeletons/CustomSkeleton';

function WrappedTrendingFacetValues(props) {
  const { items, refine } = useRefinementList(props);
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);

  const index = useRecoilValue(mainIndex);
  const {
    facetValuesAttribute,
    facetValuesTitle,
    maxFacetValuesRecommendations,
  } = trendingConfig;

  const { recommendations } = useTrendingFacets({
    recommendClient,
    indexName: index,
    facetName: facetValuesAttribute,
    maxRecommendations: maxFacetValuesRecommendations,
  });

  useEffect(() => {
    setRecommendationsLoaded(recommendations.length > 0);
  }, [recommendations]);

  const TrendingFacetsItem = ({
    trendingFacetValue
  }) => {
    // trendingFacet prop comes from Recommend, it is not a refinementList item, but we need a refinementList item to do things like refine.
    // We look up the refinementList item which matches the current Recommend item (they are both facet values) and switch item.
    // Item is now the refinementList item, so we can access all of correct functionality like isRefined etc.
    const [isBusy, setBusy] = useState(true);
    const [mergedItem, setMergedItem] = useState(null);

    useEffect(() => {
      if (items.length > 0) {
        let newItems = items.filter(
          (facet) => facet.label === trendingFacetValue.facetValue
        );
        setMergedItem(newItems[0]);
        setBusy(false);
      }
    }, [items]);

    return (
      <>
        {mergedItem && !isBusy && (
          <button
            className={`filters-container__content__list__button-filter ${mergedItem.isRefined ? 'refined-filter' : ''
              }`}
            type="button"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              refine(mergedItem.value);
            }}
          >
            <p>{mergedItem.label}</p>
            <span className="filters-container__content__list__refinement-count">
              {mergedItem.count}
            </span>
          </button>
        )}
      </>
    );
  };

  return (
    <div className="trending-facet-container">
      {recommendations.length > 0 && (
        <div className="filters-container">
          {recommendationsLoaded && (
            <div className="filters-container__title">
              <h3>{facetValuesTitle}</h3>
            </div>
          )}
          <div className="filters-container__list"></div>
          <ul className="filters-container__content">
            {recommendations.map((trendingFacetValue, i) => {
              return recommendationsLoaded ? (
                <TrendingFacetsItem
                  trendingFacetValue={trendingFacetValue}
                  key={`${i}${trendingFacetValue}`}
                />
              ) : (
                <div key={i + 'facetItem'}>
                  <CustomSkeleton type="facet" />
                </div>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WrappedTrendingFacetValues;