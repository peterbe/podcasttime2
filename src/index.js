import React from 'react';
import ReactDOM from 'react-dom';
import {MobxRouter, startRouter} from 'mobx-router';
import {Link} from 'mobx-router';
import {IntlProvider} from 'react-intl';

// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';
import './index.css';

// mobx
import {Provider} from 'mobx-react'
import store from './store'


// router
import views from './views'
startRouter(views, store)


// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );

ReactDOM.render(
  <IntlProvider locale="en">
    <Provider store={store}>
      <div className="ui container">
        <h1>{store.app.title}</h1>
        <header>
          Links:
          {' '}
          <Link view={views.home} store={store}>Home</Link>
          {' '}
          <Link view={views.picks} store={store}>Picks</Link>
          {' '}
          <Link view={views.podcasts} store={store}>Podcasts</Link>
          {/* <Link to="/" activeClassName="active">Home</Link> */}
        </header>
          {/* <button onClick={() => store.router.goTo(views.home)}> go home</button> */}
        <MobxRouter/>
      </div>
    </Provider>
  </IntlProvider>
  ,
  document.getElementById('root')
)
