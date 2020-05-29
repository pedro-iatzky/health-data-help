import {api} from '../common'

var mealsApi = `${api}/meals`


export function getMeals(date, idToken) {
    let endpoint = `${mealsApi}/dates/${date}`

    return fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
    })
    .then(res => res.json()).then(res => res.data)
}


export function postMeal(date, order, mealDescription, idToken) {
    let endpoint = `${mealsApi}`

    let data = {
        date: date,
        order: order,
        mealDescription: mealDescription
    }
    return fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
}
