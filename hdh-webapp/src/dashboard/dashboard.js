import React from 'react';
import ReactDOM from 'react-dom';
import './dashboard.css';
import { getMeals, postMeal } from './dbController';


const mealNames = {
  100: "breakfast",
  200: "lunch",
  300: "afternoon-snack",
  400: "dinner"
}

export class MealsDashboard extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props)
    let date = (new Date()).toISOString().substring(0, 10);
    this.state = {
      date: date,
      meals: {}
    }
    this.handleMealDescriptionSave = this.handleMealDescriptionSave.bind(this)
  }

  renderMealContainer(mealOrder) {
    let meal = this.state.meals[mealOrder]
    let mealDescription = ""
    if (meal) {
      mealDescription = meal.mealDescription
    }
    return (
      <MealContainer
        mealName={mealNames[mealOrder]}
        mealDescription={mealDescription}
        order={mealOrder}
        handleMealDescriptionSave={(e) => this.handleMealDescriptionSave(e)} />
    );
  }

  renderAddMealButton() {
    return (
      <AddMealButton />
    );
  }

  componentDidMount() {
    this._isMounted = true;

    // TODO: move this to the constructor in order to avoid double rendering
    if (!this.props.idToken) {
      return
    }
    getMeals(this.state.date, this.props.idToken)
      .then(
        (result) => {
          let meals = {}
          result.forEach(element =>
            meals[element.order] = {
              mealDescription: element.meal_description,
              order: element.order
            }
          );
          if (this._isMounted) {
            this.setState({
              meals: meals
            });
          }
        },
        (error) => {
          // TODO: handle error 
          if (this._isMounted) {
            this.setState({
              isLoaded: true,
              error
            });
          }
        }
      )
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleMealDescriptionSave(event) {
    let order = event.order
    let mealDescription = event.mealDescription
    let meals = Object.assign({}, this.state.meals);
    if (meals[order]) {
      if (meals[order]["mealDescription"] === mealDescription) {
        // If no change was performed, we want to save a write in the db
        return
      }
      meals[order]["mealDescription"] = mealDescription
    } else {
      meals[order] = {
        "mealDescription": mealDescription,
        "order": order
      }
    }
    // Save into db
    postMeal(this.state.date, order, mealDescription, this.props.idToken)
    this.setState({
      meals: meals
    })
  }

  render() {
    return (
      <div className="main-dashboard">
        <div className="meals-dashboard">
          {this.renderMealContainer(100)}
          {this.renderMealContainer(200)}
          {this.renderMealContainer(300)}
          {this.renderMealContainer(400)}
        </div>
        <div className="add-meal-container">
          {this.renderAddMealButton()}
        </div>
      </div>
    )
  }
}

class MealContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isSelected: false,
    }
  }

  getClasses() {
    return "meal-container" + (this.state.isSelected ? " meal-selected" : "")
  }

  handleClick() {
    this.setState({
      isSelected: !this.state.isSelected
    })
  }

  renderMealButton(mealName, ) {
    return (
      <MealButton
        value={mealName}
        onClick={() => this.handleClick()} />
    );
  }
  renderMealDescription(mealName) {
    return (
      <MealDescription
        value={mealName}
        mealDescription={this.props.mealDescription}
        order={this.props.order}
        onBlur={this.props.handleMealDescriptionSave}
      />
    );
  }

  render() {
    return (
      <div className={this.getClasses()}>
        {this.renderMealButton(this.props.mealName)}
        {this.renderMealDescription(this.props.mealName)}
      </div>
    );
  }

}

class MealButton extends React.Component {
  render() {
    return (
      <button className="meal-button" onClick={() => this.props.onClick()}>
        {this.props.value}
      </button>
    );
  }
}

class MealDescription extends React.Component {
  render() {
    return (
      <div className="meal-description">
        <textarea className="meal-description"
          type="text" placeholder="A carrot, a pepper, a tomato, a piece of salmon. An apple"
          onBlur={(e) => this.props.onBlur({ order: this.props.order, mealDescription: e.target.value })}
          defaultValue={this.props.mealDescription}
        />
      </div>
    );
  }
}

class AddMealButton extends React.Component {
  onClick() {
    alert("You cannot add another food at this moment. Add your meal description inside another one you think it fits the most")
  }

  render() {
    return (
      <button className="add-meal-button" onClick={() => this.onClick()}>
        +
      </button>
    );
  }
}


ReactDOM.render(
  <MealsDashboard />,
  document.getElementById('root')
);