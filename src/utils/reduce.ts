export const reduceBy = (data, by = 'slug') =>
  data && data.reduce((dict, el, _index) => ((dict[el[by]] = el), dict), {})
