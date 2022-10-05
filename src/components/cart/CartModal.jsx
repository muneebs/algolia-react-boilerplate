import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { motion } from 'framer-motion';

import ArticlesCard from './ArticlesCard';

import { cartOpen, cartState } from '@/config/cartFunctions';

//Import scope SCSS
import { useRef } from 'react';
import './SCSS/cartModal.scss';

//Import config from helped navigation
import { cartClick } from '@/config/cartFunctions';
import useOutsideClickConditional from '@/hooks/useOutsideClickConditional';
import { windowSize } from '@/hooks/useScreenSize';
import { framerMotionTransition } from '@/config/animationConfig';

const CartModal = () => {
  // Import all recoil states to show modal + Cart stored and Removed articles
  const [showCart, setShowCart] = useRecoilState(cartOpen);
  const [cartValue, setCartValue] = useRecoilState(cartState);
  // Use ref on click modal and on cart icon + hamburger
  const cartModal = useRef();
  const cartIcon = useRecoilValue(cartClick);

  const { isDesktop } = useRecoilValue(windowSize);

  //Listen for click outside the Demo Guide panel
  useOutsideClickConditional(cartModal, cartIcon, () => setShowCart(false));

  return (
    <motion.div
      initial={{ opacity: 0, x: '120%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={framerMotionTransition}
      className={`${
        !isDesktop
          ? 'modal-container-mobile modal-container'
          : 'modal-container'
      }`}
      ref={cartModal}
    >
      {!isDesktop && (
        <a
          className="modal-container-mobile__close"
          onClick={() => {
            setShowCart(!showCart);
          }}
        >
          x
        </a>
      )}
      <h3 className="modal-container__title">
        My Cart{' '}
        {showCart?.length > 0 && (
          <span className="modal-container__title">({showCart.length})</span>
        )}
      </h3>
      <div className="modal-container__line"></div>
      {cartValue.map((item, i) => {
        if (item.qty !== 0) {
          return <ArticlesCard item={item} key={i} />;
        }
      })}
      {cartValue.length === 0 && <p>Your cart is empty</p>}
      {cartValue.length !== 0 && (
        <a
          className="modal-container__button"
          onClick={() => {
            setCartValue([]);
            localStorage.removeItem('myCart');
          }}
        >
          Empty my cart
        </a>
      )}
    </motion.div>
  );
};

export default CartModal;
