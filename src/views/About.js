import React, {Component} from 'react';
import {observer,inject} from 'mobx-react';
import {
  FormattedNumber,
} from 'react-intl'

class About extends Component {

  render() {

    const { store } = this.props
    const { statsNumbers } = store.app

    return (
      <div className="">

        <h2>About This Site</h2>

        <p className="lead">
          The purpose of this site is to help you figure out
          {' '}
          <b>how much time your podcasts</b> take to keep up with per time interval.
        </p>
        <p className="lead">
          This web site was built by <a href="https://www.peterbe.com">Peter Bengtsson</a>.
        </p>
        <p>
          It started as a simple script to download and calculate how much
          I have to listen every day to keep up with the podcasts I wanted to
          keep up with.<br/>
          Eventually the script got more advanced and I needed to store the
          data downloaded and slowly it developed into a full app where anybody
          can figure the total time for their podcasts.
        </p>

        {
          statsNumbers ?
          <ShowStatsNumbers numbers={statsNumbers} /> :
          <p><i>fetching some basic stats...</i></p>
        }
      </div>
    )
  }
}

export default inject('store',)(observer(About))


const ShowStatsNumbers = ({ numbers }) => {
  return (
    <div style={{marginTop: 60}}>
      <h4>Numbers</h4>
      <dl className="row">
        <dt className="col-sm-3">Podcasts</dt>
        <dd className="col-sm-9"><FormattedNumber value={numbers.podcasts} /></dd>
        <dt className="col-sm-3">Episodes</dt>
        <dd className="col-sm-9"><FormattedNumber value={numbers.episodes} /></dd>
        <dt className="col-sm-3">Picks</dt>
        <dd className="col-sm-9"><FormattedNumber value={numbers.picks} /></dd>
        <dt className="col-sm-3">Total Hours</dt>
        <dd className="col-sm-9"><FormattedNumber value={numbers.total_hours} /></dd>
      </dl>
    </div>

  )
}
