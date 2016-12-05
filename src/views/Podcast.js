import React, {Component} from 'react';
import {observer,inject} from 'mobx-react';
import {Link} from 'mobx-router';
import views from '../views';
import {
  RippleCentered,
  FormattedNumber,
  FormattedDuration,
  FormattedDate,
  FormattedRelative,
 } from './Common'


class Podcast extends Component {
  render() {

    const { store } = this.props;
    const { podcast, isFetching } = store.app

    // updateDocumentTitle(XXX)
    return (
      <div className="ui container">

        { isFetching ? <RippleCentered scale={2}/> : null }
        { podcast ?
          <div>
            <h1>{ podcast.name }</h1>
            <AddLinks
              store={store}
              id={podcast.id}
              />
            <Metadata
              {...podcast}
              episodeCount={podcast.episodes_count}
              />
            <Episodes
              store={store}
              episodes={podcast.episodes}
              />
          </div>
          : null
        }

      </div>
    )
  }
}

// export default observer(['store'], Home);
export default inject('store',)(observer(Podcast))


const AddLinks = ({ id, store }) => {
  return (
    <div className="ui container">
      <Link
        className="ui button primary"
        view={views.add}
        params={{id: id}}
        to={`/add/${id}`}
        store={store}
      >
        I listen to this!
      </Link>
      <Link
        className="ui button"
        view={views.home}
        store={store}
      >
        Go back to Home
      </Link>
    </div>
  )
}


const Metadata = ({
  name,
  thumb,
  total_seconds,
  times_picked,
  last_fetch,
  modified,
  episodeCount,
}) => {
  return (
    <div className="ui segment clearing">
      {
        thumb ?
        <img
          role="presentation"
          style={{float: 'left'}}
          src={thumb.url}/> :
        <img
          role="presentation"
          style={{float: 'left'}}
          src="/static/images/no-image.png"
          width="300" height="300"/>
      }
      {/* <div style={{marginLeft: 330}}>
        <h2>Title: { name }</h2>
        <h3>
          Number of episodes:{' '}
          <FormattedNumber value={episodeCount} />
        </h3>
        <h3>
          Total amount of content:{' '}
          <FormattedDuration seconds={total_seconds}/>
        </h3>
        <h3>
          Times picked: <FormattedNumber value={times_picked}/>
        </h3>
        <h3>
          Last updated:{' '}
          { last_fetch ?
            <FormattedRelative value={last_fetch}/> :
            <FormattedRelative value={modified}/>
          }
        </h3>
      </div> */}
    </div>
  )
}

const Episodes = ({ episodes }) => {
  // console.log('episodes', episodes);
  return (
    <table className="ui celled table">
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
  console.log('EISODE', episode, episode);
  console.log("FORMATTED", <FormattedDate value={episode.published}/>);
  console.log("RELATIVE", <FormattedRelative value={episode.published} />);
  console.log("DURATION", <FormattedDuration seconds={episode.duration} />);
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
