// useful image processing functions for Canvas imageData
// Author: Sam Redfern, 2014-2017

function readImage(canvas,filename,callback) {
      var img = new Image();
      img.src = filename;
      img.onload = function() {
         var wid = img.naturalWidth;
         var hgt = img.naturalHeight;
         canvas.width = wid; 
         canvas.height = hgt;
         ctx = canvas.getContext("2d"); // global var
         ctx.drawImage(img,0,0,wid,hgt);
         imgWidth = wid; // global var
         imgHeight = hgt; // global var
         if (typeof callback!="undefined")
         	callback();
      }	
}

function greyscale(imageData) {
	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var index = (x + y * imageData.width) * 4;
			var grey = Math.round((imageData.data[index+0] + imageData.data[index+1] + imageData.data[index+2])/3);
			imageData.data[index+0] = imageData.data[index+1] = imageData.data[index+2] = grey;
		}
	}
}

function threshold(imageData, level) {
	// assumes image is greyscale (i.e. RGB all the same)
	// so we will only read the Red channel
	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var index = (x + y * wid) * 4;
			var grey = imageData.data[index+0];
			var output;
			if (grey>=level)
				output=255;
			else
				output=0;
			imageData.data[index+0] = imageData.data[index+1] = imageData.data[index+2] = output;
		}
	}
}

function convolution3x3(imageData,kernel) {
	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=1;x<wid-1;x++) {
		for (y=1;y<hgt-1;y++) {
			var weightedSum = 0;
			for (xx=-1;xx<=1;xx++) {
				for (yy=-1;yy<=1;yy++) {
					var index = (x+xx + (y+yy)*wid) * 4;
					var grey = imageData.data[index+0];
					var kernelCellIndex = (xx+1 + (yy+1)*3);
					weightedSum += grey*kernel[kernelCellIndex];
				}
			}
			var index = (x + y * wid) * 4;
			var outputGrey = weightedSum; 
			outputData[index] = outputGrey;// red channel

			outputData[index+1] = outputGrey; // green channel

			outputData[index+2] = outputGrey; // blue channel
		}
	}

	// copy data from output array to original array

	return outputData;

}
function GaussianConvolution5x5(imageData,kernel) {
	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=1;x<wid-1;x++) {
		for (y=1;y<hgt-1;y++) {
			var weightedSum = 0;
			for (xx=-1;xx<=3;xx++) {
				for (yy=-1;yy<=3;yy++) {
					var index = (x+xx + (y+yy)*wid) * 4;
					var grey = imageData.data[index+0];
					var kernelCellIndex = (xx+1 + (yy+1)*5);
					weightedSum += grey*kernel[kernelCellIndex];
				}
			}
			var index = (x + y * wid) * 4;
			var outputGrey = weightedSum;
			outputData[index] = outputGrey;// red channel

			outputData[index+1] = outputGrey; // green channel

			outputData[index+2] = outputGrey; // blue channel
		}
	}

	// copy data from output array to original array

	for (i=0;i<sz;i++)
		  imageData.data[i] = outputData[i];


}

function erode(imageData,kernelSize) {
	// assumes image has been thresholded (i.e. colours are all 0 or 255)
	var halfKernelSize = Math.floor(kernelSize/2);
	
	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=1;x<wid-halfKernelSize;x++) {
		for (y=1;y<hgt-halfKernelSize;y++) {
			var index = (x + y * wid) * 4;
			if (imageData.data[index]==255) { // this pixel is white so needs to be processed
				erodeOuterLoop:
				for (xx=-halfKernelSize;xx<=halfKernelSize;xx++) {
					for (yy=-halfKernelSize;yy<=halfKernelSize;yy++) {
						var index2 = (x+xx + (y+yy)*wid) * 4;
						if (imageData.data[index2]==0) {
							// pixel at x,y needs to be removed
							outputData[index] = outputData[index+1] = outputData[index+2] = 0;
							break erodeOuterLoop; // exit xx and yy loops
						}
					}
				}
			}
		}
	}

	// copy data from output array to original array
	for (i=0;i<sz;i++)
		imageData.data[i] = outputData[i];
}

