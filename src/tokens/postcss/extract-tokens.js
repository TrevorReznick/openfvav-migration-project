export default ({ colorTokens = {}, customVariables = {}, typographyTokens = {} } = {}) => {
  const sanitizeValue = (val) => {
    let v = (val || '').trim();
    v = v.replace(/(^|\s)(\d*\.?\d+)\s*re\b/gi, '$1$2rem');
    return v;
  };
  return {
    postcssPlugin: 'extract-tokens',
    Once(root) {
      root.walkDecls((decl) => {
        const prop = decl.prop || '';
        const value = sanitizeValue(decl.value || '');
        if (prop.startsWith('--color-')) {
          const tokenName = prop.slice(8);
          colorTokens[tokenName] = value;
        } else if (prop.startsWith('--font-')) {
          const key = prop.slice(7);
          typographyTokens[key] = value;
        } else if (prop.startsWith('--space-')) {
          const key = prop.slice(8);
          typographyTokens[`space-${key}`] = value;
        } else if (prop.startsWith('--')) {
          customVariables[prop] = value;
        }
      });
    },
  };
};

export const postcss = true;