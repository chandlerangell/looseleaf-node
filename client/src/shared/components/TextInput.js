import React from 'react';

export default class TextInput extends React.Component {
  handleChange(e) {
    this.props.setState(e.target.value);
  }
  render() {
    return (
      <div className="input-field col s12 m12 l12">
        <input
          id={this.props.id}
          defaultValue={this.props.field}
          onChange={this.handleChange.bind(this)}
          type="text" className="validate"/>
        <label htmlFor={this.props.id}
          className={!this.props.field ? '' : 'active'}>
          {this.props.label}
        </label>
      </div>
    )
  }
}
