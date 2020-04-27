import _ from 'lodash';

const convertToObject = (document) => {
  if (document.children.length === 0) {
    return { [document.localName]: document.textContent };
  }
  return [...document.children].reduce((acc, el) => ({ ...acc, ...convertToObject(el) }), {});
};

const parseXML = (XMLSource) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(XMLSource, 'application/xml');
  const title = convertToObject(doc.querySelector('channel>title'));
  const description = convertToObject(doc.querySelector('channel>description'));
  const items = [...doc.querySelectorAll('channel>item')].map(convertToObject);


  const result = {
    ...title,
    ...description,
    items,
    ID: _.uniqueId(),
  };

  return result;
};

export default parseXML;
