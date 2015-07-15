var _gl;
var _points = [];
var _numberTimesToSubdivide = 0;
var _originPoint = vec2(0,0);
var _rotationAngle = 0;
var _shapeIsTriangle = true;
//var canvas;

window.onload = init;

function init()
{
	var canvas = document.getElementById("gl-canvas");
	
	_gl = WebGLUtils.setupWebGL(canvas);
	if (!_gl)
	{
		alert("WebGL isn't available");
	}
	
	// configure WebGL
	_gl.viewport(0, 0, canvas.width, canvas.height);
	_gl.clearColor(1.0, 1.0, 1.0, 1.0);
	
	// load shaders & initialise attribute buffers
	var program = initShaders(_gl, "vertex-shader", "fragment-shader");
	_gl.useProgram(program);
	
	//// load data into the GPU
	var bufferId = _gl.createBuffer();
	_gl.bindBuffer(_gl.ARRAY_BUFFER, bufferId);
	
	// associate shader variables with variables in JS fileCreatedDate
	var vPosition = _gl.getAttribLocation(program, "vPosition");
	_gl.vertexAttribPointer(vPosition, 2, _gl.FLOAT, false, 0, 0 ); 
	_gl.enableVertexAttribArray(vPosition);
	
	document.getElementById("slider").onchange = function(event) 
	{
		var target;
		if (event.target)
		{
			target = event.target;
		}	
		else if (event.srcElement)
		{
			target = event.srcElement;
		}
		
		// safari bug apparently
		if (target.nodeType == 3)
		{
			target = target.parentNode;
		}
		
		_numberTimesToSubdivide = target.value;
		
		//_numberTimesToSubdivide = event.srcElement.value;
		
		Render();
	}
	
	document.getElementById("slider_angle").onchange = function(event) 
	{
		var target;
		if (event.target)
		{
			target = event.target;
		}	
		else if (event.srcElement)
		{
			target = event.srcElement;
		}
		
		// safari bug apparently
		if (target.nodeType == 3)
		{
			target = target.parentNode;
		}
		
		_rotationAngle = target.value;
		
		//_rotationAngle = event.srcElement.value;
		
		Render();
	}
	
	document.getElementById("isSquare").onclick = function()
	{
		_shapeIsTriangle = false;
		
		Render();
	}
	
	document.getElementById("isTriangle").onclick = function()
	{
		_shapeIsTriangle = true;
		
		Render();
	}
	
	
	Render();
};

function GetShape()
{
	radioButtons = document.getElementsByName("shape");
	for(i=0; i<radioButtons.length; i++)
	{
		if (radioButtons[i].checked == true)
		{
			if (radioButtons[i].value == "Triangle")
			{
				_shapeIsTriangle = true;
			}
			else // is square
			{
				_shapeIsTriangle = false;
			}
		}
	}
}