function dilate(imageData,kernelSize) {
	// assumes image has been thresholded (i.e. colours are all 0 or 255)
	var halfKernelSize = Math.floor(kernelSize/2);
	
	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=1;x<wid-halfKernelSize;x++) {
		for (y=1;y<hgt-halfKernelSize;y++) {
			var index = (x + y * wid) * 4;
			if (imageData.data[index]==0) { // this pixel is black so needs to be processed
				erodeOuterLoop:
				for (xx=-halfKernelSize;xx<=halfKernelSize;xx++) {
					for (yy=-halfKernelSize;yy<=halfKernelSize;yy++) {
						var index2 = (x+xx + (y+yy)*wid) * 4;
						if (imageData.data[index2]==255) {
							// pixel at x,y needs to be added
							outputData[index] = outputData[index+1] = outputData[index+2] = 255;
							break erodeOuterLoop; // exit xx and yy loops
						}
					}
				}
			}
		}
	}

	// copy data from output array to original array
	for (i=0;i<sz;i++)
		imageData.data[i] = outputData[i];
}

function invert(imageData) {
	// assumes image is greyscale (i.e. RGB all the same)
	// so we will only read the Red channel
	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var index = (x + y * wid) * 4;
			var grey = imageData.data[index];
			if (grey==255)
				grey=0;
			else
				grey=255;
			imageData.data[index] = imageData.data[index+1] = imageData.data[index+2] = grey;
		}
	}
}

function countPixels(imageData,matchValue) {
	// assumes image is greyscale (i.e. RGB all the same)
	// so we will only read the Red channel
	var count=0;
	var wid = imageData.width;
	var hgt = imageData.height;
	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var index = (x + y * wid) * 4;
			if (imageData.data[index]==matchValue)
				count++;
		}
	}
	return count;
}

function thinning(imageData,bCompleteThinning) {
	var wid = imageData.width;
	var hgt = imageData.height;
	// build 2d array containing data for 8 thinning templates (each sized 3x3)
    // 0 means must be black, 1 means must be white,
    // 2 means doesn't matter
	var template = [];
	template[0] = [1,1,1, 2,1,2, 0,0,0];
	template[1] = [2,1,1, 0,1,1, 0,0,2];
	template[2] = [0,2,1, 0,1,1, 0,2,1];
	template[3] = [0,0,2, 0,1,1, 2,1,1];
	template[4] = [0,0,0, 2,1,2, 1,1,1];
	template[5] = [2,0,0, 1,1,0, 1,1,2];
	template[6] = [1,2,0, 1,1,0, 1,2,0];
	template[7] = [1,1,2, 1,1,0, 2,0,0];

	var anyChanged = true;
	do {
		anyChanged = false;
		for (y=2; y<hgt-2; y++) {
			for (x=2; x<wid-2; x++) {
				var index = (x + y * wid) * 4;
				if (imageData.data[index]==255) {
					for (t=0; t<8; t++) {
						var pixChange = true;
						for (xx=-1; xx<=1; xx++) {
							for (yy=-1; yy<=1; yy++) {
								var index2 = ((x+xx) + (y+yy)*wid) * 4;
								var templateval = template[t][xx + 1 + 3 * (yy + 1)];
								if (templateval==1 && imageData.data[index2]<255)
									pixChange = false;
								else if (templateval==0 && imageData.data[index2]>0)
									pixChange = false;
							}	
						}
						if (pixChange) {
							anyChanged = true;
							imageData.data[index] = imageData.data[index+1] = imageData.data[index+2] = 0;
						}
					}
				}
			}
		}
	}
	while (anyChanged && bCompleteThinning);

	return anyChanged;
}

