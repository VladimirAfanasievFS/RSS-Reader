import i18next from 'i18next';
import resources from '../locales';

const updateContent = () => {
  document.querySelector('.jumbotron>h1').innerHTML = i18next.t('html.RSS Reader');
  document.querySelector('.jumbotron>.lead').innerHTML = i18next.t('html.Start reading RSS today! It is easy, it is nicely');
  document.querySelector('[id=example]').innerHTML = i18next.t('html.hexletLink');
  document.querySelector('[id=example2]').innerHTML = i18next.t('html.30SecondLink');
};

i18next.init({
  lng: 'en',
  // ns: 'common',
  defaultNS: 'common',
  debug: true,
  resources,
}).then(() => {
  updateContent();
});


i18next.on('languageChanged', () => {
  updateContent();
});

export default i18next;
