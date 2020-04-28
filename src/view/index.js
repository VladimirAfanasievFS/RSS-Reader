import { watch } from 'melanke-watchjs';
import processState from '../constant';
import i18next from '../i18next';

const renderFeedBack = (text, colorText) => {
  const feedbackElement = document.createElement('div');
  feedbackElement.classList.add('feedback');
  feedbackElement.classList.add(colorText);
  feedbackElement.innerHTML = text;
  return feedbackElement;
};

const renderRSS = (element, rss) => {
  const existingRow = element.nextElementSibling;
  if (existingRow) {
    existingRow.remove();
  }
  const row = document.createElement('div');
  row.classList.add('row');

  const rssItems = document.createElement('div');
  rssItems.classList.add('col-6');
  rssItems.classList.add('rss-items');
  rss.streams.map((stream) => {
    const div = document.createElement('div');
    const text = document.createElement('p');
    text.innerHTML = `${stream.title} : ${stream.description}`;
    div.appendChild(text);
    rssItems.appendChild(div);
    return null;
  });
  row.appendChild(rssItems);

  const rssLinks = document.createElement('div');
  rssLinks.classList.add('col-6');
  rssLinks.classList.add('rss-links');
  const newTopTopics = rss.topics.map((el) => el).sort((topicA, topicB) => {
    const d1 = new Date(topicA.pubDate);
    const d2 = new Date(topicB.pubDate);
    return d2.getTime() - d1.getTime();
  });
  newTopTopics.map((topic) => {
    const div = document.createElement('div');
    const link = document.createElement('a');
    link.href = topic.link;
    link.innerHTML = topic.title;
    div.appendChild(link);
    rssLinks.appendChild(div);
    return null;
  });
  row.appendChild(rssLinks);
  element.after(row);
};

const view = (state, form, jumbotron) => {
  watch(state.form, 'fields', (prop) => {
    form[prop].value = state.form.fields.url;
  });

  watch(state, 'rss', () => {
    renderRSS(jumbotron, state.rss);
  });

  watch(state, 'processState', () => {
    const feedbackElement = form.nextElementSibling;
    if (feedbackElement) {
      feedbackElement.remove();
    }

    switch (state.processState) {
      case processState.valid: {
        form.elements.add.disabled = false;
        form.elements.url.classList.remove('is-invalid');
        form.after(renderFeedBack(i18next.t('app.URL correct'), 'text-success'));
        break;
      }
      case processState.invalid: {
        form.elements.add.disabled = true;
        form.elements.url.classList.add('is-invalid');

        form.after(renderFeedBack(state.error, 'text-danger'));
        break;
      }
      case processState.errorNetwork: {
        form.elements.add.disabled = false;

        form.after(renderFeedBack(state.error, 'text-danger'));
        break;
      }
      case processState.sending: {
        form.elements.add.disabled = true;
        form.after(renderFeedBack(i18next.t('app.request sending'), 'text-info'));
        break;
      }
      case processState.completed: {
        form.elements.add.disabled = true;
        form.after(renderFeedBack(i18next.t('app.Rss has been loaded'), 'text-success'));
        break;
      }
      default: {
        form.elements.add.disabled = false;
        break;
      }
    }
  });
};

export default view;
