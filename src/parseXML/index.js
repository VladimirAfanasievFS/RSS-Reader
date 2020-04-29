
const toObject = (document) => {
  if (document.children.length === 0) {
    return { [document.localName]: document.textContent };
  }
  return [...document.children].reduce((acc, el) => ({ ...acc, ...toObject(el) }), {});
};
const parseXML = (XMLSource) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(XMLSource, 'application/xml');
  const title = doc.querySelector('channel>title').textContent;
  const description = doc.querySelector('channel>description').textContent;
  const items = [...doc.querySelectorAll('channel>item')].map(toObject);


  const result = {
    title,
    description,
    items,
  };

  return result;
};

export default parseXML;
