import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import './index.css';

import { MealsDashboard } from './dashboard/dashboard'
import { UserAuthPage, checkUserIsSignedIn, getIdToken } from './auth/auth'
import { Diseases } from './diseases/diseases'



class UserAuth extends React.Component {
  constructor(props) {
    super(props)
    let date = new Date()
    this.state = {
      date: date.toISOString().substring(0, 10),
      dateObj: date,
      idToken: "",
      userIsSignIn: null
    }
    this.saveIdToken = this.saveIdToken.bind(this)
    this.userlogsin = this.userlogsin.bind(this)
    this.userlogsout = this.userlogsout.bind(this)
  }

  userlogsin() {
    getIdToken(this.saveIdToken)
  }

  userlogsout() {
    this.setState({
      userIsSignIn: false
    })
  }

  saveIdToken(idToken) {
    this.setState({
      idToken: idToken,
      userIsSignIn: true
    })
  }

  componentDidMount() {
    checkUserIsSignedIn(this.userlogsin, this.userlogsout)
  }

  renderLoadingScreen() {
    return (
      <div className="d-flex align-items-center">
        <strong>Loading...</strong>
        <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
      </div>
      // <div>Loading...</div>
    );
  }

  renderAuthPage() {
    return (
      <UserAuthPage />
    );
  }

  renderDashboardPage() {
    return (
      <MealsDashboard
        key={this.state.date}
        idToken={this.state.idToken}
        date={this.state.date}
        showPreviousDate={() => this.showPreviousDate()}
        showNextDate={() => this.showNextDate()} />
    );
  }


  renderDiseasesPage() {
    return (
      <Diseases
        key={this.state.date}
        idToken={this.state.idToken}
        date={this.state.date}
        showPreviousDate={() => this.showPreviousDate()}
        showNextDate={() => this.showNextDate()} />
    );
  }

  showPreviousDate() {
    let currentDate = new Date()
    let prevDate = new Date(this.state.dateObj.getTime());
    prevDate.setDate(prevDate.getDate() - 1)
    let diffTime = Math.abs(currentDate - prevDate);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 8) {
      return
    }
    this.setState({
      date: prevDate.toISOString().substring(0, 10),
      dateObj: prevDate
    }
    )
  }

  showNextDate() {
    let currentDate = new Date()
    let nextDate = new Date(this.state.dateObj.getTime());
    nextDate.setDate(nextDate.getDate() + 1)
    if (nextDate > currentDate) {
      return
    }
    this.setState({
      date: nextDate.toISOString().substring(0, 10),
      dateObj: nextDate
    }
    )
  }

  render() {
    if (this.state.userIsSignIn === null) {
      // The user status has not loaded yet
      return this.renderLoadingScreen()
    }
    if (this.state.userIsSignIn) {
      return (
        <Switch>
          <Route path="/dashboard">
            {this.renderDashboardPage()}
          </Route>
          <Route path="/diseases">
            {this.renderDiseasesPage()}
          </Route>
          <Route path="/">
            {this.renderDashboardPage()}
          </Route>
        </Switch>
      )

    }
    return this.renderAuthPage()
  }
}


ReactDOM.render(
  <Router>
    <UserAuth />
  </Router>,
  document.getElementById('root')
);
