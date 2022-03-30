// This is the Search Results Page that you'll see on a normal computer screen

import { useState } from 'react';
// eslint-disable-next-line import/order
import { Pagination, Configure, Index } from 'react-instantsearch-dom';

import { useLocation } from 'react-router-dom';

// import framer motion
import { motion } from 'framer-motion';
import {
  framerMotionPage,
  framerMotionFacet,
} from '../../../config/animationConfig';

// Recoil state to directly access results
import { useRecoilValue } from 'recoil';

import { isStats, isInjectedHits } from '../../../config/config';
import { sortBy } from '../../../config/sortByConfig';
import { queryAtom } from '../../../config/searchbox';

// Import Persona State from recoil
import { personaSelectedAtom } from '../../../config/personaConfig';

// Import Components
import CustomClearRefinements from '../../../components/facets/ClearRefinement';
import CustomCurrentRefinements from '../../../components/facets/CurrentRefinement';
import GenericRefinementList from '../../../components/facets/Facets';
import CustomHitsComponent from '../../../components/hits/CustomHits';
import GiftCard from '../../../components/hits/GiftCard';
import { Hit } from '../../../components/hits/Hits';
import InfluencerCard from '../../../components/hits/InfluencerCard';
import NikeCard from '../../../components/hits/SalesCard';
import CustomSortBy from '../../../components/searchresultpage/SortBy';
import { CustomStats } from '../../../components/searchresultpage/Stats';
import { InjectedHits } from '../../../components/searchresultpage/injected-hits';

import {
  indexName,
  injectedContentIndex,
} from '../../../config/algoliaEnvConfig';

// Handle the number of hits per page
import { hitsPerPage } from '../../../config/hits';

// Import Config File
import { customDataByType } from '../../../utils';

const SrpLaptop = () => {
  // Recoil & React states

  const stats = useRecoilValue(isStats);
  const shouldInjectContent = useRecoilValue(isInjectedHits);
  const queryState = useRecoilValue(queryAtom);
  const [injected, setInjected] = useState(false);

  // Define Stat Const
  const { hitsPerPageNotInjected, hitsPerPageInjected } = hitsPerPage;

  // Define Price Sort By Const
  const { value: priceSortBy, labelIndex: labelItems } = sortBy;

  // Get states of React Router
  const { state } = useLocation();

  // Persona
  const userToken = useRecoilValue(personaSelectedAtom);

  return (
    <div className="srp-container">
      <motion.div
        variants={framerMotionFacet}
        initial={framerMotionFacet.initial}
        animate={framerMotionFacet.animate}
        exit={framerMotionFacet.exit}
        transition={framerMotionFacet.transition}
        className="srp-container__facets"
      >
        <GenericRefinementList />
      </motion.div>
      <motion.div
        className="srp-container__hits"
        variants={framerMotionPage}
        initial={framerMotionPage.initial}
        animate={framerMotionPage.animate}
        exit={framerMotionPage.exit}
        transition={framerMotionPage.transition}
      >
        {/* This is above the items and shows the Algolia search speed and the sorting options (eg. price asc) */}
        <div className="srp-container__stats-sort">
          {stats && <CustomStats />}
          {priceSortBy && (
            <CustomSortBy
              items={labelItems}
              defaultRefinement={indexName.index}
            />
          )}
        </div>
        {/* Refinements, to the left of the items, including a list of currently selected refinements */}
        <div className="refinement-container">
          <CustomCurrentRefinements />
          <CustomClearRefinements />
        </div>
        <Configure
          hitsPerPage={injected ? hitsPerPageInjected : hitsPerPageNotInjected}
          analytics={false}
          userToken={userToken}
          enablePersonalization={true}
          filters={state ? state : ''}
          query={queryState && queryState}
        />
        <Index indexName={injectedContentIndex}>
          <Configure hitsPerPage={1} page={0} />
        </Index>
        {/* This is a big ternary, where it injects a card (eg. Sale card) or renders an item */}
        {shouldInjectContent ? (
          <InjectedHits
            hitComponent={Hit}
            slots={({ resultsByIndex }) => {
              const indexValue = indexName.index;
              const { noCta, nikeCard } = customDataByType(
                resultsByIndex?.[indexValue]?.userData
              );
              // eslint-disable-next-line no-lone-blocks
              {
                // eslint-disable-next-line no-unused-expressions
                nikeCard && setInjected(true);
              }
              return [
                {
                  getHits: () => [noCta],
                  injectAt: noCta ? noCta.position : null,
                  slotComponent: GiftCard,
                },
                {
                  getHits: () => [nikeCard],
                  injectAt: nikeCard ? nikeCard.position : null,
                  slotComponent: NikeCard,
                },
                {
                  injectAt: ({ position }) => position === 2,
                  // eslint-disable-next-line no-shadow
                  getHits: ({ resultsByIndex }) => {
                    setInjected(true);
                    return resultsByIndex[injectedContentIndex]
                      ? resultsByIndex[injectedContentIndex].hits || []
                      : [];
                  },
                  slotComponent: InfluencerCard,
                },
              ];
            }}
          />
        ) : (
          <CustomHitsComponent />
        )}
        <Pagination />
      </motion.div>
    </div>
  );
};

export default SrpLaptop;