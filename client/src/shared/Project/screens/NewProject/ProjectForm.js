import React from 'react';
import InputTags from '../../../components/InputTags';
import InputDropdown from '../../../components/InputDropdown';

const projects = [
  'Web Development',
  'Mobile Development',
  'Data Science'
]

export default class AboutForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bio: this.props.bio,
      location: this.props.location,
      website: this.props.website,
      communities: this.props.communities,
      tags: ['Advertising', 'AI', 'Animation', 'Art', 'AWS', 'Blogging', 'Branding', 'C++', 'D3.js', 'Data Science', 'Data Visualization', 'Design', 'Digital Marketing', 'Education', 'Entrepreneurship', 'Games', 'Go', 'JavaScript', 'Machine Learning', 'Node', 'Photography', 'Python', 'React', 'Ruby', 'Ruby on Rails', 'Social Media', 'SPA', 'UI', 'User Experience', 'UX Design', 'Writing'],
      selectedTags: this.props.interests,
    }
  }
  handleChange(id, e) {
    if(id==='bio') {
      this.setState({bio: e.target.value})
    } else if(id==='location') {
      this.setState({location: e.target.value})
    } else if(id==='website') {
      this.setState({website: e.target.value})
    } else if(id==='interests') {
      this.setState({interests: e.target.value})
    } else if(id==='communities') {
      this.setState({communities: e.target.value})
    }
  }
  renderTextInput(id, field, label) {
    return (
      <div className="input-field col s12 m12 l12">
        <input
          id={id}
          defaultValue={field}
          onChange={this.handleChange(this, id)}
          type="text" className="validate"/>
        <label htmlFor={id}
          className={!field ? '' : 'active'}>
          {label}
        </label>
      </div>
    )
  }
  renderTextAreaInput(id, field, label) {
    return (
      <div className="input-field col s12 m12 l12">
        <textarea
          id={id}
          defaultValue={field}
          onChange={this.handleChange(this, id)}
          className="materialize-textarea">
        </textarea>
        <label htmlFor={id} className={!field ? '' : 'active'}>
          {label}
        </label>
      </div>
    )
  }

  render() {
    return (
      <form className="col s12">
      <div className="card-panel white">
        <h5>About The Project</h5>
        <div className="row">
          <div className="col s12">
            {
              this.renderTextInput('location', '', 'Title')
            }
            {
              this.renderTextAreaInput('bio', '', 'Description')
            }
            {
              <InputDropdown
                id='select-project'
                label='Project Type'
                choices={projects}
                setState={d => this.setState({selectedProject: d})}
              />
          }
          {
              <InputTags
                id='select-areas'
                label='Interest Areas'
                hint='+Interest'
                tags={this.state.tags}
                selectedTags={this.state.selectedTags}
                setState={ds => this.setState({selectedTags: ds})}
              />
            }

          </div>
        </div>
      </div>
      <div className="card-panel white">
        <h5>About You And Your Mission</h5>
        <p>{'Introduce yourself. Give people a reason to get really excited about working on this project with you.'}</p>

        <div className="row">
          <div className="col s12">
            {
              this.renderTextAreaInput('bio', '', 'About Me')
            }
            {
              this.renderTextAreaInput('bio', '', 'My Mission')
            }
          </div>
        </div>

      </div>
      <div className="card-panel white">
        <h5>Deadline</h5>
        <p>{"Set deadline. You can always change the deadline."}</p>
        <div className="or-divider"/>
        <h5>Invite People</h5>
        <p>
          {
            "Invite People to work on the project."
          }
        </p>
      </div>
      <div className="col s12 m12 l12 center">
        <button className="btn" type="submit" name="action">
          Create Project
        </button>
      </div>
      </form>
    )
  }
}