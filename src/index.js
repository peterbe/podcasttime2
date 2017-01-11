import React from 'react';
import ReactDOM from 'react-dom';
import {MobxRouter, startRouter} from 'mobx-router';
import {Link} from 'mobx-router';
import {IntlProvider} from 'react-intl';
import './index.css';
import './sticky-footer.css';

// mobx
import {Provider} from 'mobx-react'
import store from './store'


// router
import views from './views'
startRouter(views, store)


// {/* <div className="site container-fluid">
//   <div className="site-content">
//     <div className="xheader">
//       <h1 className="xheader">
//         <Link view={views.home} store={store}>Podcast Time</Link>
//         <div className="sub header">
//           How Much Time Do <i>Your</i> Podcasts Take To Listen To?
//         </div>
//       </h1>
//       {/* <h1>
//         <Link view={views.home} store={store}>Podcast Time</Link>
//       </h1>
//       <h2>
//           How Much Time Do <i>Your</i> Podcasts Take To Listen To?
//       </h2>
//       <div className="clearfix"></div> */}
//     </div>
//     <MobxRouter/>
//   </div>
//     <div className="">
//       <div className="">
//         <Link className="item" view={views.home} store={store}>Home</Link>
//         <Link className="item" view={views.picks} store={store}>Picks</Link>
//         <Link className="item" view={views.podcasts} store={store}>Podcasts</Link>
//       </div>
//   </div>
// </div> */}


ReactDOM.render(
  <IntlProvider locale="en">
    <Provider store={store}>
      <div>
        <div className="container" style={{marginBottom: 100}}>
          <div className="mt-1">
            <h1><Link view={views.home} store={store}>Podcast Time</Link></h1>
            <div className="sub header">
              How Much Time Do <i>Your</i> Podcasts Take To Listen To?
            </div>
          </div>
          <MobxRouter/>
        </div>

        <footer className="footer">
          <div className="container">
            <Link className="item" view={views.home} store={store}>Home</Link>
            {' • '}
            <Link className="item" view={views.picks} store={store}>Picks</Link>
            {' • '}
            <Link className="item" view={views.podcasts} store={store}>Podcasts</Link>
            {' • '}
            <Link className="item" view={views.about} store={store}>About</Link>
          </div>
        </footer>

      </div>

    </Provider>
  </IntlProvider>
  ,
  document.getElementById('root')
)
