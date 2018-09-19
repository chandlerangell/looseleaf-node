import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { matchRoutes } from 'react-router-config';
import { Provider } from 'react-redux';
import configureStore from '../src/shared/redux/configureStore/userPage';
import { getRoutes } from '../src/shared/UserPage/routes';
import HTML from '../src/shared/UserPage/HTML';
import App from '../src/shared/UserPage/App';

export default function renderUserPage(req, res, next, user) {
  const preloadedState = {
    user: { info: user, loggedinUser: req.user },
  }

  const store = configureStore(preloadedState);
  const dataToSerialize = preloadedState;
  const meta = {
    title: `${user.displayName} - LooseLeaf`
  };

  const branch = matchRoutes(getRoutes(user.username), req.url);
  const promises = branch.map(({ route, match }) => {
    return route.loadData
      ? route.loadData(match)
      : Promise.resolve(null)
  });
  Promise.all(promises).then(data => {
    // data will be an array[] of datas returned by each promises.
  	// console.log(data)
  	const context = data.reduce( (context, data) => {
  		return Object.assign(context, data)
  	}, {})

		const app = renderToString(
      <Provider store={store}>
        <StaticRouter location={req.url} context={context} >
          <App />
        </StaticRouter>
      </Provider>
		);

    if(context.url) {
			res.writeHead(301, {Location: context.url})
			res.end()
		}
    const html = renderToString(
      <HTML
        meta={meta}
        dataToSerialize={dataToSerialize}
        html={app}
      />
    );
    return res.send(`<!DOCTYPE html>${html}`);
  }).catch(reason => {
    console.log(reason)
  });
}
