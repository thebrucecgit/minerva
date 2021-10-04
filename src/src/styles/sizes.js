export const breakpoints = {
  sm: 576,
  md: 640,
  lg: 768,
  xl: 1124,
};

const mediaQuery = (key) => (style) =>
  `@media (min-width: ${breakpoints[key]}px) { ${style} }`;

export default mediaQuery;