function Render()
{
	if (_shapeIsTriangle === true)
	{
		var vertices = [

		   vec2(Math.sin(2.0 * Math.PI / 3.0 * 0), Math.cos(2.0 * Math.PI / 3.0 * 0)),
		   vec2(Math.sin(2.0 * Math.PI / 3.0 * 1), Math.cos(2.0 * Math.PI / 3.0 * 1)),
		   vec2(Math.sin(2.0 * Math.PI / 3.0 * 2), Math.cos(2.0 * Math.PI / 3.0 * 2))

		];
		
		_points = [];

		DivideTriangle( vertices[0], vertices[1], vertices[2], _numberTimesToSubdivide );
		
		_gl.bufferData(_gl.ARRAY_BUFFER, flatten(_points), _gl.STATIC_DRAW);
		_gl.bufferSubData(_gl.ARRAY_BUFFER, 0, flatten(_points));
		
		_gl.clear(_gl.COLOR_BUFFER_BIT);
		//_gl.drawArrays(_gl.TRIANGLES, 0, _points.length);
		//_gl.drawArrays(_gl.LINE_LOOP, 0, _points.length);
		for	(i=0; i<_points.length; i+=3)
		{
			_gl.drawArrays(_gl.LINE_LOOP, i, 3);
			//_gl.drawArrays(_gl.TRIANGLES, i, 3);
		}
		
		_points = [];
	}
	else // shape is square
	{
		var vertices = [
			vec2(-0.5, -0.5),
			vec2(-0.5, 0.5),
			vec2(0.5, 0.5),
			vec2(0.5, -0.5)
			];
			
		_points = [];
		
		// divide triangles
		DivideTriangle( vertices[0], vertices[1], vertices[2], _numberTimesToSubdivide );
		DivideTriangle( vertices[0], vertices[2], vertices[3], _numberTimesToSubdivide );
		
		_gl.bufferData(_gl.ARRAY_BUFFER, flatten(_points), _gl.STATIC_DRAW);
		_gl.bufferSubData(_gl.ARRAY_BUFFER, 0, flatten(_points));
		
		_gl.clear(_gl.COLOR_BUFFER_BIT);
		
		for	(i=0; i<_points.length; i+=3)
		{
			_gl.drawArrays(_gl.LINE_LOOP, i, 3);
			//_gl.drawArrays(_gl.TRIANGLES, i, 3);
		}
			
	}
}

//function Triangle(a, b, c)
//{
//    _points.push(a, b, c);
//}

// function RotatedTriangle(a, b, c)
// {

	// var rotation = _rotationAngle * Math.PI / 180;
	
	// var cos = Math.cos(rotation);
	// var sin = Math.sin(rotation);
	
	// // a
	// var x = a[0] * cos - a[1] * sin;
	// var y = a[0] * sin + a[1] * cos;
	// var newA = vec2(x, y);
	
	// // b
	// var x = b[0] * cos - b[1] * sin;
	// var y = b[0] * sin + b[1] * cos;
	// var newB = vec2(x, y);
	
		// // b
	// var x = c[0] * cos - c[1] * sin;
	// var y = c[0] * sin + c[1] * cos;
	// var newC = vec2(x, y);

	// _points.push(newA, newB, newC);
// }

function TwistedTriangle(a, b, c)
{
	var rotation = _rotationAngle * Math.PI / 180;
	
	// a
	var distance = Math.sqrt((a[0] * a[0]) + (a[1] * a[1]));
	var cos = Math.cos(rotation * distance);
	var sin = Math.sin(rotation * distance);
	var x = a[0] * cos - a[1] * sin;
	var y = a[0] * sin + a[1] * cos;
	var newA = vec2(x, y);
	
	// b
	distance = Math.sqrt((b[0] * b[0]) + (b[1] * b[1]));
	cos = Math.cos(rotation * distance);
	sin = Math.sin(rotation * distance);
	x = b[0] * cos - b[1] * sin;
	y = b[0] * sin + b[1] * cos;
	var newB = vec2(x, y);
	
	// c
	distance = Math.sqrt((c[0] * c[0]) + (c[1] * c[1]));
	cos = Math.cos(rotation * distance);
	sin = Math.sin(rotation * distance);
	x = c[0] * cos - c[1] * sin;
	y = c[0] * sin + c[1] * cos;
	var newC = vec2(x, y);
	
	_points.push(newA, newB, newC);
}


function DivideTriangle(a, b, c, count)
{
    // check for end of recursion
    if (count == 0) 
    {
        //Triangle(a, b, c);
		//RotatedTriangle(a, b, c);
		TwistedTriangle(a, b, c);
    }
	else
	{
		// bisect the sides
		var ab = mix(a, b, 0.5);
		var ac = mix(a, c, 0.5);
		var bc = mix(b, c, 0.5);
		--count;

		// new triangles
		DivideTriangle(b, bc, ab, count);
		DivideTriangle(ac, ab, a, count);
		DivideTriangle(c, ac, bc, count);
		DivideTriangle(bc, ac, ab, count);
		DivideTriangle(b, bc, ab, count);
		
	}
}
