import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Link} from 'mobx-router';
import views from '../views';

class Picks extends Component {
  render() {

    const {store} = this.props;
    const { picks, isFetching, page } = store.app
    // const {router: {goTo}} = store;

    // console.log("STORE.PICKS", picks);
    // if (picks) {
    //   console.log("  ITEMS", picks.items);
    //   // console.log("  PAGE", picks.page);
    //   console.log("  PAGINATION", picks.pagination);
    // }

    let items = null
    if (!isFetching) {
      items = (
        <div>
          { picks.items.map(pick => {
            return <Pick store={store} key={pick.id} pick={pick}/>
          })
          }
          <Pagination
            store={store}
            pagination={picks.pagination}/>
        </div>
      )
    }

    // updateDocumentTitle("Picks")XXX
    return (
      <div className="ui container">
        <h3> Picks - Page {page}</h3>

        { isFetching ? <h4>Fetching...</h4> : null }

        { items }
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

// export default observer(['store'], Picks);
// export default inject('store',)(observer(Picks))
export default inject('store')(observer(Picks))




const Pick = ({ pick, store }) => {
  // XXX stop using style tags
  return (
    <div
      className="ui eight cards segment"
      style={{marginBottom:5}}>
      {
        pick.podcasts.map(podcast => {
          return <Podcast
            store={store}
            key={podcast.id}
            podcast={podcast}/>
        })
      }
    </div>
  )
}

const Podcast = ({podcast, store}) => {
  // let linkURL = `/podcasts/${podcast.id}/${podcast.slug}` XXX
  return (
    <div
      className="ui centered card"
      title={podcast.name}>
      <Link
        className="image"
        view={views.podcast}
        store={store}
        params={{id: podcast.id, slug: podcast.slug}}>
        {
          podcast.image ?
          <img src={podcast.image} role="presentation"/> :
          <img src="/static/podcasttime/images/no-image.png"  role="presentation"/>
         }
         <span className="floating ui teal label" title="Times picked">
           {podcast.times_picked}
         </span>
      </Link>
    </div>
  )
}


const Pagination = ({ pagination, store }) => {

  const prev = (page) => {
    return `← Page ${page}`
  }

  const next = (page) => {
    return `Page ${page} →`
  }

  const current = (number, pages) => {
    return `Page ${number} of ${pages}`
  }

  let nextLink = null
  if (pagination.has_next) {
    nextLink = (
      <Link
        className="item"
        view={views.picks}
        store={store}
        params={{page: pagination.next_page_number}}
      >
        {next(pagination.next_page_number)}
      </Link>
    )
  } else {
    nextLink = (
      <a className="item disabled">
        Page{' '}{pagination.num_pages}
      </a>
    )
  }

  let prevLink = null
  if (pagination.has_previous) {
    prevLink = (
      <Link
        className="item"
        view={views.picks}
        store={store}
        params={pagination.previous_page_number}
      >
        {prev(pagination.previous_page_number)}
      </Link>
    )
  } else {
    prevLink = (
      <a className="item disabled">
        Page 1
      </a>
    )
  }

  return (
    <div className="ui two column centered grid" style={{marginTop: 100}}>
      <div className="ui pagination menu">
        { prevLink }
        <a className="item disabled">
          {current(pagination.number, pagination.num_pages)}
        </a>
        { nextLink }
      </div>
    </div>
  )
}
// Pagination.propTypes = {
//   pagination: PropTypes.object.isRequired,
// }
