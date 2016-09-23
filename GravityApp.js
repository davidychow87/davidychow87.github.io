/* 
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/
var canvas = document.getElementById('canvas');
var width = 600;
var height = 600;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext('2d');
var colorArray = ["rgba(255, 0, 0, 0.5)", "rgba(0, 0, 255, 0.5)", "rgba(0, 255, 0, 0.5)"];
var maxG = 0.1; //limits maximum G
var G = 0.02; //limit between 0.003 and 0.04 - this is the gravitational proportionality constant
var timeStep = 10; //refresh screen every (timeStep) milliseconds
var scale = 4; //Note: this controls the speed of the orbit
var gravity = true; //shows if gravity is ON
var front = null; //Front of BallNode linked list
var listLength = 0; //list of BallNode linked list
var firstX = 0; //position of mouse (X) on canvas after mouse click
var firstY = 0; //position of mouse (Y) on canvas after mouse click
var lastX = 0;  //position of mouse (X) after mouse unclick
var lastY = 0; //position of mouse (X) after mouse unclick
var mouseIsDown = false; //flags if mouse is clicked
var TempBall; // Temporary ball when clicked
var mouseDownTime;
var mouseUpTime;
var clickTime;
var slider = document.getElementById("massSlider").value;
var massSlider = 10; //This is how much you multiple the slider value to be to get mass
var radiusSlider = 0.01;
var globalStatic = false; //If the check box is unchecked
var trans = 0.5; //tranparency of balls
var selectionCounter = 0;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
//        
function mouseDownHandler(e) {
    if(e.clientX > canvas.offsetLeft && e.clientX < (canvas.offsetLeft + 600) && e.clientY > canvas.offsetTop && e.clientY < canvas.offsetTop + 600) {
        mouseIsDown = true;
        firstX = e.clientX - canvas.offsetLeft;
        firstY = e.clientY - canvas.offsetTop;
        var ballColor = colorArray[Math.round(Math.random() * (colorArray.length - 1))];
        TempBall = new Ball(firstX, firstY, 0, 0, ballColor, slider * massSlider, 3 + (slider * radiusSlider), globalStatic);
        mouseDownTime = e.timeStamp;
    }

}  

function mouseUpHandler(e) {

    if(e.clientX > canvas.offsetLeft && e.clientX < (canvas.offsetLeft + 700) && e.clientY > canvas.offsetTop && e.clientY < canvas.offsetTop + 700) {
        mouseIsDown = false;
        lastX = e.clientX - canvas.offsetLeft;
        lastY = e.clientY - canvas.offsetTop;
        mouseUpTime = e.timeStamp;
        makeNewBall();
    }
}
//makes a new ball with temp ball properties
function makeNewBall() {
    clickTime = mouseUpTime - mouseDownTime;
    var velocityX = (lastX - firstX) / clickTime;
    var velocityY = (lastY - firstY) / clickTime;
    //var ballColor = colorArray[Math.round(Math.random() * (colorArray.length - 1)];
    var newBall = new Ball(lastX, lastY, velocityX, velocityY, TempBall.color, TempBall.mass, TempBall.radius, TempBall.static);
    addBall(newBall);
}

function mouseMoveHandler(e) {
    if(mouseIsDown) {
        TempBall.x = e.clientX - canvas.offsetLeft;
        TempBall.y = e.clientY - canvas.offsetTop;;
    }
}

function drawTempBall() {
    if(mouseIsDown) {
        createBall(TempBall);
    }
}

function keyDownHandler(e) {
    if(e.keyCode === 45) {//insert key - selects ball
        toggleSelection();
    }
    if(e.keyCode == 33) {//page up key - increases gravit
        if(G < maxG) {
            G += maxG / 20;
        }   
    } 
    if(e.keyCode == 34) {//page down key - decreases grvity
        if(G >= 0) {
            G -= maxG/ 20;
        }
    }
    if(e.keyCode == 46) {
        deleteSelection();
    }
    
}

//This changes var slider to be the value of the slider
function changeSlider() {
        slider = document.getElementById("massSlider").value;
}
//If the check box (slider) is false, then global static is false
function changeStatic() {
    globalStatic = document.getElementById("checkStatic").checked;
}

function changeGravity() {
    gravity = document.getElementById("checkGravity").checked;
}

//This shows the velocity of the selected Ball object
function showVelocity(thisBall) {
        var dist = Math.sqrt(Math.pow(thisBall.vx * timeStep / scale, 2) + Math.pow(thisBall.vy * timeStep / scale, 2));
        var velocity = Math.round((dist / timeStep) * 1000); // 1000 ms per s
        //var velocity =  (Math.floor(Math.sqrt(Math.pow(thisBall.vx, 2) + Math.pow(thisBall.vy, 2)) * 10) / 10);
        ctx.font = "bold 16px Comic Sans MS";
        ctx.fillStyle = "#FF0000";
        if(thisBall === null) {
            ctx.fillText("Velocity of Latest Ball (pixels/sec): ", 8, 30);
        } else {
            ctx.fillText("Velocity of Latest Ball (pixels/sec): " + velocity, 8, 60);
        }
        
}

//This shows the value of G, the gravity constant
function showGravity() {
    var onOff;
    if(gravity === true) {
        onOff = "ON";                    
    } else {
        onOff = "OFF";
    }
    var percentG = Math.round((G / maxG) * 100);
    ctx.font = "bold 16px Comic Sans MS";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Gravity is: " + onOff, 8, 20);
    ctx.fillText("Force Constant G: " + percentG + " % maximum", 8, 40);
}

//Finds the selected BallNode, and makes it's stroktyle yellow and line width 3
function currentSelection() {
    var current = front;
    while(current !== null) {
        if(current.selected === true) {
            //current.Ball.strokeStyle = '#E5A300';
            current.Ball.lineWidth = 5;
            flash(current.Ball);
            showVelocity(current.Ball);
        } else {
            current.Ball.strokeStyle = '#000000';
            current.Ball.lineWidth = 2;
        }
        current = current.next;
    }
}

//makes the selected ball flash
function flash(thisBall) {
    if(Math.round(selectionCounter) % 20 === 0) {
        if(thisBall.strokeStyle === '#000000') {
            thisBall.strokeStyle = '#E5A300'; 
        } else if (thisBall.strokeStyle === '#E5A300') {
            thisBall.strokeStyle = '#F000FF';
        } else if(thisBall.strokeStyle === '#F000FF') {
            thisBall.strokeStyle = '#E5A300';
        }
    }   
    if(selectionCounter > 10000) {
        selectionCounter = 0;
    }
}

function deleteSelection() {
    if(front.selected === true) {
        front = front.next;
        front.selected = true;
    } else {
        var current = front;
        while(current.next.selected !== true) {
            current = current.next;
        }
        deleteBallNode(current.next);
    }
}


//changes the selected to next in linked list
function toggleSelection() {
    var current = front;
    while(current.selected !== true) {
        current = current.next;
    }
    current.selected = false;
    if(current.next !== null) {
        current = current.next;
    } else {
        current = front;
    }
    current.selected = true;
}

//Shows distance from center
function centerDistance(thisBall) {
    var diffX = thisBall.x - canvas.width/2;
    var diffY = thisBall.y - canvas.height/2;
    var d = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    return d;
}

//only inbounds balls can be selected
function toggleInbounds() {
    var current = front;
    while(current.selected !== true) {
        current = current.next;
    }
    if(centerDistance(current.Ball) > 0.5 * width) {
        current.selected = false;
        if(current.next !== null) {
            current = current.next;
        } else {
            current = front;
        }
        current.selected = true;
    }
}

function countBalls() {
    var current = front;
    var count = 0;
    while(current !== null) {
        count++;
        current = current.next;
    }
    ctx.font = "bold 16px Comic Sans MS";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Ball Count: " + count, 8, 100);
    
}

//This function draws a representation of a passed Ball object on the canvas
function createBall(thisBall) {     
    ctx.beginPath();
    ctx.arc(thisBall.x, thisBall.y, thisBall.radius, 0, Math.PI*2);
    ctx.fillStyle = thisBall.color;
    ctx.fill();
    ctx.lineWidth = thisBall.lineWidth;
    ctx.strokeStyle = thisBall.strokeStyle;
    ctx.stroke();
    ctx.closePath();
}

//This function bounces Ball objects off walls
function wallCollision(thisBall) {
    if (thisBall.y < 0 || thisBall["y"] > canvas.height) {
        thisBall["vy"] = -thisBall["vy"];
    }
    if(thisBall.x < 0 || thisBall["x"] > canvas.width) {
        thisBall["vx"] = -thisBall["vx"];
    }    

}
// This method calculates the pairwise interaction between balls, returns an array [Fx, Fy]
function interaction(thisBall, otherBall) {
    var diffx = otherBall.x - thisBall.x;
    var diffy = otherBall.y - thisBall.y;
    var d = Math.sqrt(Math.pow(diffx, 2) + Math.pow(diffy, 2)); 
    var F;
    var theta = Math.atan2(diffy, diffx); 
    //set d > (thisBall.radius + otherBall.radius) * some number
    if(d > 40) { // set if(d > -1) if you don't want close interaction modification
        F = G * (thisBall.mass * otherBall.mass) / Math.pow(d ,2); 
    } else {
        //var K = G / Math.pow(d, 3);
        var K = G /100000;
        //var K = Math.pow(d, 2) / G;
        F = K * thisBall.mass * otherBall.mass * d;     
    }
    var Fx = Math.cos(theta) * F;
    var Fy = Math.sin(theta) * F;
    return [Fx, Fy];
}
//accepts a Ball object and calculates the sum of all Pairwise interactions
function sumInteraction(thisBall) {
    thisBall.sumFx = 0;
    thisBall.sumFy = 0;
    var current = front;
    if(thisBall.static === true) {
        return;
    } else {
        while(current !== null) {
            if(thisBall !== current.Ball) {
                var sumF = interaction(thisBall, current.Ball);
                thisBall.sumFx += sumF[0];
                thisBall.sumFy += sumF[1];
            }
            current = current.next;
        }
        thisBall.vx += (thisBall.sumFx / thisBall.mass) * timeStep / scale;
        thisBall.vy += (thisBall.sumFy / thisBall.mass) * timeStep / scale;
    }
}

//Constructor for Ball object
function Ball(x, y, vx, vy, color, mass, radius, static) {
    this.x = x;
    this.y = y;
    this.vx = vx; 
    this.vy = vy; 
    this.mass = mass;
    this.radius = radius;
    this.static = static;
    this.sumFx = 0;
    this.sumFy = 0;
    this.select = false;
    this.color = color;  
    this.strokeStyle = '#000000';
    this.lineWidth = 2;
}

//Constructor for a new BallNode
function BallNode(Ball, next) {
    this.Ball = Ball;
    this.next = next; 
    this.selected = true;
}
//accepts a Ball object, passes into a new BallNode; adds to linkedlist
//when a ball is added, it becomes the slected ball
function addBall(newBall) {
    if(front === null) {
        front = new BallNode(newBall, null);
    } else {
        var current = front;
        while(current.next !== null) {// !current
            current = current.next;
        }
        current.next = new BallNode(newBall, null);
        newSelection();
    }
}

//deletes specified ball from linked list
function deleteBallNode(thisBallNode) {
    //var current = front;
    if(thisBallNode.selected === true) {
        if(thisBallNode.next !== null) {
            thisBallNode.next.selected = true;
        }
        else {
            front.selected = true;
        }
    }
    if(front === thisBallNode) {
        front = front.next;
    } else {
        var current = front; 
        while(current.next !== null) {
            if(current.next === thisBallNode) {
                current.next = current.next.next;
            }
            current = current.next;
        }
    }
}


//Newly created balls become the selected, the rest are set to false;
function newSelection() {
    var current = front;
    while(current.next !== null) {
        current.selected = false;
        current = current.next;
    }
    current.selected = true;
}

//This traverses the BallNode linked list and calls passed function on the current node's Ball object
function traverseList(func) {
    var current = front;
    while(current !== null) {
        func(current.Ball);
        current = current.next;
    }            
}
//This changes the x, y coordinates of each Ball object according to it's current dx and dy
function changePosition(thisBall) {
    thisBall.x += thisBall.vx * timeStep / scale;
    thisBall.y += thisBall.vy * timeStep / scale;
}


//This updates the view
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showGravity();
    changeSlider();
    changeGravity();
    changeStatic();
    drawTempBall();
    currentSelection();
    toggleInbounds();
    countBalls();
    selectionCounter++;
//    var curr = front;
//    while(curr.next !== null) {
//        curr = curr.next;
//    }
//    showVelocity(curr.Ball);

    traverseList(createBall); 
    
    
    if(gravity === true && G > 0) {
        traverseList(sumInteraction);
    } else {   //comment below if you don't want wall collisions
        traverseList(wallCollision);
    }
    traverseList(changePosition);
    
}
setInterval(loop, timeStep);


