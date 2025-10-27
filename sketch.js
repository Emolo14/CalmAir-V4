let mic;
let vol = 0;
let co2 = 600;
let co2Trend = 1;
let co2Speed = 0.5;
let alarmTekst = "";
let alarmTimer = 0;
let alarmSpillet = false;
let knap;
let aktiv = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  noStroke();

  mic = new p5.AudioIn();

  knap = createButton("🎤 Start lydmåling");
  designKnap("#4CAF50");
  positionKnap();
  knap.mousePressed(toggleMic);
}

function designKnap(farve) {
  knap.style("font-family", "Arial, sans-serif");
  knap.style("font-weight", "bold");
  knap.style("border", "none");
  knap.style("border-radius", "20px");
  knap.style("padding", "15px 30px");
  knap.style("background", farve);
  knap.style("color", "white");
  knap.style("box-shadow", "0 4px 10px rgba(0,0,0,0.3)");
  knap.style("transition", "0.3s");
}

function positionKnap() {
  // Under dB-meter, lidt højere og lidt til højre
  let radius = min(width, height) * 0.25;
  knap.position(width*0.27 - knap.width/2, height/2 + radius - 10); 
  knap.style("font-size", min(width, height) * 0.07 + "px");
}

function toggleMic() {
  getAudioContext().resume();
  if (!aktiv) {
    mic.start();
    aktiv = true;
    knap.html("⏹️ Stop lydmåling");
    designKnap("#F44336");
  } else {
    mic.stop();
    aktiv = false;
    knap.html("🎤 Start lydmåling");
    designKnap("#4CAF50");
  }
}

function draw() {
  background(20);

  if (width < height) {
    fill(255);
    textSize(min(width, height) * 0.05);
    text("Vend telefonen til landscape for bedste oplevelse", width/2, height/2);
    return;
  }

  if (aktiv) vol = mic.getLevel();
  let dB = map(vol, 0, 0.2, 30, 100);
  dB = constrain(dB, 30, 100);

  co2 += random(-co2Speed, co2Speed) * co2Trend;
  if (frameCount % 200 === 0) {
    co2Trend = random([-1, 1]);
    co2Speed = random(0.3, 1.2);
  }
  co2 = constrain(co2, 400, 1600);

  let colorState;
  if (co2 < 800) colorState = "#4CAF50";
  else if (co2 < 1200) colorState = "#FFEB3B";
  else colorState = "#F44336";

  if (dB > 85 && aktiv) {
    if (!alarmSpillet) {
      alarmLyd();
      alarmSpillet = true;
    }
    alarmTekst = "🔴 Lyden er for høj! 🙉";
    alarmTimer = millis();
  } else {
    alarmSpillet = false;
  }

  // --- dB-meter venstre ---
  push();
  translate(width * 0.25, height / 2);
  drawDbMeter(dB);
  pop();

  // --- CO2-smiley højre ---
  push();
  translate(width * 0.75, height / 2 - height*0.05);
  drawCo2Smiley(co2, colorState);
  pop();

  // --- Knap under dB-meter ---
  positionKnap();

  // --- Alarmtekst ---
  if (millis() - alarmTimer < 2000) {
    fill(255, 0, 0);
    textSize(min(width, height) * 0.05);
    text(alarmTekst, width/2, height*0.1);
  }
}

function drawDbMeter(dB) {
  let radius = min(width, height) * 0.25;

  strokeWeight(radius * 0.08);
  noFill();
  stroke(80);
  arc(0, 0, radius*2, radius*2, -180, 0);

  let arcColor = "#4CAF50";
  if (dB > 70 && dB <= 85) arcColor = "#FFEB3B";
  if (dB > 85) arcColor = "#F44336";
  stroke(arcColor);

  let angle = map(dB, 30, 100, -180, 0, true);
  arc(0, 0, radius*2, radius*2, -180, angle);

  noStroke();
  fill(255);
  textSize(radius*0.25);
  text("dB", 0, -radius*0.35);
  textSize(radius*0.2);
  text(int(dB) + " dB", 0, 0);
}

function drawCo2Smiley(co2, colorState) {
  let dia = min(width, height) * 0.35;

  // Smiley
  noStroke();
  fill(colorState);
  circle(0, 0, dia);

  fill(0);
  let eyeOffset = dia*0.15;
  circle(-eyeOffset, -eyeOffset, dia*0.08);
  circle(eyeOffset, -eyeOffset, dia*0.08);

  noFill();
  stroke(0);
  strokeWeight(dia*0.06);
  arc(0, 0, dia*0.35, dia*0.2, 20, 160);

  // CO2-bar rykket længere ned
  noStroke();
  fill(colorState);
  rect(-dia*0.425, dia*0.3, dia*0.85, dia*0.2, dia*0.05);

  fill("white");
  textSize(dia*0.18);
  textStyle(BOLD);
  text(int(co2) + " ppm", 0, dia*0.4);
}

function alarmLyd() {
  let osc = new p5.Oscillator();
  osc.setType('sine');
  osc.freq(880);
  osc.amp(0.2);
  osc.start();
  setTimeout(() => osc.stop(), 200);
}

function touchStarted() {
  getAudioContext().resume();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
