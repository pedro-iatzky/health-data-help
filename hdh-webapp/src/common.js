import React from 'react';

export var api = ""
if (process.env.REACT_APP_STAGE === "local") {
    api = "http://localhost:5000/healthdatahelp-e4ab1/us-central1/v1"
} else {
    // throw "meals api no defined";
    api = "https://us-central1-healthdatahelp-e4ab1.cloudfunctions.net/v1"
}


export class DatesNavigator extends React.Component {

    render() {
      return (
        <div className="container">
          <div className="row">
            <div className="col">
              <button className="btn btn-primary btn-center" onClick={() => this.props.onLeftClick()}>
                <svg className="bi bi-chevron-left" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                </svg>
              </button>
            </div>
            <div className="col-8">
              <div className="date-legend">
                {this.props.date}
              </div>
            </div>
            <div className="col">
              <button  className="btn btn-primary btn-center" onClick={() => this.props.onRightClick()}>
                <svg className="bi bi-chevron-right" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )
    }
  }