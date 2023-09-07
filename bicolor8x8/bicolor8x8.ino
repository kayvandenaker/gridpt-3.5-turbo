/*************************************************** 
  This is a library for our I2C LED Backpacks

  Designed specifically to work with the Adafruit LED Matrix backpacks 
  ----> http://www.adafruit.com/products/872
  ----> http://www.adafruit.com/products/871
  ----> http://www.adafruit.com/products/870

  These displays use I2C to communicate, 2 pins are required to 
  interface. There are multiple selectable I2C addresses. For backpacks
  with 2 Address Select pins: 0x70, 0x71, 0x72 or 0x73. For backpacks
  with 3 Address Select pins: 0x70 thru 0x77

  Adafruit invests time and resources providing this open source code, 
  please support Adafruit and open-source hardware by purchasing 
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.  
  BSD license, all text above must be included in any redistribution
 ****************************************************/

#include <Wire.h>
#include <Adafruit_GFX.h>
#include "Adafruit_LEDBackpack.h"

Adafruit_BicolorMatrix matrix = Adafruit_BicolorMatrix();

String data = "";

void setup() {
  Serial.begin(9600);
  matrix.begin(0x70);  // pass in the address
}


static const uint8_t PROGMEM
  starBitmap[] = {
    B00011000,
    B00111100,
    B01111110,
    B11111111,
    B11111111,
    B01111110,
    B00111100,
    B00011000
  };

void loop() {
if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    for (int i = 0; i < input.length(); i++) {
      char c = input.charAt(i);
      if (c != ' ') {
        data += c;
      }
    }
    displayBitmap(data);
    Serial.println(data);
    data = "";
  }

}

void displayBitmap(String bitmapData) {
  matrix.clear();
  for (int y = 0; y < 8; y++) {
    for (int x = 0; x < 8; x++) {
      char pixel = bitmapData.charAt(y * 8 + x);
      if (pixel == '1') {
        matrix.drawPixel(x, y, LED_GREEN);
      }
    }
  }
  matrix.writeDisplay();
}
