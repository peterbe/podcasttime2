import React from 'react';
import ReactDOM from 'react-dom';
import {MobxRouter, startRouter} from 'mobx-router';
import {Link} from 'mobx-router';
import {IntlProvider} from 'react-intl';
import './index.css';

// mobx
import {Provider} from 'mobx-react'
import store from './store'


// router
import views from './views'
startRouter(views, store)


ReactDOM.render(
  <IntlProvider locale="en">
    <Provider store={store}>
      <div className="site">
        <div className="ui container site-content">
          <div className="ui header">
            <h1>
              <Link view={views.home} store={store}>Podcast Time</Link>
              <span className="sub-title">
                How Much Time Do <i>Your</i> Podcasts Take To Listen To?
              </span>
            </h1>
          </div>
          <MobxRouter/>
        </div>
          <div className="ui container center aligned">
            <div className="ui horizontal bulleted list">
              <Link className="item" view={views.home} store={store}>Home</Link>
              <Link className="item" view={views.picks} store={store}>Picks</Link>
              <Link className="item" view={views.podcasts} store={store}>Podcasts</Link>
            </div>
        </div>
      </div>
    </Provider>
  </IntlProvider>
  ,
  document.getElementById('root')
)
