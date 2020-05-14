import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class MealButton extends React.Component {
  render() {
    return (
      <button className="meal-button">
        {this.props.value}
      </button>
    );
  }
}

class AddMealButton extends React.Component {
  onClick(){
    console.log("adding food... you fat :>")
  }

  render() {
    return (
      <button className="add-meal-button" onClick={() => this.onClick()}>
        +
      </button>
    );
  }
}

class MealsDashboard extends React.Component {
  renderMealButton(mealName) {
    return (
      <MealButton value={mealName} />
    ); 
  }

  renderAddMealButton() {
    return (
      <AddMealButton />
    ); 
  }

  render() {
    return (
      <div className="main-dashboard">
        <div className="meals-dashboard">
          <div className="meal-container">
           {this.renderMealButton("breakfast")}
          </div>
          <div className="meal-container">
            {this.renderMealButton("lunch")}
          </div>
          <div className="meal-container">
           {this.renderMealButton("afternoon-snack")}
          </div>
          <div className="meal-container">
            {this.renderMealButton("dinner")}
          </div>
        </div>
        <div className="add-meal-container">
          {this.renderAddMealButton()}
        </div>
      </div>
    )

  }
}


ReactDOM.render(
  <MealsDashboard />,
  document.getElementById('root')
);