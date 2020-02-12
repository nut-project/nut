import React from 'react'

export default class Page extends React.Component {
  render() {
    console.log( this.props.ctx )
    return <div style={{ color: 'blue' }}>react!!!</div>
  }
}

// export default () => <div style={{ color: 'blue' }}>react</div>
