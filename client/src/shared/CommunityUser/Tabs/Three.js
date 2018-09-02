import React from 'react';
import TopNav from '../TopNav';
import { communityPage as page }  from '../../data/appPage';
import { getApiData } from '../../../lib/helpers';
import { apiLink } from '../../data/apiLinks';
import Users from '../../components/Collection/Users';

export default class Three extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null
    };
  }
  componentDidMount() {
    this.fetchUsers();
  }
  fetchUsers() {
    const communitySlug = this.props.state.community.info.slug;
    const setApiData = data => this.setState({ users: data });
    getApiData(apiLink.usersByCommunity(communitySlug), setApiData);
  }
  render() {
    const userInfo = this.props.state.user.info;
    const communityInfo = this.props.state.community.info;
    return (
      <div className="section-white">
        <TopNav
          route={this.props.route}
          user={userInfo}
          community={communityInfo}
          actions={this.props.actions}
          updateState={this.fetchUsers.bind(this)}
        />
        <div className="community-page container">
          <div className="row">
            <div id={page(communityInfo.slug).three.slug} className="col s12">
              <h3>{page(communityInfo.slug).three.name}</h3>
              {
                this.state.users && this.state.users.length > 0 ?
                  <Users users={this.state.users} />
                  :
                  <p>There are no members in this community.</p>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