function pruning(imageData, pruneLength, bWithRegrowth) {
	var wid = imageData.width;
	var hgt = imageData.height;

	// create a temporary array for output
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	// pass 'pruneLength' times thru the image, removing 'on' pixels that have exactly 1 neighbour 'on'
	for (i=0; i<pruneLength; i++) {
		for (x=1; x<wid-1; x++) {
			for (y=1; y<hgt-1; y++) {
				var index = (x + y * wid) * 4;
				if (outputData[index]==255) {
					var neighbours = 0;
					if (outputData[(x + (y-1) * wid) * 4]>=254)
						neighbours++;
					if (outputData[(x + (y+1) * wid) * 4]>=254)
						neighbours++;
					if (outputData[(x-1 + y * wid) * 4]>=254)
						neighbours++;
					if (outputData[(x+1 + y * wid) * 4]>=254)
						neighbours++;
					if (neighbours==1) {
						// set to 254 so it will still be counted for neighbouring checks on this pass
						outputData[index] = 254; 
					}
				}
			}
		}
		// now remove those that were marked for removal
		for (x=1; x<wid-1; x++) {
			for (y=1; y<hgt-1; y++) {
				var index = (x + y * wid) * 4;
				if (outputData[index]==254)
					outputData[index] = outputData[index+1] = outputData[index+2] = 0;
			}
		}		
	}

	if (bWithRegrowth) {
		// pass 'prunelength' times thru the image, regrowing from 'on' pixels that have exactly 1 neighbour 'on'
		for (i=0; i<pruneLength; i++) {
			for (x=1; x<wid-1; x++) {
				for (y=1; y<hgt-1; y++) {
					var index = (x + y * wid) * 4;
					if (outputData[index]==255) {
						var neighbours = 0;
						if (outputData[(x + (y-1) * wid) * 4]>=254)
							neighbours++;
						if (outputData[(x + (y+1) * wid) * 4]>=254)
							neighbours++;
						if (outputData[(x-1 + y * wid) * 4]>=254)
							neighbours++;
						if (outputData[(x+1 + y * wid) * 4]>=254)
							neighbours++;
						if (neighbours==1) {
							// look for a neighbour that was previously pruned, and replace it (if one is found)
							if (imageData.data[(x + (y-1) * wid) * 4]==255 && outputData[(x + (y-1) * wid) * 4]==0)
								outputData[(x + (y-1) * wid) * 4] = outputData[(x + (y-1) * wid) * 4 + 1] = outputData[(x + (y-1) * wid) * 4 + 2] = 255;
							else if (imageData.data[(x + (y+1) * wid) * 4]==255 && outputData[(x + (y+1) * wid) * 4]==0)
								outputData[(x + (y+1) * wid) * 4] = outputData[(x + (y+1) * wid) * 4 + 1] = outputData[(x + (y+1) * wid) * 4 + 2] = 255;
							else if (imageData.data[(x-1 + y * wid) * 4]==255 && outputData[(x-1 + y * wid) * 4]==0)
								outputData[(x-1 + y * wid) * 4] = outputData[(x-1 + y * wid) * 4 + 1] = outputData[(x-1 + y * wid) * 4 + 2] = 255;
							else if (imageData.data[(x-1 + y * wid) * 4]==255 && outputData[(x-1 + y * wid) * 4]==0)
								outputData[(x+1 + y * wid) * 4] = outputData[(x+1 + y * wid) * 4 + 1] = outputData[(x+1 + y * wid) * 4 + 2] = 255;
						}
					}
				}
			}
		}
	}

	// copy data from output array to original array
	for (i=0;i<sz;i++)
		imageData.data[i] = outputData[i];
}

function magnitude(imageData,Gx,Gy) {
	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];
	var wid = imageData.width;
	var hgt = imageData.height;


	for (x=0;x<wid;x++) {
		for (y=0;y<hgt;y++) {
			var index = (x + y * wid) * 4;

			var GxValue = Math.pow(Gx[index+0], 2);
			var GyValue = Math.pow(Gy[index+0], 2);

		var temp = Math.sqrt(GxValue + GyValue);
		outputData[index]= outputData[index+1]= outputData[index+2]=temp;

	}}

	return outputData;




}
function getEdgeOrientation(imageData,Gx,Gy) {

	var outputData = new Array();
	var sz = imageData.data.length;
	for (i=0;i<sz;i++)
		outputData[i] = imageData.data[i];

	var wid = imageData.width;
	var hgt = imageData.height;
	var pi = Math.PI;

	for (x = 0; x < wid; x++) {
		for (y = 0; y < hgt; y++) {
			var index = (x + y * wid) * 4;


			var radians = 1.5708 + Math.atan(Gy[index] / Gx[index]);

			var degrees = radians * (180 / pi);
			var roundedValue = roundDir(degrees);
			outputData[index]= outputData[index+1]= outputData[index+2]=roundedValue;




		}
	}
		return outputData;


}

