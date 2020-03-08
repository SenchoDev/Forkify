import axios from 'axios';
import {key} from '../config'

export default class Search {
    constructor(id){
        this.id = id;

    }
    

    async getRecipe() {
        try {
            const res = await axios(`https://api.spoonacular.com/recipes/${this.id}/information?apiKey=${key}`);
            this.title = res.data.title;
            this.author = res.data.sourceName;
            this.img = res.data.image;
            this.url = res.data.sourceUrl;
            this.ingredients = res.data.extendedIngredients;

        } catch(err){
            alert(err)
        }
    }

    calcTime(){
        //Assuming we need 15 min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup' , 'pound'];
        const units = [...unitsShort, 'kg', 'g']
        
        const newArr = [];
        this.ingredients.map(el => newArr.push(el.original));
        console.log(newArr);
        

        const newIngredients = newArr.map(el => {
            // Uniform units
            let ingredient = el.toLowerCase();

            //replaces each unit of current array item with new unit
            unitsLong.forEach((unit , i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            })
            // Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //Parse ingredients into count, unit and ingredient

            //splits array
            const arrIng = ingredient.split(' ');
            //
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;

            if(unitIndex > -1){
                //There is unit
                 // Ex. 4 1/2 cups, arrCount is [4, 1/2]
                 // Ex 4 cups arrCount is  [4];
                 const arrCount = arrIng.slice(0, unitIndex);
                
                 let count;
                 if (arrCount.length === 1) {
                     count = eval(arrIng[0].replace('-', '+'));
                 } else {
                     count = eval(arrIng.slice(0, unitIndex).join('+'));
                 }
 
                 objIng = {
                     count,
                     unit: arrIng[unitIndex],
                     ingredient: arrIng.slice(unitIndex + 1).join(' '),
                 };

            } else if (parseInt(arrIng[0], 10)) {
                // There is NO unit, but 1st element is number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                // There is NO unit and NO number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            return objIng;
        })
        this.ingredients = newIngredients;

        console.log(this.ingredients);
    }
    updateServings(type) {
        //Servings 

        const  newServings = type === 'dec' ? this.servings -1 : this.servings + 1;
        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        })
        this.servings = newServings;
    }
}
