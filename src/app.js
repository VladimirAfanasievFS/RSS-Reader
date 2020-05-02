import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import parseRSS from './parseRSS';
import view from './view';
import processState from './namedConstants';
import i18next from './i18next';

const getPreparedUrl = (url) => `https://cors-anywhere.herokuapp.com/${url}`;

const getNewTopics = (state, stream) => {
  const { url, ID } = stream;

  console.log('sending');
  axios.get(getPreparedUrl(url))
    .then((response) => {
      const { items } = parseRSS(response.data);
      const storededTopics = state.rss.topics.filter((topic) => topic.streamID === ID);
      const newTopics = items.filter((item) => {
        const newTopic = storededTopics.filter((topic) => _.isMatch(topic, item));
        return _.isEmpty(newTopic);
      });
      newTopics.forEach((item) => {
        state.rss.topics.push({
          ...item,
          streamID: ID,
        });
      });
      console.log('completed');
    }).catch((error) => {
      console.log(error);
      throw new Error(error);
    });
};

const updateStreams = (state) => {
  const requests = state.rss.streams.map((stream) => getNewTopics(state, stream));
  Promise.all(requests).then(() => {
    setTimeout(() => { updateStreams(state); }, 5000);
  });
};

const addStream = (state) => {
  let { url } = state.form;

  state.processState = processState.sending;
  axios.get(getPreparedUrl(url))
    .then((response) => {
      const { title, description } = parseRSS(response.data);
      state.rss.streams.push({
        url,
        title,
        description,
        ID: _.uniqueId(),
      });
      url = '';
      state.processState = processState.completed;
    }).catch((error) => {
      state.error = error;
      state.processState = processState.errorNetwork;
      throw new Error(error);
    });
};

const validatyInput = (state) => {
  const urls = state.rss.streams.map((el) => el.url);

  const schema = yup.object().shape({

    url: yup.string().url().notOneOf(urls).required(),
  });

  try {
    schema.validateSync(state.form);
    state.processState = processState.valid;
  } catch (error) {
    state.processState = processState.invalid;
    state.error = error.message;
  }
};

const app = () => {
  const state = {
    form: {
      url: '',
    },
    rss: {
      streams: [],
      topics: [],
    },
    processState: processState.init,
    error: null,
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
    validatyInput(state);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addStream(state);
  });

  updateStreams(state);

  const jumbotron = document.querySelector('.jumbotron');
  view(state, jumbotron);
};


export default app;
