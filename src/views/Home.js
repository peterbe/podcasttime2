import React, {Component} from 'react';
import {observer,inject} from 'mobx-react';
// import {Link} from 'mobx-router';
// import views from '../views';

class Home extends Component {
  render() {

    // const {store} = this.props;
    // const {router: {goTo}} = store;

    return (
      <div>
        <h3> Home </h3>

        {/* <Link view={views.gallery} store={store}> Go to gallery </Link>

        <br/>
        <br/>
        <Link view={views.gallery} store={store} queryParams={{start: 5}}>
          Go to gallery and start from 5th image
        </Link>

        <br/>
        <br/>

        <Link view={views.document} params={{id: 456}} title="Go to document 456" store={store}/>

        <br/>
        <br/>

        <Link view={views.document} params={{id: 999}} store={store}>
          <div style={{display: 'inline-block'}}>
            Go to document <b> 999 </b>
          </div>
        </Link>

        <br/>
        <br/>

        <button onClick={() => goTo(views.document, {id: 123}, store)}> Go to document 123</button>

        <br/>
        <br/>

        <Link view={views.book} params={{id: 250, page: 130}} title="Go to book 250, page 130" store={store}/>

        <br/>
        <br/>

        <button onClick={() => goTo(views.userProfile, {username: 'kitze', tab: 'articles'}, store)}>
          go to user kitze
        </button> */}

      </div>
    );
  }
}

// export default observer(['store'], Home);
export default inject('store',)(observer(Home))
