import React, {Component} from 'react'

import ReactTable from 'react-table'
import {observer,inject} from 'mobx-react';

import 'react-table/react-table.css'
import './AllPodcasts.css'

// import {
//   FormattedNumber,
// } from 'react-intl'

class AllPodcasts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      pages: null,
      loading: true,
    }
  }

  fetchData(state, instance) {
    let url = '/api/podcasttime/podcasts/table/'
    url += `?page_size=${state.pageSize}`
    url += `&page=${state.page}`
    state.sorting.forEach(s => {
      url += `&sorting=${s.id}:${s.desc}`
    })
    fetch(url)
    .then(r => r.json())
    .then(res => {
      this.setState({
        data: res.rows,
        pages: res.pages,
        loading: false,
      })
    })
  }

  render() {

    // const { store } = this.props
    // const { statsNumbers } = store.app

    return (
      <ReactTable
        columns={[{
          header: 'Name',
          accessor: 'name',
          id: 'name'
        }, {
          header: 'Last Fetch',
          accessor: 'last_fetch',
          id: 'last_fetch',
        }, {
          header: 'Times Picked',
          accessor: 'times_picked',
          style: {textAlign: 'right'},
        }, {
          header: 'Latest Episode',
          accessor: 'latest_episode',
        }, {
          header: 'Episode Count',
          accessor: 'episodes_count',
          style: {textAlign: 'right'},
          sortable: false,
        }, {
          header: 'Has Error',
          accessor: 'error',
          // id: 'error',
          // accessor: d => d.error && d.error.length
          // accessor: d => d.error ? 'error!'&& d.error.length
        }, {
          header: 'Modified',
          accessor: 'modified',
          // id: 'modified',
          // accessor: d => !!d.error
        }]}
        getTdProps={(state, rowInfo, column, instance) => {
          return {
            onClick: e => {
              if (column.id === 'name') {
                const url = `/podcasts/${rowInfo.row.id}/${rowInfo.row.slug}`
                window.open(url, rowInfo.row.name)
              } else {
                console.log(rowInfo.row[column.id]);
              }

              // console.log('A Td Element was clicked!')
              // console.log('it produced this event:', e)
              // console.log('It was in this column:', column)
              // console.log('It was in this row:', rowInfo)
              // console.log('It was in this table instance:', instance)
            }
          }
        }}
        manual // Forces table not to paginate or sort automatically, so we can handle it server-side
        defaultPageSize={25}
        data={this.state.data} // Set the rows to be displayed
        pages={this.state.pages} // Display the total number of pages
        loading={this.state.loading} // Display the loading overlay when we need it
        onChange={this.fetchData.bind(this)} // Request new data when things change
      />
    )
  }
}

export default inject('store',)(observer(AllPodcasts))
