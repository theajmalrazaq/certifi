document
  .getElementById("imageUpload")
  .addEventListener("change", handleImageUpload);
document.getElementById("confirmArea").addEventListener("click", confirmArea);
document
  .getElementById("csvUpload")
  .addEventListener("change", handleCSVUpload);
document
  .getElementById("fontUpload")
  .addEventListener("change", handleFontUpload);

document.getElementById("saveImages").addEventListener("click", saveImages);
document.getElementById("generate").addEventListener("click", () => {
  document.getElementById("home").style.display = "none";
  document.getElementById("st-1").style.display = "flex";
});
document.getElementById("bck1").addEventListener("click", () => {
  document.getElementById("home").style.display = "";
  document.getElementById("st-1").style.display = "none";
});
document.getElementById("bck2").addEventListener("click", () => {
  document.getElementById("st-1").style.display = "";
  document.getElementById("st-2").style.display = "none";
});
document.getElementById("reset").addEventListener("click", () => {
  document.getElementById("home").style.display = "";
  document.getElementById("st-1").style.display = "none";
  document.getElementById("st-2").style.display = "none";
});

let uploadedImage;
let selectedNames = ["Demo Name"];
let canvas, ctx, previewCanvas, previewCtx;
let startX, startY, endX, endY;
let isDrawing = true;
let rectX, rectY, rectWidth, rectHeight;
let customFont = null;
let customColor = "#ff0000";
let fontSize = 20;
let isDragging = false;
let textX, textY;

function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    uploadedImage = new Image();
    uploadedImage.onload = function () {
      setUpCanvas();
    };
    uploadedImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function setUpCanvas() {
  canvas = document.getElementById("imageCanvas");
  canvas.width = uploadedImage.width;
  canvas.style.width = "100%";
  canvas.height = uploadedImage.height;
  canvas.style.height = "100%";
  ctx = canvas.getContext("2d");
  ctx.drawImage(uploadedImage, 0, 0);

  previewCanvas = document.getElementById("previewCanvas");
  previewCanvas.width = uploadedImage.width;
  previewCanvas.style.width = "100%";
  previewCanvas.height = uploadedImage.height;
  previewCanvas.style.height = "100%";
  previewCtx = previewCanvas.getContext("2d");

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", drawRectangle);
  canvas.addEventListener("mouseup", endDrawing);
  canvas.addEventListener("touchstart", startDrawingTouch, { passive: false });
  canvas.addEventListener("touchmove", drawRectangleTouch, { passive: false });
  canvas.addEventListener("touchend", endDrawingTouch);
}

function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function getTouchPos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches[0];
  return {
    x: (touch.clientX - rect.left) * (canvas.width / rect.width),
    y: (touch.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function startDrawing(event) {
  canvas.style.cursor = "cell";
  const pos = getMousePos(canvas, event);
  startX = pos.x;
  startY = pos.y;
  isDrawing = true;
}

function startDrawingTouch(event) {
  event.preventDefault();
  const pos = getTouchPos(canvas, event);
  startX = pos.x;
  startY = pos.y;
  isDrawing = true;
}

function drawRectangle(event) {
  if (!isDrawing) return;

  const pos = getMousePos(canvas, event);
  endX = pos.x;
  endY = pos.y;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(uploadedImage, 0, 0);

  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, endX - startX, endY - startY);
}

function drawRectangleTouch(event) {
  if (!isDrawing) return;
  event.preventDefault();

  const pos = getTouchPos(canvas, event);
  endX = pos.x;
  endY = pos.y;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(uploadedImage, 0, 0);

  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, endX - startX, endY - startY);
}

function endDrawing(event) {
  if (!isDrawing) return;
  isDrawing = false;

  const pos = getMousePos(canvas, event);
  endX = pos.x;
  endY = pos.y;
}

function endDrawingTouch(event) {
  if (!isDrawing) return;
  isDrawing = false;
}

