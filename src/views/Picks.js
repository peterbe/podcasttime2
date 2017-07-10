import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Link} from 'mobx-router';
import views from '../views';
import { Pagination, ShowServerResponseError } from './Common'
import './picks.css'


class Picks extends Component {
  render() {

    const { store } = this.props
    const {
      picks,
      isFetching,
      page,
      serverResponseError,
     } = store.app

    let items = null
    if (!isFetching && picks) {
      items = (
        <div>
          { picks.items.map(pick => {
            return <Pick store={store} key={pick.id} pick={pick}/>
          })
          }
          <Pagination
            store={store}
            view={views.picks}
            pagination={picks.pagination}/>
        </div>
      )
    }

    return (
      <div className="">
        <h2 className="">Picks</h2>
        <p><b>Picks</b> are collections of podcasts that people have chosen.</p>
        <h3>Page {page}</h3>

        { isFetching ? <h4>Fetching...</h4> : null }
        <ShowServerResponseError error={serverResponseError}/>

        { items }
      </div>
    );
  }
}

export default inject('store')(observer(Picks))



const Pick = ({ pick, store }) => {
  return (
    <div
      className=""
      style={{border: '1px solid #555', margin: 15, padding: 10}}>
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
  return (
    <figure
      className="figure"
      style={{marginRight: 4}}
      title={podcast.name}>
      <Link
        view={views.podcast}
        store={store}
        params={{id: podcast.id, slug: podcast.slug}}>
        <img
          className="figure-img img-fluid rounded"
          src={podcast.image ? podcast.image : '/static/podcasttime/images/no-image.png'}
          alt="thumbnail"
          style={{width: 100}}/>
      </Link>
      <figcaption className="figure-caption" style={{textAlign: 'center'}}
        title="Times picked">
        <span className="badge badge-pill badge-default">{podcast.times_picked}</span>
      </figcaption>
    </figure>
  )
}

//
// const Pagination = ({ pagination, store }) => {
//
//   const prev = (page) => {
//     return `← Page ${page}`
//   }
//
//   const next = (page) => {
//     return `Page ${page} →`
//   }
//
//   const current = (number, pages) => {
//     return `Page ${number} of ${pages}`
//   }
//
//   let nextLink = null
//   if (pagination.has_next) {
//     nextLink = (
//       <Link
//         className="item"
//         view={views.picks}
//         store={store}
//         params={{page: pagination.next_page_number}}
//       >
//         {next(pagination.next_page_number)}
//       </Link>
//     )
//   } else {
//     nextLink = (
//       <a className="item disabled">
//         Page{' '}{pagination.num_pages}
//       </a>
//     )
//   }
//
//   let prevLink = null
//   if (pagination.has_previous) {
//     prevLink = (
//       <Link
//         className="item"
//         view={views.picks}
//         store={store}
//         params={pagination.previous_page_number}
//       >
//         {prev(pagination.previous_page_number)}
//       </Link>
//     )
//   } else {
//     prevLink = (
//       <a className="item disabled">
//         Page 1
//       </a>
//     )
//   }
//
//   return (
//     <div className="ui two column centered grid" style={{marginTop: 100}}>
//       <div className="ui pagination menu">
//         { prevLink }
//         <a className="item disabled">
//           {current(pagination.number, pagination.num_pages)}
//         </a>
//         { nextLink }
//       </div>
//     </div>
//   )
// }
