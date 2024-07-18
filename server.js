const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuid4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

//Function to generate random fruit position
const generateRandomFruitPosition = (width, height) => ({
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height)
});

//Function to validate snake moves
const moveValidator = (state, ticks) => {
    let {x, y, velX, velY} = state.snake;
    const { width, height, fruit} = state;

    for(let tick of ticks){
        velX = tick.velX;
        velY = tick.velY;
        //Updating position of the snake
        x += velX;
        y += velY;
        //Checking for out of bounds
        if(x<0 || x>=width || y<0 || y>= height){
            return { valid: false, message: 'Snake out of bounds'}
        }

        //Checking if snake found the fruit
        if(x === fruit.x && y === fruit.y){
            return {valid: true, position: generateRandomFruitPosition(width, height)}
        }
    }

    //If fruit is not found
    return {valid: false, message: 'Fruit not found'}
}

app.get('/new', (req,res) => {
    try{
        const width = parseInt(req.query.width);
        const height = parseInt(req.query.height);

        if(isNaN(width) || isNaN(height) || width<=0 || height<=0)
            return res.status(400).json({error: 'Invalid request'});

        const state = {
            gameId: uuid4(), 
            width,
            height,
            score: 0,
            fruit: generateRandomFruitPosition(width, height),
            snake: {
                x: 0,
                y: 0,
                velX: 1,
                velY: 0,
            },
        }

        res.status(200).json({state});
    }catch(error){
        if(error.statusCode == 400)
            res.status(400).json({error: 'Invalid request'})
        else if(error.statusCode == 405)
            res.status(405).json({error: 'Invalid method'})
        else if(error.statusCode == 500)
            res.status(500).json({error: 'Internal Server error'})
    }
})

app.post('/validate', (req, res) => {
    try{
        const { state, ticks } = req.body;
        if(!state || !ticks || !Array.isArray(ticks))
           res.status(400).json({error: 'Invalid request'});

        const result = moveValidator(state, ticks);

        if(!result.valid){
            if(result.message == 'Snake out of bounds')
                return res.status(418).json({error: 'Game over!! Snake out of bounds!!'}) 
            else if(result.message == 'Fruit not found')
                return res.status(404).json({error: 'Fruit not found!!'}) 
        }else{
            state.fruit = result.position;
            state.score += 1;
            res.status(200).json(state);
        }
    }catch(error){
        if(error.statusCode == 400)
            res.status(400).json({error: 'Invalid request'})
        else if(error.statusCode == 405)
            res.status(405).json({error: 'Invalid method'})
        else if(error.statusCode == 500)
            res.status(500).json({error: 'Internal Server error'})
    }   
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});

