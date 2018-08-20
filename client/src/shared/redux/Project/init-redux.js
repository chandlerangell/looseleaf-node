import {
  createStore,
  combineReducers, // Use the combineReducers function to create one root reducer. In bigger apps you will have many reducers.
  applyMiddleware,
  compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import loggerMiddleware from 'redux-logger';
import project from './reducers/project';

export default function (initialStore={}) {
  const reducer = combineReducers({
    project
  });
  const middleware = [thunkMiddleware, loggerMiddleware];
  return compose(
    applyMiddleware(...middleware)
  )(createStore)(reducer, initialStore); // the initialStore value is passed into the Redux createStore function. The store is now hydrated with the data from the server
}
