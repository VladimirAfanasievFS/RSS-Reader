import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parseRSS from './parseRSS';
import view from './view';
import processState from './namedConstants';
import i18next from './i18next';

const getPreparedUrl = (url) => `https://cors-anywhere.herokuapp.com/${url}`;

const getNewPosts = (state, feed) => {
  const { url, ID } = feed;

  console.log('sending');
  axios.get(getPreparedUrl(url))
    .then((response) => {
      const { items } = parseRSS(response.data);
      const storededPosts = state.rss.posts.filter((topic) => topic.feedID === ID);
      const newPosts = _.differenceBy(items, storededPosts, 'guid');
      newPosts.forEach((item) => {
        state.rss.posts.unshift({
          ...item,
          feedID: ID,
        });
      });
      console.log('completed');
    });
};

const updateFeeds = (state) => {
  const requests = state.rss.feeds.map((feed) => getNewPosts(state, feed));
  Promise.all(requests).finally(() => {
    setTimeout(() => {
      console.log('timeout');
      updateFeeds(state);
    }, 5000);
  });
};

const addFeed = (state) => {
  const { url } = state.form;

  state.processState = processState.sending;
  axios.get(getPreparedUrl(url))
    .then((response) => {
      const { title, description } = parseRSS(response.data);
      const feed = {
        url,
        title,
        description,
        ID: _.uniqueId(),
      };
      state.rss.feeds.push(feed);
      state.form.url = '';
      state.processState = processState.completed;
      return feed;
    })
    .then((feed) => getNewPosts(state, feed))
    .catch((error) => {
      state.reason = error;
      state.processState = processState.failed;
      throw new Error(error);
    });
};

const validateInput = (state) => {
  const urls = state.rss.feeds.map((el) => el.url);

  const schema = yup.object().shape({

    url: yup.string().url().notOneOf(urls).required(),
  });

  try {
    schema.validateSync(state.form);
    state.processState = processState.valid;
  } catch (error) {
    state.processState = processState.invalid;
    state.reason = error.message;
  }
};

const app = () => {
  const state = {
    form: {
      url: '',
    },
    rss: {
      feeds: [],
      posts: [],
    },
    processState: processState.init,
    reason: null,
  };

  yup.setLocale({
    mixed: {
      notOneOf: i18next.t('app.Rss already exists'),
    },
    string: {
      url: i18next.t('app.this must be a valid URL'),
    },
  });

  const englishButton = document.querySelector('#english');
  englishButton.addEventListener('click', () => {
    i18next.changeLanguage('en');
  });

  const russianButton = document.querySelector('#russian');
  russianButton.addEventListener('click', () => {
    i18next.changeLanguage('ru');
  });

  const form = document.querySelector('form');
  form.elements.url.addEventListener('input', (e) => {
    state.form.url = e.target.value;
    validateInput(state);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addFeed(state);
  });
  updateFeeds(state);

  const jumbotron = document.querySelector('.jumbotron');
  view(state, jumbotron);
};


export default app;
