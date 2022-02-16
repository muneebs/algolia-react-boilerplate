import { motion } from 'framer-motion';
import React from 'react';

// Import config framer Motion
import { listItem } from '../../config/config';
// GIFT CARD
const GiftCard = ({ hit }) => {
  return (
    <motion.li
      variants={listItem}
      initial="hidden"
      animate="show"
      className="hit-list"
    >
      <div className="image-wrapper">
        <img src={hit.image.desktop_url} alt="" />
      </div>
    </motion.li>
  );
};

export default GiftCard;