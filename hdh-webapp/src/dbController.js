var mealsApi = ""
if (process.env.REACT_APP_STAGE === "local") {
    mealsApi = "http://localhost:5000/healthdatahelp-e4ab1/us-central1/meals"
} else {
    // throw "meals api no defined";
    mealsApi = "https://us-central1-healthdatahelp-e4ab1.cloudfunctions.net/meals"
}


export function getMeals(date) {
    let endpoint = `${mealsApi}/dates/${date}`

    return fetch(endpoint).then(res => res.json()).then(res => res.data)
}


export function postMeal(date, order, mealDescription) {
    let endpoint = `${mealsApi}`

    let data = {
        date: date,
        order: order,
        mealDescription: mealDescription
    }
    return fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
}