function confirmArea() {
  if (document.getElementById("imageUpload").value == "" || isDrawing) {
    alert("select image first");
    return;
  }

  document.getElementById("st-1").style.display = "none";
  document.getElementById("st-2").style.display = "flex";
  rectX = Math.min(startX, endX);
  rectY = Math.min(startY, endY);
  rectWidth = Math.abs(endX - startX);
  rectHeight = Math.abs(endY - startY);

  document.getElementById("csvUpload").style.display = "block";
  document.getElementById("fontUpload").style.display = "block";
  document.getElementById("colorPicker").style.display = "block";
  document.getElementById("fontSize").style.display = "block";
  showPreview();
  document.getElementById("confirmArea").style.display = "none";

  canvas.removeEventListener("mousedown", startDrawing);
  canvas.removeEventListener("mousemove", drawRectangle);
  canvas.removeEventListener("mouseup", endDrawing);
  canvas.removeEventListener("touchstart", startDrawingTouch);
  canvas.removeEventListener("touchmove", drawRectangleTouch);
  canvas.removeEventListener("touchend", endDrawingTouch);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(uploadedImage, 0, 0);

  document
    .getElementById("csvUpload")
    .addEventListener("change", handleCSVUpload);
  document
    .getElementById("fontUpload")
    .addEventListener("change", handleFontUpload);
  document
    .getElementById("colorPicker")
    .addEventListener("input", handleColorChange);
  document
    .getElementById("fontSize")
    .addEventListener("input", handleFontSizeChange);
}

function handleCSVUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const lines = e.target.result.split("\n");
    selectedNames = lines.map((line) => line.trim());
    console.log("CSV uploaded and parsed", selectedNames);
    showPreview();
  };
  reader.readAsText(file);
}

function handleFontUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const font = new FontFace("customFont", e.target.result);
    font.load().then(function (loadedFont) {
      document.fonts.add(loadedFont);
      customFont = "customFont";

      showPreview();
    });
  };
  reader.readAsArrayBuffer(file);
}

function handleColorChange(event) {
  customColor = event.target.value;
  showPreview();
}

function handleFontSizeChange(event) {
  fontSize = event.target.value;
  showPreview();
}

function showPreview() {
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height); // Clear canvas
  previewCtx.drawImage(uploadedImage, 0, 0); // Redraw image

  previewCtx.font = `${fontSize}px ${customFont || "Arial"}`;
  previewCtx.fillStyle = customColor;
  previewCtx.fillText(
    selectedNames[0],
    textX || rectX + 10,
    textY || rectY + 30
  );

  previewCanvas.addEventListener("mousedown", startDrag);
  previewCanvas.addEventListener("mousemove", dragText);
  previewCanvas.addEventListener("mouseup", stopDrag);
  previewCanvas.addEventListener("touchstart", startDragTouch, {
    passive: false,
  });
  previewCanvas.addEventListener("touchmove", dragTextTouch, {
    passive: false,
  });
  previewCanvas.addEventListener("touchend", stopDragTouch);
}

function startDrag(event) {
  previewCanvas.style.cursor = "grab";
  const rect = previewCanvas.getBoundingClientRect();
  textX = (event.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (event.clientY - rect.top) * (previewCanvas.height / rect.height);
  isDragging = true;
}

function startDragTouch(event) {
  event.preventDefault();
  const rect = previewCanvas.getBoundingClientRect();
  const touch = event.touches[0];
  textX = (touch.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (touch.clientY - rect.top) * (previewCanvas.height / rect.height);
  isDragging = true;
}

function dragText(event) {
  if (!isDragging) return;

  const rect = previewCanvas.getBoundingClientRect();
  textX = (event.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (event.clientY - rect.top) * (previewCanvas.height / rect.height);

  showPreview();
}

function dragTextTouch(event) {
  if (!isDragging) return;
  event.preventDefault();

  const rect = previewCanvas.getBoundingClientRect();
  const touch = event.touches[0];
  textX = (touch.clientX - rect.left) * (previewCanvas.width / rect.width);
  textY = (touch.clientY - rect.top) * (previewCanvas.height / rect.height);

  showPreview();
}

function stopDrag(event) {
  isDragging = false;
}

function stopDragTouch(event) {
  isDragging = false;
}

function saveImages() {
  selectedNames.forEach((name, index) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(uploadedImage, 0, 0);

    ctx.font = `${fontSize}px ${customFont || "Arial"}`;
    ctx.fillStyle = customColor;
    ctx.fillText(name, textX || rectX + 10, textY || rectY + 30);

    const link = document.createElement("a");
    link.download = `${name}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
}
