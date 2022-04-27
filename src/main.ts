import Timer from "timer";
import Digital from "pins/digital";
import SMBus from "pins/smbus";

class Trackball {
  static constants = {
    I2C_ADDR_PRIMARY: 0x0a,
    I2C_ADDR_ALTERNATIVE: 0x0b,
    CHIP_ID: 0xba11,
    VERSION: 1,
    REG_LED_RED: 0x00,
    REG_LED_GRN: 0x01,
    REG_LED_BLU: 0x02,
    REG_LED_WHT: 0x03,
    REG_LEFT: 0x04,
    REG_RIGHT: 0x05,
    REG_UP: 0x06,
    REG_DOWN: 0x07,
    REG_SWITCH: 0x08,
    MSK_CLICKED: 0x80,
    MSK_CLICK_STATE_UPDATE: 0x01,
    MSK_SWITCH_STATE: 0b10000000,
    REG_USER_FLASH: 0xd0,
    REG_FLASH_PAGE: 0xf0,
    REG_INT: 0xf9,
    MSK_INT_TRIGGERED: 0b00000001,
    MSK_INT_OUT_EN: 0b00000010,
    REG_CHIP_ID_L: 0xfa,
    RED_CHIP_ID_H: 0xfb,
    REG_VERSION: 0xfc,
    REG_I2C_ADDR: 0xfd,
    REG_CTRL: 0xfe,
    MSK_CTRL_SLEEP: 0b00000001,
    MSK_CTRL_RESET: 0b00000010,
    MSK_CTRL_FREAD: 0b00000100,
    MSK_CTRL_FWRITE: 0b00001000,
  };
  i2c_address: number;
  i2c_bus: SMBus;
  timeout: number;
  constructor(address = Trackball.constants.I2C_ADDR_PRIMARY, timeout = 5) {
    this.i2c_address = address;
    this.i2c_bus = new SMBus({ sda: 23, scl: 22, address, hz: 250_000 });
    this.timeout = timeout;
    trace("\nTrackball initialized");
    if (this.chipId !== Trackball.constants.CHIP_ID) {
      throw new Error("Chip ID does not match Pimoroni Trackball chip ID");
    }
  }
  private get chipId() {
    trace("\nReading chip id");
    const uInt8Array = this.i2c_bus.readBlock(
      Trackball.constants.REG_CHIP_ID_L,
      2
    );
    return new DataView(uInt8Array.buffer, 0).getUint16(0, true);
  }
  readValues() {
    const values = this.i2c_bus.readBlock(Trackball.constants.REG_LEFT, 5);
    return {
      left: values[0],
      right: values[1],
      up: values[2],
      down: values[3],
      clicked: values[4] === Trackball.constants.MSK_CLICKED,
    };
  }

  setColor(values: {
    red: number;
    blue: number;
    green: number;
    white: number;
  }) {
    this.i2c_bus.writeByte(Trackball.constants.REG_LED_RED, values.red);
    this.i2c_bus.writeByte(Trackball.constants.REG_LED_BLU, values.blue);
    this.i2c_bus.writeByte(Trackball.constants.REG_LED_GRN, values.green);
    this.i2c_bus.writeByte(Trackball.constants.REG_LED_WHT, values.white);
  }
}

let lightOn = false;
trace("Run");
const trackball = new Trackball();
Timer.repeat(() => {
  Digital.write(13, lightOn ? 1 : 0);
  lightOn = !lightOn;
  // trace(JSON.stringify(trackball.readValues()));
}, 500);
