let canvas;
let gl;
let program;

let stopSign;
let lamp;
let car;
let street;
let bunny;


// FLAGS
let lightOn = 1.0;
let cameraAnimation = false;
let carAnimation = false;


//REQUESTS
let cameraAnimReq;
let carAnimReq;


// OBJECTS
let stopSignFaceVert;
let stopSignFaceNorm;
let stopSignFaceTex;
let stopSignSpecular;
let stopSignDiffuse;
let stopSignPoints;
let stopSignNormalsArray;
let stopSignTexCoords;
let stopSignImage = new Image();

let lampFaceVert;
let lampFaceNorm;
let lampFaceTex;
let lampSpecular;
let lampDiffuse;
let lampPoints;
let lampNormalsArray;
let lampTexCoords;

let carFaceVert;
let carFaceNorm;
let carFaceTex;
let carSpecular;
let carDiffuse;
let carPoints;
let carNormalsArray;
let carTexCoords;

let streetFaceVert;
let streetFaceNorm;
let streetFaceTex;
let streetSpecular;
let streetDiffuse;
let streetPoints;
let streetNormalsArray;
let streetTexCoords;

let bunnyFaceVert;
let bunnyFaceNorm;
let bunnyFaceTex;
let bunnySpecular;
let bunnyDiffuse;


// Lighting Properties
var lightPosition = vec4(4.0, 5.0, 2.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4(0.5,0.5,0.5,1.0);
var materialShininess = 200.0;

// Camera Coordinates
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

// Model Attributes (Temporary to Calculate and pass to store in individual arrays for each object)
let modelFaceVert=[];
let modelFaceNorm=[];
let modelFaceTex=[];

// Matrices
var modelViewMatrix,projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var transformationMatrix;
var transformationMatrixLoc;


// STACK
let stack =[];


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
    gl.uniform4fv(gl.getUniformLocation(program, "materialAmbient"), flatten(materialAmbient));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    gl.uniform1f(gl.getUniformLocation(program, "lightCheck"), lightOn);

    // Depth Testing
    gl.enable(gl.DEPTH_TEST);

    getModel();
    
    setupProjection();
}



// Create Event Listener
window.addEventListener("keydown", keyDownListener);



// Event Listener for Keyboard Input
function keyDownListener(event){
    var key = event.key;
    
    switch(key){
        case 'l':
            console.log('l Pressed');
            if(lightOn == 0.0){
                lightOn = 1.0;
                console.log("Light On");
            }
            else{
                lightOn = 0.0;
                console.log("Light Off");
            }
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.uniform1f(gl.getUniformLocation(program, "lightCheck"), lightOn);
            drawObjects();
            break;

        case 'c':
            //gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            if(cameraAnimation){
                cameraAnimation = false;
                cancelAnimationFrame(cameraAnimReq);
            }
            else{
                cameraAnimation = true;
                rotateCamera();
            }
            break;

        case 'm':
            if(carAnimation){
                carAnimation = false;
                cancelAnimationFrame(carAnimReq);
            }
            else{
                carAnimation = true;
                setCarAnimation();
            }
            break;
    }
    
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
    
    // Get the bunny (you will not need this one until Part II)
    bunny = new Model(
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.obj",
        "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/bunny.mtl");

    checkFlag(bunny);

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

    if(count==5){
        drawObjects();
    }

}


function drawObjects(){
    // Set stop Texture to true
    gl.uniform1f(gl.getUniformLocation(program, "stopTextureCheck"), 1.0);
    // Draw Stop Sign with Texture
    drawStopSign();
    // Set stop Texture to false
    gl.uniform1f(gl.getUniformLocation(program, "stopTextureCheck"), 0.0);


    drawLamp();
    drawCar();
    drawStreet();
    drawBunny();
}


// Draw Stop Sign with Texture
function drawStopSign(){
    // Stop Sign Material  (Only one Material so preloaded)
    stopSignDiffuse = stopSign.diffuseMap.get('StopMaterial');
    stopSignSpecular = stopSign.specularMap.get('StopMaterial');
    gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"), flatten(stopSignDiffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"), flatten(stopSignSpecular));

    // Get stop sign vertex and normals
    stopSignPoints = pushToPoints(stopSignFaceVert);
    stopSignNormalsArray = pushToPoints(stopSignFaceNorm); 
    stopSignTexCoords = pushToPoints(stopSignFaceTex);

    //console.log(stopSignTexCoords);

    // Tranform Object (TRS)
    transformObject("stopSign");

    // Get Stop Texture
    getStopTexture();

    // Create Buffer
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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(stopSignTexCoords), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord);


    gl.drawArrays(gl.TRIANGLES,0,stopSignPoints.length);
}