function roundDir(deg) {//rounds degrees to 4 possible orientations: horizontal, vertical, and 2 diagonals
	deg = deg < 0 ? deg + 180 : deg;
	var roundVal;
	if ((deg >= 0 && deg <= 22.5) || (deg > 157.5 && deg <= 180)) {
		roundVal = 0;
	} else if (deg > 22.5 && deg <= 67.5) {
		roundVal = 45;
	} else if (deg > 67.5 && deg <= 112.5) {
		roundVal = 90;
	} else if (deg > 112.5 && deg <= 157.5) {
		roundVal = 135;
	}
	return roundVal;
}

















	function edgeTrace(G,theta,imageData) {


		var sz = imageData.data.length;
		for (i=0;i<sz;i++)
			imageData.data[i] = G[i];


		var wid = imageData.width;
		var hgt = imageData.height;


		for (x = 0; x < wid; x++) {
			for (y = 0; y < hgt; y++) {
				var index = (x + y * wid) * 4;
				if (imageData.data[index] > 90) {


					var angle = theta[index];


					var kernal = {
						pixelX1Y1: imageData.data[index + 0],
						pixelX1Y0: imageData.data[index + wid * 4],
						pixelX1Y2: imageData.data[index - wid * 4],
						pixelX0Y1: imageData.data[index - 4],
						pixelX2Y1: imageData.data[index + 4],
						pixelX0Y0: imageData.data[(index + wid * 4) - 4],
						pixelX2Y0: imageData.data[(index + wid * 4) + 4],
						pixelX0Y2: imageData.data[(index - wid * 4) - 4],
						pixelX2Y2: imageData.data[(index - wid * 4) + 4]
					};


					var isKernalvalid = true;
					for (var properties in kernal) {
						if (kernal[properties] === undefined) {
							isKernalvalid = false;
						}
					}
					if (isKernalvalid === false) {
						continue;
					}


					if (angle == 0) {
						if ((Math.max(kernal.pixelX1Y2, kernal.pixelX1Y0) < Math.max(kernal.pixelX0Y1, kernal.pixelX2Y1)) && Math.max(kernal.pixelX0Y1, kernal.pixelX2Y1) > 80  ) {
							imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 255;


						} else
							// imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;
							relaxationApproach1(imageData,index,theta);


					}


					if (angle == 45) {
						if ((Math.max(kernal.pixelX2Y2, kernal.pixelX0Y0) > Math.max(kernal.pixelX0Y2, kernal.pixelX2Y0)) && Math.max(kernal.pixelX2Y2, kernal.pixelX0Y0) > 80) {
							imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 255;


						} else
							//imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;
							relaxationApproach1(imageData,index,theta);


					}

					if (angle == 90) {
						if ((Math.max(kernal.pixelX1Y2, kernal.pixelX1Y0) > Math.max(kernal.pixelX0Y1, kernal.pixelX2Y1)) && Math.max(kernal.pixelX1Y2, kernal.pixelX1Y0) > 80) {
							imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 255;


						} else
							// imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;
							relaxationApproach1(imageData,index,theta);

					}

					if (angle == 135) {
						if ((Math.max(kernal.pixelX2Y2, kernal.pixelX0Y0) > Math.max(kernal.pixelX0Y2, kernal.pixelX2Y0)) && Math.max(kernal.pixelX2Y2, kernal.pixelX0Y0) > 80) {
							imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 255;


						} else
							//imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;
							relaxationApproach1(imageData,index,theta);

					}

				}
				else{
					imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;




				}

			}
		}


}












