/**
 * @module PropTypes
 * @license MIT
 */

import PropTypes from 'prop-types';

export const storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired
});
