import React, {Component} from 'react';
import {observer,inject} from 'mobx-react';
import {Link} from 'mobx-router';
import views from '../views';
import {
  RippleCentered,
  FormattedDuration,
  ShowServerResponseError,
 } from './Common'
import {
  FormattedRelative,
  FormattedDate,
  FormattedNumber,
} from 'react-intl'
import './Podcast.css'

class Podcast extends Component {
  constructor(props) {
    super(props)
    this.onAddThis = this.onAddThis.bind(this)
  }

  onAddThis(event) {
    event.preventDefault()
    const { store } = this.props
    let ids = store.app.picked.map(p => p.id)
    if (!ids.includes(store.app.podcast.id)) {
      ids.push(store.app.podcast.id)
    }
    store.router.goTo(
      views.home_found,
      {ids: ids.join('-')},
      store,
    )
  }

  render() {

    const { store } = this.props
    const {
      podcast,
      podcastEpisodes,
      isFetching,
      serverResponseError,
      podcastNotFound,
    } = store.app

    return (
      <div className="">

        <ShowServerResponseError error={serverResponseError}/>

        { isFetching ? <RippleCentered scale={2}/> : null }
        { podcast && podcast._updating ? <p>Updating right now...</p> : null }
        { podcast && podcast._has_error ? <p>Last update failed.</p> : null }
        { podcastNotFound ? <PodcastNotFound store={store}/> : null }
        { podcast ?
          <div>

            <Metadata
              podcast={podcast}
              />
            <div id="add-links">
              <AddLinks
                store={store}
                id={podcast.id}
                onAddThis={this.onAddThis}
                />
            </div>

            <div id="episodes">
              {
                podcastEpisodes && podcastEpisodes.length && podcastEpisodes[0].title ?
                <Episodes
                  store={store}
                  episodes={podcastEpisodes}
                  />
                :
                <EpisodesWithoutTitles
                  store={store}
                  episodes={podcastEpisodes}
                  />
              }
            </div>

          </div>
          : null
        }
      </div>
    )
  }
}

export default inject('store',)(observer(Podcast))


const PodcastNotFound = ({ store }) => {
  return (
    <div className="podcast-not-found">
      <h2>Podcast Not Found</h2>
      <Link
        className="btn btn-secondary"
        role="button"
        view={views.home}
        store={store}
      >
        Back to Home
      </Link>
    </div>
  )
}

const AddLinks = ({ id, store, onAddThis }) => {
  let homeLink = (
    <Link
      className="btn btn-secondary"
      role="button"
      view={views.home}
      store={store}
    >
      Back to Home
    </Link>
  )
  if (store.app.picked.length) {
    let ids = store.app.picked.map(p => p.id)
    homeLink = (
      <Link
        className="btn btn-secondary"
        view={views.home_found}
        params={{ids: ids.join('-')}}
        store={store}
      >
        Back to Home
      </Link>
    )
  }
  return (
    <div className="clearfix container">
      <div className="row justify-content-center">
        <a
          className="btn btn-primary"
          role="button"
          onClick={onAddThis}
        >
          I listen to this!
        </a>
        {' '}
        { homeLink }
      </div>
    </div>
  )
}


const Metadata = ({ podcast }) => {
  return (
    <div className="metadata">
      <div className="item row">
        <div className="image col-4">
          <img
            className="img-thumbnail"
            role="presentation"
            style={{float: 'left'}}
            src={podcast.thumbnail_348 ? podcast.thumbnail_348 : process.env.PUBLIC_URL + '/static/images/no-image.png'}/>
        </div>
        <div className="content col-8">
          <h1>
            { podcast.name }
          </h1>
          <dl className="row">
            <dt className="col-sm-4">Episodes</dt>
            <dd className="col-sm-8">
              { podcast.episodes_count !== null ?
                <FormattedNumber value={podcast.episodes_count} /> :
                <i>currently unknown</i>
              }
            </dd>

            <dt className="col-sm-4">Total amount of content</dt>
            <dd className="col-sm-8"><FormattedDuration seconds={podcast.total_hours * 3600}/></dd>

            <dt className="col-sm-4">Times picked</dt>
            <dd className="col-sm-8"><FormattedNumber value={podcast.times_picked}/></dd>

            <dt className="col-sm-4">Last updated</dt>
            <dd className="col-sm-8">
              <FormattedRelative value={podcast.last_fetch ? podcast.last_fetch : podcast.modified }/>
            </dd>
            <dt className="col-sm-4">Last episode</dt>
            <dd className="col-sm-8">{ podcast.latest_episode ?
              <FormattedRelative value={podcast.latest_episode}/> :
              <span>none</span>
            }</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

const Episodes = ({ episodes }) => {
  return (
    <ul className="list-unstyled">
      {
        episodes.map(episode => {
          return (
            <li className="media" key={episode.guid}>
              {/* <img className="d-flex mr-3" src={process.env.PUBLIC_URL + '/static/images/play-64x64.png'} alt="Play"/> */}
              <div className="media-body">
                <h4 className="mt-0 mb-1">{ episode.title }</h4>
                <p className="episode-metadata">
                  Published:{' '}
                  <FormattedDate value={episode.published}/>{' '}
                  (<FormattedRelative value={episode.published} />)
                  {'   Duration: '}
                  <FormattedDuration seconds={episode.duration} />
                </p>
                <p>{ episode.summary }</p>
              </div>
            </li>
          )
        })
      }

    </ul>
  )
}

const EpisodesWithoutTitles = ({ episodes }) => {
  if (!episodes) {
    return null
  }
  return (
    <table className="table table-sm">
      <thead>
        <tr>
          <th>Published</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        {
          episodes.map(episode => {
            return <EpisodeRow key={episode.guid} episode={episode}/>
          })
        }
      </tbody>
    </table>
  )
}

const EpisodeRow = ({ episode }) => {
  return (
    <tr>
      <td>
        <FormattedDate value={episode.published}/>{' '}
        <small>
          (<FormattedRelative value={episode.published} />)
        </small>
      </td>
      <td>
        <FormattedDuration seconds={episode.duration} />
      </td>
    </tr>
  )
}