// Draw Lamp 
function drawLamp() {
    // Get and Store Lamp Attributes (Coord,Normal,Tex)
    lampPoints = pushToPoints(lampFaceVert);
    lampNormalsArray = pushToPoints(lampFaceNorm); 
    lampTexCoords = pushToPoints(lampFaceTex);

    // Transform Object (TRS)
    transformObject("lamp");

    // Create Buffer
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

    // Draw FACE BY FACE using the FACE Material
    var n=0;
    for(var i=0;i<lamp.faces.length;i++){
        var faces = lamp.faces[i];
        // Face Material (Diffuse and Specular)
        gl.uniform4fv(gl.getUniformLocation(program,"materialDiffuse"), flatten(lamp.diffuseMap.get(faces.material)));
        gl.uniform4fv(gl.getUniformLocation(program,"materialSpecular"), flatten(lamp.specularMap.get(faces.material)));

        gl.drawArrays(gl.TRIANGLES,n,faces.faceVertices.length);
        n=n+faces.faceVertices.length;
    }
}


// Draw Car Object
function drawCar(){
    // Get and Store Car Attributes (Coord,Normal,Tex)
    carPoints = pushToPoints(carFaceVert);
    carNormalsArray = pushToPoints(carFaceNorm); 
    carTexCoords = pushToPoints(carFaceTex);

    if(carAnimation)
        animateCar();
    else
        transformObject("car");

    // Create Buffer
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

    // Draw FACE BY FACE using the FACE Material
    var n=0;
    for(var i=0;i<car.faces.length;i++){
        var faces = car.faces[i];
        gl.uniform4fv(gl.getUniformLocation(program,"materialDiffuse"), flatten(car.diffuseMap.get(faces.material)));
        gl.uniform4fv(gl.getUniformLocation(program,"materialSpecular"), flatten(car.specularMap.get(faces.material)));
        gl.drawArrays(gl.TRIANGLES,n,faces.faceVertices.length);
        n=n+faces.faceVertices.length;
    }

}


// Draw Bunny
function drawBunny(){
    // Get and Store Bunny Attributes (Coord,Normal,Tex)
    bunnyPoints = pushToPoints(bunnyFaceVert);
    bunnyNormalsArray = pushToPoints(bunnyFaceNorm); 
    bunnyTexCoords = pushToPoints(bunnyFaceTex);

    transformObject("bunny");

    // Create Buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bunnyPoints), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var vNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bunnyNormalsArray), gl.STATIC_DRAW);

    var vNormalPosition = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormalPosition);

    // Draw FACE BY FACE using the FACE Material
    var n=0;
    for(var i=0;i<bunny.faces.length;i++){
        var faces = bunny.faces[i];
        gl.uniform4fv(gl.getUniformLocation(program,"materialDiffuse"), flatten(bunny.diffuseMap.get(faces.material)));
        gl.uniform4fv(gl.getUniformLocation(program,"materialSpecular"), flatten(bunny.specularMap.get(faces.material)));
        gl.drawArrays(gl.TRIANGLES,n,faces.faceVertices.length);
        n=n+faces.faceVertices.length;
    }

}


// Draw Street
function drawStreet(){
    // Get and Store Street Attributes (Coord,Normal,Tex)
    streetPoints = pushToPoints(streetFaceVert);
    streetNormalsArray = pushToPoints(streetFaceNorm); 
    streetTexCoords = pushToPoints(streetFaceTex);


    transformObject("street");

    // Create Buffer
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

    // Draw FACE BY FACE using the FACE Material
    var n=0;
    for(var i=0;i<street.faces.length;i++){
        var faces = street.faces[i];
        //console.log(faces);
        gl.uniform4fv(gl.getUniformLocation(program,"materialDiffuse"), flatten(street.diffuseMap.get(faces.material)));
        gl.uniform4fv(gl.getUniformLocation(program,"materialSpecular"), flatten(street.specularMap.get(faces.material)));
        gl.drawArrays(gl.TRIANGLES,n,faces.faceVertices.length);
        n=n+faces.faceVertices.length;
    }

}


// Get Stop Texture from URL
function getStopTexture(){
    stopSignImage.crossOrigin = "";
    stopSignImage.src = stopSign.imagePath;
    stopSignImage.onload = function(){
        configureTexture(stopSignImage);
    }
    console.log(stopSignImage);
}


