let canvas;
let gl;
let program;

let stopSign;
let lamp;
let car;
let street;
let bunny;


// OBJECTS
let stopSignFaceVert;
let stopSignFaceNorm;
let stopSignFaceTex;
let stopSignSpecular;
let stopSignDiffuse;
let stopSignPoints;
let stopSignNormalsArray;

let lampFaceVert;
let lampFaceNorm;
let lampFaceTex;
let lampSpecular;
let lampDiffuse;
let lampPoints;
let lampNormalsArray;

let carFaceVert;
let carFaceNorm;
let carFaceTex;
let carSpecular;
let carDiffuse;
let carPoints;
let carNormalsArray;

let streetFaceVert;
let streetFaceNorm;
let streetFaceTex;
let streetSpecular;
let streetDiffuse;
let streetPoints;
let streetNormalsArray;

let bunnyFaceVert;
let bunnyFaceNorm;
let bunnyFaceTex;
let bunnySpecular;
let bunnyDiffuse;


// Lighting Properties
var lightPosition = vec4(0.0, 3.0, 0.0, 1.0 );  
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 0.8, 1.0, 0.5, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialShininess = 20.0;

// Camera Coordinates
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

// Buffer

var vBuffer;

// Matrices
var transformationMatrix;
var transformationMatrixLoc;

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform4fv(gl.getUniformLocation(program, "lightDiffuse"), flatten(lightDiffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "ligtSpecular"), flatten(lightSpecular));
    gl.uniform4fv(gl.getUniformLocation(program, "lightAmbient"), flatten(lightAmbient));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    gl.enable(gl.DEPTH_TEST);

    getModel();
    
    setupProjection();
}


// Get Models from Website      (OBJ and MTL FILES)
function getModel(){
    // Get the stop sign

    stopSign =  new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/stopsign.mtl");
    
    console.log(stopSign);
    checkFlag(stopSign);
    
    // Get the lamp
    lamp = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/lamp.mtl");
    
    console.log(lamp);
    checkFlag(lamp);
    
    
    // Get the street
    street = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/street.mtl");

    checkFlag(street);
    
    // Get the car
    
    car = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/car.mtl");

    checkFlag(car);
    /*
   // 
    // Get the bunny (you will not need this one until Part II)
    bunny = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.mtl");

    //checkFlag(bunny);
    */

}

var count = 0;
// Wait until flags are set to true
function checkFlag(model){
    if(model.objParsed && model.mtlParsed){
        console.log(model.faces.length);
        count++;
        getAttributes(model);
    }
    else{
        setTimeout(function(){
            checkFlag(model);
        },100);
    }

    if(count==4){
        drawObjects();
    }

}


function drawObjects(){
    drawStopSign();
    drawLamp();
    drawCar();
    drawStreet();
}


function drawStopSign(){
    stopSignPoints = pushToPoints(stopSignFaceVert);
    stopSignNormalsArray = pushToNormalsArray(stopSignFaceNorm); 

    transformObject("stopSign");
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(stopSignPoints), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(stopSignNormalsArray), gl.STATIC_DRAW);

    var vNormalPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);

    gl.drawArrays(gl.TRIANGLES,0,stopSignPoints.length);
}


function drawLamp() {
    lampPoints = pushToPoints(lampFaceVert);
    lampNormalsArray = pushToNormalsArray(lampFaceNorm); 

    transformObject("lamp");
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lampPoints), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lampNormalsArray), gl.STATIC_DRAW);

    var vNormalPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);

    gl.drawArrays(gl.TRIANGLES,0,lampPoints.length);
}


function drawCar(){
    carPoints = pushToPoints(carFaceVert);
    carNormalsArray = pushToNormalsArray(carFaceNorm); 

    transformObject("car");
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(carPoints), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(carNormalsArray), gl.STATIC_DRAW);

    var vNormalPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);

    gl.drawArrays(gl.TRIANGLES,0,carPoints.length);
}

function drawStreet(){
    streetPoints = pushToPoints(streetFaceVert);
    streetNormalsArray = pushToNormalsArray(streetFaceNorm); 

    transformObject("street");
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(streetPoints), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(streetNormalsArray), gl.STATIC_DRAW);

    var vNormalPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);

    gl.drawArrays(gl.TRIANGLES,0,streetPoints.length);
}

