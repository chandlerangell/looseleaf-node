import React, { Component } from 'react';
import { Link, Switch } from 'react-router-dom';
import { polyfill } from 'es6-promise';
import { renderRoutes } from 'react-router-config';
import $ from 'jquery';
import { getRoot, getRoutes, tabs } from './routes';
import About from './About';
import TopNavUser from '../TopNavUser/Main';
import TopNavGuest from '../TopNavSimple';

polyfill();
export default class Main extends Component {
  componentDidMount() {
    $('ul.tabs').tabs();
    this.initializeSticky();
  }
  initializeSticky() {
    const tabs = $('.tabs-container');
    if (tabs.length) {
      tabs.pushpin({
        top: tabs.offset().top - 48
      });
    }
  }
  // TODO: need to display "follow" or "unfollow" button next to user picture.
  // TODO: should be able to hover over user pic to reveal username
  renderProfileUserpic(username, userPic) {
    return (
      <div className="row" id='profile-userpic-tab'>
        <div className="col">
          <img src={userPic} alt={username}/>
        </div>
        {
          <div className="col hide-on-med-only">
            <p>
              <span className="nowrap">{`@${username}`}</span>
            </p>
          </div>
        }

      </div>
    );
  }
  renderTabsNav(selected, root) {
    return (
      <div id="profile-tabs" className="tabs-container pin-top" style={{top: 0}}>
        <div className="row">
          <div className="col">
          {this.renderProfileUserpic(
            this.props.user.info.username,
            this.props.user.info.picture,
          )}
          </div>
          <ul className="tabs section-white">
            {
            tabs.map((tab, i) => {
              return (
                <li key={i} className="tab col">
                  <Link
                    id={`tab-${tab}`}
                    to={`${root}/${tab}`}
                    className={selected === tab ? 'active' : ''}
                  >
                    {tab}
                  </Link>
                </li>);
            })
          }
          </ul>
        </div>
      </div>
    );
  }
  render() {
    // TODO: The code below is an ugly hac but it works. I don't know why
    // this.props.match.slug no longer provides the tab name
    // It worked before ... not sure why it doesn't work now
    const selected = this.props.location.pathname.split('/').pop() || 'completed';
    if (typeof window !== 'undefined' &&
        (selected === tabs[0] || selected === tabs[1] || selected === tabs[2] || selected === tabs[3])
    ) {
      $(`#tab-${selected}`).trigger('click');
    }
    const root = getRoot(this.props.user.info.username);
    const username = this.props.user.info.username;
    const portfolioProps = {
      userId: this.props.user.info._id,
      loggedInUser: this.props.user.loggedinUser
    };

    return (
      <div className="section-white">
        {
          this.props.user.loggedinUser ?
            <TopNavUser route={this.props.route} user={this.props.user.loggedinUser} useExternLinks />
            :
            <TopNavGuest />
        }
        <div className="container">
          <div className="row">
            <div className="col l12 m12 s12">
              <About user={this.props.user.info} />
            </div>
          </div>
        </div>
        { this.renderTabsNav(selected, root) }
        <div className="row">
          <div className="col l12 m12 s12">
            <Switch>
              {renderRoutes(getRoutes(username).routes, portfolioProps)}
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}
