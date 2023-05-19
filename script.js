// https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language
const vertexShaderTxt = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;

    varying vec3 fragColor;

    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main()
    {
        fragColor = vertColor;
        gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    }

`

const fragmentShaderTxt = `
    precision mediump float;

    varying vec3 fragColor;

    void main()
    {
        gl_FragColor = vec4(fragColor, 1.0); // R,G,B, opacity
    }
`
const mat4 = glMatrix.mat4;

let Triangle = function () {
    let canvas = document.getElementById('main-canvas');
    let gl = canvas.getContext('webgl');

    if (!gl) {
        alert('webgl not supported');
    }

    gl.clearColor(0.5, 0.5, 0.9, 1.0);  // R,G,B, opacity
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);


    gl.compileShader(vertexShader);
    // shaderCompileErr(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    // shaderCompileErr(fragmentShader);


    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.detachShader(program, vertexShader); //https://www.khronos.org/opengl/wiki/Shader_Compilation#Before_linking
    gl.detachShader(program, fragmentShader);

    gl.validateProgram(program);

    let vertices_and_colors = generateCubeIndices(3, [0.33, 0.5, 0.25]);
    var boxVertices = vertices_and_colors[0];
    let colors = vertices_and_colors[1];

    var boxIndices =
        [
            // Top
            0, 1, 2,
            0, 2, 3,

            // Left
            5, 4, 6,
            6, 4, 7,

            // Right
            8, 9, 10,
            8, 10, 11,

            // Front
            13, 12, 14,
            15, 14, 12,

            // Back
            16, 17, 18,
            16, 18, 19,

            // Bottom
            21, 20, 22,
            22, 20, 23
        ];

    const boxVerticesertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVerticesertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); // since everything in JS is 64 bit floating point we need to convert to 32 bits

    const cubeIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW); // since everything in JS is 64 bit floating point we need to convert to 32 bits

    const posAttrLocation = gl.getAttribLocation(program, 'vertPosition');

    gl.vertexAttribPointer(
        posAttrLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0,
    );

    const colorAttrLocation = gl.getAttribLocation(program, 'vertColor');
    const color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.vertexAttribPointer(
        colorAttrLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        0,
        0
    );

    gl.enableVertexAttribArray(posAttrLocation);
    gl.enableVertexAttribArray(colorAttrLocation);

    gl.useProgram(program);

    const matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    const matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    const matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    let worldMatrix = mat4.create();
    let worldMatrix2 = mat4.create();


    let viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]); // vectors are: position of the camera, which way they are looking, which way is up
    let projMatrix = mat4.create();
    mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    let rotationMatrix = new Float32Array(16)
    let translationMatrix = new Float32Array(16)

    let angle = 0;
    const loop = function () {
        angle = performance.now() / 100 / 8 * 2 * Math.PI;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.fromRotation(rotationMatrix, angle, [1, 2, 0]);
        mat4.fromTranslation(translationMatrix, [0,0,0])
        mat4.mul(worldMatrix, translationMatrix, rotationMatrix)

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        rotationMatrix = new Float32Array(16)
        translationMatrix = new Float32Array(16)

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

}


// color to tablica 3 elementowa z kolorem w RGB 
function generateCubeIndices(sideLength, color) {
    // Wierzchołki szescianu
    var vertices = [
        // Top
        -sideLength / 2, sideLength / 2, -sideLength / 2,
        -sideLength / 2, sideLength / 2, sideLength / 2,
        sideLength / 2, sideLength / 2, sideLength / 2,
        sideLength / 2, sideLength / 2, -sideLength / 2,
        // Left
        -sideLength / 2, sideLength / 2, sideLength / 2,
        -sideLength / 2, -sideLength / 2, sideLength / 2,
        -sideLength / 2, -sideLength / 2, -sideLength / 2,
        -sideLength / 2, sideLength / 2, -sideLength / 2,
        // Right
        sideLength / 2, sideLength / 2, sideLength / 2,
        sideLength / 2, -sideLength / 2, sideLength / 2,
        sideLength / 2, -sideLength / 2, -sideLength / 2,
        sideLength / 2, sideLength / 2, -sideLength / 2,
        // Front
        sideLength / 2, sideLength / 2, sideLength / 2,
        sideLength / 2, -sideLength / 2, sideLength / 2,
        -sideLength / 2, -sideLength / 2, sideLength / 2,
        -sideLength / 2, sideLength / 2, sideLength / 2,
        // Back
        sideLength / 2, sideLength / 2, -sideLength / 2,
        sideLength / 2, -sideLength / 2, -sideLength / 2,
        -sideLength / 2, -sideLength / 2, -sideLength / 2,
        -sideLength / 2, sideLength / 2, -sideLength / 2,

        // Bottom
        -sideLength / 2, -sideLength / 2, -sideLength / 2,
        -sideLength / 2, -sideLength / 2, sideLength / 2,
        sideLength / 2, -sideLength / 2, sideLength / 2,
        sideLength / 2, -sideLength / 2, -sideLength / 2
      ];

    var colors = [];       
        for(i = 0; i< 24; i++){
            colors.push(color[0]);
            colors.push(color[1]);
            colors.push(color[2]);
        }

    return [vertices, colors]
}