function getAttributes(model){
    modelFaceVert=[];
    modelFaceNorm=[];
    modelFaceTex=[];
    switch(model){
        case stopSign:
            getData(model);
            stopSignFaceVert = modelFaceVert;
            stopSignFaceNorm = modelFaceNorm;
            stopSignFaceTex = modelFaceTex;
            stopSignDiffuse = model.diffuseMap.get('StopMaterial');
            stopSignSpecular = model.specularMap.get('StopMaterial');
            console.log(stopSignDiffuse);
            console.log(stopSignSpecular);

            gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"), flatten(stopSignDiffuse));
            gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"), flatten(stopSignSpecular));

            transformObject("stopSign");
            console.log("stop get");
            break;
        case car:
            getData(model);
            carFaceVert = modelFaceVert;
            carFaceNorm = modelFaceNorm;
            carFaceTex = modelFaceTex;
            carDiffuse = model.diffuseMap.get('CarMaterial');
            carSpecular = model.specularMap.get('CarMaterial');
            transformObject("car");
            break;
        case street:
            getData(model);
            streetFaceVert = modelFaceVert;
            streetFaceNorm = modelFaceNorm;
            streetFaceTex = modelFaceTex;
            transformObject("street");
            console.log("street get");
            break;
        case lamp:
            getData(model);
            lampFaceVert = modelFaceVert;
            lampFaceNorm = modelFaceNorm;
            lampFaceTex = modelFaceTex;
            lampDiffuse = model.diffuseMap.get('LampMaterial');
            lampSpecular = model.specularMap.get('LampSpecular');
            transformObject("lamp");
            console.log("lamp get");
            break;
        case bunny:
            bunnyFaceVert = modelFaceVert;
            bunnyFaceNorm = modelFaceNorm;
            bunnyFaceTex = modelFaceTex;
            break;

    }
    pushToPoints(modelFaceVert);
    pushToNormalsArray(modelFaceNorm);
}



let modelFaceVert=[];
let modelFaceNorm=[];
let modelFaceTex=[];

function getData(model){

    
    let modelFaces = model.faces;
    for(var i=0;i<modelFaces.length;i++){
        modelFaceNorm.push(modelFaces[i].faceNormals);
        modelFaceVert.push(modelFaces[i].faceVertices);
        modelFaceTex.push(modelFaces[i].faceTexCoords);
    }
}





// Setup Camera and Projection matrix
function setupProjection(){
    
    eye = vec3(4, 5, 10);

    // Camera Matrix (Position, Looking at, Up)
    modelViewMatrix = lookAt(eye, at , up);

    // Projection Matrix (FOV, Aspect, Near, Far)
    projectionMatrix = perspective(90,1,0.1,30);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
   
}



// Push the Vertices to points
var points=[];
function pushToPoints(modelFaceVert){
    points=[];
    for(var i=0;i<modelFaceVert.length;i++){
        var currentface = modelFaceVert[i];
        for(var j=0;j<currentface.length;j++){
            var facepoints = currentface[j];
            points.push(facepoints)
        }
    }
    return points;
}



// Push Face normal to normals array
var normalsArray = [];
function pushToNormalsArray(modelFaceNorm){
    normalsArray=[];
    for(var i=0;i<modelFaceNorm.length;i++){
        var currentface = modelFaceNorm[i];
        for(var j=0;j<currentface.length;j++){
            var facepoints = currentface[j];
            normalsArray.push(facepoints)
        }
    }
    return normalsArray;
}


// Compute Transformation Matrix for each Object
function transformObject(name) {
    transformationMatrix=[];
    var rotateMatrix,translateMatrix,scaleMatrix;
    switch(name){
        case "stopSign":
            rotateMatrix = rotateY(90);
            translateMatrix = translate(4,1,0);
            transformationMatrix = mult(translateMatrix,rotateMatrix);
            break;
        case "lamp":
            transformationMatrix = translate(0,0,0);
            break;
        case "car":
            rotateMatrix = rotateY(90);
            transformationMatrix = mult(translate(1,1,4),rotateMatrix);
            break;
        case "street":
            transformationMatrix = translate(0,0,0);
            break;
    }
    
    transformationMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(transformationMatrixLoc, false,flatten(transformationMatrix));
}

/*
// Create Buffer, Draw Cube
function drawObjects() {
    console.log(stopSignFaceVert);
    console.log(normalsArray);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormalPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);
    

   gl.drawArrays(gl.TRIANGLES, 0, points.length);
}
*/

// render mesh
function render(){
    
}