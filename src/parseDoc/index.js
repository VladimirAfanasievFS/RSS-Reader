import _ from 'lodash';


const parseDoc = (document) => {
  const result = [...document].reduce((acc, el) => {
    if (el.localName === 'item') {
      if (!acc[el.localName]) {
        return { ...acc, [el.localName]: parseDoc(el.children) };
      }
      const dep = _.flatten([acc[el.localName], parseDoc(el.children)]);
      return { ...acc, [el.localName]: dep };
    }
    if (el.children.length < 1) {
      return { ...acc, [el.localName]: el.textContent };
    }
    return { ...acc, [el.localName]: parseDoc(el.children) };
  }, {});
  return result;
};

export default parseDoc;
