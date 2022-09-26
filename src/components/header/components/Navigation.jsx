// Render the navigation menu in the header

// React Router
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
// Recoil Header State
import { queryAtom } from '@/config/searchboxConfig';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

// Import Config for the header
import {
  categoryPageFilterAttribute,
  linksHeader,
  navigationStateAtom,
  selectorNavigationRef,
} from '@/config/navigationConfig';

// Import Recoil config
import {
  shouldHaveLanguages,
  shouldHavePersona,
  shouldHaveSegments,
} from '@/config/featuresConfig';

import { cartOpen, cartState } from '@/config/cartFunctions';
import { Selectors } from '../../selector/Selectors';

// Import segment configuration
import { CartPicto } from '@/assets/svg/SvgIndex';
import { languagesConfig } from '@/config/languagesConfig';
import { personaConfig } from '@/config/personaConfig';
import { segmentConfig } from '@/config/segmentConfig';
import { useEffect } from 'react';
import useStoreCartToLocalStorage from '@/hooks/useStoreCartToLocalStorage';

const Navigation = ({ isMenuOpen, setIsMenuOpen, mobile, tablet }) => {
  // Recoil State
  const setQueryState = useSetRecoilState(queryAtom);
  const [cartOpenValue, setCartOpenValue] = useRecoilState(cartOpen);
  const [showCart, setShowCart] = useRecoilState(cartState);

  // navigate is used by React Router
  const navigate = useNavigate();
  const { state } = useLocation();

  const highlightingCat = () => {
    if (state?.action !== null) {
      if (state?.type === 'filter') {
        return state.action
          .split(':')[1]
          .split('>')
          .pop()
          .replace("'", '')
          .slice(0, -1)
          .toLowerCase();
      } else if (state?.type === 'context') {
        return state?.action.toLowerCase();
      } else {
        null;
      }
    } else {
    }
  };

  // Get references for dropdowns in Navigation
  const selectorsNavigation = useSetRecoilState(selectorNavigationRef);

  // Should show or not the sections
  const shouldShowPersonasAtom = useRecoilValue(shouldHavePersona);
  const shouldShowSegmentsAtom = useRecoilValue(shouldHaveSegments);
  const shouldShowLanguageSelected = useRecoilValue(shouldHaveLanguages);

  // Import the navigation links, as defined in the config
  const links = useRecoilValue(linksHeader);

  let [searchParams, setSearchParams] = useSearchParams();

  const [navigationState, setNavigationState] =
    useRecoilState(navigationStateAtom);

  useEffect(() => {
    if (showCart?.length > 0) {
      console.log('Hello');
      useStoreCartToLocalStorage(showCart);
    }
  }, [showCart]);

  useEffect(() => {
    const getCart = localStorage.getItem('myCart');
    if (getCart) {
      const cleanCart = JSON.parse(getCart);
      const savedCart = cleanCart[cleanCart?.length - 1];
      setShowCart(savedCart);
    }
  }, []);

  return (
    <ul
      className={`${
        isMenuOpen
          ? 'container-mobile__navList-items'
          : 'container__header-nav__links'
      } `}
    >
      {links.map((link, i) => {
        return (
          <li
            id={link.name}
            tabIndex="0"
            key={link.name}
            onClick={() => {
              // Set query to nothing when clicking on a category
              // setQueryState('');

              //Build action based on link type, then navigate
              let action = null;
              if (link.type === 'filter' && link.filter?.length > 0) {
                action = `${categoryPageFilterAttribute}:'${link.filter}'`;
              } else if (link.type === 'context') {
                action = link.context;
              } else if (
                link.type === 'rawFilter' &&
                link.rawFilter?.length > 0
              ) {
                action = `${link.rawFilter}`;
              }

              setNavigationState({
                type: link.type,
                name: link.name,
                action: action,
              });
              searchParams.set('category', link.name);
              navigate({
                pathname: '/search',
                search: `?${searchParams}`,
              });

              // Only used for Mobile view
              if (tablet || mobile) {
                setIsMenuOpen(false);
              }
            }}
          >
            <p
              className={
                highlightingCat() === link.name.toLowerCase() ||
                navigationState?.name === link.name
                  ? 'selected'
                  : ''
              }
            >
              {link.name}
            </p>
          </li>
        );
      })}
      <li className="container__header-nav-selectors" ref={selectorsNavigation}>
        {shouldShowPersonasAtom && (
          <div>
            <Selectors props={personaConfig} />
          </div>
        )}
        {shouldShowSegmentsAtom && (
          <div>
            <Selectors props={segmentConfig} />
          </div>
        )}
        {/* Display the language select component */}
        {shouldShowLanguageSelected && (
          <div>
            <Selectors props={languagesConfig} />
          </div>
        )}
      </li>
      <li
        className="picto-cart"
        onClick={() => {
          setCartOpenValue(!cartOpenValue);
        }}
      >
        <CartPicto />
        {showCart?.length > 0 && (
          <div className="notification-cart">
            <p>{showCart?.length}</p>
          </div>
        )}
      </li>
    </ul>
  );
};

export default Navigation;