// Create and Configure Stop Texture
function configureTexture(image){
    console.log("Configuring Texture");
    let tex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D,tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}



// Get Attributes
function getAttributes(model){
    
    switch(model){
        case stopSign:
            getData(model);
            stopSignFaceVert = modelFaceVert;
            stopSignFaceNorm = modelFaceNorm;
            stopSignFaceTex = modelFaceTex;
            console.log("stop get");
            break;
        case car:
            getData(model);
            carFaceVert = modelFaceVert;
            carFaceNorm = modelFaceNorm;
            carFaceTex = modelFaceTex;
            
            break;
        case street:
            getData(model);
            streetFaceVert = modelFaceVert;
            streetFaceNorm = modelFaceNorm;
            streetFaceTex = modelFaceTex;
            console.log("street get");
            break;
        case lamp:
            getData(model);
            lampFaceVert = modelFaceVert;
            lampFaceNorm = modelFaceNorm;
            lampFaceTex = modelFaceTex;
            
            console.log("lamp get");
            break;
        case bunny:
            getData(model);
            bunnyFaceVert = modelFaceVert;
            bunnyFaceNorm = modelFaceNorm;
            bunnyFaceTex = modelFaceTex;
            break;

    }
}



// Loop through and get Vert, Norm, Tex data for each face of the model
function getData(model){
    modelFaceVert=[];
    modelFaceNorm=[];
    modelFaceTex=[];
    
    let modelFaces = model.faces;
    for(var i=0;i<modelFaces.length;i++){
        modelFaceNorm.push(modelFaces[i].faceNormals);
        modelFaceVert.push(modelFaces[i].faceVertices);
        modelFaceTex.push(modelFaces[i].faceTexCoords);
    }
}





// Setup Camera and Projection matrix
function setupProjection(){
    
    eye = vec3(4, 5, 6);

    // Camera Matrix (Position, Looking at, Up)
    modelViewMatrix = lookAt(eye, at , up);

    // Projection Matrix (FOV, Aspect, Near, Far)
    projectionMatrix = perspective(90,1,0.1,30);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

}


// Camera Animation (Rotate around origin)
let alpha = 0;
function rotateCamera(){
    if (alpha>=360)
        alpha = 0;
    console.log(alpha);
    modelViewMatrix = lookAt(vec3(mult(rotateY(alpha++),vec4(eye))), at, up);


    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    //gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    cameraAnimReq = requestAnimationFrame(rotateCamera);
    drawObjects();
}


// Push the Vertices to points
var points=[];
function pushToPoints(modelFaces){
    points=[];
    for(var i=0;i<modelFaces.length;i++){
        var currentface = modelFaces[i];
        for(var j=0;j<currentface.length;j++){
            var facepoints = currentface[j];
            points.push(facepoints)
        }
    }
    return points;
}


// Compute Transformation Matrix for each Object
function transformObject(name) {
    transformationMatrix=[];
    var rotateMatrix,translateMatrix,scaleMatrix;
    switch(name){
        case "stopSign":
            rotateMatrix = rotateY(-90);
            translateMatrix = translate(4,0,0);
            //translateMatrix = translate(2,4,8);
            transformationMatrix = mult(translateMatrix,rotateMatrix);
            break;
        case "lamp":
            transformationMatrix = translate(0,0,0);
            break;
        case "car":
            rotateMatrix = rotateY(90);
            transformationMatrix = mult(translate(0,0,3),rotateMatrix);
            break;
        case "street":
            transformationMatrix = translate(0,0,0);
            break;
        case "bunny":
            rotateMatrix = rotateY(90);
            transformationMatrix = mult(translate(1.5,0.6,3),rotateMatrix);
            break;
    }
    
    transformationMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    gl.uniformMatrix4fv(transformationMatrixLoc, false,flatten(transformationMatrix));
}

// Set Car Animation
function setCarAnimation(){
    drawObjects();
    carAnimReq = requestAnimationFrame(setCarAnimation);
}

// Animate Car
let carAlpha = 0;
function animateCar(){
    if (carAlpha>=360)
        carAlpha = 0;

    transformationMatrix = mult(rotateY(carAlpha++),mult(translate(0,0,3),rotateY(90)));
    gl.uniformMatrix4fv(transformationMatrixLoc, false,flatten(transformationMatrix));
    //carAnimReq = requestAnimationFrame(animateCar);
    //drawCar();
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