function relaxationApproach1(imageData, index, theta){

	var wid = imageData.width;

	var anglePixel = theta[index];






	if (anglePixel == 0) {

			var newIndex = [index+8];
			var newKernel = create3x3kernal(newIndex,imageData);
			var isKernalvalid = true;

			for (var properties in newKernel) {

				if (newKernel[properties] === undefined) {
					isKernalvalid = false;
				}
			}
			if (isKernalvalid === false) {
				return;
			}if(anglePixel ==0){
			if ((Math.max(newKernel.data.pixelX1Y2, newKernel.data.pixelX1Y0) < Math.max(newKernel.data.pixelX0Y1, newKernel.data.pixelX2Y1)) && Math.max(newKernel.data.pixelX0Y1, newKernel.data.pixelX2Y1) > 20  ) {
				imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 255;
				imageData.data[newIndex] = imageData.data[newIndex + 1] = imageData.data[newIndex + 2] = 255;}


		} else imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;


	}



	if (anglePixel == 45) {
		var newIndex = [(index - (wid * 2 ) * 4)+8];
		var newKernel = create3x3kernal(newIndex,imageData);
		isKernalvalid = true;

		for (var properties in newKernel) {
			if (newKernel[properties] === undefined) {
				isKernalvalid = false;
			}
		}
		if (isKernalvalid === false) {
			return;
		}
		if ((Math.max(newKernel.data.pixelX2Y2, newKernel.data.pixelX0Y0) > Math.max(newKernel.data.pixelX0Y2, newKernel.data.pixelX2Y0)) && Math.max(newKernel.data.pixelX2Y2, newKernel.data.pixelX0Y0) > 20) {
			imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 255;
			imageData.data[newIndex] = imageData.data[newIndex + 1] = imageData.data[newIndex + 2] = 255;


		} else imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;


	}

	if (anglePixel == 90) {
		var newIndex = [(index - (wid * 2 ) * 4)];
		var newKernel = create3x3kernal(newIndex,imageData);
		isKernalvalid = true;

		for (var properties in newKernel) {
			if (newKernel[properties] === undefined) {
				isKernalvalid = false;
			}
		}
		if (isKernalvalid === false) {
			return;
		}
		if((Math.max(newKernel.data.pixelX1Y2, newKernel.data.pixelX1Y0) > Math.max(newKernel.data.pixelX0Y1, newKernel.data.pixelX2Y1)) && Math.max(newKernel.data.pixelX1Y2, newKernel.data.pixelX1Y0) > 20){

			imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 255;
			imageData.data[newIndex] = imageData.data[newIndex + 1] = imageData.data[newIndex + 2] = 255;


		} else imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;



	if (anglePixel == 135) {
		isKernalvalid = true;

		var newIndex = [(index - (wid * 2 ) * 4) -8];
		var newKernel = create3x3kernal(newIndex,imageData);

		for (var properties in newKernel) {
			if (newKernel[properties] === undefined) {
				isKernalvalid = false;
			}
		}
		if (isKernalvalid === false) {
			return;
		}
		if ((Math.max(newKernel.data.pixelX2Y2, newKernel.data.pixelX0Y0) > Math.max(newKernel.data.pixelX0Y2, newKernel.data.pixelX2Y0)) && Math.max(newKernel.data.pixelX2Y2, newKernel.data.pixelX0Y0) > 20) {

			imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 255;
			imageData.data[newIndex] = imageData.data[newIndex + 1] = imageData.data[newIndex + 2] = 255;


		} else imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;
	}




else{
	imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = 0;

}


}
}


