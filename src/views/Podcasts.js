import React, {Component} from 'react';
import {observer,inject} from 'mobx-react';
import {Link} from 'mobx-router';
import views from '../views';
import { RippleCentered } from './Common'
import {
  FormattedNumber,
  FormattedRelative,
  FormattedPlural,
 } from 'react-intl'


class Podcasts extends Component {

  render() {
    const { store } = this.props;
    const { podcasts, isFetching, page, podcastsSearch } = store.app

    return (
      <div className="ui container">
        <h3>Picks - Page {page}</h3>

        <SearchForm
          search={podcastsSearch}
          store={store}
        />

        { isFetching ? <RippleCentered scale={2}/> : null }
        { podcasts ?
          <div>
            <div className="ui link cards">
              {
                podcasts.items.map(podcast => {
                  return <PodcastCard
                    key={podcast.id}
                    podcast={podcast}
                    store={store}
                  />
                })
              }
            </div>
            <Pagination
              search={podcastsSearch}
              pagination={podcasts.pagination}
              store={store}
            />
          </div> : null
        }

      </div>
    )
  }
}

export default inject('store',)(observer(Podcasts))


class SearchForm extends Component {

  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(event) {
    event.preventDefault()
    let search = this.refs.q.value.trim()
    this.props.store.router.goTo(
      views.podcasts,
      {page: 1},
      this.props.store,
      {search: search}
    )
  }

  render() {
    let { search } = this.props
    return (
      <form className="ui search" onSubmit={this.onSubmit}
        style={{marginBottom: 30}}
        >
        <div className="ui fluid huge icon input">
          <input
            type="text"
            ref="q"
            name="search"
            placeholder="Search..."
            defaultValue={search} />
          <i className="search icon"></i>
        </div>
      </form>
    )
  }
}


const PodcastCard = ({ podcast, store }) => {
  let updateDate = podcast.last_fetch ? podcast.last_fetch : podcast.modified
  return (
    <div className="ui centered card">
      <Link
        className="image"
        view={views.podcast}
        params={{id: podcast.id, slug: podcast.slug}}
        store={store}
      >
        {
          podcast.image ?
          <img src={podcast.image} role="presentation"/> :
          <img src="/static/images/no-image.png" role="presentation"/>
         }
      </Link>

      <div className="content">
        <Link
          className="header"
          view={views.podcast}
          params={{id: podcast.id, slug: podcast.slug}}
          store={store}
        >
          {podcast.name}
        </Link>
        <div className="meta">
          <span className="date">
            Last updated <FormattedRelative value={updateDate} />
          </span>
        </div>
        <div className="description">
          <PodcastDescription
            episodeCount={podcast.episode_count}
            episodeHours={Math.ceil(podcast.episode_seconds / 3600)}
            />
        </div>
      </div>

      <div className="extra content">
        <a>
          Picked <b><FormattedNumber value={podcast.times_picked}/></b> {' '}
          <FormattedPlural
            value={podcast.times_picked}
            one="time"
            other="times"
          />
        </a>
      </div>

    </div>
  )
}

const PodcastDescription = ({ episodeCount, episodeHours}) => {
  if (episodeCount) {
    return (
      <span>
        <b><FormattedNumber value={episodeCount} /></b> episodes,{' '}
        <b><FormattedNumber value={episodeHours} /></b> hours of content.
      </span>
    )
  } else {
    return <i>episodes currently unknown</i>
  }
}
// PodcastDescription.propTypes = {
//   episodeCount: PropTypes.number.isRequired,
//   episodeHours: PropTypes.number.isRequired,
// }


// XXX find a way to share this code with the Pagination in Picks.js
const Pagination = ({
  pagination,
  search,
  store,
}) => {

  const prev = (page) => {
    return `← Page ${page}`
  }

  const next = (page) => {
    return `Page ${page} →`
  }

  const current = (number, pages) => {
    return `Page ${number} or ${pages}`
  }

  let nextLink = null
  if (pagination.has_next) {
    // let nextURL = '/podcasts'
    // if (search) {
    //   nextURL += '/' + search
    // }
    // nextURL += '/p' + pagination.next_page_number
    nextLink = (
      <Link
        className="item"
        view={views.podcasts}
        params={{page: pagination.next_page_number}}
        queryParams={{search: search}}
        store={store}
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
    // let prevURL = '/podcasts'
    // if (search) {
    //   prevURL += '/' + search
    // }
    prevLink = (
      <Link
        className="item"
        view={views.podcasts}
        params={{page: pagination.previous_page_number}}
        queryParams={{search: search}}
        store={store}
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
