import {defineRouting} from 'next-intl/routing';
 
const routing = defineRouting({
  locales: ['en', 'hu'],
 
  defaultLocale: 'en'
});

export default routing;