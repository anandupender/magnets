let mu = 35;
let muSFriction = .15;
let muKFriction = .01;
let g = -9.8;
let magnets = [];
let totalmagnets = 1;

let cursor;
let cursorDiameter = 50;
let cursorQ = 100000;
let stuck = false;

function setup(){
    cnv = createCanvas(window.innerWidth,window.innerHeight);
    reset();
    frameRate(100);
    userStartAudio();
    textAlign(CENTER);
    rectMode(CENTER);
}

function draw(){
    background(255);

    push();

    let newMousePosition = createVector(mouseX,mouseY);

    for (let i = 0; i < magnets.length; i++) {
        magnets[i].display();



        //calculate magnet force
        let distance =  magnets[i].position.dist(newMousePosition);
        let f = mu*cursorQ*magnets[i].q/(4*Math.PI*Math.pow(distance,4));
        let magnetForce;

        magnetForce = p5.Vector.sub(magnets[i].position,newMousePosition);
        
        // get direction between cursor and magnet, then multiply by magnitude of force
        magnetForce.normalize();
        magnetForce.mult(f);

        //setup static friction
        let staticDirectionUnit = createVector(magnetForce.x,magnetForce.y);
        staticDirectionUnit.normalize();

        //setup kinetic friction (based on mass)
        let velUnit = createVector(cursor.velocity.x,cursor.velocity.y);
        velUnit.normalize();    //direction of mover

        let staticForce = p5.Vector.mult(staticDirectionUnit, magnets[i].mass*muSFriction*g);

        //if magnet is stronger than static force, apply magnet force
        if(magnetForce.mag() > staticForce.mag()){
            // if(distance > magnets[i].radius + cursorDiameter/2){
                let distanceBtwCursorAndCircle = newMousePosition.dist(cursor.position);
                cursor.applyForce(magnetForce);
                cursor.update(newMousePosition);
                if(distanceBtwCursorAndCircle < distance){
                    cursor.display();
                }
                else{
                    cursor.display(i);
                }
        }else{
            cursor.update(newMousePosition);
            cursor.display();
        }
    }

      pop();
}

// Restart all the Mover objects randomly
function reset() {
    for (let i = 0; i < totalmagnets; i++) {
       magnets[i] = new Magnet(random(0, width),random(0, height),random(15,25),color(random(0,255),random(0,255),random(0,255)));
    }
    cursor = new Cursor(mouseX,mouseY);
  }

function Cursor(x, y,r) {
    this.radius = cursorDiameter/2;
    this.mass = cursorDiameter/100;
    this.q = cursorDiameter*100;
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.prevVelocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.extraAcceleration = createVector(0, 0);
}

function Magnet(x, y,r,c) {
    this.radius = r;
    this.mass = r/100;
    this.q = r*100;
    this.position = createVector(x, y);
    this.color = c;
  }

Cursor.prototype.update = function(newPos,i) {

    //start out with setting new position (offset) to mouse position
    let prevPosition = cursor.position;

    let prevVelocity = cursor.velocity;
    cursor.velocity = p5.Vector.sub(newPos,prevPosition);
    cursor.acceleration = p5.Vector.sub(cursor.velocity,prevVelocity);  
    cursor.acceleration.add(cursor.extraAcceleration);  //you add the acceleration caused by any magnets

    cursor.velocity.add(cursor.extraAcceleration);

    cursor.position = p5.Vector.add(prevPosition,cursor.velocity);

}

  // Newton's 2nd law: F = M * A
// or A = F / M
Cursor.prototype.applyForce = function(force) {
    let f = p5.Vector.div(force, this.mass);
    this.extraAcceleration.add(f);
};


Cursor.prototype.stop = function() {
    this.velocity = createVector(0, 0);
};

Cursor.prototype.adjust = function(i,cursorPosition) {
    //unit vector direction between magnet and point
    let magnet = magnets[i]
    let unit = p5.Vector.sub(cursorPosition,magnet.position).normalize();
    unit.mult(magnet.radius/2 + this.radius);
    this.position = p5.Vector.add(cursorPosition, unit);
    this.velocity = createVector(0, 0);
};

Cursor.prototype.display = function(i) {

    noStroke();
    if(i == null){
        fill(0);
        circle(this.position.x, this.position.y, this.radius*2);
        stuck = false;
    }else{
        let magnet = magnets[i]
        let newAdjustedPos = p5.Vector.sub(cursor.position,p5.Vector.sub(cursor.position,magnet.position));
        fill(color(0,0,245));
        circle(newAdjustedPos.x, newAdjustedPos.y, this.radius*2);
        stuck = true;
    }

    this.extraAcceleration = createVector(0,0);
};

Magnet.prototype.display = function() {
    push();
    stroke(color(0,0,240));
    strokeWeight(10);
    drawingContext.shadowOffsetY = 20;
    drawingContext.shadowColor = "#00000044";
    drawingContext.shadowBlur = 30;
    if(stuck){
        drawingContext.shadowBlur = 70;
    }else{
        drawingContext.shadowBlur = 30;
    }
    circle(this.position.x, this.position.y, this.radius*2);
    pop();

    //cover up the inner with white
    noStroke();
    fill(255);
    circle(this.position.x, this.position.y, this.radius*2);
    fill(color(0,0,240));
    textSize(15);
    text("click",this.position.x,this.position.y+5);
};

function mouseClicked() {
    if (stuck) {
        reset();
    } else {
    }
  }