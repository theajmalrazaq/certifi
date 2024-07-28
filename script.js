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
  document.getElementById("st-1").style.display = "flex";
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
let customFont = null;
let customColor = "#ff0000";
let fontSize = 30;
let isDragging = false;
let textX, textY;
let rectX, rectY;
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
  rectX = uploadedImage.width / 2;
  rectY = uploadedImage.height / 2;
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
}

function confirmArea() {
  if (document.getElementById("imageUpload").value == "") {
    UIkit.notification({
      message: "Upload Certificate First",
      status: "danger",
    });
    return;
  }
  document.getElementById("st-1").style.display = "none";
  document.getElementById("st-2").style.display = "flex";

  document.getElementById("csvUpload").style.display = "block";
  document.getElementById("fontUpload").style.display = "block";
  document.getElementById("colorPicker").style.display = "block";
  document.getElementById("fontSize").style.display = "block";
  showPreview();

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
    showPreview();
  };
  reader.readAsText(file);
}

function handleFontUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload((e) => {
    const font = new FontFace("customFont", e.target.result);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      customFont = "customFont";
      showPreview();
    });
  });
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
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.drawImage(uploadedImage, 0, 0);

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
  if (document.getElementById("csvUpload").value == "") {
    UIkit.notification({
      message: "Upload Name list CSV/TXT",
      status: "danger",
    });
    return;
  }
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
