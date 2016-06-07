var React = require('react')
var Link  = require('react-router').Link

var App = React.createClass({
  render: function() {
    return (
      <div className='App'>
        <ul className='App_menu'>
          <li className='App_menuItem'>
            <Link to='/employee/search'>Search</Link>
          </li>
          <li className='App_menuItem'>
            <Link to='/employee/hierarchy'>Hierarchy</Link>
          </li>
        </ul>
        <div className='App_content'>
          {this.props.children}
        </div>
      </div>
    )
  }
})

module.exports = App