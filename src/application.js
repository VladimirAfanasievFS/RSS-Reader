import * as yup from 'yup';
import axios from 'axios';
import parseXML from './parser/index';
import view from './view/index';
import { processState } from './constant';


const validatyInput = (state) => {
  yup.setLocale({
    mixed: {
      notOneOf: 'Rss already exists',
    },
    string: {
      url: 'thisSS must be a valid URL',
    },
  });

  const urls = state.rss.streams.map((el) => el.url);

  const schema = yup.object().shape({

    url: yup.string().url().notOneOf(urls).required(),
  });
  try {
    schema.validateSync(state.form.fields);
    state.message = 'OK';
    state.processState = processState.valid;
    // state.error = {};
  } catch (error) {
    console.log(error);
    state.processState = processState.invalid;
    state.error = error.message;
  }
};


const app = () => {
  const state = {
    form: {
      fields: {
        url: '',
      },
    },
    rss: {
      streams: [],
      topics: [],
    },
    processState: processState.init,
    error: {},
    message: '',
  };

  const form = document.querySelector('form');
  const jumbotron = document.querySelector('.jumbotron');

  form.elements.url.addEventListener('input', (e) => {
    state.form.fields.url = e.target.value;
    validatyInput(state);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let { url } = state.form.fields;
    const preparedUrl = `http://cors-anywhere.herokuapp.com/${url}`;

    state.message = 'sending';
    state.processState = processState.sending;
    axios({
      method: 'get',
      url: preparedUrl,
    })
      .then((response) => {
        const {
          title, description, items, ID,
        } = parseXML(response.data);

        state.rss.streams.push({
          url: state.form.fields.url,
          title,
          description,
          ID,
        });
        items.map((item) => {
          state.rss.topics.push({
            ...item,
            streamID: ID,
          });
          return null;
        });

        state.message = 'success comleted';
        state.processState = processState.completed;
      }).catch((error) => {
        state.error = error;
        state.processState = processState.invalid;
      });

    url = '';
  });

  view(state, form, jumbotron);
};


export default app;
