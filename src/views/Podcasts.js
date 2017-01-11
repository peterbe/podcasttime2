import React, {Component} from 'react';
import {observer,inject} from 'mobx-react';
import {Link} from 'mobx-router';
import views from '../views';
import { RippleCentered, Pagination } from './Common'
import {
  FormattedNumber,
  FormattedRelative,
  FormattedPlural,
 } from 'react-intl'
import './Podcasts.css'

class Podcasts extends Component {

  render() {
    const { store } = this.props;
    const { podcasts, isFetching, page, podcastsSearch } = store.app

    let groups = []
    if (podcasts) {
      let group = []
      podcasts.items.forEach(podcast => {
        if (group.length === 3) {
          groups.push(group)
          group = []
        } else {
          group.push(podcast)
        }
      })
      if (group.length) {
        groups.push(group)
      }
    }
    return (
      <div className="">
        <h2 className="">Podcasts</h2>
        <p>These are the most popular podcasts collected so far</p>
        <h4 className="page-number-header">Page {page}</h4>

        <SearchForm
          search={podcastsSearch}
          store={store}
        />

        { isFetching ? <RippleCentered scale={2}/> : null }
        { podcasts ?
          <div>
            {
              groups.map((group, i) => {
                return (
                  <div className="card-deck" key={i}>
                    {
                      group.map(podcast => {
                        return <PodcastCard
                          key={podcast.id}
                          podcast={podcast}
                          store={store}
                        />
                      })
                    }
                  </div>
                )
              })
            }

            <Pagination
              search={podcastsSearch}
              view={views.podcasts}
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
      <form className="" onSubmit={this.onSubmit}
        style={{marginBottom: 30}}
        >
        <div className="input-group">
          <input
            type="text"
            ref="q"
            name="search"
            placeholder="Search..."
            className="form-control form-control-lg"
            defaultValue={search} />
            <span className="input-group-btn">
              <button className="btn btn-secondary" type="submit">Search</button>
            </span>
        </div>
      </form>
    )
  }
}


class PodcastCard extends Component {

  constructor(props) {
    super(props)
    this.onAddThis = this.onAddThis.bind(this)
  }

  onAddThis(event) {
    event.preventDefault()
    // console.log("ADD ", this.props.podcast);
    const { store, podcast } = this.props
    let ids = store.app.picked.map(p => p.id)
    if (!ids.includes(podcast.id)) {
      ids.push(podcast.id)
    }
    store.router.goTo(
      views.home_found,
      {ids: ids.join('-')},
      store,
    )
  }

  render() {

    const { podcast, store } = this.props
    let updateDate = podcast.last_fetch ? podcast.last_fetch : podcast.modified

    return (
      <div className="card">
        <Link
          view={views.podcast}
          params={{id: podcast.id, slug: podcast.slug}}
          store={store}
        >
        {
          podcast.image ?
          <img src={podcast.image} className="card-img-top" role="presentation"/> :
          <img src="/static/images/no-image.png" className="card-img-top" role="presentation"/>
         }
       </Link>
        <div className="card-block">
          <h4 className="card-title">
            <Link
             className="header"
             view={views.podcast}
             params={{id: podcast.id, slug: podcast.slug}}
             store={store}
            >
             {podcast.name}
            </Link>
          </h4>
          <p className="card-text">
            <PodcastDescription
              episodeCount={podcast.episode_count}
              episodeHours={Math.ceil(podcast.episode_seconds / 3600)}
            />
          </p>
          <p className="card-text">
            Last updated <FormattedRelative value={updateDate} />
          </p>
          <p className="card-text">
            <button
              type="button"
              className="btn"
              onClick={this.onAddThis}
              title="Click to add to your list of podcasts">I listen to this one</button>
          </p>
          <p className="card-text">
            <small className="text-muted">
              Picked <b><FormattedNumber value={podcast.times_picked}/></b> {' '}
              <FormattedPlural
               value={podcast.times_picked}
               one="time"
               other="times"
              />

            </small>
          </p>
        </div>
      </div>
    )
  }
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