function create5x5kernal(index,imageData){
	var wid = imageData.width;
	var kernal = {

		pixelXOY4:imageData.data[(index - (wid * 2 ) * 4) -8],     pixelX1Y4:imageData.data[(index - (wid * 2 ) * 4) -4],pixelX2Y4:imageData.data[(index - (wid * 2 ) * 4)],     pixelX3Y4:imageData.data[(index - (wid * 2 ) * 4)+4],     pixelX4Y4:imageData.data[(index - (wid * 2 ) * 4)+8],
		pixelXOY3:imageData.data[(index - (wid) * 4) -8],          pixelX1Y3:imageData.data[(index - (wid) * 4) -4],     pixelX2Y3:imageData.data[(index - (wid) * 4)],          pixelX3Y3:imageData.data[(index - (wid) * 4)+4],          pixelX4Y3:imageData.data[(index - (wid) * 4)+8],
		pixelXOY2:imageData.data[index -8],                        pixelX1Y2:imageData.data[index - 4],                  pixelX2Y2:imageData.data[index],                       pixelX3Y2:imageData.data[index + 4],                      pixelX4Y2:imageData.data[index + 8],
		pixelXOY1:imageData.data[(index + (wid) * 4) -8],          pixelX1Y1:imageData.data[(index + (wid) * 4) -4],     pixelX2Y1:imageData.data[(index + (wid) * 4)],          pixelX3Y1:imageData.data[(index + (wid) * 4)+4],		   pixelX4Y1:imageData.data[(index + (wid) * 4)+8],
		pixelXOY0:imageData.data[(index + (wid * 2 ) * 4) -8],	   pixelX1Y4:imageData.data[(index + (wid * 2 ) * 4) -4],pixelX2Y4:imageData.data[(index + (wid * 2 ) * 4)],	 pixelX3Y4:imageData.data[(index + (wid * 2 ) * 4)+4],     pixelX4Y4:imageData.data[(index + (wid * 2 ) * 4)+8],


	};
	return kernal;

}
function create3x3kernal(index,imageData){
	var wid = imageData.width;
	var kernal = {

			data : {
				pixelX1Y1: imageData.data[index + 0],
				pixelX1Y0: imageData.data[index + wid * 4],
				pixelX1Y2: imageData.data[index - wid * 4],
				pixelX0Y1: imageData.data[index - 4],
				pixelX2Y1: imageData.data[index + 4],
				pixelX0Y0: imageData.data[(index + wid * 4) - 4],
				pixelX2Y0: imageData.data[(index + wid * 4) + 4],
				pixelX0Y2: imageData.data[(index - wid * 4) - 4],
				pixelX2Y2: imageData.data[(index - wid * 4) + 4],},

			location:{
				pixelX1Y1Location: index + 0,
				pixelX1Y0Location: index + wid * 4,
				pixelX1Y2Location: index - wid * 4,
				pixelX0Y1Location: index - 4,
				pixelX2Y1Location: index + 4,
				pixelX0Y0Location: (index + wid * 4) - 4,
				pixelX2Y0Location: (index + wid * 4) + 4,
				pixelX0Y2Location: (index - wid * 4) - 4,
				pixelX2Y2Location: (index - wid * 4) + 4}
		};
	return kernal;
}


function RelaxationApproach2(G,theta,imageData,) {
	var sz = imageData.data.length;
	for (i = 0; i < sz; i++) {
		imageData.data[i] = G[i];
	}

	var wid = imageData.width;
	var hgt = imageData.height;

	for (i = 0; i < 15; i++) {
		for (x = 0; x < wid; x++) {
			for (y = 0; y < hgt; y++) {
				var index = (x + y * wid) * 4;

				if (imageData.data[index] > 10) {


					var kernel = create3x3kernal(index, imageData);


					var isKernalvalid = true;
					for (var properties in kernel) {
						if (kernel[properties] === undefined) {
							isKernalvalid = false;
						}
					}
					if (isKernalvalid === false) {
						continue;
					}


					for (var properties1 of Object.values(kernel.location)) {

						if (imageData.data[properties1] === imageData.data[index]) {
							continue;
						}


						if (Math.abs(imageData.data[properties1] - imageData.data[index]) <= 40 && (theta[properties1] === theta[index])) {
							imageData.data[index] = imageData.data[index] + 10;
							if (imageData.data[index] > 255) {
								imageData.data[index] = 255;
							}
							imageData.data[index + 1] = imageData.data[index + 1] + 10;
							if (imageData.data[index + 1] > 255) {
								imageData.data[index + 1] = 255;
							}
							imageData.data[index + 2] = imageData.data[index + 2] + 10;
							if (imageData.data[index + 2] > 255) {
								imageData.data[index + 2] = 255;
							}


						} else {
							imageData.data[index] = imageData.data[index] - 10;
							if (imageData.data[index] < 0) {
								imageData.data[index] = 0;
							}
							imageData.data[index + 1] = imageData.data[index + 1] - 10;
							if (imageData.data[index + 1] < 0) {
								imageData.data[index + 1] = 0;
							}
							imageData.data[index + 2] = imageData.data[index + 2] - 10;
							if (imageData.data[index + 2] < 0) {
								imageData.data[index + 2] = 0;
							}
						}


					}


				}
			}
		}
	}

}



