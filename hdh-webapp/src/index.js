import React from 'react';
import ReactDOM from 'react-dom';
import {MealsDashboard} from './dashboard/dashboard'
import './index.css';
import {UserAuthPage, checkUserIsSignedIn, getIdToken} from './auth/auth'

import {Diseases} from './diseases/diseases'


class UserAuth extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
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
      <div>Loading...</div>
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
        idToken={this.state.idToken} />
    );
  }

  renderDiseasesPage() {
    return (
      <Diseases
        idToken={this.state.idToken} />
    );
  }


  render() {
    if (this.state.userIsSignIn === null) {
      // The user status has not loaded yet
      return this.renderLoadingScreen()
    }
    if (this.state.userIsSignIn) {
      // return this.renderDashboardPage()
      return this.renderDiseasesPage()
    }
    return this.renderAuthPage()
  }
}


ReactDOM.render(
  <UserAuth />,
  document.getElementById('root')
);
