import Vue from 'vue';

export const buildSearchParamsWithLocale = search => {
  const locale = Vue.config.lang;
  if (search) {
    search = `${search}&locale=${locale}`;
  } else {
    search = `?locale=${locale}`;
  }
  return search;
};

export const getLocale = (search = '') => {
  const searchParamKeyValuePairs = search.split('&');
  return searchParamKeyValuePairs.reduce((acc, keyValuePair) => {
    const [key, value] = keyValuePair.split('=');
    if (key === 'locale') {
      return value;
    }
    return acc;
  }, undefined);
};
