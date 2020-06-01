import React from 'react';
import { useHistory } from "react-router-dom";
import './dashboard.css';
import { getMeals, postMeal } from './dbController';
import { DatesNavigator } from '../common'


const mealNames = {
  100: "Breakfast",
  200: "Lunch",
  300: "Afternoon-snack",
  400: "Dinner"
}

export class MealsDashboard extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props)
    this.state = {
      meals: {},
      selectedMeal: null
    }
    this.handleMealDescriptionSave = this.handleMealDescriptionSave.bind(this)
  }

  renderDatesNavigator() {
    return (
      <DatesNavigator
        date={this.props.date}
        onLeftClick={() => this.props.showPreviousDate()}
        onRightClick={() => this.props.showNextDate()} />
    )
  }

  renderMealContainer(mealOrder) {
    let meal = this.state.meals[mealOrder]
    let mealDescription = ""
    if (meal) {
      mealDescription = meal.mealDescription
    }
    let isSelected = false
    if (this.state.selectedMeal === mealOrder) {
      isSelected = true
    }
    return (
      <MealContainer
        isSelected={isSelected}
        mealName={mealNames[mealOrder]}
        mealDescription={mealDescription}
        order={mealOrder}
        handleMealDescriptionSave={(e) => this.handleMealDescriptionSave(e)}
        selectMeal={(e) => this.selectMeal(e)} />
    );
  }

  selectMeal(mealOrder) {
    if (this.state.selectedMeal === mealOrder) {
      // If the user clicks again in a selected button, unselect it
      this.setState({
        selectedMeal: null
      })
      return
    }
    this.setState({
      selectedMeal: mealOrder
    })
  }

  renderChangePageButton() {
    return (
      <ChangePageButton />
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
    getMeals(this.props.date, this.props.idToken)
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
        // If no change was performed, we want to avoid to save a write in the db
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
    postMeal(this.props.date, order, mealDescription, this.props.idToken)
    this.setState({
      meals: meals
    })
  }

  render() {
    return (
      <div className="main-container">
        <div className="main-header">
          {this.renderDatesNavigator()}
        </div>
        <div className="main-body">
          <div className="meals-dashboard">
            {this.renderMealContainer(100)}
            {this.renderMealContainer(200)}
            {this.renderMealContainer(300)}
            {this.renderMealContainer(400)}
          </div>
          <div className="side-section">
            <div className="change-page-container">
              {this.renderChangePageButton()}
            </div>
          </div>
        </div>
        <div className="main-footer">
          <div className="add-meal-container">
            {this.renderAddMealButton()}
          </div>
        </div>
      </div>
    )
  }
}

class MealContainer extends React.Component {
  getClasses() {
    return "meal-container" + (this.props.isSelected ? " meal-selected" : "")
  }

  renderMealButton(mealName, ) {
    return (
      <MealButton
        value={mealName}
        onClick={() => this.props.selectMeal(this.props.order)} />
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
      <button className="meal-button btn btn-success" onClick={() => this.props.onClick()}>
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
      <button className="btn-center add-meal-button" onClick={() => this.onClick()}>
        +
      </button>
    );
  }
}

function ChangePageButton() {
  const history = useHistory();

  function handleClick() {
    history.push("/diseases");
  }
  return (
    <button className="btn" onClick={handleClick}>
      <svg className="bi bi-chevron-right" width="32" height="64" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M6.646 3.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L12.293 10 6.646 4.354a.5.5 0 010-.708z" />
      </svg>
    </button>
  );
}
