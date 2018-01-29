import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Tasks } from '../api/tasks.js';
import AccountsUIWrapper from './AccountsUIWrapper.js';
import Task from './Task.js';

// App component - represents the whole app
class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { hideCompleted: false };
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Meteor.call('tasks.insert', text);

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({ hideCompleted: !this.state.hideCompleted });
  }

  renderTasks() {
    const { currentUser, tasks } = this.props
    const { hideCompleted } = this.state
    return tasks
      .filter(task => hideCompleted ? !task.checked : true)
      .map(task =>
        <Task
          key={task._id}
          task={task}
          showPrivateButton={task.owner === (currentUser && currentUser._id)}
        />
      );
  }

  render() {
    return (
      <div className="container">

        <header>

          <h1>Todo List ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>

          <AccountsUIWrapper />

          {this.props.currentUser &&
            <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
              <input placeholder="Type to add new tasks" ref="textInput" type="text" />
            </form>
          }

        </header>

        <ul>
          {this.renderTasks()}
        </ul>

      </div>
    );
  }
}

const mapMongoToProps = () => {
  Meteor.subscribe('tasks');

  return {
    currentUser: Meteor.user(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch()
  }
}

export default withTracker(mapMongoToProps)(App)
